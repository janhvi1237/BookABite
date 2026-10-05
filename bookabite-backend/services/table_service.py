"""Database side of automatic table booking.

table_allocator.py holds the pure rules; this file reads the restaurant's
tables and existing bookings from the database, calls those rules, and
provides the lock that stops two guests getting the same table.
"""
from datetime import time

from sqlalchemy import text

from extensions import db
from models.booking import Booking
from models.restaurant import RestaurantTable
from services import table_allocator as alloc

ACTIVE_STATUSES = ("Pending", "Confirmed")


def sitting_minutes(restaurant):
    """How long one party keeps a table at this restaurant."""
    return int(restaurant.dining_duration_minutes or alloc.DEFAULT_DURATION_MINUTES)


def end_time_for(start, minutes):
    """The clock time a sitting ends (wraps past midnight if needed)."""
    total = (alloc.to_minutes(start) + int(minutes)) % 1440
    return time(total // 60, total % 60)


def lock_restaurant(restaurant_id):
    """Serialise bookings per restaurant until the transaction commits.

    Two guests clicking Book at the same instant would otherwise both see the
    same table as free. On SQL Server the UPDLOCK hint makes the second request
    wait for the first to finish, then see the table as taken. (SQLAlchemy's
    with_for_update() is ignored by SQL Server, hence the explicit hint.)
    """
    if db.engine.dialect.name == "mssql":
        db.session.execute(
            text("SELECT restaurant_id FROM Restaurants WITH (UPDLOCK, ROWLOCK) "
                 "WHERE restaurant_id = :rid"),
            {"rid": restaurant_id},
        )


def load_tables(restaurant_id):
    return RestaurantTable.query.filter_by(restaurant_id=restaurant_id).all()


def load_busy(restaurant, booking_date, ignore_booking_id=None):
    """Tables already taken on a date, as Busy(table_id, start, end) records."""
    query = Booking.query.filter(
        Booking.restaurant_id == restaurant.restaurant_id,
        Booking.booking_date == booking_date,
        Booking.status.in_(ACTIVE_STATUSES),
        Booking.table_id.isnot(None),
    )
    if ignore_booking_id is not None:
        query = query.filter(Booking.booking_id != ignore_booking_id)

    default = sitting_minutes(restaurant)
    busy = []
    for b in query.all():
        if not b.booking_time:
            continue
        start = alloc.to_minutes(b.booking_time)
        end = alloc.to_minutes(b.end_time) if b.end_time else start + default
        if end <= start:          # sitting runs past midnight
            end += 1440
        busy.append(alloc.Busy(b.table_id, start, end))
    return busy


def max_party(restaurant):
    """Largest group this restaurant can seat (its biggest active table)."""
    return alloc.max_party_size(load_tables(restaurant.restaurant_id))


def allocate_table(restaurant, booking_date, start_time, party_size,
                   ignore_booking_id=None, preferred_table_id=None):
    """Pick a table. Returns (table_or_None, sitting_minutes).

    If the guest asked for a specific table, it is returned only if it is
    currently free and fits the party. Automatic best-fit assignment is used
    only when no table preference was supplied.
    """
    tables = load_tables(restaurant.restaurant_id)
    busy = load_busy(restaurant, booking_date, ignore_booking_id)
    duration = sitting_minutes(restaurant)
    start = alloc.to_minutes(start_time)
    end = start + duration

    options = alloc.free_tables(tables, busy, start, end, party_size)
    if preferred_table_id is not None:
        for table in options:
            if table.table_id == preferred_table_id:
                return table, duration
        return None, duration
    return (options[0] if options else None), duration


def alternative_times(restaurant, booking_date, wanted_time, party_size, slot_times):
    """Nearest times that still have a table, as 'HH:MM' strings."""
    tables = load_tables(restaurant.restaurant_id)
    busy = load_busy(restaurant, booking_date)
    duration = sitting_minutes(restaurant)
    starts = [alloc.to_minutes(s) for s in slot_times]
    best = alloc.suggest_alternatives(
        tables, busy, starts, duration, party_size, alloc.to_minutes(wanted_time)
    )
    return [f"{m // 60:02d}:{m % 60:02d}" for m in best]


def day_availability(restaurant, booking_date, slot_times, party_size=1):
    """Per-slot table counts for the availability screen, keyed by 'HH:MM'."""
    tables = alloc.usable_tables(load_tables(restaurant.restaurant_id))
    busy = load_busy(restaurant, booking_date)
    duration = sitting_minutes(restaurant)

    result = {}
    for slot in slot_times:
        start = alloc.to_minutes(slot)
        free_any = alloc.free_tables(tables, busy, start, start + duration, 1)
        free_fit = [t for t in free_any if t.capacity >= party_size]
        result[slot.strftime("%H:%M")] = {
            "tables_total": len(tables),
            "tables_free": len(free_any),
            "free_seats": sum(t.capacity for t in free_any),
            "fits_party": bool(free_fit),
        }
    return result
