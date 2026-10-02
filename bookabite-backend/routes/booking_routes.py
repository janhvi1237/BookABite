from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, date, time, timedelta

from extensions import db
from models.booking import Booking
from models.payment import Payment
from services.fee_service import (
    calculate_fee, make_invoice_number, is_refundable, PAYMENT_METHODS
)
from utils.auth import (
    login_required, roles_required, current_user, optional_user,
    is_admin, can_manage_restaurant, forbidden
)


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


# A guest cannot hold two tables at the same restaurant on the same day
# if the times are closer than this (a normal dining sitting).
SITTING_MINUTES = 120


def find_clashing_booking(user_id, restaurant_id, booking_date, booking_time, ignore_id=None):
    """Return this user's active booking at the same restaurant that overlaps the
    requested time, or None."""
    wanted = datetime.combine(booking_date, booking_time)
    others = Booking.query.filter(
        Booking.user_id == user_id,
        Booking.restaurant_id == restaurant_id,
        Booking.booking_date == booking_date,
        Booking.status.in_(["Pending", "Confirmed"]),
    ).all()
    for other in others:
        if ignore_id and other.booking_id == ignore_id:
            continue
        if not other.booking_time:
            continue
        gap = abs((datetime.combine(booking_date, other.booking_time) - wanted).total_seconds())
        if gap < SITTING_MINUTES * 60:
            return other
    return None


# ============================================================
# BOOKING FEE QUOTE
# GET /api/bookings/fee-quote?party_size=4
# ============================================================

