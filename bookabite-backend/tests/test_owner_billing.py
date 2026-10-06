from datetime import date, time

from extensions import db
from models.booking import Booking
from models.restaurant import Restaurant


def _completed_booking(user_id, restaurant_id, owner_fee):
    booking = Booking(
        user_id=user_id,
        restaurant_id=restaurant_id,
        booking_date=date.today(),
        booking_time=time(19, 0),
        party_size=2,
        status="Completed",
        owner_fee=owner_fee,
    )
    db.session.add(booking)
    return booking


def test_owner_can_pay_demo_dues_and_view_payment_history(
    app, client, owner, other_owner, customer
):
    with app.app_context():
        own_restaurant = Restaurant(
            name="Owner billing venue", address="Billing test road", owner_id=owner[0]
        )
        other_restaurant = Restaurant(
            name="Other billing venue", address="Other test road", owner_id=other_owner[0]
        )
        db.session.add_all([own_restaurant, other_restaurant])
        db.session.flush()
        own_booking = _completed_booking(customer[0], own_restaurant.restaurant_id, 60)
        _completed_booking(customer[0], other_restaurant.restaurant_id, 100)
        db.session.commit()
        own_booking_id = own_booking.booking_id

    initial = client.get("/api/owner/billing", headers=owner[1])
    assert initial.status_code == 200
    assert initial.get_json()["amount_due"] == 60.0
    assert initial.get_json()["is_demo"] is True

    paid = client.post(
        "/api/owner/billing/pay",
        json={"payment_method": "upi"},
        headers=owner[1],
    )
    assert paid.status_code == 201
    result = paid.get_json()
    assert result["payment"]["amount"] == 60.0
    assert result["payment"]["payment_method"] == "upi"
    assert result["payment"]["reference"].startswith("DEMO-")
    assert result["billing"]["amount_due"] == 0
    assert result["billing"]["paid_total"] == 60.0
    assert len(result["billing"]["payments"]) == 1

    with app.app_context():
        db.session.get(Booking, own_booking_id).status = "Cancelled"
        db.session.commit()

    no_due = client.post(
        "/api/owner/billing/pay",
        json={"payment_method": "upi"},
        headers=owner[1],
    )
    assert no_due.status_code == 409
    assert client.get("/api/owner/billing", headers=owner[1]).get_json()["total_fees"] == 60.0

    with app.app_context():
        own_restaurant_id = Restaurant.query.filter_by(owner_id=owner[0]).first().restaurant_id
        _completed_booking(customer[0], own_restaurant_id, 25)
        db.session.commit()

    later_dues = client.get("/api/owner/billing", headers=owner[1]).get_json()
    assert later_dues["amount_due"] == 25.0
    assert later_dues["paid_total"] == 60.0


def test_owner_billing_rejects_invalid_method_and_non_owners(client, owner, customer):
    invalid = client.post(
        "/api/owner/billing/pay",
        json={"payment_method": "cash"},
        headers=owner[1],
    )
    assert invalid.status_code == 400
    assert client.get("/api/owner/billing", headers=customer[1]).status_code == 403
