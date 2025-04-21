from flask import Blueprint
from controllers.train_mapper_controller import TrainMapperController

train_mappers_bp = Blueprint('train_mappers', __name__)

# Existing routes
@train_mappers_bp.route('/process_query', methods=['POST'])
def get_routes():
    controller = TrainMapperController()
    return controller.process_query()