# routes/models.py
from flask import Blueprint
from controllers.ml_model_controller import MLModelController
from controllers.auth_controller import token_required

ml_models_bp = Blueprint('ml_models', __name__)

@ml_models_bp.route('/models', methods=['GET'])
@token_required
def get_models(current_user):
    return MLModelController.paginate()

@ml_models_bp.route('/models/all', methods=['GET'])
def get_all_models():
    return MLModelController.getAll()

@ml_models_bp.route('/models/<int:model_id>', methods=['GET'])
@token_required
def get_model(current_user, model_id):
    return MLModelController.get_by_id(model_id)

@ml_models_bp.route('/models', methods=['POST'])
def create_model():
    return MLModelController.create()

@ml_models_bp.route('/models/<int:model_id>', methods=['PUT', 'PATCH'])
@token_required
def update_model(current_user, model_id):
    return MLModelController.update(model_id)

@ml_models_bp.route('/models/<int:model_id>', methods=['DELETE'])
@token_required
def delete_model(current_user, model_id):
    return MLModelController.delete(model_id)

@ml_models_bp.route('/models/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    return MLModelController.get_stats()