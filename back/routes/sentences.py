# routes/sentences.py
from flask import Blueprint
from controllers.sentence_controller import SentenceController
from controllers.auth_controller import token_required

sentences_bp = Blueprint('sentences', __name__)

# Existing routes
@sentences_bp.route('/sentences', methods=['GET'])
def get_sentences():
    return SentenceController.paginate()

@sentences_bp.route('/sentences/<int:sentence_id>', methods=['GET'])
@token_required
def get_sentence(current_user, sentence_id):
    return SentenceController.get_by_id(sentence_id)

@sentences_bp.route('/sentences', methods=['POST'])
def create_sentence():
    return SentenceController.create()

@sentences_bp.route('/sentences/<int:sentence_id>', methods=['PUT', 'PATCH'])
@token_required
def update_sentence(current_user, sentence_id):
    return SentenceController.update(sentence_id)

@sentences_bp.route('/sentences/<int:sentence_id>', methods=['DELETE'])
@token_required
def delete_sentence(current_user, sentence_id):
    return SentenceController.delete(sentence_id)

@sentences_bp.route('/sentences/<int:sentence_id>/validate', methods=['POST'])
@token_required
def validate_sentence(current_user, sentence_id):
    return SentenceController.validate(sentence_id)

@sentences_bp.route('/sentences/<int:sentence_id>/invalidate', methods=['POST'])
@token_required
def invalidate_sentence(current_user, sentence_id):
    return SentenceController.invalidate(sentence_id)

@sentences_bp.route('/sentences/<int:sentence_id>/treat', methods=['POST'])
@token_required
def mark_as_treated(current_user, sentence_id):
    return SentenceController.mark_as_treated(sentence_id)

@sentences_bp.route('/sentences/<int:sentence_id>/untreat', methods=['POST'])
@token_required
def mark_as_untreated(current_user, sentence_id):
    return SentenceController.mark_as_untreated(sentence_id)

@sentences_bp.route('/sentences/markAllAsTreated', methods=['GET'])
@token_required
def mark_all_as_treated(current_user):
    return SentenceController.mark_all_as_treated()

@sentences_bp.route('/sentences/validateEntities', methods=['GET'])
@token_required
def validate_entities(current_user):
    return SentenceController.validate_entities()

@sentences_bp.route('/sentences/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    return SentenceController.get_stats()