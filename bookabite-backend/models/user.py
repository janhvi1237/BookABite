from datetime import datetime
from extensions import db


class User(db.Model):
    __tablename__ = "Users"

    user_id = db.Column("user_id", db.Integer, primary_key=True)
    full_name = db.Column("full_name", db.String(100), nullable=False)
    email = db.Column("email", db.String(150), nullable=False, unique=True)
    phone = db.Column("phone", db.String(15), nullable=True)
    password_hash = db.Column("password_hash", db.String(255), nullable=False)
    profile_image = db.Column("profile_image", db.String(255), nullable=True)
    is_admin = db.Column("is_admin", db.Boolean, default=False)
    role = db.Column("role", db.String(20), default="customer")  # customer, owner, admin
    created_at = db.Column("created_at", db.DateTime, default=datetime.utcnow)
    updated_at = db.Column("updated_at", db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bookings = db.relationship("Booking", backref="user", lazy=True)
    reviews = db.relationship("Review", backref="user", lazy=True)
    favorites = db.relationship("Favorite", backref="user", lazy=True)
    restaurants = db.relationship("Restaurant", backref="owner", lazy=True)

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "profile_image": self.profile_image,
            "is_admin": self.is_admin,
            "role": self.role or ("admin" if self.is_admin else "customer"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
