"""Owner tools for the restaurant's real tables.

An owner (or admin) lists, adds, edits and removes the tables of THEIR OWN
restaurants and sets how long a sitting lasts. Customers never call these;
they just book, and the system picks a table (see services/table_service.py).
"""
from datetime import date, time

from flask import Blueprint, request, jsonify

from extensions import db
from models.booking import Booking
from models.restaurant import Restaurant, RestaurantTable
from services import table_service
from services import table_allocator as allocator
from services.table_allocator import overlaps, to_minutes
from utils.auth import roles_required, current_user, can_manage_restaurant, forbidden

table_bp = Blueprint("tables", __name__, url_prefix="/api")

MAX_SEATS_PER_TABLE = 20
ACTIVE = ["Pending", "Confirmed"]


def _my_restaurant(restaurant_id):
    """(restaurant, error_response). Owners only reach their own restaurants."""
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return None, (jsonify({"error": "Restaurant not found"}), 404)
    if not can_manage_restaurant(current_user(), restaurant):
        return None, forbidden("You can only manage tables of your own restaurants.")
    return restaurant, None


def _seats(value):
    try:
        seats = int(value)
    except (TypeError, ValueError):
        return None
    return seats if 1 <= seats <= MAX_SEATS_PER_TABLE else None


def _future_bookings_on(table_id):
    return Booking.query.filter(
        Booking.table_id == table_id,
        Booking.status.in_(ACTIVE),
        Booking.booking_date >= date.today(),
    ).all()


@table_bp.route("/restaurants/<int:restaurant_id>/tables", methods=["GET"])
@roles_required("owner", "admin")
def list_tables(restaurant_id):
    restaurant, error = _my_restaurant(restaurant_id)
    if error:
        return error
    tables = (RestaurantTable.query.filter_by(restaurant_id=restaurant_id)
              .order_by(RestaurantTable.table_id).all())
    active = [t for t in tables if t.is_active is not False]
    return jsonify({
        "tables": [t.to_dict() for t in tables],
        "summary": {
            "tables": len(active),
            "total_seats": sum(t.capacity for t in active),
            "largest_table": max((t.capacity for t in active), default=0),
        },
        "settings": {
            "dining_duration_minutes": restaurant.dining_duration_minutes or 90,
            "max_advance_days": restaurant.max_advance_days or 30,
        },
    }), 200


@table_bp.route("/restaurants/<int:restaurant_id>/tables/availability", methods=["GET"])
@roles_required("owner", "admin")
def table_availability(restaurant_id):
    restaurant, error = _my_restaurant(restaurant_id)
    if error:
        return error

    try:
        booking_date = date.fromisoformat(request.args.get("booking_date", ""))
        booking_time = time.fromisoformat(request.args.get("booking_time", ""))
    except ValueError:
        return jsonify({"error": "booking_date and booking_time must be valid ISO date/time values"}), 400

    start = to_minutes(booking_time)
    end = start + table_service.sitting_minutes(restaurant)
    tables = table_service.load_tables(restaurant_id)
    busy = table_service.load_busy(restaurant, booking_date)
    bookings = Booking.query.filter(
        Booking.restaurant_id == restaurant_id,
        Booking.booking_date == booking_date,
        Booking.status.in_(ACTIVE),
        Booking.table_id.isnot(None),
    ).all()
    booking_by_table = {
        booking.table_id: booking
        for booking in bookings
        if booking.booking_time
        and overlaps(
            start,
            end,
            to_minutes(booking.booking_time),
            (to_minutes(booking.end_time) if booking.end_time else
             to_minutes(booking.booking_time) + table_service.sitting_minutes(restaurant))
            + (1440 if booking.end_time and booking.end_time <= booking.booking_time else 0),
        )
    }
    taken = {
        item.table_id for item in busy
        if overlaps(start, end, item.start, item.end)
    }

    results = []
    for table in sorted(tables, key=lambda item: item.table_id):
        booking = booking_by_table.get(table.table_id)
        if table.is_active is False:
            status = "out_of_service"
        elif table.table_id in taken:
            status = "booked"
        else:
            status = "available"
        results.append({
            **table.to_dict(),
            "status": status,
            "booking": ({
                "booking_id": booking.booking_id,
                "party_size": booking.party_size,
                "status": booking.status,
            } if booking else None),
        })

    return jsonify({
        "restaurant_id": restaurant_id,
        "restaurant_name": restaurant.name,
        "booking_date": booking_date.isoformat(),
        "booking_time": booking_time.strftime("%H:%M"),
        "end_time": table_service.end_time_for(
            booking_time, table_service.sitting_minutes(restaurant)
        ).strftime("%H:%M"),
        "tables": results,
        "summary": {
            "available": sum(item["status"] == "available" for item in results),
            "booked": sum(item["status"] == "booked" for item in results),
            "out_of_service": sum(item["status"] == "out_of_service" for item in results),
        },
    }), 200


@table_bp.route("/restaurants/<int:restaurant_id>/available-tables", methods=["GET"])
def customer_available_tables(restaurant_id):
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant or restaurant.is_active is False:
        return jsonify({"error": "Restaurant not found"}), 404

    try:
        booking_date = date.fromisoformat(request.args.get("booking_date", ""))
        booking_time = time.fromisoformat(request.args.get("booking_time", ""))
    except ValueError:
        return jsonify({"error": "booking_date and booking_time must be valid ISO date/time values"}), 400

    try:
        party_size = int(request.args.get("party_size", "1"))
    except (TypeError, ValueError):
        return jsonify({"error": "party_size must be a whole number between 1 and 20"}), 400
    if not 1 <= party_size <= 20:
        return jsonify({"error": "party_size must be a whole number between 1 and 20"}), 400

    tables = table_service.load_tables(restaurant_id)
    busy = table_service.load_busy(restaurant, booking_date)
    start = to_minutes(booking_time)
    duration = table_service.sitting_minutes(restaurant)
    available = allocator.free_tables(tables, busy, start, start + duration, party_size)

    return jsonify({
        "restaurant_id": restaurant_id,
        "booking_date": booking_date.isoformat(),
        "booking_time": booking_time.strftime("%H:%M"),
        "party_size": party_size,
        "tables": [
            {
                "table_id": table.table_id,
                "table_number": table.table_number or f"T{table.table_id}",
                "table_type": table.table_type,
                "capacity": table.capacity,
            }
            for table in available
        ],
        "summary": {
            "available": len(available),
            "available_seats": sum(table.capacity for table in available),
        },
    }), 200


