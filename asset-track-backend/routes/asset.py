from flask import Blueprint, request, jsonify, send_file, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from models import Asset, AssetAttachment, AssetLog, AuditLog, User
import json
import io

asset_bp = Blueprint('asset', __name__)

def log_action(user_id, action, resource_type, resource_id, details=None):
    if resource_type == 'Asset':
        try:
            log = AssetLog(
                userId=user_id,
                action=action,
                assetId=int(resource_id),
                requestJSON=details
            )
            db.session.add(log)
        except Exception as e:
            print(f"Failed to create AssetLog: {e}")
            pass
    else:
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id),
            details=details
        )
        db.session.add(log)

def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))

def get_current_user_org_ids():
    user = get_current_user()
    if not user:
        return []
    
    org_ids = [m.organization_id for m in user.memberships.all()]
    
    if not org_ids and user.organization_id:
        org_ids = [user.organization_id]
    
    return org_ids

def get_current_user_org_id():
    org_ids = get_current_user_org_ids()
    return org_ids[0] if org_ids else None

def check_org_access(org_id):
    user_org_ids = get_current_user_org_ids()
    if not user_org_ids or org_id not in user_org_ids:
        abort(403, description="Zugriff auf diese Organisation verweigert")

def check_asset_access(asset):
    user_org_ids = get_current_user_org_ids()
    if not user_org_ids or asset.organization_id not in user_org_ids:
        abort(403, description="Zugriff auf dieses Asset verweigert")

@asset_bp.route('/assets/<int:asset_id>/history', methods=['GET'])
@jwt_required()
def get_asset_history(asset_id):
    try:
        asset = Asset.query.get_or_404(asset_id)
        check_asset_access(asset)
        
        logs = AssetLog.query.filter_by(assetId=asset_id).order_by(AssetLog.timestamp.desc()).all()
        return jsonify([log.to_dict() for log in logs]), 200
    except Exception as e:
        if "Access denied" in str(e):
             return jsonify({"error": str(e)}), 403
        return jsonify({"error": str(e)}), 500

@asset_bp.route('/organization/<int:org_id>/assets', methods=['GET'])
@jwt_required()
def get_assets(org_id):
    try:
        check_org_access(org_id)
        
        lifecycle = request.args.get('lifecycle')
        asset_type = request.args.get('type')
        
        query = Asset.query.filter_by(organization_id=org_id)
        
        if lifecycle:
            query = query.filter_by(lifecycle=lifecycle)
        if asset_type:
            query = query.filter_by(type=asset_type)
            
        assets = query.all()
        return jsonify([asset.to_dict() for asset in assets]), 200
    except Exception as e:
         if "Access denied" in str(e):
             return jsonify({"error": str(e)}), 403
         return jsonify({"error": str(e)}), 500

@asset_bp.route('/organization/<int:org_id>/assets', methods=['POST'])
@jwt_required()
def create_asset(org_id):
    try:
        check_org_access(org_id)
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Keine Daten übermittelt"}), 400
            
        name = data.get('name')
        lifecycle = data.get('lifecycle')
        asset_type = data.get('type')
        
        if not all([name, lifecycle, asset_type]):
            return jsonify({"error": "Fehlende Pflichtfelder"}), 400
            
        new_asset = Asset(
            name=name,
            lifecycle=lifecycle,
            type=asset_type,
            custom_attributes=json.dumps(data.get('custom_attributes', {})),
            organization_id=org_id
        )
        
        db.session.add(new_asset)
        db.session.flush()
        
        log_action(current_user_id, 'CREATE', 'Asset', new_asset.id, json.dumps(data))
        db.session.commit()
        
        return jsonify(new_asset.to_dict()), 201
    except Exception as e:
        if "Access denied" in str(e):
             return jsonify({"error": str(e)}), 403
        return jsonify({"error": str(e)}), 500

@asset_bp.route('/assets/<int:asset_id>', methods=['GET'])
@jwt_required()
def get_asset(asset_id):
    asset = Asset.query.get_or_404(asset_id)
    check_asset_access(asset)
    return jsonify(asset.to_dict()), 200

@asset_bp.route('/assets/<int:asset_id>', methods=['PATCH'])
@jwt_required()
def update_asset(asset_id):
    asset = Asset.query.get_or_404(asset_id)
    check_asset_access(asset)
    
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if 'name' in data:
        asset.name = data['name']
    if 'lifecycle' in data:
        asset.lifecycle = data['lifecycle']
    if 'type' in data:
        asset.type = data['type']
    if 'custom_attributes' in data:
        asset.custom_attributes = json.dumps(data['custom_attributes'])
        
    log_action(current_user_id, 'UPDATE', 'Asset', asset_id, json.dumps(data))
    db.session.commit()
    
    return jsonify(asset.to_dict()), 200

