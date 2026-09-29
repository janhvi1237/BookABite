import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  CalendarDays,
  Clock3,
  CircleCheck,
  Users,
  MapPin,
  LogOut,
  XCircle,
  CheckCircle2,
  Settings,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  fetchOwnerBookings,
  updateBookingStatus,
} from "../api/bookings";
import { fetchOwnerRestaurants } from "../api/restaurants";

import "./OwnerDashboard.css";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isOwner, logout } = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const ownerId = user?.user_id || user?.id;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isOwner) {
      navigate("/restaurants", { replace: true });
      return;
    }

    if (!ownerId) return;

    loadDashboard();
  }, [isAuthenticated, isOwner, ownerId]);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [restaurantData, bookingData] = await Promise.all([
        fetchOwnerRestaurants(ownerId),
        fetchOwnerBookings(ownerId),
      ]);

      setRestaurants(Array.isArray(restaurantData) ? restaurantData : []);
      setBookings(Array.isArray(bookingData) ? bookingData : []);
    } catch (err) {
      console.error("Owner dashboard error:", err);
      setError(err.message || "Unable to load owner dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBookingStatus(bookingId, status) {
    try {
      setActionLoading(`${bookingId}-${status}`);
      setError("");
      setMessage("");

      // Backend expects capitalized status values.
      await updateBookingStatus(bookingId, status);

      setBookings((current) =>
        current.map((booking) =>
          booking.booking_id === bookingId
            ? { ...booking, status }
            : booking
        )
      );

      setMessage(
        status === "Confirmed"
          ? `Booking #${bookingId} confirmed successfully.`
          : `Booking #${bookingId} rejected successfully.`
      );
    } catch (err) {
      console.error("Booking status error:", err);
      setError(err.message || "Unable to update booking status.");
    } finally {
      setActionLoading(null);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const pendingCount = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          String(booking.status || "").toLowerCase() === "pending"
      ).length,
    [bookings]
  );

  const confirmedCount = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          String(booking.status || "").toLowerCase() === "confirmed"
      ).length,
    [bookings]
  );

  if (!isAuthenticated || !isOwner) {
    return null;
  }

  if (loading) {
    return (
      <div className="owner-dashboard-page">
        <div className="owner-dashboard-container">
          <div className="owner-loading">
            <div className="owner-spinner" />
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-dashboard-page">
      <div className="owner-dashboard-container">

        {/* HEADER */}
        <section className="owner-dashboard-header">
          <div>
            <div className="owner-eyebrow">
              BOOKABITE · OWNER
            </div>

            <h1>Owner Dashboard</h1>

            <p>
              Manage your restaurants and reservations from one place.
            </p>
          </div>

          <button
            type="button"
            className="owner-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </section>

        {/* MESSAGE */}
        {message && (
          <div className="owner-success-message">
            <CheckCircle2 size={17} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="owner-error-message">
            <XCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* STATS */}
        <section className="owner-stats-grid">

          <div className="owner-stat-card">
            <div className="owner-stat-icon">
              <Store size={20} />
            </div>

            <span>Restaurants</span>
            <strong>{restaurants.length}</strong>
          </div>

          <div className="owner-stat-card">
            <div className="owner-stat-icon">
              <CalendarDays size={20} />
            </div>

            <span>Total bookings</span>
            <strong>{bookings.length}</strong>
          </div>

          <div className="owner-stat-card">
            <div className="owner-stat-icon">
              <Clock3 size={20} />
            </div>

            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>

          <div className="owner-stat-card">
            <div className="owner-stat-icon">
              <CircleCheck size={20} />
            </div>

            <span>Confirmed</span>
            <strong>{confirmedCount}</strong>
          </div>

        </section>

        {/* RESTAURANTS */}
        <section className="owner-section">

          <div className="owner-section-header">
            <div>
              <div className="owner-section-eyebrow">
                YOUR BUSINESS
              </div>

              <h2>Your Restaurants</h2>
            </div>

            {/* NEW MANAGE RESTAURANTS BUTTON */}
            <button
              type="button"
              className="owner-manage-btn"
              onClick={() => navigate("/owner/restaurants")}
            >
              <Settings size={17} />
              Manage restaurants
            </button>
          </div>

          {restaurants.length === 0 ? (
            <div className="owner-empty-box">
              <Store size={32} />
              <h3>No restaurants yet</h3>
              <p>
                Add your first restaurant to start receiving reservations.
              </p>

              <button
                type="button"
                className="owner-primary-btn"
                onClick={() => navigate("/owner/restaurants")}
              >
                Add restaurant
              </button>
            </div>
          ) : (
            <div className="owner-restaurants-grid">
              {restaurants.map((restaurant) => (
                <article
                  className="owner-restaurant-card"
                  key={restaurant.id}
                >
                  <div className="owner-restaurant-image-wrap">
                    <img
                      src={
                        restaurant.image ||
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80"
                      }
                      alt={restaurant.name}
                      className="owner-restaurant-image"
                    />
                  </div>

                  <div className="owner-restaurant-content">
                    <span className="owner-restaurant-cuisine">
                      {restaurant.cuisine}
                    </span>

                    <h3>{restaurant.name}</h3>

                    <div className="owner-restaurant-location">
                      <MapPin size={15} />
                      <span>
                        {restaurant.address || restaurant.area || restaurant.city}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* BOOKINGS */}
        <section className="owner-section owner-bookings-section">

          <div className="owner-section-header">
            <div>
              <div className="owner-section-eyebrow">
                RESERVATIONS
              </div>

              <h2>Customer Bookings</h2>
            </div>

            <span className="owner-bookings-count">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="owner-empty-box">
              <CalendarDays size={32} />
              <h3>No bookings yet</h3>
              <p>
                Customer reservations will appear here.
              </p>
            </div>
          ) : (
            <div className="owner-bookings-list">
              {bookings.map((booking) => {
                const bookingId = booking.booking_id;

                const status = String(
                  booking.status || "Pending"
                );

                const normalizedStatus = status.toLowerCase();

                const guests =
                  booking.party_size ??
                  booking.number_of_guests ??
                  booking.numberOfGuests ??
                  booking.guest_count ??
                  booking.guests ??
                  "Not available";

                const customerName =
                  booking.customer_name ||
                  booking.user_name ||
                  "Customer";

                const customerEmail =
                  booking.customer_email ||
                  booking.email ||
                  "";

                return (
                  <article
                    className="owner-booking-card"
                    key={bookingId}
                  >
                    <div className="owner-booking-top">

                      <div>
                        <span className="owner-booking-label">
                          BOOKING #{bookingId}
                        </span>

                        <h3>
                          {booking.restaurant_name ||
                            "Restaurant"}
                        </h3>

                        <p className="owner-customer-name">
                          Customer: <strong>{customerName}</strong>
                        </p>

                        {customerEmail && (
                          <p className="owner-customer-email">
                            {customerEmail}
                          </p>
                        )}
                      </div>

                      <span
                        className={`owner-status owner-status-${normalizedStatus}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="owner-booking-details">

                      <div className="owner-detail">
                        <CalendarDays size={17} />
                        <div>
                          <span>DATE</span>
                          <strong>
                            {booking.booking_date || "—"}
                          </strong>
                        </div>
                      </div>

                      <div className="owner-detail">
                        <Clock3 size={17} />
                        <div>
                          <span>TIME</span>
                          <strong>
                            {booking.booking_time || "—"}
                          </strong>
                        </div>
                      </div>

                      <div className="owner-detail">
                        <Users size={17} />
                        <div>
                          <span>GUESTS</span>
                          <strong>
                            {guests}{" "}
                            {guests !== "Not available" ? "guests" : ""}
                          </strong>
                        </div>
                      </div>

                      <div className="owner-detail">
                        <MapPin size={17} />
                        <div>
                          <span>LOCATION</span>
                          <strong>
                            {booking.restaurant?.city ||
                              booking.city ||
                              "Pune"}
                          </strong>
                        </div>
                      </div>

                    </div>

                    {/* ACTIONS */}
                    {normalizedStatus === "pending" && (
                      <div className="owner-booking-actions">

                        <button
                          type="button"
                          className="owner-confirm-btn"
                          disabled={actionLoading !== null}
                          onClick={() =>
                            handleBookingStatus(
                              bookingId,
                              "Confirmed"
                            )
                          }
                        >
                          <CheckCircle2 size={16} />

                          {actionLoading ===
                          `${bookingId}-Confirmed`
                            ? "Confirming..."
                            : "Confirm booking"}
                        </button>

                        <button
                          type="button"
                          className="owner-reject-btn"
                          disabled={actionLoading !== null}
                          onClick={() =>
                            handleBookingStatus(
                              bookingId,
                              "Cancelled"
                            )
                          }
                        >
                          <XCircle size={16} />

                          {actionLoading ===
                          `${bookingId}-Cancelled`
                            ? "Rejecting..."
                            : "Reject booking"}
                        </button>

                      </div>
                    )}

                  </article>
                );
              })}
            </div>
          )}

        </section>

      </div>
    </div>
  );
}