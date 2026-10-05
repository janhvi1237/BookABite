from datetime import datetime

from extensions import db


class Booking(db.Model):
    __tablename__ = "Bookings"

    booking_id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("Users.user_id"),
        nullable=False
    )

    restaurant_id = db.Column(
        db.Integer,
        db.ForeignKey("Restaurants.restaurant_id"),
        nullable=False
    )

    table_id = db.Column(
        db.Integer,
        db.ForeignKey("RestaurantTables.table_id"),
        nullable=True
    )

    booking_date = db.Column(
        db.Date,
        nullable=False
    )

    booking_time = db.Column(
        db.Time,
        nullable=False
    )

    party_size = db.Column(
        db.Integer,
        nullable=False
    )

    status = db.Column(
        db.String(20),
        default="Pending"
    )

    special_request = db.Column(
        db.String(500),
        nullable=True
    )

    qr_code = db.Column(
        db.String(255),
        nullable=True
    )

    scratch_card_used = db.Column(
        db.Boolean,
        default=False
    )

    # When the sitting ends (booking_time + the restaurant's dining duration).
    # Stored, so changing the duration later never alters past bookings.
    end_time = db.Column(
        db.Time,
        nullable=True
    )

    # Booking fee (INR). fee_status: None (no fee), Paid, Refunded
    booking_fee = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    fee_status = db.Column(
        db.String(20),
        nullable=False,
        default="None"
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    # --------------------------------------------------------
    # Relationships
    # --------------------------------------------------------

    payments = db.relationship(
        "Payment",
        backref="booking",
        lazy=True
    )

    table = db.relationship(
        "RestaurantTable",
        foreign_keys=[table_id],
        lazy="joined",
    )

    reviews = db.relationship(
        "Review",
        backref="booking",
        lazy=True
    )

    # --------------------------------------------------------
    # Convert to dictionary
    # --------------------------------------------------------

    def to_dict(self):
        return {
            "booking_id": self.booking_id,

            "user_id": self.user_id,

            "restaurant_id": self.restaurant_id,

            "table_id": self.table_id,

            "table_number": (
                self.table.table_number or f"T{self.table.table_id}"
                if self.table
                else None
            ),

            "booking_date": (
                self.booking_date.isoformat()
                if self.booking_date
                else None
            ),

            "booking_time": (
                self.booking_time.isoformat()
                if self.booking_time
                else None
            ),

            "end_time": (
                self.end_time.isoformat()
                if self.end_time
                else None
            ),

            "party_size": self.party_size,

            "status": self.status,

            "special_request": (
                self.special_request
            ),

            "qr_code": self.qr_code,

            "scratch_card_used": (
                self.scratch_card_used
            ),

            "booking_fee": float(self.booking_fee or 0),

            "fee_status": self.fee_status or "None",

            "invoice_number": self._invoice_number(),

            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }

    def _invoice_number(self):
        for payment in self.payments or []:
            if payment.invoice_number:
                return payment.invoice_number
        return None
