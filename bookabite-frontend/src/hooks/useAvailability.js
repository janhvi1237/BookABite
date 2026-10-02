import { useEffect, useState } from 'react';
import { fetchBookingAvailability } from '../api/bookings';
import { formatTime } from '../utils/time';

// Loads the real availability for one restaurant + date and returns only the
// slots a guest can actually book (open, in the future, seats left for the
// party, and not clashing with a table they already hold).
export default function useAvailability(restaurantId, date, partySize) {
  const [state, setState] = useState({ loading: true, error: null, slots: [], message: '' });

  useEffect(() => {
    if (!restaurantId || !date) return undefined;
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchBookingAvailability(restaurantId, date)
      .then((data) => {
        if (!active) return;
        const all = Array.isArray(data?.slots) ? data.slots : [];
        const guests = Number(partySize) || 1;
        const open = all.filter((s) => s.available && s.remaining_capacity >= guests);
        const heldByYou = all.filter((s) => s.already_booked).length;
        setState({
          loading: false,
          error: null,
          slots: open.map((s) => ({ value: s.value, label: formatTime(s.value), remaining: s.remaining_capacity })),
          message: data?.error || '',
          totalOpen: all.filter((s) => s.available).length,
          heldByYou,
        });
      })
      .catch((err) => {
        if (active) setState({ loading: false, error: err.message || 'Could not load timings', slots: [], message: '' });
      });

    return () => { active = false; };
  }, [restaurantId, date, partySize]);

  return state;
}
