import os

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from extensions import db, bcrypt, jwt
from utils.exceptions import AppError

from routes.auth_routes import auth_bp
from routes.restaurant_routes import restaurant_bp
from routes.booking_routes import booking_bp
from routes.menu_routes import menu_bp
from routes.review_routes import review_bp
from routes.favorite_routes import favorite_bp
from routes.admin_routes import admin_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Warn (don't crash) if secrets are missing, default or too short.
    if not app.config.get("TESTING"):
        for key in ("SECRET_KEY", "JWT_SECRET_KEY"):
            value = app.config.get(key) or ""
            if value.startswith("dev-") or len(value) < 32:
                app.logger.warning(
                    "%s is a default or short value. Generate a real one: "
                    "python -c \"import secrets; print(secrets.token_hex(32))\"", key
                )

    # Init extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(restaurant_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(favorite_bp)
    app.register_blueprint(admin_bp)

    app.json.sort_keys = False

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok", "service": "BookABite API"}), 200

    @app.errorhandler(AppError)
    def handle_app_error(e):
        return jsonify(e.to_dict()), e.status_code

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"error": "The requested resource was not found."}), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        return jsonify({"error": "This HTTP method is not allowed for this endpoint."}), 405

    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        app.logger.exception("Unhandled exception")
        return jsonify({"error": "Something went wrong. Please try again later."}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    # Debug mode exposes an interactive console: only enable it locally via FLASK_DEBUG=1
    app.run(debug=os.getenv("FLASK_DEBUG", "0") == "1", port=5000)