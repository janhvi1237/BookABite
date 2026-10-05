"""Real tables + automatic table booking + owner table management."""
from datetime import date, timedelta

FUTURE = (date.today() + timedelta(days=3)).isoformat()


def book(client, headers, restaurant_id, **overrides):
    body = {"restaurant_id": restaurant_id, "booking_date": FUTURE,
            "booking_time": "19:00", "party_size": 2, "payment_method": "upi"}
    body.update(overrides)
    return client.post("/api/bookings", json=body, headers=headers)


def table_ids(client, owner_headers, restaurant_id):
    """{'T1': id, ...} for a restaurant, read through the owner API."""
    res = client.get(f"/api/restaurants/{restaurant_id}/tables", headers=owner_headers)
    return {t["table_number"]: t["table_id"] for t in res.get_json()["tables"]}


# ---------- automatic assignment ----------

def test_booking_gets_a_table_and_end_time_automatically(client, customer, restaurant):
    res = book(client, customer[1], restaurant)
    assert res.status_code == 201
    booking = res.get_json()["booking"]
    assert booking["table_id"] is not None
    assert booking["end_time"] == "20:30:00"          # 19:00 + 90 minutes


def test_couple_gets_the_two_seater(client, customer, owner, restaurant):
    ids = table_ids(client, owner[1], restaurant)
    res = book(client, customer[1], restaurant, party_size=2)
    assert res.get_json()["booking"]["table_id"] == ids["T1"]


def test_guest_can_choose_a_specific_available_table(client, customer, owner, restaurant):
    ids = table_ids(client, owner[1], restaurant)
    response = book(client, customer[1], restaurant, party_size=2, table_id=ids["T3"])
    assert response.status_code == 201
    assert response.get_json()["booking"]["table_id"] == ids["T3"]


def test_chosen_table_unavailable_returns_conflict_instead_of_silent_reassignment(
    client, customer, other_customer, owner, restaurant
):
    ids = table_ids(client, owner[1], restaurant)
    assert book(client, customer[1], restaurant, party_size=2, table_id=ids["T1"]).status_code == 201
    response = book(client, other_customer[1], restaurant, party_size=2, table_id=ids["T1"])
    assert response.status_code == 409
    assert "no longer available" in response.get_json()["error"]


def test_party_of_three_gets_a_four_seater_not_the_two_seater(client, customer, owner, restaurant):
    ids = table_ids(client, owner[1], restaurant)
    table = book(client, customer[1], restaurant, party_size=3).get_json()["booking"]["table_id"]
    assert table in (ids["T2"], ids["T3"])


def test_two_parties_never_share_a_table(client, customer, other_customer, restaurant):
    a = book(client, customer[1], restaurant, party_size=4).get_json()["booking"]["table_id"]
    b = book(client, other_customer[1], restaurant, party_size=4).get_json()["booking"]["table_id"]
    assert a != b


def test_party_bigger_than_the_largest_table_is_refused(client, customer, restaurant):
    res = book(client, customer[1], restaurant, party_size=5)
    assert res.status_code == 409
    assert res.get_json()["max_party_size"] == 4


def test_full_restaurant_suggests_other_times(client, customer, other_customer, small_restaurant):
    assert book(client, customer[1], small_restaurant, party_size=4, booking_time="19:00").status_code == 201
    res = book(client, other_customer[1], small_restaurant, party_size=4, booking_time="19:30")
    assert res.status_code == 409
    suggestions = res.get_json()["suggested_times"]
    assert suggestions and "19:30" not in suggestions and "19:00" not in suggestions


def test_booking_too_far_ahead_is_refused(client, customer, restaurant):
    far = (date.today() + timedelta(days=31)).isoformat()
    res = book(client, customer[1], restaurant, booking_date=far)
    assert res.status_code == 400
    assert res.get_json()["max_advance_days"] == 30


# ---------- availability ----------

def test_availability_counts_free_tables(client, customer, restaurant):
    book(client, customer[1], restaurant, party_size=2, booking_time="19:00")
    url = f"/api/bookings/availability?restaurant_id={restaurant}&booking_date={FUTURE}"
    slots = {s["value"]: s for s in client.get(url).get_json()["slots"]}
    assert slots["12:00"]["tables_free"] == 3
    assert slots["19:00"]["tables_free"] == 2
    assert slots["19:30"]["tables_free"] == 2        # the 19:00 sitting is still running


def test_owner_can_view_per_table_availability(client, owner, customer, restaurant):
    book(client, customer[1], restaurant, party_size=2, booking_time="19:00")
    url = (
        f"/api/restaurants/{restaurant}/tables/availability"
        f"?booking_date={FUTURE}&booking_time=19:00"
    )
    response = client.get(url, headers=owner[1])
    assert response.status_code == 200
    data = response.get_json()
    assert data["summary"] == {"available": 2, "booked": 1, "out_of_service": 0}
    assert next(table for table in data["tables"] if table["table_number"] == "T1")["status"] == "booked"


def test_customer_can_view_available_tables_for_selected_party_and_time(client, customer, restaurant):
    book(client, customer[1], restaurant, party_size=2, booking_time="19:00")
    url = (
        f"/api/restaurants/{restaurant}/available-tables"
        f"?booking_date={FUTURE}&booking_time=19:00&party_size=3"
    )
    response = client.get(url)
    assert response.status_code == 200
    data = response.get_json()
    assert data["summary"] == {"available": 2, "available_seats": 8}
    assert {table["capacity"] for table in data["tables"]} == {4}
    assert all(table["table_id"] for table in data["tables"])
    assert all("booking" not in table for table in data["tables"])


