from flask import Blueprint, request, jsonify
from services import RestaurantService
from utils.exceptions import AppError

restaurant_bp = Blueprint("restaurants", __name__, url_prefix="/api/restaurants")


@restaurant_bp.route("", methods=["GET"])
def list_restaurants():
    city = request.args.get("city", "Pune")

    try:
        restaurants = RestaurantService.list_restaurants(city=city)
    except AppError as e:
        return jsonify(e.to_dict()), e.status_code

    return jsonify(restaurants), 200


@restaurant_bp.route("/<int:restaurant_id>", methods=["GET"])
def get_restaurant(restaurant_id):
    try:
        restaurant = RestaurantService.get_restaurant(restaurant_id)
    except AppError as e:
        return jsonify(e.to_dict()), e.status_code

    return jsonify(restaurant), 200
