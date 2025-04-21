from flask import jsonify, request
from models import db, User
import jwt
from config import Config

class UserController:
    @staticmethod
    def get_by_token():
        data = request.get_json()
        token = data['token']
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
            
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            user = User.query.get(data['user_id'])
            
            if not user:
                return jsonify({'message': 'User not found'}), 401
                
            return jsonify({
                'id': user.id,
                'email': user.email,
            }), 200 
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401