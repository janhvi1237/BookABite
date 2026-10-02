from flask import Blueprint, request, jsonify
from services import AuthService
from utils.auth import login_required, current_user
from utils.exceptions import AppError

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
