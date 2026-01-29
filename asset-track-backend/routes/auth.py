from flask import Blueprint, request, jsonify
from models import User
from db import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not all(k in data for k in ('email', 'password', 'name')):
        return jsonify({"error": "Fehlende Pflichtfelder"}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "E-Mail bereits registriert"}), 409
        
    new_user = User(
        email=data['email'],
        name=data['name']
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(new_user.id))
    
    return jsonify({
        "message": "Benutzer erfolgreich registriert",
        "user": new_user.to_dict(),
        "token": access_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "E-Mail oder Passwort fehlt"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "Anmeldung erfolgreich",
            "user": user.to_dict(),
            "token": access_token
        }), 200
    else:
        return jsonify({"error": "Ungültige Anmeldedaten"}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "Benutzer nicht gefunden"}), 404
    return jsonify(user.to_dict(include_memberships=True)), 200
