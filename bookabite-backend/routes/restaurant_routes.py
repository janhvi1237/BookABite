from flask import Blueprint, jsonify, request
from models import Restaurant

restaurant_bp = Blueprint("restaurants", __name__, url_prefix="/api/restaurants")


@restaurant_bp.route("", methods=["GET"])
def list_restaurants():
    """
    Basic listing endpoint. Filters (cuisine, budget, rating, amenities, etc.)
    will be layered on here once the Restaurants page is built.
    """
    city = request.args.get("city", "Pune")
    restaurants = Restaurant.query.filter_by(city=city, is_active=True).all()
    return jsonify([r.to_dict() for r in restaurants]), 200


@restaurant_bp.route("/<int:restaurant_id>", methods=["GET"])
def get_restaurant(restaurant_id):
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    return jsonify(restaurant.to_dict()), 200