@table_bp.route("/restaurants/<int:restaurant_id>/tables", methods=["POST"])
@roles_required("owner", "admin")
def add_table(restaurant_id):
    restaurant, error = _my_restaurant(restaurant_id)
    if error:
        return error
    data = request.get_json(silent=True) or {}

    seats = _seats(data.get("capacity"))
    if seats is None:
        return jsonify({"error": f"capacity must be a whole number from 1 to {MAX_SEATS_PER_TABLE}"}), 400

    existing = RestaurantTable.query.filter_by(restaurant_id=restaurant_id).all()
    label = str(data.get("table_number") or "").strip()[:20] or f"T{len(existing) + 1}"
    if any((t.table_number or "").lower() == label.lower() for t in existing):
        return jsonify({"error": f"A table called {label} already exists"}), 409

    table = RestaurantTable(
        restaurant_id=restaurant_id,
        table_number=label,
        table_type=str(data.get("table_type") or "Indoor").strip()[:50],
        capacity=seats,
        is_active=True,
    )
    db.session.add(table)
    db.session.commit()
    return jsonify({"message": "Table added", "table": table.to_dict()}), 201


@table_bp.route("/tables/<int:table_id>", methods=["PUT"])
@roles_required("owner", "admin")
def update_table(table_id):
    table = RestaurantTable.query.get(table_id)
    if not table:
        return jsonify({"error": "Table not found"}), 404
    restaurant, error = _my_restaurant(table.restaurant_id)
    if error:
        return error
    data = request.get_json(silent=True) or {}

    new_seats = table.capacity
    if "capacity" in data:
        new_seats = _seats(data["capacity"])
        if new_seats is None:
            return jsonify({"error": f"capacity must be a whole number from 1 to {MAX_SEATS_PER_TABLE}"}), 400

    turning_off = data.get("is_active") is False and table.is_active is not False
    shrinking = new_seats < table.capacity
    if turning_off or shrinking:
        blocked = [b for b in _future_bookings_on(table_id)
                   if turning_off or int(b.party_size or 0) > new_seats]
        if blocked:
            return jsonify({
                "error": (f"{len(blocked)} upcoming booking(s) use this table. "
                          "Move or cancel them first."),
                "booking_ids": [b.booking_id for b in blocked],
            }), 409

    if "table_number" in data:
        label = str(data["table_number"] or "").strip()[:20]
        if not label:
            return jsonify({"error": "table_number cannot be empty"}), 400
        clash = RestaurantTable.query.filter(
            RestaurantTable.restaurant_id == table.restaurant_id,
            RestaurantTable.table_id != table_id,
            db.func.lower(RestaurantTable.table_number) == label.lower(),
        ).first()
        if clash:
            return jsonify({"error": f"A table called {label} already exists"}), 409
        table.table_number = label
    if "table_type" in data:
        table.table_type = str(data["table_type"] or "Indoor").strip()[:50]
    if "is_active" in data:
        table.is_active = bool(data["is_active"])
    table.capacity = new_seats

    db.session.commit()
    return jsonify({"message": "Table updated", "table": table.to_dict()}), 200


@table_bp.route("/tables/<int:table_id>", methods=["DELETE"])
@roles_required("owner", "admin")
def delete_table(table_id):
    table = RestaurantTable.query.get(table_id)
    if not table:
        return jsonify({"error": "Table not found"}), 404
    restaurant, error = _my_restaurant(table.restaurant_id)
    if error:
        return error

    if Booking.query.filter_by(table_id=table_id).first():
        return jsonify({
            "error": "This table has booking history, so it cannot be deleted. "
                     "Switch it off instead (is_active = false)."
        }), 409

    db.session.delete(table)
    db.session.commit()
    return jsonify({"message": "Table deleted"}), 200


@table_bp.route("/restaurants/<int:restaurant_id>/booking-settings", methods=["PUT"])
@roles_required("owner", "admin")
def update_booking_settings(restaurant_id):
    restaurant, error = _my_restaurant(restaurant_id)
    if error:
        return error
    data = request.get_json(silent=True) or {}

    if "dining_duration_minutes" in data:
        try:
            minutes = int(data["dining_duration_minutes"])
        except (TypeError, ValueError):
            minutes = 0
        if not 30 <= minutes <= 240:
            return jsonify({"error": "dining_duration_minutes must be between 30 and 240"}), 400
        restaurant.dining_duration_minutes = minutes
    if "max_advance_days" in data:
        try:
            days = int(data["max_advance_days"])
        except (TypeError, ValueError):
            days = 0
        if not 1 <= days <= 180:
            return jsonify({"error": "max_advance_days must be between 1 and 180"}), 400
        restaurant.max_advance_days = days

    db.session.commit()
    return jsonify({
        "message": "Booking settings saved (applies to new bookings)",
        "settings": {
            "dining_duration_minutes": restaurant.dining_duration_minutes,
            "max_advance_days": restaurant.max_advance_days,
        },
    }), 200
