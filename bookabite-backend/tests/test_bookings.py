"""Booking flow tests: create, validate, capacity, cancel, status, permissions."""
from datetime import date, timedelta

FUTURE = (date.today() + timedelta(days=3)).isoformat()


def payload(restaurant_id, **overrides):
    body = {"restaurant_id": restaurant_id, "booking_date": FUTURE,
            "booking_time": "19:00", "party_size": 2}
    body.update(overrides)
    return body


def book(client, headers, restaurant_id, **overrides):
    return client.post("/api/bookings", json=payload(restaurant_id, **overrides), headers=headers)


# ---------- happy path ----------

def test_customer_can_book_a_table(client, customer, restaurant):
    res = book(client, customer[1], restaurant)
    assert res.status_code == 201
    booking = res.get_json()["booking"]
    assert booking["status"] == "Pending"
    assert booking["user_id"] == customer[0]
    assert booking["party_size"] == 2


def test_booking_always_belongs_to_logged_in_user(client, customer, other_customer, restaurant):
    res = book(client, customer[1], restaurant, user_id=other_customer[0])
    assert res.get_json()["booking"]["user_id"] == customer[0]


def test_availability_endpoint_responds(client, restaurant):
    res = client.get(f"/api/bookings/availability?restaurant_id={restaurant}&booking_date={FUTURE}")
    assert res.status_code == 200


# ---------- login ----------

def test_booking_requires_login(client, restaurant):
    assert client.post("/api/bookings", json=payload(restaurant)).status_code == 401


def test_garbage_token_is_rejected(client, restaurant):
    res = book(client, {"Authorization": "Bearer not-a-real-token"}, restaurant)
    assert res.status_code == 401


# ---------- validation ----------

def test_missing_fields(client, customer, restaurant):
    res = client.post("/api/bookings", json={"restaurant_id": restaurant}, headers=customer[1])
    assert res.status_code == 400
    assert set(res.get_json()["fields"]) == {"booking_date", "booking_time", "party_size"}


def test_past_date_rejected(client, customer, restaurant):
    past = (date.today() - timedelta(days=1)).isoformat()
    assert book(client, customer[1], restaurant, booking_date=past).status_code == 400


def test_bad_date_and_time_formats(client, customer, restaurant):
    assert book(client, customer[1], restaurant, booking_date="09/09/2030").status_code == 400
    assert book(client, customer[1], restaurant, booking_time="7pm").status_code == 400


def test_party_size_limits(client, customer, restaurant):
    assert book(client, customer[1], restaurant, party_size=0).status_code == 400
    assert book(client, customer[1], restaurant, party_size=21).status_code == 400
    assert book(client, customer[1], restaurant, party_size="abc").status_code == 400


def test_time_outside_opening_hours(client, customer, restaurant):
    assert book(client, customer[1], restaurant, booking_time="03:00").status_code == 400
    assert book(client, customer[1], restaurant, booking_time="22:30").status_code == 400


def test_unknown_restaurant(client, customer):
    assert book(client, customer[1], 9999).status_code == 404


# ---------- capacity ----------

def test_capacity_is_enforced(client, customer, other_customer, restaurant):
    assert book(client, customer[1], restaurant, party_size=6).status_code == 201
    res = book(client, other_customer[1], restaurant, party_size=3)  # only 2 seats left
    assert res.status_code == 409
    assert res.get_json()["remaining_capacity"] == 2
    assert book(client, other_customer[1], restaurant, party_size=2).status_code == 201


def test_capacity_is_per_time_slot(client, customer, other_customer, restaurant):
    assert book(client, customer[1], restaurant, party_size=8, booking_time="19:00").status_code == 201
    assert book(client, other_customer[1], restaurant, party_size=8, booking_time="20:00").status_code == 201


def test_cancelled_booking_frees_seats(client, customer, other_customer, restaurant):
    first = book(client, customer[1], restaurant, party_size=8).get_json()["booking"]["booking_id"]
    assert book(client, other_customer[1], restaurant, party_size=2).status_code == 409
    client.patch(f"/api/bookings/{first}/cancel", headers=customer[1])
    assert book(client, other_customer[1], restaurant, party_size=2).status_code == 201


