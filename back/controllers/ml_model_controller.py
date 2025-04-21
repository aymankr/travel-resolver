from flask import jsonify, request
from models import db, MLModel
from datetime import datetime
from sqlalchemy import and_
from typing import Dict

class MLModelController:
    @staticmethod
    def paginate():
        try:
            # Get pagination parameters
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            
            # Get filter parameters
            model_type = request.args.get('type')  # Filter by NER or NLU
            name = request.args.get('name')        # Filter by model name
            
            # Build query
            query = MLModel.query
            
            # Apply filters if provided
            filters = []
            if model_type:
                filters.append(MLModel.type == model_type)
            if name:
                filters.append(MLModel.name.ilike(f'%{name}%'))
            if filters:
                query = query.filter(and_(*filters))
            
            # Order by creation date, newest first
            query = query.order_by(MLModel.created_at.desc())
            
            # Execute pagination
            pagination = query.paginate(page=page, per_page=per_page, error_out=False)
            
            response = {
                'items': [model.to_dict() for model in pagination.items],
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total_pages': pagination.pages,
                    'total_items': pagination.total,
                    'has_next': pagination.has_next,
                    'has_prev': pagination.has_prev
                }
            }
            return jsonify(response), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
    @staticmethod
    def getAll():
        try:
            models = MLModel.query.order_by(MLModel.created_at.asc()).all()
            return jsonify([model.to_dict() for model in models]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def get_by_id(model_id: int):
        try:
            model = MLModel.query.get_or_404(model_id)
            return jsonify(model.to_dict()), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 404

    @staticmethod
    def create():
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = [
                'name', 'type', 'version', 'base_model', 
                'train_data_count', 'test_data_count', 'training_time',
                'iterations', 'batch_size_min', 'batch_size_max',
                'dropout_rate', 'learning_rate', 'optimizer', 'accuracy'
            ]
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({
                    'error': f'Missing required fields: {", ".join(missing_fields)}'
                }), 400
            
            # Create new model instance
            new_model = MLModel(
                name=data['name'],
                type=data['type'],
                version=data['version'],
                base_model=data['base_model'],
                train_data_count=data['train_data_count'],
                test_data_count=data['test_data_count'],
                training_time=data['training_time'],
                iterations=data['iterations'],
                batch_size_min=data['batch_size_min'],
                batch_size_max=data['batch_size_max'],
                dropout_rate=data['dropout_rate'],
                learning_rate=data['learning_rate'],
                optimizer=data['optimizer'],
                accuracy=data['accuracy'],
                loss=data.get('loss'),
                
                # Optional entity metrics
                departure_metrics=data.get('departure_metrics'),
                arrival_metrics=data.get('arrival_metrics'),
                
                # Optional additional data
                confusion_matrix=data.get('confusion_matrix'),
                entity_distribution=data.get('entity_distribution'),
                training_history=data.get('training_history'),
                additional_metrics=data.get('additional_metrics'),
                description=data.get('description')
            )
            
            db.session.add(new_model)
            db.session.commit()
            
            return jsonify(new_model.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def update(model_id: int):
        try:
            model = MLModel.query.get_or_404(model_id)
            data = request.get_json()
            
            # List of fields that cannot be updated
            protected_fields = ['id', 'created_at']
            
            # Update fields
            for key, value in data.items():
                if key not in protected_fields and hasattr(model, key):
                    setattr(model, key, value)
            
            model.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify(model.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def delete(model_id: int):
        try:
            model = MLModel.query.get_or_404(model_id)
            db.session.delete(model)
            db.session.commit()
            
            return jsonify({
                'message': f'Model {model_id} deleted successfully',
                'model': model.to_dict()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def get_stats():
        try:
            # Get total counts
            total_models = MLModel.query.count()
            ner_models = MLModel.query.filter_by(type='NER').count()
            nlu_models = MLModel.query.filter_by(type='NLU').count()
            
            # Get latest model
            latest_model = MLModel.query.order_by(MLModel.created_at.desc()).first()
            
            # Calculate average metrics
            models = MLModel.query.all()
            
            if total_models > 0:
                avg_accuracy = sum(model.accuracy for model in models) / total_models
                avg_training_time = sum(model.training_time for model in models) / total_models
                
                # Calculate metrics by type
                ner_accuracy = sum(model.accuracy for model in models if model.type == 'NER') / ner_models if ner_models > 0 else 0
                nlu_accuracy = sum(model.accuracy for model in models if model.type == 'NLU') / nlu_models if nlu_models > 0 else 0
            else:
                avg_accuracy = 0
                avg_training_time = 0
                ner_accuracy = 0
                nlu_accuracy = 0
            
            response = {
                'total_models': total_models,
                'models_by_type': {
                    'NER': ner_models,
                    'NLU': nlu_models
                },
                'average_metrics': {
                    'accuracy': round(avg_accuracy, 4),
                    'training_time': round(avg_training_time, 2)
                },
                'accuracy_by_type': {
                    'NER': round(ner_accuracy, 4),
                    'NLU': round(nlu_accuracy, 4)
                },
                'latest_model': latest_model.to_dict() if latest_model else None,
                'last_training': latest_model.created_at.isoformat() if latest_model else None
            }
            
            return jsonify(response), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500