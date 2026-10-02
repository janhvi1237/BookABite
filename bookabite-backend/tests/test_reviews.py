from flask_jwt_extended import create_access_token


def test_restaurant_review_stats_come_from_review_rows(
    app, client, restaurant, customer
):
    from extensions import db
    from models.review import Review
    from models.restaurant import Restaurant

    with app.app_context():
        item = db.session.get(Restaurant, restaurant)
        item.rating = 4.8
        item.total_reviews = 342
        db.session.add_all([
            Review(
                user_id=customer[0],
                restaurant_id=restaurant,
                rating=5,
                comment="Actual first review",
            ),
            Review(
                user_id=customer[0],
                restaurant_id=restaurant,
                rating=2,
                comment="Actual second review",
            ),
        ])
        db.session.commit()

    listing = client.get("/api/restaurants").get_json()
    listed_restaurant = next(
        item for item in listing if item["restaurant_id"] == restaurant
    )
    detail = client.get(f"/api/restaurants/{restaurant}").get_json()
    review_response = client.get(
        f"/api/restaurants/{restaurant}/reviews"
    ).get_json()

    assert listed_restaurant["total_reviews"] == 2
    assert listed_restaurant["rating"] == 3.5
    assert detail["total_reviews"] == 2
    assert detail["rating"] == 3.5
    assert len(detail["reviews_list"]) == 2
    assert review_response["total"] == len(review_response["reviews"]) == 2


def test_unreviewed_restaurant_is_not_in_rating_filter(
    app, client, restaurant
):
    from extensions import db
    from models.restaurant import Restaurant

    with app.app_context():
        item = db.session.get(Restaurant, restaurant)
        item.rating = 4.9
        item.total_reviews = 999
        db.session.commit()

    results = client.get("/api/restaurants?min_rating=4").get_json()

    assert all(item["restaurant_id"] != restaurant for item in results)


def test_review_submission_returns_persisted_review_count_and_rating(
    app, client, restaurant, customer
):
    with app.app_context():
        token = create_access_token(identity=str(customer[0]))

    response = client.post(
        f"/api/restaurants/{restaurant}/reviews",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "user_id": 999999,
            "rating": 4,
            "comment": "Submitted review",
        },
    )

    assert response.status_code == 201
    result = response.get_json()
    assert result["review"]["user_id"] == customer[0]
    assert result["rating"] == 4
    assert result["total_reviews"] == 1

    persisted = client.get(
        f"/api/restaurants/{restaurant}/reviews"
    ).get_json()
    assert persisted["total"] == len(persisted["reviews"]) == 1
