from datetime import datetime
from extensions import db


class Review(db.Model):
    __tablename__ = "Reviews"

    review_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("Users.user_id"), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey("Restaurants.restaurant_id"), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey("Bookings.booking_id"), nullable=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.String(1000), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "review_id": self.review_id,
            "user_id": self.user_id,
            "restaurant_id": self.restaurant_id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
