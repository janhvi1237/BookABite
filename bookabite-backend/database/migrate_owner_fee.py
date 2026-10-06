"""Adds fee settings, owner fees, and the demo owner-payment ledger.

Usage (inside bookabite-backend, venv active):
    python database/migrate_owner_fee.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db
from models.setting import Setting
from models.owner_dues_payment import OwnerDuesPayment
from sqlalchemy import text, inspect

app = create_app()

with app.app_context():
    Setting.__table__.create(db.engine, checkfirst=True)
    print("Settings table ready")
    OwnerDuesPayment.__table__.create(db.engine, checkfirst=True)
    print("Owner dues payments table ready")
    columns = [c["name"] for c in inspect(db.engine).get_columns("Bookings")]
    if "owner_fee" not in columns:
        db.session.execute(text(
            "ALTER TABLE Bookings ADD owner_fee DECIMAL(10,2) NOT NULL "
            "CONSTRAINT DF_Bookings_owner_fee DEFAULT 0"))
        print("Added Bookings.owner_fee")
    db.session.commit()
    print("Done.")
