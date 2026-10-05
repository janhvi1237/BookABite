"""Real table inventory + automatic table booking (safe to run more than once).

Usage (inside bookabite-backend, venv active):
    python database/migrate_tables.py

What it does
  1. Adds the new columns (table label, table on/off, dining duration,
     booking window, booking end time).
  2. Gives every table a label (T1, T2 ...) if it has none.
  3. Fills in the end time of existing bookings.
  4. Gives every FUTURE Pending/Confirmed booking that has no table a real
     table, oldest first, using the same best-fit rule as new bookings.
     Bookings that cannot be seated are listed - nothing is cancelled for you.
"""
import os
import sys
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db
from sqlalchemy import text, inspect

app = create_app()

NEW_COLUMNS = [
    ("RestaurantTables", "table_number", "NVARCHAR(20) NULL"),
    ("RestaurantTables", "is_active",
     "BIT NOT NULL CONSTRAINT DF_RestaurantTables_is_active DEFAULT 1"),
    ("Restaurants", "dining_duration_minutes",
     "INT NOT NULL CONSTRAINT DF_Restaurants_duration DEFAULT 90"),
    ("Restaurants", "max_advance_days",
     "INT NOT NULL CONSTRAINT DF_Restaurants_advance DEFAULT 30"),
    ("Bookings", "end_time", "TIME NULL"),
]


def add_columns():
    inspector = inspect(db.engine)
    for table, column, definition in NEW_COLUMNS:
        existing = [c["name"] for c in inspector.get_columns(table)]
        if column in existing:
            print(f"{table}.{column} already exists")
            continue
        db.session.execute(text(f"ALTER TABLE {table} ADD {column} {definition}"))
        print(f"Added {table}.{column}")
    db.session.commit()


def main():
    with app.app_context():
        add_columns()

        # Imported only now: the ORM needs the columns above to exist.
        from models.booking import Booking
        from models.restaurant import Restaurant, RestaurantTable
        from services import table_service

        # 2. Table labels
        labelled = 0
        for restaurant in Restaurant.query.all():
            tables = (RestaurantTable.query.filter_by(restaurant_id=restaurant.restaurant_id)
                      .order_by(RestaurantTable.table_id).all())
            for number, table in enumerate(tables, 1):
                if not table.table_number:
                    table.table_number = f"T{number}"
                    labelled += 1
        db.session.commit()
        print(f"Labelled {labelled} tables")

        # 3. End times
        filled = 0
        for booking in Booking.query.filter(Booking.end_time.is_(None)).all():
            if booking.booking_time and booking.restaurant:
                booking.end_time = table_service.end_time_for(
                    booking.booking_time, table_service.sitting_minutes(booking.restaurant))
                filled += 1
        db.session.commit()
        print(f"Filled end time on {filled} bookings")

        # 4. Seat future bookings that have no table yet
        pending = (Booking.query
                   .filter(Booking.table_id.is_(None),
                           Booking.status.in_(["Pending", "Confirmed"]),
                           Booking.booking_date >= date.today())
                   .order_by(Booking.booking_date, Booking.booking_time, Booking.booking_id)
                   .all())
        assigned, stuck = 0, []
        for booking in pending:
            table, _ = table_service.allocate_table(
                booking.restaurant, booking.booking_date, booking.booking_time,
                int(booking.party_size or 0), ignore_booking_id=booking.booking_id)
            if table:
                booking.table_id = table.table_id
                db.session.commit()   # commit each so the next one sees it
                assigned += 1
            else:
                stuck.append(booking)
        print(f"Assigned tables to {assigned} existing bookings")
        for b in stuck:
            print(f"  NEEDS ATTENTION: booking #{b.booking_id} ({b.party_size} guests, "
                  f"{b.booking_date} {b.booking_time}) - no table fits; contact the guest")
        print("Done.")


if __name__ == "__main__":
    main()
