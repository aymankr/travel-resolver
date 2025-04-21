from datetime import datetime
from . import db
from sqlalchemy.dialects.postgresql import JSON

class Sentence(db.Model):
    __tablename__ = 'sentences'
    
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    entities = db.Column(JSON, nullable=True)
    is_valid = db.Column(db.Boolean, default=False)
    is_treated = db.Column(db.Boolean, default=False)  # New field
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'entities': self.entities,
            'isValid': self.is_valid,
            'isTreated': self.is_treated,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }