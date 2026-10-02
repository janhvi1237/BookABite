from flask import Blueprint, request, jsonify

from extensions import db
from models import User, Restaurant, Review
from models.booking import Booking
from utils.auth import roles_required, current_user, ROLE_ADMIN, ROLE_OWNER, ROLE_CUSTOMER

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

VALID_ROLES = (ROLE_CUSTOMER, ROLE_OWNER, ROLE_ADMIN)


# GET /api/admin/stats  -> numbers for the dashboard cards
@admin_bp.route("/stats", methods=["GET"])
@roles_required(ROLE_ADMIN)
def stats():
    owners = User.query.filter(User.role == ROLE_OWNER).count()
    admins = User.query.filter(User.role == ROLE_ADMIN).count()
    total_users = User.query.count()
    return jsonify({
        "users": total_users,
        "customers": total_users - owners - admins,
        "owners": owners,
        "pending_owners": User.query.filter(User.role == ROLE_OWNER, User.is_approved == False).count(),  # noqa: E712
        "admins": admins,
        "restaurants": Restaurant.query.count(),
        "active_restaurants": Restaurant.query.filter_by(is_active=True).count(),
        "bookings": Booking.query.count(),
        "pending_bookings": Booking.query.filter_by(status="Pending").count(),
        "reviews": Review.query.count(),
    }), 200


# GET /api/admin/users?role=owner&search=abc
@admin_bp.route("/users", methods=["GET"])
@roles_required(ROLE_ADMIN)
def list_users():
    query = User.query

    role = request.args.get("role")
    if role in VALID_ROLES:
        query = query.filter(User.role == role)

    if request.args.get("approval") == "pending":
        query = query.filter(User.role == ROLE_OWNER, User.is_approved == False)  # noqa: E712

    search = (request.args.get("search") or "").strip()
    if search:
        like = f"%{search}%"
        query = query.filter(db.or_(User.full_name.ilike(like), User.email.ilike(like)))

    users = query.order_by(User.user_id).limit(500).all()
    return jsonify([u.to_dict() for u in users]), 200


# PUT /api/admin/users/<id>/role   body: {"role": "customer" | "owner" | "admin"}
@admin_bp.route("/users/<int:user_id>/role", methods=["PUT"])
@roles_required(ROLE_ADMIN)
def set_user_role(user_id):
    data = request.get_json(silent=True) or {}
    role = data.get("role")

    if role not in VALID_ROLES:
        return jsonify({"error": f"Role must be one of: {', '.join(VALID_ROLES)}"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.user_id == current_user().user_id:
        return jsonify({"error": "You cannot change your own role."}), 400

    # Someone who stops being an owner must not keep control of restaurants.
    if user.role == ROLE_OWNER and role != ROLE_OWNER:
        for restaurant in Restaurant.query.filter_by(owner_id=user.user_id).all():
            restaurant.owner_id = None

    user.role = role
    user.is_admin = role == ROLE_ADMIN
    user.is_approved = True  # an admin choosing a role is also an approval
    db.session.commit()
    return jsonify({"message": "Role updated", "user": user.to_dict()}), 200


# PUT /api/admin/users/<id>/approval   body: {"approved": true | false}
# true  -> the owner can start using the owner area
# false -> the sign-up is rejected (account becomes a normal customer)
@admin_bp.route("/users/<int:user_id>/approval", methods=["PUT"])
@roles_required(ROLE_ADMIN)
def set_owner_approval(user_id):
    data = request.get_json(silent=True) or {}
    approved = data.get("approved")

    if not isinstance(approved, bool):
        return jsonify({"error": "approved must be true or false"}), 400

    user = User.query.get(user_id)
    if not user or user.role != ROLE_OWNER:
        return jsonify({"error": "Owner account not found"}), 404

    if approved:
        user.is_approved = True
    else:
        user.role = ROLE_CUSTOMER
        user.is_approved = True
        for restaurant in Restaurant.query.filter_by(owner_id=user.user_id).all():
            restaurant.owner_id = None

    db.session.commit()
    return jsonify({"message": "Owner approved" if approved else "Owner rejected", "user": user.to_dict()}), 200


# GET /api/admin/restaurants   (includes inactive ones)
@admin_bp.route("/restaurants", methods=["GET"])
@roles_required(ROLE_ADMIN)
def list_restaurants():
    restaurants = Restaurant.query.order_by(Restaurant.restaurant_id).all()

    owner_ids = {r.owner_id for r in restaurants if r.owner_id}
    owners = {}
    if owner_ids:
        owners = {u.user_id: u for u in User.query.filter(User.user_id.in_(owner_ids)).all()}

    results = []
    for r in restaurants:
        item = r.to_dict()
        item["is_active"] = r.is_active
        item["owner_id"] = r.owner_id
        owner = owners.get(r.owner_id)
        item["owner_name"] = owner.full_name if owner else None
        item["owner_email"] = owner.email if owner else None
        results.append(item)
    return jsonify(results), 200


# PUT /api/admin/restaurants/<id>/status   body: {"is_active": true|false}
@admin_bp.route("/restaurants/<int:restaurant_id>/status", methods=["PUT"])
@roles_required(ROLE_ADMIN)
def set_restaurant_status(restaurant_id):
    data = request.get_json(silent=True) or {}
    is_active = data.get("is_active")

    if not isinstance(is_active, bool):
        return jsonify({"error": "is_active must be true or false"}), 400

    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404

    restaurant.is_active = is_active
    db.session.commit()
    return jsonify({"message": "Status updated", "restaurant_id": restaurant_id, "is_active": is_active}), 200


# PUT /api/admin/restaurants/<id>/owner   body: {"owner_id": 6}  (null = remove owner)
@admin_bp.route("/restaurants/<int:restaurant_id>/owner", methods=["PUT"])
@roles_required(ROLE_ADMIN)
def assign_owner(restaurant_id):
    data = request.get_json(silent=True) or {}
    owner_id = data.get("owner_id")

    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404

    if owner_id is None:
        restaurant.owner_id = None
    else:
        try:
            owner = User.query.get(int(owner_id))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid owner_id"}), 400
        if not owner or owner.role != ROLE_OWNER:
            return jsonify({"error": "The selected user must have the 'owner' role."}), 400
        restaurant.owner_id = owner.user_id

    db.session.commit()
    return jsonify({"message": "Owner updated", "restaurant_id": restaurant_id, "owner_id": restaurant.owner_id}), 200


# GET /api/admin/bookings   (latest 200)
@admin_bp.route("/bookings", methods=["GET"])
@roles_required(ROLE_ADMIN)
def list_bookings():
    bookings = Booking.query.order_by(Booking.booking_id.desc()).limit(200).all()
    results = []
    for b in bookings:
        item = b.to_dict()
        item["restaurant_name"] = b.restaurant.name if b.restaurant else None
        item["customer_name"] = b.user.full_name if b.user else None
        item["customer_email"] = b.user.email if b.user else None
        results.append(item)
    return jsonify(results), 200
