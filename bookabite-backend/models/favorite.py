from datetime import datetime
from extensions import db


class Favorite(db.Model):
    __tablename__ = "Favorites"

    user_id = db.Column(db.Integer, db.ForeignKey("Users.user_id"), primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey("Restaurants.restaurant_id"), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
