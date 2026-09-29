from flask import Blueprint, request, jsonify
from datetime import datetime, date, time, timedelta

from extensions import db
from models.booking import Booking


booking_bp = Blueprint(
    "booking",
    __name__,
    url_prefix="/api/bookings"
)


# ============================================================
# HELPERS
# ============================================================

def parse_time_value(value):
    """
    Convert a restaurant opening/closing time into a Python time.

    Supports:
    - Python datetime.time
    - HH:MM
    - HH:MM:SS
    - 12-hour formats such as 11:00 AM
    """
    if value is None:
        return None

    if isinstance(value, time):
        return value

    value = str(value).strip()

    formats = [
        "%H:%M",
        "%H:%M:%S",
        "%I:%M %p",
        "%I:%M:%S %p",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).time()
        except ValueError:
            continue

    return None


def generate_time_slots(opening_time, closing_time):
    """
    Generate 30-minute booking slots.

    Handles normal hours:
        11:00 AM -> 11:00 PM

    And overnight hours:
        6:00 PM -> 2:00 AM
    """
    opening = parse_time_value(opening_time)
    closing = parse_time_value(closing_time)

    if not opening or not closing:
        return []

    base_date = date.today()

    opening_dt = datetime.combine(base_date, opening)
    closing_dt = datetime.combine(base_date, closing)

    # Closing time is next day for an overnight restaurant.
    if closing_dt <= opening_dt:
        closing_dt += timedelta(days=1)

    slots = []

    current = opening_dt

    while current < closing_dt:
        slots.append(current.time())
        current += timedelta(minutes=30)

    return slots


def format_time_label(slot_time):
    """
    Convert Python time to a user-friendly 12-hour label.
    """
    return datetime.combine(date.today(), slot_time).strftime("%I:%M %p").lstrip("0")


def get_restaurant_capacity(restaurant):
    """
    Calculate total seating capacity from RestaurantTables.capacity.

    The project uses restaurant.tables for the relationship.
    """
    total_capacity = 0

    for table in getattr(restaurant, "tables", []) or []:
        capacity = getattr(table, "capacity", 0) or 0

        try:
            total_capacity += int(capacity)
        except (TypeError, ValueError):
            continue

    return total_capacity


# ============================================================
# CHECK BOOKING AVAILABILITY
# GET /api/bookings/availability
#
# Example:
# /api/bookings/availability?restaurant_id=1&booking_date=2026-09-09
# ============================================================

