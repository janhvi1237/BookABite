from datetime import datetime
from extensions import db


class Payment(db.Model):
    __tablename__ = "Payments"

    payment_id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("Bookings.booking_id"), nullable=False)
    razorpay_order_id = db.Column(db.String(100), nullable=True)
    razorpay_payment_id = db.Column(db.String(100), nullable=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(10), default="INR")
    status = db.Column(db.String(20), default="Pending")  # Pending, Success, Failed, Refunded
    payment_method = db.Column(db.String(50), nullable=True)
    invoice_number = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "payment_id": self.payment_id,
            "booking_id": self.booking_id,
            "amount": float(self.amount) if self.amount else None,
            "currency": self.currency,
            "status": self.status,
            "payment_method": self.payment_method,
            "invoice_number": self.invoice_number,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
