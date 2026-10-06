from datetime import date, datetime, time, timedelta

from flask import Blueprint, jsonify, request

from models.booking import Booking
from models.restaurant import Restaurant
from models.review import Review
from utils.auth import current_user, roles_required

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


@reports_bp.route("", methods=["GET"])
@roles_required("owner", "admin")
def statistics_report():
    try:
        start_date = date.fromisoformat(request.args.get("start_date", ""))
        end_date = date.fromisoformat(request.args.get("end_date", ""))
    except ValueError:
        return jsonify({"error": "start_date and end_date must be valid ISO dates"}), 400

    if end_date < start_date:
        return jsonify({"error": "end_date must be on or after start_date"}), 400
    if (end_date - start_date).days > 365:
        return jsonify({"error": "The report date range cannot exceed 366 days"}), 400

    restaurants_query = Restaurant.query
    if current_user().role != "admin" and not current_user().is_admin:
        restaurants_query = restaurants_query.filter_by(owner_id=current_user().user_id)

    restaurant_id_arg = request.args.get("restaurant_id")
    if restaurant_id_arg:
        try:
            restaurant_id = int(restaurant_id_arg)
        except ValueError:
            return jsonify({"error": "restaurant_id must be a valid integer"}), 400
        restaurants_query = restaurants_query.filter_by(restaurant_id=restaurant_id)

    restaurants = restaurants_query.order_by(Restaurant.restaurant_id).all()
    if restaurant_id_arg and not restaurants:
        return jsonify({"error": "Restaurant not found or you do not have access to it"}), 404

    restaurant_ids = [restaurant.restaurant_id for restaurant in restaurants]
    bookings = []
    reviews = []
    if restaurant_ids:
        bookings = Booking.query.filter(
            Booking.restaurant_id.in_(restaurant_ids),
            Booking.booking_date >= start_date,
            Booking.booking_date <= end_date,
        ).order_by(Booking.booking_date, Booking.booking_time).all()
        reviews = Review.query.filter(
            Review.restaurant_id.in_(restaurant_ids),
            Review.created_at >= datetime.combine(start_date, time.min),
            Review.created_at < datetime.combine(end_date + timedelta(days=1), time.min),
        ).all()

    daily = {}
    cursor = start_date
    while cursor <= end_date:
        daily[cursor.isoformat()] = {"date": cursor.isoformat(), "bookings": 0, "guests": 0}
        cursor += timedelta(days=1)

    by_restaurant = {
        restaurant.restaurant_id: {
            "restaurant_id": restaurant.restaurant_id,
            "restaurant_name": restaurant.name,
            "bookings": 0,
            "guests": 0,
            "reviews": 0,
            "average_rating": 0,
        }
        for restaurant in restaurants
    }
    status_counts = {"pending": 0, "confirmed": 0, "completed": 0, "cancelled": 0}
    guests = 0
    paid_booking_fees = 0.0
    platform_fee_due = 0.0
    for booking in bookings:
        party_size = int(booking.party_size or 0)
        guests += party_size
        daily[booking.booking_date.isoformat()]["bookings"] += 1
        daily[booking.booking_date.isoformat()]["guests"] += party_size
        restaurant_report = by_restaurant[booking.restaurant_id]
        restaurant_report["bookings"] += 1
        restaurant_report["guests"] += party_size
        normalized_status = (booking.status or "").lower()
        if normalized_status in status_counts:
            status_counts[normalized_status] += 1
        if booking.fee_status == "Paid":
            paid_booking_fees += float(booking.booking_fee or 0)
        platform_fee_due += float(booking.owner_fee or 0)

    rating_totals = {restaurant_id: [0, 0] for restaurant_id in by_restaurant}
    for review in reviews:
        restaurant_report = by_restaurant[review.restaurant_id]
        restaurant_report["reviews"] += 1
        totals = rating_totals[review.restaurant_id]
        totals[0] += int(review.rating or 0)
        totals[1] += 1
    for restaurant_id, (rating_total, review_count) in rating_totals.items():
        if review_count:
            by_restaurant[restaurant_id]["average_rating"] = round(
                rating_total / review_count, 2
            )

    average_rating = (
        round(sum(review.rating for review in reviews) / len(reviews), 2)
        if reviews else 0
    )
    summary = {
        "bookings": len(bookings),
        "guests": guests,
        "average_party_size": round(guests / len(bookings), 2) if bookings else 0,
        **status_counts,
        "paid_booking_fees": round(paid_booking_fees, 2),
        "platform_fee_due": round(platform_fee_due, 2),
        "reviews": len(reviews),
        "average_rating": average_rating,
    }

    return jsonify({
        "period": {"start_date": start_date.isoformat(), "end_date": end_date.isoformat()},
        "summary": summary,
        "daily": list(daily.values()),
        "by_restaurant": list(by_restaurant.values()),
    }), 200
