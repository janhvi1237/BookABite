from flask import Blueprint, request, jsonify
from extensions import db
from models import Restaurant, Amenity, RestaurantImage
from datetime import time

restaurant_bp = Blueprint(
    "restaurants",
    __name__,
    url_prefix="/api/restaurants"
)


# ============================================================
# LIST / SEARCH / FILTER RESTAURANTS
# GET /api/restaurants
# ============================================================
@restaurant_bp.route("", methods=["GET"])
def list_restaurants():
    city = request.args.get("city")
    cuisine = request.args.get("cuisine")
    search = request.args.get("search")
    food_type = request.args.get("food_type")
    min_rating = request.args.get("min_rating")
    max_price = request.args.get("max_price")
    amenity = request.args.get("amenity")
    sort_by = request.args.get("sort_by", "rating_desc")

    query = Restaurant.query.filter(Restaurant.is_active == True)

    if city and city.lower() != "all":
        query = query.filter(
            Restaurant.city.ilike(f"%{city}%")
        )

    if cuisine and cuisine.lower() != "all":
        query = query.filter(
            Restaurant.cuisine_type.ilike(f"%{cuisine}%")
        )

    if food_type and food_type.lower() != "all":
        query = query.filter(
            Restaurant.food_type.ilike(f"%{food_type}%")
        )

    if min_rating:
        try:
            query = query.filter(
                Restaurant.rating >= float(min_rating)
            )
        except ValueError:
            pass

    if max_price:
        try:
            query = query.filter(
                Restaurant.avg_budget_for_two <= float(max_price)
            )
        except ValueError:
            pass

    if amenity:
        query = query.filter(
            Restaurant.amenities.any(
                Amenity.name.ilike(f"%{amenity}%")
            )
        )

    if search:
        search_filter = f"%{search}%"

        query = query.filter(
            (Restaurant.name.ilike(search_filter))
            | (Restaurant.description.ilike(search_filter))
            | (Restaurant.cuisine_type.ilike(search_filter))
            | (Restaurant.area.ilike(search_filter))
            | (Restaurant.city.ilike(search_filter))
        )

    # --------------------------------------------------------
    # SORTING
    # --------------------------------------------------------
    if sort_by == "rating_desc":
        query = query.order_by(
            Restaurant.rating.desc(),
            Restaurant.total_reviews.desc()
        )

    elif sort_by == "price_asc":
        query = query.order_by(
            Restaurant.avg_budget_for_two.asc()
        )

    elif sort_by == "price_desc":
        query = query.order_by(
            Restaurant.avg_budget_for_two.desc()
        )

    elif sort_by == "name_asc":
        query = query.order_by(
            Restaurant.name.asc()
        )

    else:
        query = query.order_by(
            Restaurant.rating.desc()
        )

    restaurants = query.all()

    return jsonify(
        [restaurant.to_dict() for restaurant in restaurants]
    ), 200


# ============================================================
# GET RESTAURANTS BY OWNER
# GET /api/restaurants/owner?owner_id=...
# ============================================================
@restaurant_bp.route("/owner", methods=["GET"])
def get_owner_restaurants():
    owner_id = request.args.get("owner_id")

    if not owner_id:
        return jsonify({
            "error": "owner_id query parameter is required"
        }), 400

    try:
        owner_id = int(owner_id)
    except ValueError:
        return jsonify({
            "error": "Invalid owner_id"
        }), 400

    # Only return ACTIVE restaurants.
    # Deleted/deactivated restaurants will no longer
    # appear in the owner's Manage Restaurants page.
    restaurants = (
        Restaurant.query
        .filter_by(
            owner_id=owner_id,
            is_active=True
        )
        .all()
    )

    return jsonify(
        [restaurant.to_dict() for restaurant in restaurants]
    ), 200


