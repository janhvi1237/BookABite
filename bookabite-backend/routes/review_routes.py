from flask import Blueprint, request, jsonify
from extensions import db
from models import Review, Restaurant, User
from utils.auth import login_required, current_user

review_bp = Blueprint("reviews", __name__, url_prefix="/api")


# ============================================================
# GET REVIEWS FOR A RESTAURANT
# GET /api/restaurants/<restaurant_id>/reviews
# ============================================================
@review_bp.route("/restaurants/<int:restaurant_id>/reviews", methods=["GET"])
def get_restaurant_reviews(restaurant_id):
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404

    reviews = (
        Review.query.filter_by(restaurant_id=restaurant_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    results = []
    for r in reviews:
        d = r.to_dict()
        if r.user:
            d["user_name"] = r.user.full_name
            d["user_profile"] = r.user.profile_image
        results.append(d)

    return jsonify({"restaurant_id": restaurant_id, "reviews": results, "total": len(results)}), 200


# ============================================================
# SUBMIT A REVIEW
# POST /api/restaurants/<restaurant_id>/reviews
# ============================================================
@review_bp.route("/restaurants/<int:restaurant_id>/reviews", methods=["POST"])
@login_required
def create_review(restaurant_id):
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404

    data = request.get_json(silent=True) or {}
    user_id = current_user().user_id  # always the logged-in user
    rating = data.get("rating")
    comment = data.get("comment", "")

    if not user_id or rating is None:
        return jsonify({"error": "user_id and rating are required"}), 400

    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            return jsonify({"error": "Rating must be between 1 and 5"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid rating"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    review = Review(
        user_id=user_id,
        restaurant_id=restaurant_id,
        booking_id=data.get("booking_id"),
        rating=rating,
        comment=comment.strip() if comment else None,
    )

    db.session.add(review)
    db.session.flush()  # so the new review is counted exactly once below

    # Recalculate restaurant rating
    all_reviews = Review.query.filter_by(restaurant_id=restaurant_id).all()
    total_revs = len(all_reviews)
    new_avg = sum(r.rating for r in all_reviews) / total_revs

    restaurant.rating = round(new_avg, 1)
    restaurant.total_reviews = total_revs

    db.session.commit()

    res = review.to_dict()
    res["user_name"] = user.full_name
    return jsonify({"message": "Review submitted successfully", "review": res}), 201
