from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .sentence import Sentence
from .ml_model import MLModel, ModelType
from .city import City
from .user import User