def test_customer_available_tables_hides_inactive_tables(client, owner, small_restaurant):
    table_id = table_ids(client, owner[1], small_restaurant)["T1"]
    assert client.put(
        f"/api/tables/{table_id}", json={"is_active": False}, headers=owner[1]
    ).status_code == 200

    url = (
        f"/api/restaurants/{small_restaurant}/available-tables"
        f"?booking_date={FUTURE}&booking_time=19:00&party_size=2"
    )
    assert client.get(url).get_json()["tables"] == []
    assert client.get(url.replace("party_size=2", "party_size=21")).status_code == 400


def test_only_owner_or_admin_can_view_table_availability(client, customer, other_owner, restaurant):
    url = (
        f"/api/restaurants/{restaurant}/tables/availability"
        f"?booking_date={FUTURE}&booking_time=19:00"
    )
    assert client.get(url, headers=customer[1]).status_code == 403
    assert client.get(url, headers=other_owner[1]).status_code == 403


def test_table_availability_requires_valid_date_and_time(client, owner, restaurant):
    url = f"/api/restaurants/{restaurant}/tables/availability?booking_date=bad&booking_time=bad"
    assert client.get(url, headers=owner[1]).status_code == 400


def test_availability_hides_times_where_no_table_fits_the_party(client, small_restaurant):
    base = f"/api/bookings/availability?restaurant_id={small_restaurant}&booking_date={FUTURE}"
    fits = {s["value"]: s for s in client.get(base + "&party_size=4").get_json()["slots"]}
    too_big_res = client.get(base + "&party_size=5").get_json()
    assert fits["12:00"]["available"]
    assert not any(s["available"] for s in too_big_res["slots"])
    assert too_big_res["max_party_size"] == 4


# ---------- owner manages tables ----------

def test_owner_sees_table_summary(client, owner, restaurant):
    data = client.get(f"/api/restaurants/{restaurant}/tables", headers=owner[1]).get_json()
    assert data["summary"] == {"tables": 3, "total_seats": 10, "largest_table": 4}
    assert data["settings"]["dining_duration_minutes"] == 90


def test_owner_adds_a_table_and_bigger_parties_can_book(client, customer, owner, restaurant):
    assert book(client, customer[1], restaurant, party_size=6).status_code == 409
    res = client.post(f"/api/restaurants/{restaurant}/tables",
                      json={"capacity": 6, "table_type": "Rooftop"}, headers=owner[1])
    assert res.status_code == 201
    assert res.get_json()["table"]["table_number"] == "T4"
    assert book(client, customer[1], restaurant, party_size=6).status_code == 201


def test_customer_cannot_manage_tables(client, customer, restaurant):
    res = client.post(f"/api/restaurants/{restaurant}/tables", json={"capacity": 4}, headers=customer[1])
    assert res.status_code == 403


def test_other_owner_cannot_touch_my_tables(client, other_owner, restaurant):
    res = client.post(f"/api/restaurants/{restaurant}/tables", json={"capacity": 4}, headers=other_owner[1])
    assert res.status_code == 403


def test_table_must_have_sensible_seats_and_unique_label(client, owner, restaurant):
    url = f"/api/restaurants/{restaurant}/tables"
    assert client.post(url, json={"capacity": 0}, headers=owner[1]).status_code == 400
    assert client.post(url, json={"capacity": 99}, headers=owner[1]).status_code == 400
    assert client.post(url, json={"capacity": 4, "table_number": "T1"}, headers=owner[1]).status_code == 409


def test_cannot_switch_off_a_table_with_an_upcoming_booking(client, customer, owner, small_restaurant):
    book(client, customer[1], small_restaurant, party_size=4)
    table_id = table_ids(client, owner[1], small_restaurant)["T1"]
    res = client.put(f"/api/tables/{table_id}", json={"is_active": False}, headers=owner[1])
    assert res.status_code == 409


def test_switched_off_table_is_never_booked(client, customer, owner, small_restaurant):
    table_id = table_ids(client, owner[1], small_restaurant)["T1"]
    assert client.put(f"/api/tables/{table_id}", json={"is_active": False}, headers=owner[1]).status_code == 200
    assert book(client, customer[1], small_restaurant, party_size=2).status_code == 409


def test_table_with_history_cannot_be_deleted_but_unused_one_can(client, customer, owner, restaurant):
    ids = table_ids(client, owner[1], restaurant)
    used = book(client, customer[1], restaurant, party_size=2).get_json()["booking"]["table_id"]
    assert used == ids["T1"]
    assert client.delete(f"/api/tables/{ids['T1']}", headers=owner[1]).status_code == 409
    assert client.delete(f"/api/tables/{ids['T3']}", headers=owner[1]).status_code == 200


def test_owner_changes_dining_duration(client, customer, owner, restaurant):
    url = f"/api/restaurants/{restaurant}/booking-settings"
    assert client.put(url, json={"dining_duration_minutes": 5}, headers=owner[1]).status_code == 400
    assert client.put(url, json={"dining_duration_minutes": 60}, headers=owner[1]).status_code == 200
    booking = book(client, customer[1], restaurant).get_json()["booking"]
    assert booking["end_time"] == "20:00:00"
