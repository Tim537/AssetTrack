from db import db
from datetime import datetime, timezone
import json

class Asset(db.Model):
    __tablename__ = 'assets'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    lifecycle = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(100), nullable=False)
    download_url = db.Column(db.String(255), nullable=True)
    custom_attributes = db.Column(db.Text, nullable=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    attachments = db.relationship('AssetAttachment', backref='asset', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "lifecycle": self.lifecycle,
            "type": self.type,
            "download_url": self.download_url,
            "custom_attributes": json.loads(self.custom_attributes) if self.custom_attributes else {},
            "organization_id": self.organization_id,
            "attachment_count": len(self.attachments),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

class AssetAttachment(db.Model):
    __tablename__ = 'asset_attachments'

    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    data = db.Column(db.LargeBinary, nullable=False)
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))