# ============================================================
# GET SINGLE RESTAURANT BY ID
# GET /api/restaurants/<restaurant_id>
# ============================================================
@restaurant_bp.route("/<int:restaurant_id>", methods=["GET"])
def get_restaurant(restaurant_id):
    restaurant = Restaurant.query.get(restaurant_id)

    if not restaurant:
        return jsonify({
            "error": "Restaurant not found"
        }), 404

    # Do not allow inactive restaurants to be opened.
    if not restaurant.is_active:
        return jsonify({
            "error": "Restaurant not found"
        }), 404

    data = restaurant.to_dict()

    # Include reviews
    reviews = [
        review.to_dict()
        for review in restaurant.reviews
    ]

    data["reviews_list"] = reviews

    return jsonify(data), 200


# ============================================================
# CREATE RESTAURANT
# POST /api/restaurants
# ============================================================
@restaurant_bp.route("", methods=["POST"])
def create_restaurant():
    data = request.get_json(silent=True) or {}

    name = data.get("name")
    address = data.get("address")

    if not name or not address:
        return jsonify({
            "error": "Restaurant name and address are required"
        }), 400

    # --------------------------------------------------------
    # TIME PARSER
    # --------------------------------------------------------
    def parse_time(value, default_time):
        if not value:
            return default_time

        try:
            parts = [
                int(part)
                for part in str(value).split(":")[:2]
            ]

            return time(parts[0], parts[1])

        except Exception:
            return default_time

    opening_time = parse_time(
        data.get("opening_time"),
        time(11, 0)
    )

    closing_time = parse_time(
        data.get("closing_time"),
        time(23, 0)
    )

    # --------------------------------------------------------
    # CREATE RESTAURANT
    # --------------------------------------------------------
    restaurant = Restaurant(
        name=name.strip(),

        description=(
            data.get("description", "").strip()
            if data.get("description")
            else ""
        ),

        address=address.strip(),

        area=(
            data.get("area", "Downtown").strip()
            if data.get("area")
            else "Downtown"
        ),

        city=(
            data.get("city", "Pune").strip()
            if data.get("city")
            else "Pune"
        ),

        cuisine_type=(
            data.get("cuisine_type", "Multi-Cuisine").strip()
            if data.get("cuisine_type")
            else "Multi-Cuisine"
        ),

        food_type=data.get(
            "food_type",
            "Veg & Non-Veg"
        ),

        avg_budget_for_two=float(
            data.get("avg_budget_for_two", 1200)
        ),

        rating=float(
            data.get("rating", 4.5)
        ),

        total_reviews=int(
            data.get("total_reviews", 0)
        ),

        opening_time=opening_time,

        closing_time=closing_time,

        cover_image=data.get(
            "cover_image",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"
        ),

        is_instant_booking=bool(
            data.get("is_instant_booking", True)
        ),

        owner_id=(
            int(data.get("owner_id"))
            if data.get("owner_id")
            else None
        ),

        is_active=True,
    )

    # --------------------------------------------------------
    # ATTACH AMENITIES
    # --------------------------------------------------------
    amenities_names = data.get("amenities", [])

    if isinstance(amenities_names, list):
        for amenity_name in amenities_names:

            if not amenity_name:
                continue

            amenity = Amenity.query.filter_by(
                name=amenity_name
            ).first()

            if not amenity:
                amenity = Amenity(
                    name=amenity_name
                )

                db.session.add(amenity)

            restaurant.amenities.append(amenity)

    # --------------------------------------------------------
    # ADD GALLERY IMAGES
    # --------------------------------------------------------
    gallery_images = data.get("images", [])

    if isinstance(gallery_images, list):

        for image_url in gallery_images:

            if image_url:
                restaurant.images.append(
                    RestaurantImage(
                        image_url=image_url
                    )
                )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------
    try:
        db.session.add(restaurant)
        db.session.commit()

        return jsonify({
            "message": "Restaurant registered successfully",
            "restaurant": restaurant.to_dict()
        }), 201

    except Exception as error:
        db.session.rollback()

        print(
            "RESTAURANT CREATE ERROR:",
            error
        )

        return jsonify({
            "error": "Failed to create restaurant",
            "details": str(error)
        }), 500


