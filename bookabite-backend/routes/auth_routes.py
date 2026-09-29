from flask import Blueprint, request, jsonify
from services import AuthService
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
def get_current_user():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        user_id = int(user_id)
        result = AuthService.get_profile(user_id)
    except AppError as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(result), 200


@auth_bp.route("/profile", methods=["PUT"])
def update_profile():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        user_id = int(user_id)
        result = AuthService.update_profile(user_id, data)
    except AppError as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({"message": "Profile updated successfully", "user": result}), 200