@asset_bp.route('/assets/<int:asset_id>', methods=['DELETE'])
@jwt_required()
def delete_asset(asset_id):
    asset = Asset.query.get_or_404(asset_id)
    check_asset_access(asset)
    
    current_user_id = get_jwt_identity()
    
    db.session.delete(asset)
    log_action(current_user_id, 'DELETE', 'Asset', asset_id)
    db.session.commit()
    
    return jsonify({"message": "Asset gelöscht"}), 200

@asset_bp.route('/assets/<int:asset_id>/attachments', methods=['GET'])
@jwt_required()
def get_attachments(asset_id):
    asset = Asset.query.get_or_404(asset_id)
    check_asset_access(asset)
    
    attachments = AssetAttachment.query.filter_by(asset_id=asset_id).all()
    
    return jsonify([{
        "id": a.id,
        "filename": a.filename,
        "uploaded_at": a.uploaded_at.isoformat(),
        "download_url": f"/api/assets/attachments/{a.id}/download"
    } for a in attachments]), 200

@asset_bp.route('/assets/attachments/<int:attachment_id>', methods=['DELETE'])
@jwt_required()
def delete_attachment(attachment_id):
    attachment = AssetAttachment.query.get_or_404(attachment_id)
    asset = Asset.query.get(attachment.asset_id)
    check_asset_access(asset)
    
    current_user_id = get_jwt_identity()
    
    db.session.delete(attachment)
    
    if asset.download_url and str(attachment.filename) in asset.download_url:
         last_attachment = AssetAttachment.query.filter(AssetAttachment.asset_id == asset.id, AssetAttachment.id != attachment.id).order_by(AssetAttachment.uploaded_at.desc()).first()
         if last_attachment:
             asset.download_url = f"/api/assets/{asset.id}/attachment/{last_attachment.filename}"
         else:
             asset.download_url = None
             
    log_action(current_user_id, 'DELETE_ATTACHMENT', 'Asset', asset.id, json.dumps({"filename": attachment.filename}))
    db.session.commit()
    
    return jsonify({"message": "Anhang gelöscht"}), 200

@asset_bp.route('/assets/attachments/<int:attachment_id>/download', methods=['GET'])
@jwt_required()
def download_attachment_by_id(attachment_id):
    attachment = AssetAttachment.query.get_or_404(attachment_id)
    asset = Asset.query.get(attachment.asset_id)
    check_asset_access(asset)
    
    return send_file(
        io.BytesIO(attachment.data),
        download_name=attachment.filename,
        as_attachment=True
    )

@asset_bp.route('/assets/<int:asset_id>/attachment', methods=['POST'])
@jwt_required()
def upload_attachment(asset_id):
    try:
        asset = Asset.query.get_or_404(asset_id)
        check_asset_access(asset)
        
        current_user_id = get_jwt_identity()
        
        if 'file' not in request.files:
            return jsonify({"error": "Keine Datei in der Anfrage"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Keine Datei ausgewählt"}), 400
            
        if file:
            filename = file.filename
            try:
                data = file.read()
            except Exception as e:
                return jsonify({"error": f"Datei konnte nicht gelesen werden: {str(e)}"}), 500

            attachment = AssetAttachment(
                asset_id=asset.id,
                filename=filename,
                data=data
            )
            db.session.add(attachment)
            
            download_url = f"/api/assets/{asset.id}/attachment/{filename}"
            asset.download_url = download_url
            
            log_action(current_user_id, 'UPLOAD_ATTACHMENT', 'Asset', asset_id, json.dumps({"message": f"Uploaded {filename}"}))
            
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                return jsonify({"error": f"Datenbank-Speicherung fehlgeschlagen: {str(e)}"}), 500
            
            return jsonify({"message": "Datei hochgeladen", "download_url": download_url}), 201
            
    except Exception as e:
        if "Zugriff" in str(e) or "Access denied" in str(e):
             return jsonify({"error": str(e)}), 403
        return jsonify({"error": f"Unerwarteter Serverfehler: {str(e)}"}), 500

@asset_bp.route('/assets/<int:asset_id>/attachment/<filename>', methods=['GET'])
@jwt_required()
def download_attachment(asset_id, filename):
    asset = Asset.query.get_or_404(asset_id)
    check_asset_access(asset)
    
    attachment = AssetAttachment.query.filter_by(asset_id=asset_id, filename=filename).first_or_404()
    
    return send_file(
        io.BytesIO(attachment.data),
        download_name=attachment.filename,
        as_attachment=True
    )
