from datetime import datetime

from extensions import db


class OwnerDuesPayment(db.Model):
    __tablename__ = "OwnerDuesPayments"

    payment_id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("Users.user_id"), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(30), nullable=False)
    reference = db.Column(db.String(50), nullable=False, unique=True)
    status = db.Column(db.String(20), nullable=False, default="Success")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "payment_id": self.payment_id,
            "amount": float(self.amount),
            "payment_method": self.payment_method,
            "reference": self.reference,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