@booking_bp.route("/availability", methods=["GET"])
def get_availability():
    try:
        restaurant_id = request.args.get("restaurant_id")
        booking_date_string = request.args.get("booking_date")

        if not restaurant_id:
            return jsonify({
                "error": "restaurant_id is required"
            }), 400

        if not booking_date_string:
            return jsonify({
                "error": "booking_date is required"
            }), 400

        # ----------------------------------------------------
        # Validate restaurant ID
        # ----------------------------------------------------

        try:
            restaurant_id = int(restaurant_id)
        except (TypeError, ValueError):
            return jsonify({
                "error": "Invalid restaurant_id"
            }), 400

        # ----------------------------------------------------
        # Validate date
        # ----------------------------------------------------

        try:
            booking_date = datetime.strptime(
                booking_date_string,
                "%Y-%m-%d"
            ).date()
        except ValueError:
            return jsonify({
                "error": "Invalid booking_date. Use YYYY-MM-DD"
            }), 400

        # ----------------------------------------------------
        # Import Restaurant here to avoid unnecessary import
        # coupling during application startup.
        # ----------------------------------------------------

        from models.restaurant import Restaurant

        restaurant = Restaurant.query.get(restaurant_id)

        if not restaurant:
            return jsonify({
                "error": "Restaurant not found"
            }), 404

        # ----------------------------------------------------
        # Only active restaurants can receive bookings.
        # ----------------------------------------------------

        if hasattr(restaurant, "is_active") and not restaurant.is_active:
            return jsonify({
                "error": "Restaurant is not currently available"
            }), 400

        # ----------------------------------------------------
        # Restaurant opening / closing times
        # ----------------------------------------------------

        opening_time = getattr(restaurant, "opening_time", None)
        closing_time = getattr(restaurant, "closing_time", None)

        slots = generate_time_slots(
            opening_time,
            closing_time
        )

        if not slots:
            return jsonify({
                "error": "Restaurant opening hours are not configured correctly"
            }), 400

        # ----------------------------------------------------
        # Calculate total restaurant capacity
        # ----------------------------------------------------

        total_capacity = get_restaurant_capacity(restaurant)

        if total_capacity <= 0:
            return jsonify({
                "error": "Restaurant has no table capacity configured",
                "slots": []
            }), 200

        # ----------------------------------------------------
        # Get existing Pending / Confirmed bookings
        # ----------------------------------------------------

        existing_bookings = (
            Booking.query
            .filter(
                Booking.restaurant_id == restaurant_id,
                Booking.booking_date == booking_date,
                Booking.status.in_(["Pending", "Confirmed"])
            )
            .all()
        )

        # ----------------------------------------------------
        # Calculate used capacity for every exact time.
        #
        # Example:
        # 7:00 PM -> 4 people
        # 7:30 PM -> 6 people
        # ----------------------------------------------------

        used_capacity_by_time = {}

        for booking in existing_bookings:
            booking_time = booking.booking_time

            if not booking_time:
                continue

            key = booking_time.strftime("%H:%M")

            used_capacity_by_time[key] = (
                used_capacity_by_time.get(key, 0)
                + int(booking.party_size or 0)
            )

        # ----------------------------------------------------
        # Build availability response
        # ----------------------------------------------------

        availability = []

        now = datetime.now()

        for slot in slots:
            slot_key = slot.strftime("%H:%M")

            used_capacity = used_capacity_by_time.get(
                slot_key,
                0
            )

            remaining_capacity = max(
                total_capacity - used_capacity,
                0
            )

            slot_datetime = datetime.combine(
                booking_date,
                slot
            )

            is_past = slot_datetime < now

            available = (
                remaining_capacity > 0
                and not is_past
            )

            availability.append({
                "value": slot.strftime("%H:%M"),
                "label": format_time_label(slot),
                "total_capacity": total_capacity,
                "used_capacity": used_capacity,
                "remaining_capacity": remaining_capacity,
                "available": available
            })

        return jsonify({
            "restaurant_id": restaurant_id,
            "booking_date": booking_date.isoformat(),
            "opening_time": (
                opening_time.strftime("%H:%M:%S")
                if isinstance(opening_time, time)
                else str(opening_time)
            ),
            "closing_time": (
                closing_time.strftime("%H:%M:%S")
                if isinstance(closing_time, time)
                else str(closing_time)
            ),
            "total_capacity": total_capacity,
            "slots": availability
        }), 200

    except Exception as e:
        print("BOOKING AVAILABILITY ERROR:", e)

        return jsonify({
            "error": "Failed to fetch booking availability",
            "details": str(e)
        }), 500


# ============================================================
# CREATE BOOKING
# POST /api/bookings
# ============================================================

