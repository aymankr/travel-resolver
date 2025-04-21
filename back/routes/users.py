from flask import Blueprint
from controllers.user_controller import UserController
from controllers.auth_controller import token_required

users_bp = Blueprint('users', __name__)

@users_bp.route('/user', methods=['POST'])
@token_required
def getByToken(current_user):
    return UserController.get_by_token()
