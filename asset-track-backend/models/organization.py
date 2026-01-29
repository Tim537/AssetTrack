from db import db
from datetime import datetime, timezone
import random
import string

class Organization(db.Model):
    __tablename__ = 'organizations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    join_code = db.Column(db.String(6), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    memberships = db.relationship('OrganizationMember', back_populates='organization', lazy='dynamic')

    @staticmethod
    def generate_join_code():
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not Organization.query.filter_by(join_code=code).first():
                return code

    def get_members(self):
        return [m.user for m in self.memberships.all()]

    def get_admins(self):
        return [m.user for m in self.memberships.filter_by(is_admin=True).all()]

    def to_dict(self, include_members=False):
        result = {
            "id": self.id,
            "name": self.name,
            "join_code": self.join_code,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if include_members:
            result["members"] = [
                {
                    **m.user.to_dict(),
                    "is_org_admin": m.is_admin
                } for m in self.memberships.all()
            ]
        return result

