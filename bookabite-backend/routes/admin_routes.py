from flask import Blueprint, request, jsonify

from extensions import db
from models import User, Restaurant, Review
from models.booking import Booking
from models.restaurant import serialize_restaurants
from datetime import date
from services.settings_service import get_settings, update_settings
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

    results = serialize_restaurants(restaurants)
    for r, item in zip(restaurants, results):
        item["is_active"] = r.is_active
        item["owner_id"] = r.owner_id
        owner = owners.get(r.owner_id)
        item["owner_name"] = owner.full_name if owner else None
        item["owner_email"] = owner.email if owner else None
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


# GET /api/admin/settings  -> current fee settings
# PUT /api/admin/settings  body: any of customer_fee_per_guest, customer_fee_max, owner_fee_per_guest
@admin_bp.route("/settings", methods=["GET", "PUT"])
@roles_required(ROLE_ADMIN)
def fee_settings():
    if request.method == "PUT":
        settings, error = update_settings(request.get_json(silent=True) or {})
        if error:
            return jsonify({"error": error}), 400
    else:
        settings = get_settings()
    return jsonify({k: float(v) for k, v in settings.items()}), 200


# GET /api/admin/owner-billing?month=2026-10
# What each owner owes for COMPLETED bookings in the month + what customers paid in fees.
@admin_bp.route("/owner-billing", methods=["GET"])
@roles_required(ROLE_ADMIN)
def owner_billing():
    month = request.args.get("month") or date.today().strftime("%Y-%m")
    try:
        year, mon = (int(x) for x in month.split("-"))
        start = date(year, mon, 1)
        end = date(year + (mon == 12), mon % 12 + 1, 1)
    except (ValueError, TypeError):
        return jsonify({"error": "month must look like 2026-10"}), 400

    bookings = Booking.query.filter(Booking.booking_date >= start, Booking.booking_date < end).all()
    rows = {}
    customer_fees = 0.0
    for b in bookings:
        if b.fee_status == "Paid":
            customer_fees += float(b.booking_fee or 0)
        if b.status != "Completed" or not b.restaurant:
            continue
        r = b.restaurant
        row = rows.setdefault(r.restaurant_id, {
            "restaurant_id": r.restaurant_id, "restaurant_name": r.name,
            "owner_id": r.owner_id, "owner_name": None, "owner_email": None,
            "completed_bookings": 0, "guests": 0, "amount_due": 0.0,
        })
        row["completed_bookings"] += 1
        row["guests"] += int(b.party_size or 0)
        row["amount_due"] += float(b.owner_fee or 0)

    owner_ids = {r["owner_id"] for r in rows.values() if r["owner_id"]}
    owners = {u.user_id: u for u in User.query.filter(User.user_id.in_(owner_ids)).all()} if owner_ids else {}
    for row in rows.values():
        owner = owners.get(row["owner_id"])
        if owner:
            row["owner_name"], row["owner_email"] = owner.full_name, owner.email
        row["amount_due"] = round(row["amount_due"], 2)

    owner_total = round(sum(r["amount_due"] for r in rows.values()), 2)
    return jsonify({
        "month": month,
        "rows": sorted(rows.values(), key=lambda r: -r["amount_due"]),
        "owner_fees_total": owner_total,
        "customer_fees_total": round(customer_fees, 2),
        "platform_revenue": round(owner_total + customer_fees, 2),
    }), 200
