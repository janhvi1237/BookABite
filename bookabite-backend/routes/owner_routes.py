from decimal import Decimal
from uuid import uuid4

from flask import Blueprint, jsonify, request

from extensions import db
from models.booking import Booking
from models.owner_dues_payment import OwnerDuesPayment
from models.restaurant import Restaurant
from utils.auth import current_user, roles_required

owner_bp = Blueprint("owner", __name__, url_prefix="/api/owner")

PAYMENT_METHODS = {"upi", "card", "netbanking"}


def _billing_summary(owner_id):
    restaurant_ids = [
        restaurant_id
        for (restaurant_id,) in db.session.query(Restaurant.restaurant_id)
        .filter_by(owner_id=owner_id)
        .all()
    ]
    accrued_bookings = (
        Booking.query.filter(
            Booking.restaurant_id.in_(restaurant_ids),
            Booking.owner_fee > 0,
        ).all()
        if restaurant_ids
        else []
    )
    total_fees = sum(
        (Decimal(str(booking.owner_fee or 0)) for booking in accrued_bookings),
        Decimal("0.00"),
    )
    completed_count = (
        Booking.query.filter(
            Booking.restaurant_id.in_(restaurant_ids),
            Booking.status == "Completed",
        ).count()
        if restaurant_ids
        else 0
    )
    payments = (
        OwnerDuesPayment.query.filter_by(owner_id=owner_id)
        .order_by(OwnerDuesPayment.created_at.desc(), OwnerDuesPayment.payment_id.desc())
        .all()
    )
    paid_total = sum(
        (
            Decimal(str(payment.amount))
            for payment in payments
            if payment.status == "Success"
        ),
        Decimal("0.00"),
    )
    due = max(total_fees - paid_total, Decimal("0.00"))
    return {
        "total_fees": round(float(total_fees), 2),
        "paid_total": round(float(paid_total), 2),
        "amount_due": round(float(due), 2),
        "completed_bookings": completed_count,
        "payments": [payment.to_dict() for payment in payments],
        "currency": "INR",
        "is_demo": True,
    }


@owner_bp.route("/billing", methods=["GET"])
@roles_required("owner", "admin")
def owner_billing():
    return jsonify(_billing_summary(current_user().user_id)), 200


@owner_bp.route("/billing/pay", methods=["POST"])
@roles_required("owner", "admin")
def pay_owner_dues():
    data = request.get_json(silent=True) or {}
    payment_method = str(data.get("payment_method", "")).lower()
    if payment_method not in PAYMENT_METHODS:
        return jsonify({
            "error": "payment_method must be one of: upi, card, netbanking"
        }), 400

    owner_id = current_user().user_id
    summary = _billing_summary(owner_id)
    if summary["amount_due"] <= 0:
        return jsonify({"error": "There are no outstanding dues to pay."}), 409

    payment = OwnerDuesPayment(
        owner_id=owner_id,
        amount=Decimal(str(summary["amount_due"])),
        payment_method=payment_method,
        reference=f"DEMO-{uuid4().hex[:12].upper()}",
        status="Success",
    )
    db.session.add(payment)
    db.session.commit()

    return jsonify({
        "message": "Demo payment successful. No real payment was processed.",
        "payment": payment.to_dict(),
        "billing": _billing_summary(owner_id),
    }), 201
