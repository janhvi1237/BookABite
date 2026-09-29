import { api } from "./client";


// ============================================================
// CREATE BOOKING
// ============================================================

export async function createBooking(bookingData) {
  return api.post(
    "/api/bookings",
    bookingData
  );
}


// ============================================================
// GET USER BOOKINGS
//
// Keep both function names because different pages
// may use different names.
// ============================================================

export async function fetchUserBookings(userId) {
  return api.get(
    `/api/bookings?user_id=${userId}`
  );
}


// Alias used by newer code
export async function fetchBookings(userId) {
  return fetchUserBookings(userId);
}


// ============================================================
// GET OWNER BOOKINGS
// ============================================================

export async function fetchOwnerBookings(ownerId) {
  return api.get(
    `/api/bookings/owner?owner_id=${ownerId}`
  );
}


// ============================================================
// GET ONE BOOKING
// ============================================================

export async function fetchBooking(bookingId) {
  return api.get(
    `/api/bookings/${bookingId}`
  );
}


// ============================================================
// CANCEL BOOKING
// ============================================================

export async function cancelBooking(bookingId) {
  return api.patch(
    `/api/bookings/${bookingId}/cancel`
  );
}


// ============================================================
// UPDATE BOOKING STATUS
// ============================================================

export async function updateBookingStatus(
  bookingId,
  status
) {
  return api.patch(
    `/api/bookings/${bookingId}/status`,
    {
      status
    }
  );
}


// ============================================================
// GET RESTAURANT AVAILABILITY
// ============================================================

export async function fetchBookingAvailability(
  restaurantId,
  bookingDate
) {
  return api.get(
    `/api/bookings/availability?restaurant_id=${restaurantId}&booking_date=${bookingDate}`
  );
}