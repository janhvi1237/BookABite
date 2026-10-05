"""Automatic table allocation (pure logic: no Flask, no database).

Why this file exists
--------------------
A restaurant has real tables (T1 = 2 seats, T2 = 4 seats ...). A booking
occupies ONE table for the whole dining duration (default 90 minutes). This
module answers three questions:

  1. Which table should this party get?          -> pick_table()
  2. How many tables are free at a given time?   -> free_tables()
  3. If it is full, what times are free instead? -> suggest_alternatives()

Times are "minutes since midnight" (7:30 PM = 19*60+30 = 1170) so the maths is
simple and easy to unit-test. The database layer (table_service.py) converts
real bookings into Busy records and calls these functions.

Best-fit rule: of all tables that are free for the WHOLE sitting and have
enough seats, choose the SMALLEST one. A couple therefore never takes a
6-seater while a 2-seater is free, which keeps big tables for big groups.
"""
from dataclasses import dataclass

DEFAULT_DURATION_MINUTES = 90


@dataclass(frozen=True)
class Busy:
    """A table that is already taken from `start` (inclusive) to `end` (exclusive)."""
    table_id: int
    start: int
    end: int


def to_minutes(value):
    """datetime.time -> minutes since midnight."""
    return value.hour * 60 + value.minute


def overlaps(start_a, end_a, start_b, end_b):
    """True if two sittings share any minute. Back-to-back (one ends exactly
    when the next starts) is NOT an overlap."""
    return start_a < end_b and start_b < end_a


def _is_active(table):
    return getattr(table, "is_active", True) is not False


def usable_tables(tables):
    """Active tables with at least one seat."""
    return [t for t in tables if _is_active(t) and (t.capacity or 0) > 0]


def max_party_size(tables):
    """Biggest group the restaurant can seat (its largest active table)."""
    return max((t.capacity for t in usable_tables(tables)), default=0)


def free_tables(tables, busy, start, end, party_size=1):
    """Tables that fit the party AND are free for the whole [start, end) sitting,
    smallest first."""
    taken = {
        b.table_id for b in busy if overlaps(start, end, b.start, b.end)
    }
    fitting = [
        t for t in usable_tables(tables)
        if t.capacity >= party_size and t.table_id not in taken
    ]
    return sorted(fitting, key=lambda t: (t.capacity, t.table_id))


def pick_table(tables, busy, start, end, party_size):
    """The best-fit free table, or None if the restaurant is full."""
    options = free_tables(tables, busy, start, end, party_size)
    return options[0] if options else None


def suggest_alternatives(tables, busy, slot_starts, duration, party_size,
                         wanted_start, limit=3):
    """Closest free slot start times (minutes) to what the guest asked for."""
    free_slots = [
        s for s in slot_starts
        if s != wanted_start and pick_table(tables, busy, s, s + duration, party_size)
    ]
    free_slots.sort(key=lambda s: (abs(s - wanted_start), s))
    return sorted(free_slots[:limit])
