from datetime import datetime
from typing import Dict, Optional
from enum import Enum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict
from . import db

class ModelType(Enum):
    NER = "NER"
    NLU = "NLU"

class MLModel(db.Model):
    __tablename__ = 'ml_models'

    # Basic Information
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.Enum(ModelType), nullable=False)
    version = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    
    # Training Information
    base_model = db.Column(db.String(255), nullable=False)  # e.g., "fr_core_news_lg"
    train_data_count = db.Column(db.Integer, nullable=False)
    test_data_count = db.Column(db.Integer, nullable=False)
    training_time = db.Column(db.Float, nullable=False)  # in seconds
    training_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Training Parameters
    iterations = db.Column(db.Integer, nullable=False)  # number of training iterations
    batch_size_min = db.Column(db.Float, nullable=False)  # minimum batch size
    batch_size_max = db.Column(db.Float, nullable=False)  # maximum batch size
    dropout_rate = db.Column(db.Float, nullable=False)
    learning_rate = db.Column(db.Float, nullable=False)
    optimizer = db.Column(db.String(50), nullable=False)
    
    # Overall Metrics
    accuracy = db.Column(db.Float, nullable=False)
    loss = db.Column(db.Float)  # final training loss
    
    # Entity Type Metrics (DEPARTURE)
    departure_precision = db.Column(db.Float)
    departure_recall = db.Column(db.Float)
    departure_f1 = db.Column(db.Float)
    departure_support = db.Column(db.Integer)  # number of DEPARTURE entities in test set
    
    # Entity Type Metrics (ARRIVAL)
    arrival_precision = db.Column(db.Float)
    arrival_recall = db.Column(db.Float)
    arrival_f1 = db.Column(db.Float)
    arrival_support = db.Column(db.Integer)  # number of ARRIVAL entities in test set
    
    # Confusion Matrix and Additional Metrics
    confusion_matrix = db.Column(MutableDict.as_mutable(JSONB))  # Store as JSON
    entity_distribution = db.Column(MutableDict.as_mutable(JSONB))  # Distribution of entities in training data
    
    # Training History
    training_history = db.Column(MutableDict.as_mutable(JSONB))  # Loss and accuracy over iterations
    
    # Any Additional Custom Metrics
    additional_metrics = db.Column(MutableDict.as_mutable(JSONB))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(
        self,
        name: str,
        type: ModelType,
        version: str,
        base_model: str,
        train_data_count: int,
        test_data_count: int,
        training_time: float,
        # Training Parameters
        iterations: int,
        batch_size_min: float,
        batch_size_max: float,
        dropout_rate: float,
        learning_rate: float,
        optimizer: str,
        # Overall Metrics
        accuracy: float,
        loss: Optional[float] = None,
        # Entity Metrics
        departure_metrics: Optional[Dict] = None,
        arrival_metrics: Optional[Dict] = None,
        # Additional Data
        confusion_matrix: Optional[Dict] = None,
        entity_distribution: Optional[Dict] = None,
        training_history: Optional[Dict] = None,
        additional_metrics: Optional[Dict] = None,
        description: Optional[str] = None
    ):
        # Basic Information
        self.name = name
        self.type = type
        self.version = version
        self.description = description
        
        # Training Information
        self.base_model = base_model
        self.train_data_count = train_data_count
        self.test_data_count = test_data_count
        self.training_time = training_time
        
        # Training Parameters
        self.iterations = iterations
        self.batch_size_min = batch_size_min
        self.batch_size_max = batch_size_max
        self.dropout_rate = dropout_rate
        self.learning_rate = learning_rate
        self.optimizer = optimizer
        
        # Overall Metrics
        self.accuracy = accuracy
        self.loss = loss
        
        # Entity Metrics
        if departure_metrics:
            self.departure_precision = departure_metrics.get('precision')
            self.departure_recall = departure_metrics.get('recall')
            self.departure_f1 = departure_metrics.get('f1')
            self.departure_support = departure_metrics.get('support')
            
        if arrival_metrics:
            self.arrival_precision = arrival_metrics.get('precision')
            self.arrival_recall = arrival_metrics.get('recall')
            self.arrival_f1 = arrival_metrics.get('f1')
            self.arrival_support = arrival_metrics.get('support')
        
        # Additional Data
        self.confusion_matrix = confusion_matrix or {}
        self.entity_distribution = entity_distribution or {}
        self.training_history = training_history or {}
        self.additional_metrics = additional_metrics or {}

    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type.value,
            'version': self.version,
            'description': self.description,
            
            # Training Information
            'base_model': self.base_model,
            'train_data_count': self.train_data_count,
            'test_data_count': self.test_data_count,
            'training_time': self.training_time,
            'training_date': self.training_date.isoformat() if self.training_date else None,
            
            # Training Parameters
            'iterations': self.iterations,
            'batch_size_min': self.batch_size_min,
            'batch_size_max': self.batch_size_max,
            'dropout_rate': self.dropout_rate,
            'learning_rate': self.learning_rate,
            'optimizer': self.optimizer,
            
            # Overall Metrics
            'accuracy': self.accuracy,
            'loss': self.loss,
            
            # Entity Metrics
            'departure_metrics': {
                'precision': self.departure_precision,
                'recall': self.departure_recall,
                'f1': self.departure_f1,
                'support': self.departure_support
            },
            'arrival_metrics': {
                'precision': self.arrival_precision,
                'recall': self.arrival_recall,
                'f1': self.arrival_f1,
                'support': self.arrival_support
            },
            
            # Additional Data
            'confusion_matrix': self.confusion_matrix,
            'entity_distribution': self.entity_distribution,
            'training_history': self.training_history,
            'additional_metrics': self.additional_metrics,
            
            # Timestamps
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }