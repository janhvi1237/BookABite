"""Adds booking fee columns to Bookings (safe to run more than once).

Usage (inside bookabite-backend, venv active):
    python database/migrate_booking_fee.py

Old bookings keep a fee of 0 and fee_status 'None'.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db
from sqlalchemy import text, inspect

app = create_app()

with app.app_context():
    columns = [c["name"] for c in inspect(db.engine).get_columns("Bookings")]
    if "booking_fee" not in columns:
        db.session.execute(text(
            "ALTER TABLE Bookings ADD booking_fee DECIMAL(10,2) NOT NULL "
            "CONSTRAINT DF_Bookings_booking_fee DEFAULT 0"))
        print("Added Bookings.booking_fee")
    if "fee_status" not in columns:
        db.session.execute(text(
            "ALTER TABLE Bookings ADD fee_status NVARCHAR(20) NOT NULL "
            "CONSTRAINT DF_Bookings_fee_status DEFAULT 'None'"))
        print("Added Bookings.fee_status")
    db.session.commit()
    print("Done. Existing bookings are unchanged (fee 0).")
