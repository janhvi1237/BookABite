"""Admin-editable platform settings (stored in the Settings table).

Fee model:
  customer_fee_per_guest / customer_fee_max : paid by the customer when booking (0 = free booking)
  owner_fee_per_guest                       : charged to the owner per guest of a COMPLETED booking
.env values are only the defaults used until an admin saves something.
"""
import os
from decimal import Decimal, InvalidOperation

from extensions import db
from models.setting import Setting

DEFAULTS = {
    "customer_fee_per_guest": os.getenv("BOOKING_FEE_PER_GUEST", "50"),
    "customer_fee_max": os.getenv("BOOKING_FEE_MAX", "500"),
    "owner_fee_per_guest": os.getenv("OWNER_FEE_PER_GUEST", "20"),
}
MAX_VALUE = Decimal("100000")
_table_checked = False


def _ensure_table():
    global _table_checked
    if not _table_checked:
        Setting.__table__.create(db.engine, checkfirst=True)
        _table_checked = True


def get_settings():
    """Returns {key: Decimal}. Falls back to defaults if the table is unavailable."""
    values = dict(DEFAULTS)
    try:
        _ensure_table()
        for row in Setting.query.all():
            if row.key in values:
                values[row.key] = row.value
    except Exception:
        db.session.rollback()
    return {k: Decimal(str(v)) for k, v in values.items()}


def update_settings(data):
    """Validates and saves. Returns (settings, error_message)."""
    clean = {}
    for key in DEFAULTS:
        if key not in data:
            continue
        try:
            value = Decimal(str(data[key]))
        except (InvalidOperation, ValueError):
            return None, f"{key} must be a number"
        if value < 0 or value > MAX_VALUE:
            return None, f"{key} must be between 0 and {MAX_VALUE}"
        clean[key] = value
    if not clean:
        return None, "No valid setting provided"

    _ensure_table()
    for key, value in clean.items():
        row = Setting.query.get(key)
        if row:
            row.value = str(value)
        else:
            db.session.add(Setting(key=key, value=str(value)))
    db.session.commit()
    return get_settings(), None
