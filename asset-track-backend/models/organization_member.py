from db import db
from datetime import datetime, timezone

class OrganizationMember(db.Model):
    __tablename__ = 'organization_members'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    joined_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', back_populates='memberships')
    organization = db.relationship('Organization', back_populates='memberships')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'organization_id', name='unique_user_org'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "organization_id": self.organization_id,
            "is_admin": self.is_admin,
            "joined_at": self.joined_at.isoformat() if self.joined_at else None
        }
