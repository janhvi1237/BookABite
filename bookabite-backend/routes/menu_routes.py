from flask import Blueprint, request, jsonify
from extensions import db
from models import MenuItem, Restaurant
from models.restaurant import serialize_restaurants
from utils.exceptions import AppError
from utils.auth import roles_required, current_user, can_manage_restaurant, forbidden

menu_bp = Blueprint("menu", __name__, url_prefix="/api")


# ============================================================
# GET ALL MENU ITEMS FOR A RESTAURANT
# GET /api/restaurants/<restaurant_id>/menu
# ============================================================
@menu_bp.route("/restaurants/<int:restaurant_id>/menu", methods=["GET"])
def get_restaurant_menu(restaurant_id):
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404

    items = (
        MenuItem.query.filter_by(restaurant_id=restaurant_id)
        .order_by(MenuItem.category.asc(), MenuItem.rating.desc())
        .all()
    )

    items_dict = [item.to_dict() for item in items]

    # Group by category
    categories = {}
    for item in items_dict:
        cat = item["category"] or "Other"
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)

    return (
        jsonify(
            {
                "restaurant_id": restaurant_id,
                "restaurant_name": restaurant.name,
                "items": items_dict,
                "categories": categories,
                "total_items": len(items_dict),
            }
        ),
        200,
    )


# ============================================================
# ADD A MENU ITEM TO A RESTAURANT (Owner / Manager)
# POST /api/restaurants/<restaurant_id>/menu
# ============================================================
@menu_bp.route("/restaurants/<int:restaurant_id>/menu", methods=["POST"])
@roles_required("owner", "admin")
def add_menu_item(restaurant_id):
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404
    if not can_manage_restaurant(current_user(), restaurant):
        return forbidden("You can only change the menu of your own restaurants.")

    data = request.get_json(silent=True) or {}
    name = data.get("name")
    price = data.get("price")
    category = data.get("category", "Main Course")

    if not name or price is None:
        return jsonify({"error": "Item name and price are required"}), 400

    try:
        price = float(price)
    except (ValueError, TypeError):
        return jsonify({"error": "Price must be a valid number"}), 400

    item = MenuItem(
        restaurant_id=restaurant_id,
        name=name.strip(),
        description=data.get("description", "").strip(),
        price=price,
        category=category.strip(),
        image_url=data.get(
            "image_url",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
        ),
        is_veg=bool(data.get("is_veg", True)),
        is_available=bool(data.get("is_available", True)),
        spice_level=data.get("spice_level", "Medium"),
        ingredients=data.get("ingredients", ""),
        dietary_info=data.get("dietary_info", ""),
        rating=float(data.get("rating", 4.5)),
        popularity=int(data.get("popularity", 0)),
    )

    db.session.add(item)
    db.session.commit()

    return jsonify({"message": "Menu item added successfully", "item": item.to_dict()}), 201


# ============================================================
# EXPLORE / SEARCH GLOBAL MENU ITEMS
# GET /api/menu
# ============================================================
@menu_bp.route("/menu", methods=["GET"])
def list_menu_items():
    category = request.args.get("category")
    is_veg = request.args.get("is_veg")
    search = request.args.get("search")
    restaurant_id = request.args.get("restaurant_id")

    query = MenuItem.query.filter_by(is_available=True)

    if restaurant_id:
        query = query.filter_by(restaurant_id=int(restaurant_id))
    if category and category.lower() != "all":
        query = query.filter(MenuItem.category.ilike(f"%{category}%"))
    if is_veg is not None and is_veg != "":
        query = query.filter(MenuItem.is_veg == (is_veg.lower() in ["true", "1", "yes"]))
    if search:
        query = query.filter(
            (MenuItem.name.ilike(f"%{search}%"))
            | (MenuItem.description.ilike(f"%{search}%"))
            | (MenuItem.ingredients.ilike(f"%{search}%"))
        )

    items = query.order_by(MenuItem.rating.desc(), MenuItem.popularity.desc()).all()
    res = []
    for it in items:
        d = it.to_dict()
        if it.restaurant:
            d["restaurant_name"] = it.restaurant.name
            d["restaurant_area"] = it.restaurant.area
            d["restaurant_city"] = it.restaurant.city
        res.append(d)

    return jsonify(res), 200


# ============================================================
# GET SINGLE DISH DETAILS
# GET /api/menu/<item_id>
# ============================================================
@menu_bp.route("/menu/<int:item_id>", methods=["GET"])
def get_menu_item(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Dish not found"}), 404

    data = item.to_dict()
    if item.restaurant:
        data["restaurant"] = serialize_restaurants([item.restaurant])[0]

    return jsonify(data), 200


# ============================================================
# UPDATE MENU ITEM
# PUT /api/menu/<item_id>
# ============================================================
@menu_bp.route("/menu/<int:item_id>", methods=["PUT"])
@roles_required("owner", "admin")
def update_menu_item(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Dish not found"}), 404
    restaurant = Restaurant.query.get(item.restaurant_id)
    if not restaurant or not can_manage_restaurant(current_user(), restaurant):
        return forbidden("You can only change the menu of your own restaurants.")

    data = request.get_json(silent=True) or {}
    if "name" in data:
        item.name = data["name"].strip()
    if "description" in data:
        item.description = data["description"].strip()
    if "price" in data:
        item.price = float(data["price"])
    if "category" in data:
        item.category = data["category"].strip()
    if "image_url" in data:
        item.image_url = data["image_url"]
    if "is_veg" in data:
        item.is_veg = bool(data["is_veg"])
    if "is_available" in data:
        item.is_available = bool(data["is_available"])
    if "spice_level" in data:
        item.spice_level = data["spice_level"]
    if "ingredients" in data:
        item.ingredients = data["ingredients"]
    if "dietary_info" in data:
        item.dietary_info = data["dietary_info"]

    db.session.commit()
    return jsonify({"message": "Menu item updated successfully", "item": item.to_dict()}), 200


# ============================================================
# TOGGLE AVAILABILITY (In Stock / Sold Out)
# PATCH /api/menu/<item_id>/availability
# ============================================================
@menu_bp.route("/menu/<int:item_id>/availability", methods=["PATCH"])
@roles_required("owner", "admin")
def toggle_availability(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Dish not found"}), 404
    restaurant = Restaurant.query.get(item.restaurant_id)
    if not restaurant or not can_manage_restaurant(current_user(), restaurant):
        return forbidden("You can only change the menu of your own restaurants.")

    item.is_available = not item.is_available
    db.session.commit()
    return (
        jsonify(
            {
                "message": f"Dish is now {'Available' if item.is_available else 'Sold Out'}",
                "is_available": item.is_available,
            }
        ),
        200,
    )


# ============================================================
# DELETE MENU ITEM
# DELETE /api/menu/<item_id>
# ============================================================
@menu_bp.route("/menu/<int:item_id>", methods=["DELETE"])
@roles_required("owner", "admin")
def delete_menu_item(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Dish not found"}), 404
    restaurant = Restaurant.query.get(item.restaurant_id)
    if not restaurant or not can_manage_restaurant(current_user(), restaurant):
        return forbidden("You can only change the menu of your own restaurants.")

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Dish removed from menu"}), 200
