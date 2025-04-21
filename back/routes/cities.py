from flask import Blueprint
from controllers.city_controller import CityController
from controllers.auth_controller import token_required

cities_bp = Blueprint('cities', __name__)

@cities_bp.route('/cities', methods=['GET'])
@token_required
def get_sentences(current_user):
    return CityController.paginate()

@cities_bp.route('/cities', methods=['POST'])
def create():
    return CityController.create()

@cities_bp.route('/cities/<int:city_id>', methods=['DELETE'])
@token_required
def delete_city(current_user, city_id):
    return CityController.delete(city_id)

@cities_bp.route('/cities/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    return CityController.get_stats()
