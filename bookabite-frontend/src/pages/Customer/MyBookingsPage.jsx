import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineHeart,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineSparkles,
} from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import { fetchUserBookings, cancelBooking } from '../../api/bookings';
import './CustomerPages.css';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState('upcoming'); // 'upcoming' | 'past' | 'all'
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/my-bookings');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchUserBookings(user.id || user.user_id);
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load user bookings:', err);
        showToast('Unable to load your reservations.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, navigate]);

  async function handleCancelReservation(bookingId, restName) {
    if (!window.confirm(`Are you sure you want to cancel your table reservation at ${restName || 'this restaurant'}?`)) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          (b.booking_id || b.id) === bookingId ? { ...b, booking_status: 'Cancelled', status: 'Cancelled' } : b
        )
      );
      triggerReaction('sad', 'Your table reservation was cancelled.');
      showToast('Reservation cancelled successfully.', 'info');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      showToast('Could not cancel reservation. Please contact the venue.', 'error');
    } finally {
      setCancellingId(null);
    }
  }

  function isUpcoming(bookingDate) {
    if (!bookingDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return bookingDate >= today;
  }

  const filteredBookings = bookings.filter((b) => {
    const status = (b.booking_status || b.status || '').toLowerCase();
    const upcoming = isUpcoming(b.booking_date) && status !== 'cancelled' && status !== 'completed';
    if (tabFilter === 'upcoming') return upcoming;
    if (tabFilter === 'past') return !upcoming;
    return true;
  });

  if (loading) return <PageLoader message="Loading your dining reservations..." />;

  return (
    <div className="bab-customer-page">
      <div className="bab-customer-container">
        {/* Customer Header */}
        <div className="bab-customer-header">
          <div className="bab-customer-header__left">
            <div className="bab-customer-header__info">
              <h1>My Table Reservations</h1>
              <p>Keep track of all your upcoming dining experiences and past food journeys.</p>
            </div>
          </div>
          <div>
            <Link to="/explore" className="bab-btn bab-btn--secondary">
              Book a New Table
            </Link>
          </div>
        </div>

        {/* Customer Nav Tabs */}
        <div className="bab-customer-nav-tabs">
          <Link to="/profile" className="bab-customer-nav-tab">
            <HiOutlineUser size={18} /> My Profile
          </Link>
          <Link to="/my-bookings" className="bab-customer-nav-tab bab-customer-nav-tab--active">
            <HiOutlineCalendar size={18} /> My Bookings ({bookings.length})
          </Link>
          <Link to="/favorites" className="bab-customer-nav-tab">
            <HiOutlineHeart size={18} /> Saved Places
          </Link>
        </div>

        {/* Filter subtabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button
            type="button"
            className={`bab-owner-tab-btn ${tabFilter === 'upcoming' ? 'bab-owner-tab-btn--active' : ''}`}
            onClick={() => setTabFilter('upcoming')}
          >
            Upcoming Reservations
          </button>
          <button
            type="button"
            className={`bab-owner-tab-btn ${tabFilter === 'past' ? 'bab-owner-tab-btn--active' : ''}`}
            onClick={() => setTabFilter('past')}
          >
            Past & Cancelled
          </button>
          <button
            type="button"
            className={`bab-owner-tab-btn ${tabFilter === 'all' ? 'bab-owner-tab-btn--active' : ''}`}
            onClick={() => setTabFilter('all')}
          >
            All ({bookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="bab-bookings-list">
            {filteredBookings.map((b) => {
              const bId = b.booking_id || b.id;
              const status = b.booking_status || b.status || 'Pending';
              const isCanCancel = (status === 'Pending' || status === 'Confirmed') && isUpcoming(b.booking_date);

              // Date formatting
              const dateObj = b.booking_date ? new Date(b.booking_date) : new Date();
              const monthStr = dateObj.toLocaleString('default', { month: 'short' });
              const dayStr = dateObj.getDate();

              return (
                <div key={bId} className="bab-booking-item-card">
                  <div className="bab-booking-item__main">
                    <div className="bab-booking-date-badge">
                      <span className="bab-booking-date-month">{monthStr}</span>
                      <span className="bab-booking-date-day">{dayStr}</span>
                    </div>

                    <div className="bab-booking-item__details">
                      <h4>{b.restaurant_name || 'Restaurant Table'}</h4>
                      <div className="bab-booking-item__meta">
                        <span><HiOutlineClock size={13} /> {b.booking_time}</span>
                        <span><HiOutlineUserGroup size={13} /> {b.number_of_guests || b.guests || 2} Guests</span>
                        <span className={`bab-status-badge bab-status-badge--${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </div>
                      {b.special_requests && (
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                          Note: "{b.special_requests}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bab-booking-item__actions">
                    <Link
                      to={`/restaurants/${b.restaurant_id}`}
                      className="bab-btn bab-btn--outline"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <HiOutlineEye size={14} /> Restaurant
                    </Link>

                    {isCanCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancelReservation(bId, b.restaurant_name)}
                        disabled={cancellingId === bId}
                        className="bab-btn bab-btn--outline"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', color: '#CF1322', borderColor: '#FFA39E' }}
                      >
                        {cancellingId === bId ? 'Cancelling...' : 'Cancel Table'}
                      </button>
                    )}

                    {!isCanCancel && status === 'Completed' && (
                      <Link
                        to={`/restaurants/${b.restaurant_id}#reviews`}
                        className="bab-btn bab-btn--secondary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        Rate & Review
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bab-customer-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FoodMascot mood="idle" size={80} />
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginTop: 16 }}>
              {tabFilter === 'upcoming' ? 'No upcoming reservations' : 'No bookings found'}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 420, margin: '8px auto 20px' }}>
              {tabFilter === 'upcoming'
                ? 'Your calendar is clear. Ready to reserve a delightful table at one of the finest spots in town?'
                : 'Browse our curated collection of cafés, bistros, and fine-dining spots to get started.'}
            </p>
            <Link to="/explore" className="bab-btn bab-btn--secondary">
              Discover Restaurants
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
