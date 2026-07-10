from extensions import db


class Coupon(db.Model):
    __tablename__ = "Coupons"

    coupon_id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(30), nullable=False, unique=True)
    description = db.Column(db.String(255), nullable=True)
    discount_type = db.Column(db.String(20), nullable=False)  # 'Percentage' or 'Flat'
    discount_value = db.Column(db.Numeric(10, 2), nullable=False)
    min_booking_amount = db.Column(db.Numeric(10, 2), default=0)
    max_discount = db.Column(db.Numeric(10, 2), nullable=True)
    valid_from = db.Column(db.Date, nullable=True)
    valid_until = db.Column(db.Date, nullable=True)
    usage_limit = db.Column(db.Integer, nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "coupon_id": self.coupon_id,
            "code": self.code,
            "description": self.description,
            "discount_type": self.discount_type,
            "discount_value": float(self.discount_value),
            "min_booking_amount": float(self.min_booking_amount) if self.min_booking_amount else 0,
            "max_discount": float(self.max_discount) if self.max_discount else None,
            "valid_from": self.valid_from.isoformat() if self.valid_from else None,
            "valid_until": self.valid_until.isoformat() if self.valid_until else None,
            "is_active": self.is_active,
        }
