from datetime import datetime
from extensions import db


class MenuItem(db.Model):
    __tablename__ = "MenuItems"

    item_id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey("Restaurants.restaurant_id", ondelete="CASCADE"), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # Starters, Main Course, Desserts, Beverages, Specials
    image_url = db.Column(db.String(500), nullable=True)
    is_veg = db.Column(db.Boolean, default=True)
    is_available = db.Column(db.Boolean, default=True)
    spice_level = db.Column(db.String(20), default="Medium")  # Mild, Medium, Spicy
    ingredients = db.Column(db.String(500), nullable=True)
    dietary_info = db.Column(db.String(200), nullable=True)  # Gluten-Free, Vegan, Dairy-Free, Nut-Free, etc.
    rating = db.Column(db.Numeric(2, 1), default=4.5)
    popularity = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "item_id": self.item_id,
            "restaurant_id": self.restaurant_id,
            "name": self.name,
            "description": self.description,
            "price": float(self.price) if self.price is not None else 0.0,
            "category": self.category,
            "image_url": self.image_url,
            "is_veg": bool(self.is_veg),
            "is_available": bool(self.is_available),
            "spice_level": self.spice_level or "Medium",
            "ingredients": self.ingredients,
            "dietary_info": self.dietary_info,
            "rating": float(self.rating) if self.rating is not None else 4.5,
            "popularity": self.popularity or 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
