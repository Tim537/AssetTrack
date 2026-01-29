from db import db
from datetime import datetime, timezone

class AssetLog(db.Model):
    __tablename__ = 'assetLog'

    logId = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assetId = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=True)
    action = db.Column(db.String(50), nullable=False)
    requestJSON = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('asset_logs', lazy=True))

    def to_dict(self):
        return {
            "logId": self.logId,
            "userId": self.userId,
            "userName": self.user.name if self.user else "Unknown",
            "assetId": self.assetId,
            "action": self.action,
            "requestJSON": self.requestJSON,
            "timestamp": self.timestamp.isoformat()
        }


