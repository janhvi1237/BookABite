from flask import Blueprint, current_app, request, jsonify
from services import AuthService
from services.password_reset_service import (
    GENERIC_REQUEST_MESSAGE,
    mail_is_configured,
    request_password_reset,
    reset_password,
)
from utils.auth import login_required, current_user
from utils.exceptions import AppError
from utils.validators import validate_email

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """Controller: parses the request, delegates to AuthService, formats the response.
    No business logic or DB access here.
    """
    data = request.get_json(silent=True) or {}

    try:
        result = AuthService.register(data)
    except AppError as e:
        return jsonify(e.to_dict()), e.status_code

    return jsonify({"message": "Registered successfully", **result}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    try:
        result = AuthService.login(data)
    except AppError as e:
        return jsonify(e.to_dict()), e.status_code

    return jsonify({"message": "Login successful", **result}), 200


@auth_bp.route("/password/forgot", methods=["POST"])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    if not isinstance(email, str) or validate_email(email):
        return jsonify({"error": "Enter a valid email address."}), 400
    if not mail_is_configured():
        return jsonify({
            "error": "Password reset email is not configured. Please contact the site administrator."
        }), 503

    try:
        request_password_reset(email)
    except Exception:
        current_app.logger.exception("Could not send password reset email")
        return jsonify({
            "error": "We could not send a password reset email right now. Please try again later."
        }), 503
    return jsonify({"message": GENERIC_REQUEST_MESSAGE}), 200


@auth_bp.route("/password/reset", methods=["POST"])
def reset_password_route():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    password = data.get("password")
    if not isinstance(token, str) or not token.strip():
        return jsonify({"error": "A password reset token is required."}), 400
    if not isinstance(password, str):
        return jsonify({"error": "Enter a valid new password."}), 400

    result, status = reset_password(token, password)
    return jsonify(result), status


@auth_bp.route("/me", methods=["GET"])
@login_required
def get_current_user():
    # Always the logged-in user (the user_id sent by the browser is ignored).
    return jsonify(current_user().to_dict()), 200


@auth_bp.route("/profile", methods=["PUT"])
@login_required
def update_profile():
    data = request.get_json(silent=True) or {}

    try:
        result = AuthService.update_profile(current_user().user_id, data)
    except AppError as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({"message": "Profile updated successfully", "user": result}), 200
