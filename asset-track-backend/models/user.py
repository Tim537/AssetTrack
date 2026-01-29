from db import db
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)
    is_org_admin = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    memberships = db.relationship('OrganizationMember', back_populates='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_organizations(self):
        return [m.organization for m in self.memberships.all()]

    def get_membership(self, org_id):
        return self.memberships.filter_by(organization_id=org_id).first()

    def is_member_of(self, org_id):
        return self.memberships.filter_by(organization_id=org_id).first() is not None

    def is_admin_of(self, org_id):
        membership = self.get_membership(org_id)
        return membership.is_admin if membership else False

    def to_dict(self, include_memberships=False):
        result = {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "organization_id": self.organization_id,
            "is_org_admin": self.is_org_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
        if include_memberships:
            result["organizations"] = [
                {
                    "id": m.organization.id,
                    "name": m.organization.name,
                    "is_admin": m.is_admin
                } for m in self.memberships.all()
            ]
        return result
