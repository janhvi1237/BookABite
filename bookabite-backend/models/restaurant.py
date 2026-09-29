from datetime import datetime
from extensions import db

# Association table for Restaurant <-> Amenities (many-to-many)
restaurant_amenities = db.Table(
    "RestaurantAmenities",
    db.Column("restaurant_id", db.Integer, db.ForeignKey("Restaurants.restaurant_id"), primary_key=True),
    db.Column("amenity_id", db.Integer, db.ForeignKey("Amenities.amenity_id"), primary_key=True),
)


class Restaurant(db.Model):
    __tablename__ = "Restaurants"

    restaurant_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    address = db.Column(db.String(255), nullable=False)
    area = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), default="Pune")
    latitude = db.Column(db.Numeric(9, 6), nullable=True)
    longitude = db.Column(db.Numeric(9, 6), nullable=True)
    cuisine_type = db.Column(db.String(100), nullable=True)
    food_type = db.Column(db.String(20), nullable=True)
    avg_budget_for_two = db.Column(db.Numeric(10, 2), nullable=True)
    rating = db.Column(db.Numeric(2, 1), default=0)
    total_reviews = db.Column(db.Integer, default=0)
    opening_time = db.Column(db.Time, nullable=True)
    closing_time = db.Column(db.Time, nullable=True)
    cover_image = db.Column(db.String(255), nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("Users.user_id"), nullable=True)
    is_instant_booking = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    images = db.relationship("RestaurantImage", backref="restaurant", lazy=True)
    amenities = db.relationship("Amenity", secondary=restaurant_amenities, backref="restaurants", lazy=True)
    tables = db.relationship("RestaurantTable", backref="restaurant", lazy=True)
    bookings = db.relationship("Booking", backref="restaurant", lazy=True)
    reviews = db.relationship("Review", backref="restaurant", lazy=True)
    menu_items = db.relationship("MenuItem", backref="restaurant", cascade="all, delete-orphan", lazy=True)

    def to_dict(self, include_amenities=True):
        data = {
            "restaurant_id": self.restaurant_id,
            "owner_id": self.owner_id,
            "name": self.name,
            "description": self.description,
            "address": self.address,
            "area": self.area,
            "city": self.city,
            "cuisine_type": self.cuisine_type,
            "food_type": self.food_type,
            "avg_budget_for_two": float(self.avg_budget_for_two) if self.avg_budget_for_two else None,
            "rating": float(self.rating) if self.rating else 0,
            "total_reviews": self.total_reviews,
            "opening_time": self.opening_time.isoformat() if self.opening_time else None,
            "closing_time": self.closing_time.isoformat() if self.closing_time else None,
            "cover_image": self.cover_image,
            "is_instant_booking": self.is_instant_booking,
            "images": [img.image_url for img in self.images],
        }
        if include_amenities:
            data["amenities"] = [a.name for a in self.amenities]
        return data


class RestaurantImage(db.Model):
    __tablename__ = "RestaurantImages"

    image_id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey("Restaurants.restaurant_id"), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)


class Amenity(db.Model):
    __tablename__ = "Amenities"

    amenity_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)


class RestaurantTable(db.Model):
    __tablename__ = "RestaurantTables"

    table_id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey("Restaurants.restaurant_id"), nullable=False)
    table_type = db.Column(db.String(50), nullable=True)
    capacity = db.Column(db.Integer, nullable=False)
