"""Booking fee rules (one place, so the price shown and the price charged always match).

Fee = FEE_PER_GUEST x guests, never more than FEE_MAX. All values can be changed in
.env (BOOKING_FEE_PER_GUEST, BOOKING_FEE_MAX) without touching any code.
"""
import os
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

FEE_PER_GUEST = Decimal(os.getenv("BOOKING_FEE_PER_GUEST", "50"))
FEE_MAX = Decimal(os.getenv("BOOKING_FEE_MAX", "500"))
REFUND_CUTOFF_MINUTES = int(os.getenv("BOOKING_REFUND_CUTOFF_MINUTES", "60"))
PAYMENT_METHODS = ("upi", "card", "netbanking")


def _money(value):
    return Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_fee(party_size):
    """Fee breakdown for a party. Returns plain numbers ready for JSON."""
    party_size = max(int(party_size), 1)
    raw = FEE_PER_GUEST * party_size
    fee = _money(min(raw, FEE_MAX))
    return {
        "per_guest": float(_money(FEE_PER_GUEST)),
        "guests": party_size,
        "fee": float(fee),
        "capped": raw > FEE_MAX,
        "max_fee": float(_money(FEE_MAX)),
        "currency": "INR",
        "refund_cutoff_minutes": REFUND_CUTOFF_MINUTES,
    }


def make_invoice_number(booking_id):
    return f"BAB-{datetime.utcnow():%Y%m%d}-{int(booking_id):06d}"


def is_refundable(booking_datetime, now=None):
    """Customer cancellations are refunded only if there is still time before the booking."""
    now = now or datetime.now()
    return (booking_datetime - now).total_seconds() >= REFUND_CUTOFF_MINUTES * 60
