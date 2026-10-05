"""One-command database setup for BookABite (SQL Server).

Usage (from the bookabite-backend folder, venv active, .env filled in):

    python database/setup_db.py                       # schema + sample data
    python database/setup_db.py --admin admin@bookabite.com "StrongPass123" "Admin"
    python database/setup_db.py --schema-only         # tables only, no sample data

What it does, in the right order (this order matters - the menu can only be
seeded AFTER the restaurants exist):
    1. creates BookABiteDB if it is missing and applies schema.sql
    2. seeds restaurants, reviews and coupons
    3. seeds menu items and the demo owner (owner@bookabite.com)
    4. makes sure the owner-approval column exists
    5. optionally creates an admin account

Safe to run again: nothing is deleted and nothing is duplicated.
"""
import argparse
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.dirname(HERE)
sys.path.insert(0, BACKEND)

import pyodbc  # noqa: E402

from config import Config  # noqa: E402


def _connection_string(database="master"):
    parts = [
        f"DRIVER={{{Config.DB_DRIVER}}}",
        f"SERVER={Config.DB_SERVER}",
        f"DATABASE={database}",
    ]
    if Config.DB_AUTH == "windows":
        parts.append("Trusted_Connection=yes")
    else:
        parts += [f"UID={Config.DB_USER}", f"PWD={Config.DB_PASSWORD}"]
    return ";".join(parts)


def apply_schema():
    """Run schema.sql batch by batch (the file separates batches with GO)."""
    with open(os.path.join(HERE, "schema.sql"), encoding="utf-8") as f:
        sql = f.read()
    batches = [b.strip() for b in re.split(r"^\s*GO\s*$", sql, flags=re.M | re.I) if b.strip()]

    conn = pyodbc.connect(_connection_string("master"), autocommit=True)
    cursor = conn.cursor()
    for number, batch in enumerate(batches, 1):
        try:
            cursor.execute(batch)
        except pyodbc.Error as error:
            print(f"Schema batch {number} failed:\n{batch[:300]}\n\n{error}")
            sys.exit(1)
    conn.close()
    print(f"Schema ready in {Config.DB_NAME} ({len(batches)} batches applied).")


def run_script(name, *args):
    print(f"\n--> {name}")
    result = subprocess.run([sys.executable, os.path.join(HERE, name), *args], cwd=BACKEND)
    if result.returncode != 0:
        print(f"{name} failed (exit code {result.returncode}). Fix the error above and run setup again.")
        sys.exit(result.returncode)


def main():
    parser = argparse.ArgumentParser(description="Set up the BookABite database.")
    parser.add_argument("--schema-only", action="store_true", help="create tables only, no sample data")
    parser.add_argument("--admin", nargs="+", metavar=("EMAIL", "PASSWORD"),
                        help='create an admin: --admin EMAIL PASSWORD ["Full Name"]')
    args = parser.parse_args()

    if Config.DB_NAME != "BookABiteDB":
        print("Note: schema.sql creates a database called BookABiteDB. "
              f"Your .env says DB_NAME={Config.DB_NAME}; change one of them so they match.")
        sys.exit(1)

    apply_schema()
    if args.schema_only:
        return

    run_script("seed_data.py")                 # restaurants, tables, coupons
    run_script("seed_more_data.py")            # more restaurants + reviews
    run_script("seed_more_data_2.py")          # more restaurants + coupons
    run_script("migrate_and_seed_menu.py")     # menu items + demo owner (needs restaurants!)
    run_script("migrate_owner_approval.py")    # owner approval column (no-op on the new schema)
    run_script("migrate_booking_fee.py")       # booking fee columns (no-op on the new schema)
    run_script("migrate_tables.py")            # table labels, end times, seat existing bookings

    if args.admin:
        if len(args.admin) < 2:
            parser.error("--admin needs an email and a password")
        run_script("create_admin.py", *args.admin)

    print("\nAll done. Start the API with:  python app.py")
    print("Demo owner login: owner@bookabite.com / Password@123   (change it before any real use)")


if __name__ == "__main__":
    main()