@booking_bp.route("", methods=["POST"])
def create_booking():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Request body is required"
            }), 400

        required_fields = [
            "user_id",
            "restaurant_id",
            "booking_date",
            "booking_time",
            "party_size"
        ]

        missing_fields = [
            field
            for field in required_fields
            if data.get(field) is None
        ]

        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "fields": missing_fields
            }), 400

        # ----------------------------------------------------
        # Validate party size
        # ----------------------------------------------------

        try:
            party_size = int(data["party_size"])
        except (TypeError, ValueError):
            return jsonify({
                "error": "Party size must be a number"
            }), 400

        if party_size < 1 or party_size > 20:
            return jsonify({
                "error": "Party size must be between 1 and 20"
            }), 400

        # ----------------------------------------------------
        # Validate restaurant
        # ----------------------------------------------------

        try:
            restaurant_id = int(data["restaurant_id"])
        except (TypeError, ValueError):
            return jsonify({
                "error": "Invalid restaurant_id"
            }), 400

        from models.restaurant import Restaurant

        restaurant = Restaurant.query.get(restaurant_id)

        if not restaurant:
            return jsonify({
                "error": "Restaurant not found"
            }), 404

        if hasattr(restaurant, "is_active") and not restaurant.is_active:
            return jsonify({
                "error": "Restaurant is not currently available"
            }), 400

        # ----------------------------------------------------
        # Validate booking date
        # ----------------------------------------------------

        try:
            booking_date = datetime.strptime(
                str(data["booking_date"]),
                "%Y-%m-%d"
            ).date()
        except ValueError:
            return jsonify({
                "error": "Invalid booking date. Use YYYY-MM-DD"
            }), 400

        # ----------------------------------------------------
        # Validate booking time
        # ----------------------------------------------------

        try:
            booking_time = datetime.strptime(
                str(data["booking_time"]),
                "%H:%M"
            ).time()
        except ValueError:
            return jsonify({
                "error": "Invalid booking time. Use HH:MM"
            }), 400

        # ----------------------------------------------------
        # Prevent past bookings
        # ----------------------------------------------------

        booking_datetime = datetime.combine(
            booking_date,
            booking_time
        )

        if booking_datetime < datetime.now():
            return jsonify({
                "error": "You cannot book a table in the past"
            }), 400

        # ----------------------------------------------------
        # Validate that selected time is an actual slot
        # ----------------------------------------------------

        opening_time = getattr(
            restaurant,
            "opening_time",
            None
        )

        closing_time = getattr(
            restaurant,
            "closing_time",
            None
        )

        valid_slots = generate_time_slots(
            opening_time,
            closing_time
        )

        valid_slot_values = {
            slot.strftime("%H:%M")
            for slot in valid_slots
        }

        if booking_time.strftime("%H:%M") not in valid_slot_values:
            return jsonify({
                "error": "Selected time is outside the restaurant's booking hours"
            }), 400

        # ----------------------------------------------------
        # Calculate restaurant capacity
        # ----------------------------------------------------

        total_capacity = get_restaurant_capacity(
            restaurant
        )

        if total_capacity <= 0:
            return jsonify({
                "error": "Restaurant has no table capacity configured"
            }), 409

        # ----------------------------------------------------
        # Calculate already-used capacity for this exact time
        # ----------------------------------------------------

        existing_bookings = (
            Booking.query
            .filter(
                Booking.restaurant_id == restaurant_id,
                Booking.booking_date == booking_date,
                Booking.booking_time == booking_time,
                Booking.status.in_(["Pending", "Confirmed"])
            )
            .all()
        )

        used_capacity = sum(
            int(booking.party_size or 0)
            for booking in existing_bookings
        )

        remaining_capacity = max(
            total_capacity - used_capacity,
            0
        )

        # ----------------------------------------------------
        # Reject if there is not enough capacity
        # ----------------------------------------------------

        if party_size > remaining_capacity:
            return jsonify({
                "error": "Not enough seating capacity available for this time",
                "total_capacity": total_capacity,
                "used_capacity": used_capacity,
                "remaining_capacity": remaining_capacity,
                "requested_party_size": party_size
            }), 409

        # ----------------------------------------------------
        # Create booking
        # ----------------------------------------------------

        booking = Booking(
            user_id=int(data["user_id"]),
            restaurant_id=restaurant_id,
            table_id=data.get("table_id"),
            booking_date=booking_date,
            booking_time=booking_time,
            party_size=party_size,
            status="Pending",
            special_request=data.get("special_request"),
            scratch_card_used=False
        )

        db.session.add(booking)
        db.session.commit()

        return jsonify({
            "message": "Booking created successfully",
            "booking": booking.to_dict()
        }), 201

    except ValueError:
        db.session.rollback()

        return jsonify({
            "error": "Invalid numeric value"
        }), 400

    except Exception as e:
        db.session.rollback()

        print("BOOKING CREATE ERROR:", e)

        return jsonify({
            "error": "Failed to create booking",
            "details": str(e)
        }), 500


# ============================================================
# GET ALL BOOKINGS FOR A USER
# GET /api/bookings?user_id=1
# ============================================================

@booking_bp.route("", methods=["GET"])
def get_bookings():
    try:
        user_id = request.args.get("user_id")

        if not user_id:
            return jsonify({
                "error": "user_id is required"
            }), 400

        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({
                "error": "Invalid user_id"
            }), 400

        bookings = (
            Booking.query
            .filter_by(user_id=user_id)
            .order_by(
                Booking.booking_date.asc(),
                Booking.booking_time.asc()
            )
            .all()
        )

        results = []

        for booking in bookings:
            b_dict = booking.to_dict()

            if booking.restaurant:
                b_dict["restaurant_name"] = booking.restaurant.name
                b_dict["restaurant_cover"] = booking.restaurant.cover_image
                b_dict["restaurant_address"] = booking.restaurant.address
                b_dict["restaurant_area"] = booking.restaurant.area
                b_dict["cuisine_type"] = booking.restaurant.cuisine_type

            results.append(b_dict)

        return jsonify(results), 200

    except Exception as e:
        print("BOOKING GET ERROR:", e)

        return jsonify({
            "error": "Failed to fetch bookings",
            "details": str(e)
        }), 500


# ============================================================
# GET ALL BOOKINGS FOR AN OWNER'S RESTAURANTS
# GET /api/bookings/owner?owner_id=...
# ============================================================