# ---------- cancel ----------

def test_customer_can_cancel_own_booking(client, customer, restaurant):
    bid = book(client, customer[1], restaurant).get_json()["booking"]["booking_id"]
    res = client.patch(f"/api/bookings/{bid}/cancel", headers=customer[1])
    assert res.status_code == 200 and res.get_json()["booking"]["status"] == "Cancelled"
    assert client.patch(f"/api/bookings/{bid}/cancel", headers=customer[1]).status_code == 400


def test_cannot_cancel_someone_elses_booking(client, customer, other_customer, restaurant):
    bid = book(client, customer[1], restaurant).get_json()["booking"]["booking_id"]
    assert client.patch(f"/api/bookings/{bid}/cancel", headers=other_customer[1]).status_code == 403


def test_cannot_view_someone_elses_booking(client, customer, other_customer, restaurant):
    bid = book(client, customer[1], restaurant).get_json()["booking"]["booking_id"]
    assert client.get(f"/api/bookings/{bid}", headers=other_customer[1]).status_code == 403
    assert client.get(f"/api/bookings/{bid}", headers=customer[1]).status_code == 200


# ---------- owner / admin ----------

def test_owner_can_confirm_own_restaurant_booking(client, customer, owner, restaurant):
    bid = book(client, customer[1], restaurant).get_json()["booking"]["booking_id"]
    res = client.patch(f"/api/bookings/{bid}/status", json={"status": "Confirmed"}, headers=owner[1])
    assert res.status_code == 200 and res.get_json()["booking"]["status"] == "Confirmed"


def test_other_owner_cannot_touch_booking(client, customer, other_owner, restaurant):
    bid = book(client, customer[1], restaurant).get_json()["booking"]["booking_id"]
    res = client.patch(f"/api/bookings/{bid}/status", json={"status": "Confirmed"}, headers=other_owner[1])
    assert res.status_code == 403


def test_customer_cannot_change_status(client, customer, restaurant):
    bid = book(client, customer[1], restaurant).get_json()["booking"]["booking_id"]
    res = client.patch(f"/api/bookings/{bid}/status", json={"status": "Confirmed"}, headers=customer[1])
    assert res.status_code == 403


def test_invalid_status_value(client, customer, owner, restaurant):
    bid = book(client, customer[1], restaurant).get_json()["booking"]["booking_id"]
    res = client.patch(f"/api/bookings/{bid}/status", json={"status": "Banana"}, headers=owner[1])
    assert res.status_code == 400


def test_admin_can_manage_any_booking(client, customer, admin, restaurant):
    bid = book(client, customer[1], restaurant).get_json()["booking"]["booking_id"]
    res = client.patch(f"/api/bookings/{bid}/status", json={"status": "Confirmed"}, headers=admin[1])
    assert res.status_code == 200


# ---------- known weak spots (these document real gaps; see report) ----------

def test_error_responses_do_not_leak_internals(client, customer, restaurant, monkeypatch):
    """500 responses must not include raw exception text."""
    from routes import booking_routes

    def boom(*a, **k):
        raise RuntimeError("secret-db-detail")

    monkeypatch.setattr(booking_routes, "get_restaurant_capacity", boom)
    res = book(client, customer[1], restaurant)
    assert res.status_code == 500
    assert "secret-db-detail" not in res.get_data(as_text=True)


def test_cancelled_booking_cannot_be_reopened_past_capacity(client, customer, other_customer, owner, restaurant):
    """Owner re-confirming a cancelled booking must re-check seats."""
    first = book(client, customer[1], restaurant, party_size=8).get_json()["booking"]["booking_id"]
    client.patch(f"/api/bookings/{first}/cancel", headers=customer[1])
    assert book(client, other_customer[1], restaurant, party_size=8).status_code == 201
    res = client.patch(f"/api/bookings/{first}/status", json={"status": "Confirmed"}, headers=owner[1])
    assert res.status_code in (400, 409)


def test_table_id_must_belong_to_restaurant(client, customer, restaurant):
    res = book(client, customer[1], restaurant, table_id=424242)
    assert res.status_code == 400