# ============================================================
# UPDATE RESTAURANT
# PUT /api/restaurants/<restaurant_id>
# ============================================================
@restaurant_bp.route("/<int:restaurant_id>", methods=["PUT"])
def update_restaurant(restaurant_id):
    restaurant = Restaurant.query.get(restaurant_id)

    if not restaurant:
        return jsonify({
            "error": "Restaurant not found"
        }), 404

    data = request.get_json(silent=True) or {}

    try:

        if "name" in data:
            restaurant.name = (
                data["name"].strip()
                if data["name"]
                else restaurant.name
            )

        if "description" in data:
            restaurant.description = (
                data["description"].strip()
                if data["description"]
                else ""
            )

        if "address" in data:
            restaurant.address = (
                data["address"].strip()
                if data["address"]
                else restaurant.address
            )

        if "area" in data:
            restaurant.area = (
                data["area"].strip()
                if data["area"]
                else ""
            )

        if "city" in data:
            restaurant.city = (
                data["city"].strip()
                if data["city"]
                else restaurant.city
            )

        if "cuisine_type" in data:
            restaurant.cuisine_type = (
                data["cuisine_type"].strip()
                if data["cuisine_type"]
                else restaurant.cuisine_type
            )

        if "food_type" in data:
            restaurant.food_type = data["food_type"]

        if "avg_budget_for_two" in data:
            if data["avg_budget_for_two"] not in (
                None,
                ""
            ):
                restaurant.avg_budget_for_two = float(
                    data["avg_budget_for_two"]
                )

        if "opening_time" in data:
            if data["opening_time"]:
                parts = [
                    int(part)
                    for part in str(
                        data["opening_time"]
                    ).split(":")[:2]
                ]

                restaurant.opening_time = time(
                    parts[0],
                    parts[1]
                )

        if "closing_time" in data:
            if data["closing_time"]:
                parts = [
                    int(part)
                    for part in str(
                        data["closing_time"]
                    ).split(":")[:2]
                ]

                restaurant.closing_time = time(
                    parts[0],
                    parts[1]
                )

        if "cover_image" in data:
            restaurant.cover_image = data["cover_image"]

        if "is_instant_booking" in data:
            restaurant.is_instant_booking = bool(
                data["is_instant_booking"]
            )

        # ----------------------------------------------------
        # UPDATE AMENITIES
        # ----------------------------------------------------
        if "amenities" in data:

            restaurant.amenities = []

            amenities_names = data["amenities"]

            if isinstance(amenities_names, list):

                for amenity_name in amenities_names:

                    if not amenity_name:
                        continue

                    amenity = Amenity.query.filter_by(
                        name=amenity_name
                    ).first()

                    if not amenity:
                        amenity = Amenity(
                            name=amenity_name
                        )

                        db.session.add(amenity)

                    restaurant.amenities.append(
                        amenity
                    )

        db.session.commit()

        return jsonify({
            "message": "Restaurant updated successfully",
            "restaurant": restaurant.to_dict()
        }), 200

    except Exception as error:

        db.session.rollback()

        print(
            "RESTAURANT UPDATE ERROR:",
            error
        )

        return jsonify({
            "error": "Failed to update restaurant",
            "details": str(error)
        }), 500


# ============================================================
# DELETE / DEACTIVATE RESTAURANT
# DELETE /api/restaurants/<restaurant_id>
#
# IMPORTANT:
# We intentionally DEACTIVATE instead of physically deleting
# the database row.
#
# This keeps existing bookings/reviews safe while making the
# restaurant disappear from both customer and owner views.
# ============================================================
@restaurant_bp.route("/<int:restaurant_id>", methods=["DELETE"])
def delete_restaurant(restaurant_id):

    restaurant = Restaurant.query.get(restaurant_id)

    if not restaurant:
        return jsonify({
            "error": "Restaurant not found"
        }), 404

    try:

        restaurant.is_active = False

        db.session.commit()

        return jsonify({
            "message": "Restaurant deleted successfully",
            "restaurant_id": restaurant_id
        }), 200

    except Exception as error:

        db.session.rollback()

        print(
            "RESTAURANT DELETE ERROR:",
            error
        )

        return jsonify({
            "error": "Failed to delete restaurant",
            "details": str(error)
        }), 500