@booking_bp.route("/owner", methods=["GET"])
def get_owner_bookings():
    try:
        owner_id = request.args.get("owner_id")

        if not owner_id:
            return jsonify({
                "error": "owner_id is required"
            }), 400

        try:
            owner_id = int(owner_id)
        except ValueError:
            return jsonify({
                "error": "Invalid owner_id"
            }), 400

        from models.restaurant import Restaurant

        owner_restaurants = (
            Restaurant.query
            .filter_by(owner_id=owner_id)
            .all()
        )

        rest_ids = [
            r.restaurant_id
            for r in owner_restaurants
        ]

        if not rest_ids:
            return jsonify([]), 200

        bookings = (
            Booking.query
            .filter(
                Booking.restaurant_id.in_(rest_ids)
            )
            .order_by(
                Booking.booking_date.desc(),
                Booking.booking_time.desc()
            )
            .all()
        )

        results = []

        for booking in bookings:
            b_dict = booking.to_dict()

            if booking.user:
                b_dict["customer_name"] = booking.user.full_name
                b_dict["customer_email"] = booking.user.email
                b_dict["customer_phone"] = booking.user.phone

            if booking.restaurant:
                b_dict["restaurant_name"] = booking.restaurant.name

            results.append(b_dict)

        return jsonify(results), 200

    except Exception as e:
        print("OWNER BOOKINGS ERROR:", e)

        return jsonify({
            "error": "Failed to fetch owner bookings",
            "details": str(e)
        }), 500


# ============================================================
# GET ONE BOOKING
# GET /api/bookings/<booking_id>
# ============================================================

@booking_bp.route("/<int:booking_id>", methods=["GET"])
def get_booking(booking_id):
    try:
        booking = Booking.query.get(booking_id)

        if not booking:
            return jsonify({
                "error": "Booking not found"
            }), 404

        b_dict = booking.to_dict()

        if booking.restaurant:
            b_dict["restaurant_name"] = booking.restaurant.name
            b_dict["restaurant_cover"] = booking.restaurant.cover_image
            b_dict["restaurant_address"] = booking.restaurant.address
            b_dict["restaurant_area"] = booking.restaurant.area
            b_dict["cuisine_type"] = booking.restaurant.cuisine_type

        if booking.user:
            b_dict["customer_name"] = booking.user.full_name
            b_dict["customer_email"] = booking.user.email
            b_dict["customer_phone"] = booking.user.phone

        return jsonify(b_dict), 200

    except Exception as e:
        print("BOOKING DETAILS ERROR:", e)

        return jsonify({
            "error": "Failed to fetch booking",
            "details": str(e)
        }), 500


# ============================================================
# CANCEL BOOKING
# PATCH /api/bookings/<booking_id>/cancel
# ============================================================

@booking_bp.route(
    "/<int:booking_id>/cancel",
    methods=["PATCH"]
)
def cancel_booking(booking_id):
    try:
        booking = Booking.query.get(booking_id)

        if not booking:
            return jsonify({
                "error": "Booking not found"
            }), 404

        if booking.status == "Cancelled":
            return jsonify({
                "error": "Booking is already cancelled"
            }), 400

        if booking.status == "Completed":
            return jsonify({
                "error": "Completed bookings cannot be cancelled"
            }), 400

        booking.status = "Cancelled"

        db.session.commit()

        return jsonify({
            "message": "Booking cancelled successfully",
            "booking": booking.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()

        print("BOOKING CANCEL ERROR:", e)

        return jsonify({
            "error": "Failed to cancel booking",
            "details": str(e)
        }), 500


# ============================================================
# UPDATE BOOKING STATUS
# PATCH /api/bookings/<booking_id>/status
# ============================================================

@booking_bp.route(
    "/<int:booking_id>/status",
    methods=["PATCH"]
)
def update_booking_status(booking_id):
    try:
        booking = Booking.query.get(booking_id)

        if not booking:
            return jsonify({
                "error": "Booking not found"
            }), 404

        data = request.get_json(silent=True) or {}

        new_status = data.get("status")

        valid_statuses = [
            "Pending",
            "Confirmed",
            "Cancelled",
            "Completed"
        ]

        if new_status not in valid_statuses:
            return jsonify({
                "error": (
                    "Invalid status. Must be one of: "
                    + ", ".join(valid_statuses)
                )
            }), 400

        booking.status = new_status

        db.session.commit()

        return jsonify({
            "message": (
                f"Booking status updated to {new_status}"
            ),
            "booking": booking.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "error": "Failed to update booking status",
            "details": str(e)
        }), 500