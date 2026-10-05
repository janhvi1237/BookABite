import { api } from './client';

export function fetchTableAvailability(restaurantId, bookingDate, bookingTime) {
  const params = new URLSearchParams({
    booking_date: bookingDate,
    booking_time: bookingTime,
  });
  return api.get(`/api/restaurants/${restaurantId}/tables/availability?${params.toString()}`);
}

export function fetchCustomerAvailableTables(restaurantId, bookingDate, bookingTime, partySize) {
  const params = new URLSearchParams({
    booking_date: bookingDate,
    booking_time: bookingTime,
    party_size: String(partySize),
  });
  return api.get(`/api/restaurants/${restaurantId}/available-tables?${params.toString()}`);
}
