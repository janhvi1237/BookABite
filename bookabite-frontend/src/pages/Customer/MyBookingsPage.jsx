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
  HiOutlineTicket,
} from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import { fetchUserBookings, cancelBooking } from '../../api/bookings';
import { localDateString, formatDate, formatTime, formatMoney } from '../../utils/time';
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
      const res = await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          (b.booking_id || b.id) === bookingId
            ? { ...b, ...(res?.booking || {}), status: 'Cancelled' }
            : b
        )
      );
      triggerReaction('sad', 'Your table reservation was cancelled.');
      showToast(res?.message || 'Reservation cancelled successfully.', res?.refunded === false ? 'info' : 'success');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      showToast(err.message || 'Could not cancel reservation. Please contact the venue.', 'error');
    } finally {
      setCancellingId(null);
    }
  }

  function isUpcoming(bookingDate) {
    if (!bookingDate) return false;
    return bookingDate >= localDateString();
  }

  const filteredBookings = bookings.filter((b) => {
    const status = (b.status || '').toLowerCase();
    const upcoming = isUpcoming(b.booking_date) && status !== 'cancelled' && status !== 'completed';
    if (tabFilter === 'upcoming') return upcoming;
    if (tabFilter === 'past') return !upcoming;
    return true;
  });

  const upcomingCount = bookings.filter((b) => {
    const st = (b.status || '').toLowerCase();
    return isUpcoming(b.booking_date) && st !== 'cancelled' && st !== 'completed';
  }).length;
  const completedCount = bookings.filter((b) => (b.status || '').toLowerCase() === 'completed').length;
  const feesPaid = bookings
    .filter((b) => b.fee_status === 'Paid')
    .reduce((sum, b) => sum + Number(b.booking_fee || 0), 0);

  if (loading) return <PageLoader text="Loading your dining reservations..." />;

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

        {/* Quick stats */}
        <div className="bab-bookings-stats">
          <div className="bab-bookings-stat bab-bookings-stat--terracotta">
            <span>Upcoming</span>
            <strong>{upcomingCount}</strong>
          </div>
          <div className="bab-bookings-stat bab-bookings-stat--sage">
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
          <div className="bab-bookings-stat bab-bookings-stat--amber">
            <span>Booking fees paid</span>
            <strong>{formatMoney(feesPaid)}</strong>
          </div>
        </div>

        {/* Filter pills */}
        <div className="bab-filter-pills" role="tablist">
          {[
            ['upcoming', 'Upcoming'],
            ['past', 'Past & Cancelled'],
            ['all', `All (${bookings.length})`],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tabFilter === key}
              className={`bab-filter-pill ${tabFilter === key ? 'bab-filter-pill--active' : ''}`}
              onClick={() => setTabFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="bab-bookings-list">
            {filteredBookings.map((b) => {
              const bId = b.booking_id || b.id;
              const status = b.status || 'Pending';
              const statusKey = status.toLowerCase();
              const isCanCancel = (status === 'Pending' || status === 'Confirmed') && isUpcoming(b.booking_date);
              const fee = Number(b.booking_fee || 0);

              // Date badge (parsed as a local date so it never shifts a day)
              const monthStr = formatDate(b.booking_date, { month: 'short' });
              const dayStr = formatDate(b.booking_date, { day: 'numeric' });
              const weekday = formatDate(b.booking_date, { weekday: 'long' });

              return (
                <article key={bId} className={`bab-booking-item-card bab-booking-item-card--${statusKey}`}>
                  <div
                    className="bab-booking-item__cover"
                    style={b.restaurant_cover ? { backgroundImage: `url(${b.restaurant_cover})` } : undefined}
                  >
                    <div className="bab-booking-date-badge">
                      <span className="bab-booking-date-month">{monthStr}</span>
                      <span className="bab-booking-date-day">{dayStr}</span>
                    </div>
                  </div>

                  <div className="bab-booking-item__body">
                    <div className="bab-booking-item__top">
                      <div>
                        <h4>{b.restaurant_name || 'Restaurant Table'}</h4>
                        {(b.restaurant_area || b.cuisine_type) && (
                          <p className="bab-booking-item__sub">
                            <HiOutlineLocationMarker size={13} />
                            {[b.restaurant_area, b.cuisine_type].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                      <span className={`bab-status-badge bab-status-badge--${statusKey}`}>{status}</span>
                    </div>

                    <div className="bab-booking-item__meta">
                      <span><HiOutlineCalendar size={14} /> {weekday}</span>
                      <span><HiOutlineClock size={14} /> {formatTime(b.booking_time)}</span>
                      <span>
                        <HiOutlineUserGroup size={14} /> {b.party_size || 2} {Number(b.party_size) === 1 ? 'Guest' : 'Guests'}
                      </span>
                      <span><HiOutlineTicket size={14} /> Table {b.table_number || '—'}</span>
                      <span><HiOutlineTicket size={14} /> #{bId}</span>
                    </div>

                    {fee > 0 && (
                      <div className={`bab-booking-item__fee bab-booking-item__fee--${(b.fee_status || '').toLowerCase()}`}>
                        {b.fee_status === 'Refunded'
                          ? `Booking fee ${formatMoney(fee)} refunded`
                          : `Booking fee ${formatMoney(fee)} paid`}
                        {b.invoice_number ? ` · ${b.invoice_number}` : ''}
                      </div>
                    )}

                    {b.special_request && (
                      <p className="bab-booking-item__note">Note: &ldquo;{b.special_request}&rdquo;</p>
                    )}
                  </div>

                  <div className="bab-booking-item__actions">
                    <Link to={`/restaurants/${b.restaurant_id}`} className="bab-btn bab-btn--outline bab-btn--sm">
                      <HiOutlineEye size={14} /> Restaurant
                    </Link>

                    {isCanCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancelReservation(bId, b.restaurant_name)}
                        disabled={cancellingId === bId}
                        className="bab-btn bab-btn--outline bab-btn--sm bab-btn--danger"
                      >
                        <HiOutlineXCircle size={14} /> {cancellingId === bId ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}

                    {!isCanCancel && status === 'Completed' && (
                      <Link to={`/restaurants/${b.restaurant_id}#reviews`} className="bab-btn bab-btn--secondary bab-btn--sm">
                        Rate &amp; Review
                      </Link>
                    )}
                  </div>
                </article>
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
