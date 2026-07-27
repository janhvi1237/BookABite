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
