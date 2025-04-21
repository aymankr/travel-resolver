def register_routes(app):
    from routes.sentences import sentences_bp
    from routes.ml_models import ml_models_bp
    from routes.train_mappers import train_mappers_bp
    from routes.cities import cities_bp
    from routes.auth import auth_bp
    from routes.users import users_bp
    from .whisper import whisper_bp

    app.register_blueprint(sentences_bp)
    app.register_blueprint(ml_models_bp)
    app.register_blueprint(train_mappers_bp)
    app.register_blueprint(cities_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(whisper_bp)