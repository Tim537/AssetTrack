from flask import Blueprint, request, jsonify
from models import User, Organization, OrganizationMember
from db import db
from flask_jwt_extended import jwt_required, get_jwt_identity

org_bp = Blueprint('organization', __name__)

@org_bp.route('/create', methods=['POST'])
@jwt_required()
def create_organization():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Benutzer nicht gefunden"}), 404
        
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"error": "Organisationsname erforderlich"}), 400
    
    if user.organization_id:
        existing_legacy_membership = OrganizationMember.query.filter_by(
            user_id=user.id,
            organization_id=user.organization_id
        ).first()
        
        if not existing_legacy_membership:
            legacy_membership = OrganizationMember(
                user_id=user.id,
                organization_id=user.organization_id,
                is_admin=user.is_org_admin
            )
            db.session.add(legacy_membership)
        
    join_code = Organization.generate_join_code()
    new_org = Organization(name=data['name'], join_code=join_code)
    db.session.add(new_org)
    db.session.flush()
    
    membership = OrganizationMember(
        user_id=user.id,
        organization_id=new_org.id,
        is_admin=True
    )
    db.session.add(membership)
    
    user.organization_id = new_org.id
    user.is_org_admin = True
    
    db.session.commit()
    
    return jsonify({
        "message": "Organisation erfolgreich erstellt",
        "organization": new_org.to_dict()
    }), 201

@org_bp.route('/join', methods=['POST'])
@jwt_required()
def join_organization():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Benutzer nicht gefunden"}), 404
        
    data = request.get_json()
    if not data or 'join_code' not in data:
        return jsonify({"error": "Beitrittscode erforderlich"}), 400
        
    org = Organization.query.filter_by(join_code=data['join_code']).first()
    if not org:
        return jsonify({"error": "Ungültiger Beitrittscode"}), 404
    
    existing_membership = OrganizationMember.query.filter_by(
        user_id=user.id, 
        organization_id=org.id
    ).first()
    
    if existing_membership:
        return jsonify({"error": "Du bist bereits Mitglied dieser Organisation"}), 400
    
    if user.organization_id and user.organization_id != org.id:
        existing_legacy_membership = OrganizationMember.query.filter_by(
            user_id=user.id,
            organization_id=user.organization_id
        ).first()
        
        if not existing_legacy_membership:
            legacy_membership = OrganizationMember(
                user_id=user.id,
                organization_id=user.organization_id,
                is_admin=user.is_org_admin
            )
            db.session.add(legacy_membership)
    
    membership = OrganizationMember(
        user_id=user.id,
        organization_id=org.id,
        is_admin=False
    )
    db.session.add(membership)
    
    user.organization_id = org.id
    user.is_org_admin = False
    
    db.session.commit()
    
    return jsonify({
        "message": "Organisation erfolgreich beigetreten",
        "organization": org.to_dict()
    }), 200

@org_bp.route('', methods=['GET'])
@jwt_required()
def get_organization():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Benutzer nicht gefunden"}), 404
    
    membership = user.memberships.first()
    
    if not membership and not user.organization_id:
        return jsonify({"message": "Benutzer ist in keiner Organisation", "organization": None}), 200
    
    org_id = membership.organization_id if membership else user.organization_id
    org = Organization.query.get(org_id)
    
    if not org:
        return jsonify({"message": "Organisation nicht gefunden", "organization": None}), 200
    
    org_data = org.to_dict(include_members=True)
    
    if not org_data.get('members') or len(org_data['members']) == 0:
        members = User.query.filter_by(organization_id=org.id).all()
        org_data['members'] = [m.to_dict() for m in members]
        
    return jsonify({"organization": org_data}), 200

@org_bp.route('/leave', methods=['POST'])
@jwt_required()
def leave_organization():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Benutzer nicht gefunden"}), 404
    
    membership = user.memberships.first()
    org_id = membership.organization_id if membership else user.organization_id
    
    if not membership and not user.organization_id:
        return jsonify({"error": "Benutzer ist in keiner Organisation"}), 400
    
    is_admin = membership.is_admin if membership else user.is_org_admin
    
    if is_admin:
        if membership:
            admin_count = OrganizationMember.query.filter_by(
                organization_id=org_id, 
                is_admin=True
            ).count()
            total_members = OrganizationMember.query.filter_by(
                organization_id=org_id
            ).count()
        else:
            admin_count = User.query.filter_by(
                organization_id=org_id, 
                is_org_admin=True
            ).count()
            total_members = User.query.filter_by(
                organization_id=org_id
            ).count()
        
        if admin_count == 1 and total_members > 1:
            return jsonify({"error": "Du bist der einzige Administrator. Bitte ernenne ein anderes Mitglied zum Administrator, bevor du gehst."}), 400
    
    if membership:
        db.session.delete(membership)
    
    user.organization_id = None
    user.is_org_admin = False
    
    db.session.commit()
    
    return jsonify({"message": "Organisation erfolgreich verlassen"}), 200

