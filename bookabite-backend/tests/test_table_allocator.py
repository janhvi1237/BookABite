"""Unit tests for the automatic table allocator (no database or Flask needed).

Run:  python -m unittest tests.test_table_allocator -v      (from bookabite-backend)
"""
import os
import sys
import unittest
from collections import namedtuple
from datetime import time

# Load the module straight from its file so this test needs no Flask/database.
import importlib.util  # noqa: E402

_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "services", "table_allocator.py",
)
_spec = importlib.util.spec_from_file_location("table_allocator", _path)
_mod = importlib.util.module_from_spec(_spec)
sys.modules["table_allocator"] = _mod  # dataclass needs the module registered
_spec.loader.exec_module(_mod)

Busy = _mod.Busy
free_tables = _mod.free_tables
max_party_size = _mod.max_party_size
overlaps = _mod.overlaps
pick_table = _mod.pick_table
suggest_alternatives = _mod.suggest_alternatives
to_minutes = _mod.to_minutes

T = namedtuple("T", "table_id capacity is_active")
H = 60  # minutes in an hour
SITTING = 90


def tables(*seats):
    """tables(2, 4, 4, 6) -> T1..T4 with those seat counts."""
    return [T(i + 1, c, True) for i, c in enumerate(seats)]


class OverlapTests(unittest.TestCase):
    def test_overlapping_sittings(self):
        self.assertTrue(overlaps(19 * H, 19 * H + 90, 19 * H + 30, 21 * H))

    def test_back_to_back_is_not_overlap(self):
        self.assertFalse(overlaps(19 * H, 20 * H + 30, 20 * H + 30, 22 * H))

    def test_to_minutes(self):
        self.assertEqual(to_minutes(time(19, 30)), 1170)


class PickTableTests(unittest.TestCase):
    def test_best_fit_smallest_table_that_fits(self):
        t = tables(2, 4, 6)
        self.assertEqual(pick_table(t, [], 19 * H, 19 * H + SITTING, 2).table_id, 1)
        self.assertEqual(pick_table(t, [], 19 * H, 19 * H + SITTING, 3).table_id, 2)
        self.assertEqual(pick_table(t, [], 19 * H, 19 * H + SITTING, 5).table_id, 3)

    def test_party_bigger_than_any_table_gets_nothing(self):
        # Three 2-seaters have 6 seats in total, but a party of 6 cannot sit together.
        t = tables(2, 2, 2)
        self.assertIsNone(pick_table(t, [], 19 * H, 20 * H, 6))

    def test_busy_table_is_skipped(self):
        t = tables(2, 4)
        busy = [Busy(1, 19 * H, 19 * H + SITTING)]
        self.assertEqual(pick_table(t, busy, 19 * H, 19 * H + SITTING, 2).table_id, 2)

    def test_overlap_blocks_a_later_start(self):
        # 7:00 booking still holds the table at 7:30 (the old system missed this).
        t = tables(2)
        busy = [Busy(1, 19 * H, 19 * H + SITTING)]
        self.assertIsNone(pick_table(t, busy, 19 * H + 30, 21 * H, 2))

    def test_table_free_again_after_sitting_ends(self):
        t = tables(2)
        busy = [Busy(1, 19 * H, 19 * H + SITTING)]
        self.assertEqual(pick_table(t, busy, 20 * H + 30, 22 * H, 2).table_id, 1)

    def test_inactive_table_never_assigned(self):
        t = [T(1, 2, False), T(2, 4, True)]
        self.assertEqual(pick_table(t, [], 19 * H, 20 * H, 2).table_id, 2)

    def test_full_restaurant_returns_none(self):
        t = tables(2, 4)
        busy = [Busy(1, 19 * H, 21 * H), Busy(2, 19 * H, 21 * H)]
        self.assertIsNone(pick_table(t, busy, 19 * H + 30, 21 * H, 2))

    def test_two_parties_get_different_tables(self):
        t = tables(4, 4)
        first = pick_table(t, [], 19 * H, 20 * H + 30, 3)
        busy = [Busy(first.table_id, 19 * H, 20 * H + 30)]
        second = pick_table(t, busy, 19 * H, 20 * H + 30, 3)
        self.assertNotEqual(first.table_id, second.table_id)


class HelperTests(unittest.TestCase):
    def test_max_party_size_uses_active_tables_only(self):
        t = [T(1, 2, True), T(2, 8, False), T(3, 4, True)]
        self.assertEqual(max_party_size(t), 4)

    def test_max_party_size_no_tables(self):
        self.assertEqual(max_party_size([]), 0)

    def test_free_tables_sorted_smallest_first(self):
        t = tables(6, 2, 4)
        self.assertEqual([x.capacity for x in free_tables(t, [], 0, 60, 1)], [2, 4, 6])

    def test_suggest_alternatives_nearest_free_slots(self):
        t = tables(2)
        busy = [Busy(1, 19 * H, 19 * H + SITTING)]
        slots = [18 * H, 18 * H + 30, 19 * H, 19 * H + 30, 20 * H, 20 * H + 30, 21 * H]
        got = suggest_alternatives(t, busy, slots, SITTING, 2, 19 * H, limit=2)
        # 18:00 and 18:30 end by 19:30/20:00... 18:00-19:30 overlaps 19:00 booking, so skip;
        # 20:30 and 21:00 are free and closest after the sitting ends.
        self.assertEqual(got, [20 * H + 30, 21 * H])


if __name__ == "__main__":
    unittest.main()
