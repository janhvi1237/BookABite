"""Adds the is_approved column to Users (safe to run more than once).

Usage (inside bookabite-backend, venv active):
    python database/migrate_owner_approval.py

Everyone who already exists (customers, admin, the demo owner) stays approved.
Only NEW owner sign-ups start as "pending" until an admin approves them.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db
from sqlalchemy import text, inspect

app = create_app()

with app.app_context():
    columns = [c["name"] for c in inspect(db.engine).get_columns("Users")]
    if "is_approved" in columns:
        print("Column is_approved already exists - nothing to do.")
    else:
        db.session.execute(
            text("ALTER TABLE Users ADD is_approved BIT NOT NULL "
                 "CONSTRAINT DF_Users_is_approved DEFAULT 1")
        )
        db.session.commit()
        print("Added is_approved to Users. Existing accounts stay approved.")
