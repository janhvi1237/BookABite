from flask import Blueprint, request, jsonify
from extensions import db
from models import Favorite, Restaurant, User
from utils.auth import login_required, current_user, optional_user

favorite_bp = Blueprint("favorites", __name__, url_prefix="/api/favorites")


# ============================================================
# GET ALL FAVORITES FOR A USER
# GET /api/favorites?user_id=...
# ============================================================
@favorite_bp.route("", methods=["GET"])
@login_required
def get_favorites():
    user_id = current_user().user_id  # always the logged-in user

    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"error": "Invalid user_id"}), 400

    favorites = Favorite.query.filter_by(user_id=user_id).all()
    results = []
    for fav in favorites:
        restaurant = Restaurant.query.get(fav.restaurant_id)
        if restaurant and restaurant.is_active:
            r_dict = restaurant.to_dict()
            r_dict["favorited_at"] = fav.created_at.isoformat() if fav.created_at else None
            results.append(r_dict)

    return jsonify(results), 200


# ============================================================
# TOGGLE FAVORITE
# POST /api/favorites
# ============================================================
@favorite_bp.route("", methods=["POST"])
@login_required
def toggle_favorite():
    data = request.get_json(silent=True) or {}
    user_id = current_user().user_id  # always the logged-in user
    restaurant_id = data.get("restaurant_id")

    if not restaurant_id:
        return jsonify({"error": "restaurant_id is required"}), 400

    try:
        user_id = int(user_id)
        restaurant_id = int(restaurant_id)
    except ValueError:
        return jsonify({"error": "Invalid IDs"}), 400

    existing = Favorite.query.filter_by(user_id=user_id, restaurant_id=restaurant_id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"message": "Removed from favorites", "is_favorite": False}), 200
    else:
        fav = Favorite(user_id=user_id, restaurant_id=restaurant_id)
        db.session.add(fav)
        db.session.commit()
        return jsonify({"message": "Added to favorites", "is_favorite": True}), 201


# ============================================================
# CHECK IF FAVORITED
# GET /api/favorites/check?user_id=...&restaurant_id=...
# ============================================================
@favorite_bp.route("/check", methods=["GET"])
def check_favorite():
    me = optional_user()  # visitors who are not logged in simply get False
    user_id = me.user_id if me else None
    restaurant_id = request.args.get("restaurant_id")

    if not user_id or not restaurant_id:
        return jsonify({"is_favorite": False}), 200

    try:
        existing = Favorite.query.filter_by(
            user_id=int(user_id), restaurant_id=int(restaurant_id)
        ).first()
        return jsonify({"is_favorite": bool(existing)}), 200
    except Exception:
        return jsonify({"is_favorite": False}), 200
