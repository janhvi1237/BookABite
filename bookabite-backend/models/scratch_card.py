from datetime import datetime
from extensions import db


class ScratchCard(db.Model):
    __tablename__ = "ScratchCards"

    scratch_card_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("Users.user_id"), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey("Bookings.booking_id"), nullable=False)
    reward_type = db.Column(db.String(50), nullable=True)   # 'Discount Coupon', 'Cashback', 'No Reward'
    reward_value = db.Column(db.Numeric(10, 2), nullable=True)
    is_revealed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "scratch_card_id": self.scratch_card_id,
            "booking_id": self.booking_id,
            "reward_type": self.reward_type,
            "reward_value": float(self.reward_value) if self.reward_value else None,
            "is_revealed": self.is_revealed,
        }
