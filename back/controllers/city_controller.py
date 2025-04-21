from flask import jsonify, request
from models import db, City


class CityController:
    @staticmethod
    def paginate():
        try:
            # Get pagination parameters
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 100, type=int)
            
            # Build query
            query = City.query
            
            pagination = query.paginate(page=page, per_page=per_page, error_out=False)
            
            response = {
                'items': [city.to_dict() for city in pagination.items],
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
    def create():
        try:
            data = request.get_json()
            
            if 'name' not in data:
                return jsonify({'error': 'Name field is required'}), 400
            
            new_city = City(
                name=data['name'],
            )
            
            db.session.add(new_city)
            db.session.commit()
            
            return jsonify(new_city.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
        
    @staticmethod
    def delete(city_id):
        try:
            city = City.query.get_or_404(city_id)
            db.session.delete(city)
            db.session.commit()
            return jsonify({'message': f'City {city_id} deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
        
    @staticmethod
    def get_stats():
        try:
            total_cities = City.query.count()
            return jsonify({'total_cities': total_cities}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500