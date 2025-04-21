from flask import jsonify, request
from models import db, Sentence
from datetime import datetime
from sqlalchemy import and_


class SentenceController:
    @staticmethod
    def paginate():
        try:
            # Get pagination parameters
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 100, type=int)
            
            # Get filter parameters with three states
            is_treated = request.args.get('isTreated')
            is_valid = request.args.get('isValid')
            
            # Build query
            query = Sentence.query
            
            # Apply filters if provided
            filters = []
            if is_treated is not None:
                if is_treated.lower() == 'true':
                    filters.append(Sentence.is_treated == True)
                elif is_treated.lower() == 'false':
                    filters.append(Sentence.is_treated == False)
                # If 'all', no filter is applied
                
            if is_valid is not None:
                if is_valid.lower() == 'true':
                    filters.append(Sentence.is_valid == True)
                elif is_valid.lower() == 'false':
                    filters.append(Sentence.is_valid == False)
                # If 'all', no filter is applied
                
            if filters:
                query = query.filter(and_(*filters))
            
            pagination = query.paginate(page=page, per_page=per_page, error_out=False)
            
            response = {
                'items': [sentence.to_dict() for sentence in pagination.items],
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
    def get_by_id(sentence_id):
        try:
            sentence = Sentence.query.get_or_404(sentence_id)
            return jsonify(sentence.to_dict()), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 404
        
    @staticmethod
    def validate_entities_has_both_locations(entities):
        """
        Check if entities contain at least one departure and one arrival
        """
        if not entities or not isinstance(entities, list):
            return False
            
        has_departure = False
        has_arrival = False
        
        for entity in entities:
            if isinstance(entity, dict):
                if entity.get('label') == 'DEPARTURE':
                    has_departure = True
                elif entity.get('label') == 'ARRIVAL':
                    has_arrival = True
                    
                if has_departure and has_arrival:
                    return True
                    
        return False

    @staticmethod
    def create():
        try:
            data = request.get_json()
            
            if 'text' not in data:
                return jsonify({'error': 'Text field is required'}), 400
            
            entities = data.get('entities', [])
            
            is_valid = SentenceController.validate_entities_has_both_locations(entities)
            
            new_sentence = Sentence(
                text=data['text'],
                entities=entities,
                is_valid=is_valid,
                is_treated=data.get('isTreated', is_valid)
            )
            
            db.session.add(new_sentence)
            db.session.commit()
            
            return jsonify(new_sentence.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def update(sentence_id):
        try:
            sentence = Sentence.query.get_or_404(sentence_id)
            data = request.get_json()
            
            if 'text' in data:
                sentence.text = data['text']
                
            if 'entities' in data:
                sentence.entities = data['entities']
                sentence.is_valid = SentenceController.validate_entities_has_both_locations(data['entities'])
            
            if 'isTreated' in data:
                sentence.is_treated = data['isTreated']
            
            sentence.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify(sentence.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def delete(sentence_id):
        try:
            sentence = Sentence.query.get_or_404(sentence_id)
            db.session.delete(sentence)
            db.session.commit()
            
            return jsonify({'message': f'Sentence {sentence_id} deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def validate(sentence_id):
        try:
            sentence = Sentence.query.get_or_404(sentence_id)
            sentence.is_valid = True
            sentence.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify(sentence.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def invalidate(sentence_id):
        try:
            sentence = Sentence.query.get_or_404(sentence_id)
            sentence.is_valid = False
            sentence.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify(sentence.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def mark_as_treated(sentence_id):  # New method
        try:
            sentence = Sentence.query.get_or_404(sentence_id)
            sentence.is_treated = True
            sentence.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify(sentence.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def mark_as_untreated(sentence_id):  # New method
        try:
            sentence = Sentence.query.get_or_404(sentence_id)
            sentence.is_treated = False
            sentence.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify(sentence.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def mark_all_as_treated():
        try:
            # Build query
            query = Sentence.query.filter(Sentence.is_treated == False)
            
            # Update all matching records
            count = query.update({
                'is_treated': True,
                'updated_at': datetime.utcnow()
            }, synchronize_session=False)
            
            db.session.commit()
            
            return jsonify({
                'message': f'Successfully marked {count} sentences as treated',
                'count': count
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
        
    @staticmethod
    def validate_entities():
        try:
            query = Sentence.query.filter(Sentence.is_treated == True)
            sentences = query.all()
            
            updated_count = 0
            for sentence in sentences:
                has_departure = False
                has_arrival = False
                
                if sentence.entities and isinstance(sentence.entities, list):
                    for entity in sentence.entities:
                        if isinstance(entity, dict):
                            if entity.get('label') == 'DEPARTURE':
                                has_departure = True
                            elif entity.get('label') == 'ARRIVAL':
                                has_arrival = True
                
                if not (has_departure and has_arrival):
                    sentence.is_valid = False
                    sentence.updated_at = datetime.utcnow()
                    updated_count += 1
                else:
                    sentence.is_valid = True
                    sentence.updated_at = datetime.utcnow()
                    updated_count += 1
            
            db.session.commit()
            
            return jsonify({
                'message': f'Successfully validated {len(sentences)} sentences, updated {updated_count} sentences',
                'total_processed': len(sentences),
                'updated_count': updated_count
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
        
    @staticmethod
    def get_stats():
        try:
            total_count = Sentence.query.count()
            valid_count = Sentence.query.filter(Sentence.is_valid == True).count()
            treated_count = Sentence.query.filter(Sentence.is_treated == True).count()
            
            response = {
                'total_sentences': total_count,
                'valid_sentences': valid_count,
                'treated_sentences': treated_count,
                'completion_rate': round((treated_count / total_count * 100) if total_count > 0 else 0, 2),
                'validation_rate': round((valid_count / total_count * 100) if total_count > 0 else 0, 2)
            }
            
            return jsonify(response), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500