@booking_bp.route("/fee-quote", methods=["GET"])
def fee_quote():
    try:
        party_size = int(request.args.get("party_size", 2))
    except (TypeError, ValueError):
        return jsonify({"error": "party_size must be a number"}), 400
    if party_size < 1 or party_size > 20:
        return jsonify({"error": "Party size must be between 1 and 20"}), 400
    quote = calculate_fee(party_size)
    quote["payment_methods"] = list(PAYMENT_METHODS)
    return jsonify(quote), 200


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

        # Slots the logged-in guest cannot take because they already hold a
        # table here at an overlapping time (token is optional on this route).
        viewer = optional_user()
        my_times = []
        if viewer:
            my_times = [
                b.booking_time for b in existing_bookings
                if b.user_id == viewer.user_id and b.booking_time
            ]

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

            already_booked = any(
                abs((datetime.combine(booking_date, t) - slot_datetime).total_seconds())
                < SITTING_MINUTES * 60
                for t in my_times
            )

            available = (
                remaining_capacity > 0
                and not is_past
                and not already_booked
            )

            availability.append({
                "value": slot.strftime("%H:%M"),
                "label": format_time_label(slot),
                "total_capacity": total_capacity,
                "used_capacity": used_capacity,
                "remaining_capacity": remaining_capacity,
                "already_booked": already_booked,
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
        current_app.logger.exception("Booking route error")
        print("BOOKING AVAILABILITY ERROR:", e)

        return jsonify({
            "error": "Failed to fetch booking availability"
        }), 500


# ============================================================
# CREATE BOOKING
# POST /api/bookings
# ============================================================

@booking_bp.route("", methods=["POST"])
@login_required
def create_booking():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Request body is required"
            }), 400

        required_fields = [
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
        # One table per guest per sitting at the same restaurant
        # ----------------------------------------------------

        me = current_user()
        clash = find_clashing_booking(
            me.user_id, restaurant_id, booking_date, booking_time
        )
        if clash:
            return jsonify({
                "error": (
                    "You already have a table at this restaurant around "
                    f"{format_time_label(clash.booking_time)} on this date. "
                    "Cancel it first or pick a time at least "
                    f"{SITTING_MINUTES // 60} hours apart."
                ),
                "existing_booking_id": clash.booking_id
            }), 409

        # ----------------------------------------------------
        # Booking fee: always calculated here, never trusted from the browser
        # ----------------------------------------------------

        fee = calculate_fee(party_size)
        payment_method = str(data.get("payment_method") or "").lower()

        if fee["fee"] > 0 and payment_method not in PAYMENT_METHODS:
            return jsonify({
                "error": "Please choose a payment method for the booking fee",
                "payment_methods": list(PAYMENT_METHODS)
            }), 400

        # ----------------------------------------------------
        # Create booking
        # ----------------------------------------------------

        table_id = data.get("table_id")
        if table_id is not None:
            try:
                table_id = int(table_id)
            except (TypeError, ValueError):
                return jsonify({"error": "Invalid table_id"}), 400

            from models.restaurant import RestaurantTable

            table = RestaurantTable.query.filter_by(
                table_id=table_id, restaurant_id=restaurant_id
            ).first()
            if not table:
                return jsonify({
                    "error": "Selected table does not belong to this restaurant"
                }), 400

        booking = Booking(
            user_id=current_user().user_id,  # always the logged-in user
            restaurant_id=restaurant_id,
            table_id=table_id,
            booking_date=booking_date,
            booking_time=booking_time,
            party_size=party_size,
            status="Pending",
            special_request=data.get("special_request"),
            scratch_card_used=False,
            booking_fee=fee["fee"],
            fee_status="Paid" if fee["fee"] > 0 else "None"
        )

        db.session.add(booking)
        db.session.flush()  # booking_id is needed for the payment record

        # DEMO GATEWAY: the payment is recorded as successful straight away.
        # To use real Razorpay later, create the order here, return it to the
        # browser, and mark the Payment "Success" only after Razorpay confirms.
        if fee["fee"] > 0:
            db.session.add(Payment(
                booking_id=booking.booking_id,
                amount=fee["fee"],
                currency="INR",
                status="Success",
                payment_method=payment_method,
                invoice_number=make_invoice_number(booking.booking_id)
            ))

        # Restaurants with instant booking confirm automatically.
        if getattr(restaurant, "is_instant_booking", False):
            booking.status = "Confirmed"

        db.session.commit()

        return jsonify({
            "message": "Booking created successfully",
            "booking": booking.to_dict(),
            "fee": fee
        }), 201

    except ValueError:
        db.session.rollback()

        return jsonify({
            "error": "Invalid numeric value"
        }), 400

    except Exception as e:
        current_app.logger.exception("Booking route error")
        db.session.rollback()

        print("BOOKING CREATE ERROR:", e)

        return jsonify({
            "error": "Failed to create booking"
        }), 500


# ============================================================
# GET ALL BOOKINGS FOR A USER
# GET /api/bookings?user_id=1
# ============================================================

@booking_bp.route("", methods=["GET"])
@login_required
def get_bookings():
    try:
        # Always the logged-in user's own bookings (an admin may pass ?user_id=)
        user_id = current_user().user_id
        if is_admin(current_user()) and request.args.get("user_id"):
            try:
                user_id = int(request.args.get("user_id"))
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
        current_app.logger.exception("Booking route error")
        print("BOOKING GET ERROR:", e)

        return jsonify({
            "error": "Failed to fetch bookings"
        }), 500


# ============================================================
# GET ALL BOOKINGS FOR AN OWNER'S RESTAURANTS
# GET /api/bookings/owner?owner_id=...
# ============================================================

@booking_bp.route("/owner", methods=["GET"])
@roles_required("owner", "admin")
def get_owner_bookings():
    try:
        # Always the logged-in owner's restaurants (an admin may pass ?owner_id=)
        owner_id = current_user().user_id
        if is_admin(current_user()) and request.args.get("owner_id"):
            try:
                owner_id = int(request.args.get("owner_id"))
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
        current_app.logger.exception("Booking route error")
        print("OWNER BOOKINGS ERROR:", e)

        return jsonify({
            "error": "Failed to fetch owner bookings"
        }), 500


# ============================================================
# GET ONE BOOKING
# GET /api/bookings/<booking_id>
# ============================================================

@booking_bp.route("/<int:booking_id>", methods=["GET"])
@login_required
def get_booking(booking_id):
    try:
        booking = Booking.query.get(booking_id)

        if not booking:
            return jsonify({
                "error": "Booking not found"
            }), 404

        # Allowed: the customer who booked, the restaurant's owner, or an admin.
        me = current_user()
        owns_restaurant = booking.restaurant is not None and booking.restaurant.owner_id == me.user_id
        if not (booking.user_id == me.user_id or owns_restaurant or is_admin(me)):
            return forbidden("You cannot view this booking.")

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
        current_app.logger.exception("Booking route error")
        print("BOOKING DETAILS ERROR:", e)

        return jsonify({
            "error": "Failed to fetch booking"
        }), 500


# ============================================================
# CANCEL BOOKING
# PATCH /api/bookings/<booking_id>/cancel
# ============================================================

@booking_bp.route(
    "/<int:booking_id>/cancel",
    methods=["PATCH"]
)
@login_required
def cancel_booking(booking_id):
    try:
        booking = Booking.query.get(booking_id)

        if not booking:
            return jsonify({
                "error": "Booking not found"
            }), 404

        # Allowed: the customer who booked, the restaurant's owner, or an admin.
        me = current_user()
        owns_restaurant = booking.restaurant is not None and booking.restaurant.owner_id == me.user_id
        if not (booking.user_id == me.user_id or owns_restaurant or is_admin(me)):
            return forbidden("You cannot cancel this booking.")

        if booking.status == "Cancelled":
            return jsonify({
                "error": "Booking is already cancelled"
            }), 400

        if booking.status == "Completed":
            return jsonify({
                "error": "Completed bookings cannot be cancelled"
            }), 400

        booking.status = "Cancelled"

        # Refund rule: the owner/admin cancelling always refunds; the guest is
        # refunded only if there is still time before the booking.
        refunded = False
        if booking.fee_status == "Paid":
            booking_dt = datetime.combine(booking.booking_date, booking.booking_time)
            if booking.user_id != me.user_id or is_refundable(booking_dt):
                booking.fee_status = "Refunded"
                refunded = True
                for payment in booking.payments:
                    if payment.status == "Success":
                        payment.status = "Refunded"

        db.session.commit()

        if refunded:
            message = "Booking cancelled. Your booking fee will be refunded."
        elif booking.fee_status == "Paid":
            message = "Booking cancelled. The booking fee is non-refundable this close to the booking time."
        else:
            message = "Booking cancelled successfully"

        return jsonify({
            "message": message,
            "refunded": refunded,
            "booking": booking.to_dict()
        }), 200

    except Exception as e:
        current_app.logger.exception("Booking route error")
        db.session.rollback()

        print("BOOKING CANCEL ERROR:", e)

        return jsonify({
            "error": "Failed to cancel booking"
        }), 500


# ============================================================
# UPDATE BOOKING STATUS
# PATCH /api/bookings/<booking_id>/status
# ============================================================

@booking_bp.route(
    "/<int:booking_id>/status",
    methods=["PATCH"]
)
@roles_required("owner", "admin")
def update_booking_status(booking_id):
    try:
        booking = Booking.query.get(booking_id)

        if not booking:
            return jsonify({
                "error": "Booking not found"
            }), 404

        # Only the restaurant's owner (or an admin) may confirm / complete bookings.
        if not (booking.restaurant and can_manage_restaurant(current_user(), booking.restaurant)):
            return forbidden("You can only manage bookings of your own restaurants.")

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

        if booking.status == "Cancelled" and new_status in ("Pending", "Confirmed"):
            if booking.fee_status == "Refunded":
                return jsonify({
                    "error": "The booking fee was already refunded, so this booking cannot be re-opened. Ask the guest to book again."
                }), 409
            total_capacity = get_restaurant_capacity(booking.restaurant)
            used_capacity = sum(
                int(b.party_size or 0)
                for b in Booking.query.filter(
                    Booking.restaurant_id == booking.restaurant_id,
                    Booking.booking_date == booking.booking_date,
                    Booking.booking_time == booking.booking_time,
                    Booking.status.in_(["Pending", "Confirmed"]),
                    Booking.booking_id != booking.booking_id,
                ).all()
            )
            if int(booking.party_size or 0) > total_capacity - used_capacity:
                return jsonify({
                    "error": "Cannot re-open: not enough seating left for this time slot"
                }), 409

        booking.status = new_status

        # Owner/admin cancelling always refunds the booking fee.
        if new_status == "Cancelled" and booking.fee_status == "Paid":
            booking.fee_status = "Refunded"
            for payment in booking.payments:
                if payment.status == "Success":
                    payment.status = "Refunded"

        db.session.commit()

        return jsonify({
            "message": (
                f"Booking status updated to {new_status}"
            ),
            "booking": booking.to_dict()
        }), 200

    except Exception as e:
        current_app.logger.exception("Booking route error")
        db.session.rollback()

        return jsonify({
            "error": "Failed to update booking status"
        }), 500