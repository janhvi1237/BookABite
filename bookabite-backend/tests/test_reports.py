from datetime import date, datetime, time, timedelta

from extensions import db
from models.booking import Booking
from models.restaurant import Restaurant
from models.review import Review


def _make_restaurant(owner_id, name):
    restaurant = Restaurant(name=name, address="Report test road", owner_id=owner_id)
    db.session.add(restaurant)
    db.session.flush()
    return restaurant


def _make_booking(user_id, restaurant_id, booking_date, status, party_size, fee=0, fee_status="None"):
    booking = Booking(
        user_id=user_id,
        restaurant_id=restaurant_id,
        booking_date=booking_date,
        booking_time=time(19, 0),
        party_size=party_size,
        status=status,
        booking_fee=fee,
        fee_status=fee_status,
    )
    db.session.add(booking)
    return booking


def test_owner_report_includes_metrics_and_only_owned_restaurants(app, client, owner, other_owner, customer):
    report_date = date.today() - timedelta(days=1)
    with app.app_context():
        own_restaurant = _make_restaurant(owner[0], "Owner venue")
        other_restaurant = _make_restaurant(other_owner[0], "Other venue")
        _make_booking(customer[0], own_restaurant.restaurant_id, report_date, "Completed", 3, 50, "Paid")
        _make_booking(customer[0], own_restaurant.restaurant_id, report_date, "Cancelled", 2)
        _make_booking(customer[0], other_restaurant.restaurant_id, report_date, "Confirmed", 4)
        db.session.add(Review(
            user_id=customer[0], restaurant_id=own_restaurant.restaurant_id,
            rating=5, created_at=datetime.combine(report_date, time(12, 0)),
        ))
        db.session.commit()
        other_restaurant_id = other_restaurant.restaurant_id

    url = f"/api/reports?start_date={report_date}&end_date={report_date}"
    response = client.get(url, headers=owner[1])
    assert response.status_code == 200
    data = response.get_json()
    assert data["summary"] == {
        "bookings": 2,
        "guests": 5,
        "average_party_size": 2.5,
        "pending": 0,
        "confirmed": 0,
        "completed": 1,
        "cancelled": 1,
        "paid_booking_fees": 50.0,
        "reviews": 1,
        "average_rating": 5.0,
    }
    assert [row["restaurant_name"] for row in data["by_restaurant"]] == ["Owner venue"]
    assert data["daily"][0] == {"date": report_date.isoformat(), "bookings": 2, "guests": 5}

    denied = client.get(
        f"{url}&restaurant_id={other_restaurant_id}",
        headers=owner[1],
    )
    assert denied.status_code == 404


def test_admin_report_can_filter_to_a_restaurant(app, client, admin, owner, customer):
    report_date = date.today()
    with app.app_context():
        restaurant = _make_restaurant(owner[0], "Admin report venue")
        _make_booking(customer[0], restaurant.restaurant_id, report_date, "Confirmed", 4)
        db.session.commit()
        restaurant_id = restaurant.restaurant_id

    url = (
        f"/api/reports?start_date={report_date}&end_date={report_date}"
        f"&restaurant_id={restaurant_id}"
    )
    response = client.get(url, headers=admin[1])
    assert response.status_code == 200
    assert response.get_json()["summary"]["confirmed"] == 1


def test_report_rejects_invalid_or_excessive_date_ranges(client, admin):
    assert client.get("/api/reports?start_date=bad&end_date=bad", headers=admin[1]).status_code == 400
    assert client.get("/api/reports?start_date=2026-02-02&end_date=2026-01-01", headers=admin[1]).status_code == 400
    assert client.get("/api/reports?start_date=2025-01-01&end_date=2026-01-02", headers=admin[1]).status_code == 400