@org_bp.route('/members/<int:member_id>', methods=['DELETE'])
@jwt_required()
def remove_member(member_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Benutzer nicht gefunden"}), 404
    
    membership = user.memberships.first()
    org_id = membership.organization_id if membership else user.organization_id
    is_admin = membership.is_admin if membership else user.is_org_admin
    
    if not org_id:
        return jsonify({"error": "Benutzer oder Organisation nicht gefunden"}), 404
        
    if not is_admin:
        return jsonify({"error": "Keine Berechtigung"}), 403
        
    member_to_remove = User.query.get(member_id)
    if not member_to_remove:
        return jsonify({"error": "Mitglied nicht gefunden"}), 404
    
    member_membership = OrganizationMember.query.filter_by(
        user_id=member_id,
        organization_id=org_id
    ).first()
    
    if not member_membership and member_to_remove.organization_id != org_id:
        return jsonify({"error": "Mitglied gehört nicht zu deiner Organisation"}), 400
        
    if member_to_remove.id == user.id:
        return jsonify({"error": "Du kannst dich nicht selbst entfernen"}), 400

    if member_membership:
        db.session.delete(member_membership)
    
    member_to_remove.organization_id = None
    member_to_remove.is_org_admin = False
    
    db.session.commit()
    
    return jsonify({"message": "Mitglied erfolgreich entfernt"}), 200

@org_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_organizations():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Benutzer nicht gefunden"}), 404
    
    organizations = []
    org_ids_seen = set()
    
    for membership in user.memberships.all():
        org_data = membership.organization.to_dict()
        org_data['is_admin'] = membership.is_admin
        organizations.append(org_data)
        org_ids_seen.add(membership.organization_id)
    
    legacy_orgs = User.query.filter_by(id=user.id).first()
    if legacy_orgs and legacy_orgs.organization_id:
        if legacy_orgs.organization_id not in org_ids_seen:
            org = Organization.query.get(legacy_orgs.organization_id)
            if org:
                existing_membership = OrganizationMember.query.filter_by(
                    user_id=user.id,
                    organization_id=org.id
                ).first()
                
                if not existing_membership:
                    new_membership = OrganizationMember(
                        user_id=user.id,
                        organization_id=org.id,
                        is_admin=legacy_orgs.is_org_admin
                    )
                    db.session.add(new_membership)
                    db.session.commit()
                
                org_data = org.to_dict()
                org_data['is_admin'] = legacy_orgs.is_org_admin
                organizations.append(org_data)
    
    return jsonify({"organizations": organizations}), 200

@org_bp.route('/<int:org_id>', methods=['GET'])
@jwt_required()
def get_organization_by_id(org_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Benutzer nicht gefunden"}), 404
    
    membership = OrganizationMember.query.filter_by(
        user_id=user.id,
        organization_id=org_id
    ).first()
    
    if not membership and user.organization_id != org_id:
        return jsonify({"error": "Du bist kein Mitglied dieser Organisation"}), 403
    
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"error": "Organisation nicht gefunden"}), 404
    
    org_data = org.to_dict(include_members=True)
    org_data['is_admin'] = membership.is_admin if membership else user.is_org_admin
    
    if not org_data.get('members') or len(org_data['members']) == 0:
        members = User.query.filter_by(organization_id=org.id).all()
        org_data['members'] = [m.to_dict() for m in members]
    
    return jsonify({"organization": org_data}), 200

@org_bp.route('/<int:org_id>/leave', methods=['POST'])
@jwt_required()
def leave_specific_organization(org_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Benutzer nicht gefunden"}), 404
    
    membership = OrganizationMember.query.filter_by(
        user_id=user.id,
        organization_id=org_id
    ).first()
    
    if not membership:
        if user.organization_id != org_id:
            return jsonify({"error": "Du bist kein Mitglied dieser Organisation"}), 400
    
    is_admin = membership.is_admin if membership else user.is_org_admin
    
    if is_admin:
        admin_count = OrganizationMember.query.filter_by(
            organization_id=org_id, 
            is_admin=True
        ).count()
        total_members = OrganizationMember.query.filter_by(
            organization_id=org_id
        ).count()
        
        if admin_count == 1 and total_members > 1:
            return jsonify({"error": "Du bist der einzige Administrator. Bitte ernenne ein anderes Mitglied zum Administrator, bevor du gehst."}), 400
    
    if membership:
        db.session.delete(membership)
    
    if user.organization_id == org_id:
        next_membership = user.memberships.filter(OrganizationMember.organization_id != org_id).first()
        if next_membership:
            user.organization_id = next_membership.organization_id
            user.is_org_admin = next_membership.is_admin
        else:
            user.organization_id = None
            user.is_org_admin = False
    
    db.session.commit()
    
    return jsonify({"message": "Organisation erfolgreich verlassen"}), 200

@org_bp.route('/<int:org_id>/members/<int:member_id>', methods=['DELETE'])
@jwt_required()
def remove_member_from_org(org_id, member_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Benutzer nicht gefunden"}), 404
    
    membership = OrganizationMember.query.filter_by(
        user_id=user.id,
        organization_id=org_id
    ).first()
    
    if not membership:
        return jsonify({"error": "Du bist kein Mitglied dieser Organisation"}), 403
    
    if not membership.is_admin:
        return jsonify({"error": "Keine Berechtigung - Administrator-Zugriff erforderlich"}), 403
    
    member_to_remove = User.query.get(member_id)
    if not member_to_remove:
        return jsonify({"error": "Mitglied nicht gefunden"}), 404
    
    if member_to_remove.id == user.id:
        return jsonify({"error": "Du kannst dich nicht selbst entfernen"}), 400
    
    member_membership = OrganizationMember.query.filter_by(
        user_id=member_id,
        organization_id=org_id
    ).first()
    
    if not member_membership:
        return jsonify({"error": "Mitglied gehört nicht zu dieser Organisation"}), 400
    
    db.session.delete(member_membership)
    
    if member_to_remove.organization_id == org_id:
        next_membership = member_to_remove.memberships.filter(OrganizationMember.organization_id != org_id).first()
        if next_membership:
            member_to_remove.organization_id = next_membership.organization_id
            member_to_remove.is_org_admin = next_membership.is_admin
        else:
            member_to_remove.organization_id = None
            member_to_remove.is_org_admin = False
    
    db.session.commit()
    
    return jsonify({"message": "Mitglied erfolgreich entfernt"}), 200

