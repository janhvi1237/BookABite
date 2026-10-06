import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineBookOpen,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineX,
  HiPlus,
  HiOutlineTrash,
  HiOutlineTrendingUp,
  HiOutlineLocationMarker,
  HiOutlineCreditCard,
} from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import FoodMascot from '../../components/mascot/FoodMascot';
import { fetchOwnerRestaurants, deleteRestaurant } from '../../api/restaurants';
import { fetchOwnerBookings, updateBookingStatus } from '../../api/bookings';
import { fetchOwnerBilling } from '../../api/ownerBilling';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import './OwnerPages.css';

export default function OwnerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [restaurants, setRestaurants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingRestaurantId, setDeletingRestaurantId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/owner/login');
      return;
    }

    let active = true;
    async function loadDashboard() {
      try {
        setLoading(true);
        const [rests, bks, billingSummary] = await Promise.all([
          fetchOwnerRestaurants(user.user_id),
          fetchOwnerBookings(user.user_id),
          fetchOwnerBilling(),
        ]);
        if (active) {
          setRestaurants(rests);
          setBookings(bks);
          setBilling(billingSummary);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        if (active) showToast(err.message || 'Could not load your owner dashboard.', 'error');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboard();
    return () => { active = false; };
  }, [user, navigate, showToast]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.booking_id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (newStatus === 'Completed') {
        try {
          setBilling(await fetchOwnerBilling());
        } catch (error) {
          console.error('Failed to refresh owner billing:', error);
          showToast('Booking completed, but billing could not be refreshed.', 'error');
        }
      }
      showToast(`Booking marked as ${newStatus}`, 'success');
      if (newStatus === 'Confirmed') {
        triggerReaction('happy', "Reservation confirmed for your guests!", 3000);
      }
    } catch {
      showToast("Could not update booking status", "error");
    }
  };

  const handleDeleteRestaurant = async (restaurant) => {
    const confirmed = window.confirm(
      `Remove "${restaurant.name}" from BookABite? It will no longer be listed publicly, but existing booking history will be preserved.`
    );
    if (!confirmed) return;

    try {
      setDeletingRestaurantId(restaurant.id);
      await deleteRestaurant(restaurant.id);
      setRestaurants((prev) => prev.filter((item) => item.id !== restaurant.id));
      showToast(`${restaurant.name} was removed from BookABite.`, 'success');
    } catch (err) {
      console.error('Failed to delete restaurant:', err);
      showToast(err.message || 'Could not delete this restaurant. Please try again.', 'error');
    } finally {
      setDeletingRestaurantId(null);
    }
  };

  if (loading) return <PageLoader text="Loading your restaurant dashboard..." />;

  const upcomingBookings = bookings.filter((b) => b.status === 'Pending' || b.status === 'Confirmed');
  const totalGuests = bookings.reduce((sum, b) => sum + (b.party_size || 0), 0);

  return (
    <div className="bab-owner-page">
      <div className="bab-container bab-owner-container bab-owner-layout">
        {/* SIDEBAR NAVIGATION */}
        <aside className="bab-owner-sidebar">
          <div className="bab-owner-profile-summary">
            <div className="bab-owner-avatar">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'O'}
            </div>
            <div>
              <h4 className="bab-owner-name">{user?.full_name}</h4>
              <span className="bab-badge bab-badge--gold">Verified Partner</span>
            </div>
          </div>

          <nav className="bab-owner-nav">
            <Link to="/owner/dashboard" className="bab-owner-nav-item bab-owner-nav-item--active">
              <HiOutlineTrendingUp size={18} /> Overview
            </Link>
            <Link to="/owner/bookings" className="bab-owner-nav-item">
              <HiOutlineCalendar size={18} /> Manage Bookings
              {upcomingBookings.length > 0 && (
                <span className="bab-owner-nav-badge">{upcomingBookings.length}</span>
              )}
            </Link>
            <Link to="/owner/menu" className="bab-owner-nav-item">
              <HiOutlineBookOpen size={18} /> Menu Management
            </Link>
            <Link to="/owner/reports" className="bab-owner-nav-item">
              <HiOutlineTrendingUp size={18} /> Statistics Reports
            </Link>
            <Link to="/owner/billing" className="bab-owner-nav-item">
              <HiOutlineCreditCard size={18} /> Payments &amp; dues
              {billing?.amount_due > 0 && (
                <span className="bab-owner-nav-badge">{`₹${Number(billing.amount_due).toLocaleString('en-IN')}`}</span>
              )}
            </Link>
            <Link to="/owner/restaurants/new" className="bab-owner-nav-item">
              <HiPlus size={18} /> Add New Restaurant
            </Link>
          </nav>

          <div className="bab-owner-mascot-tip">
            <FoodMascot mood="serving" size={54} />
            <p>Chef Pierre is tracking your reservations 24/7!</p>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="bab-owner-main">
          <div className="bab-owner-header">
            <div>
              <span className="bab-section-eyebrow">PARTNER OVERVIEW</span>
              <h1 className="bab-owner-title">Restaurant Management</h1>
            </div>
            <Link to="/owner/restaurants/new" className="bab-btn bab-btn--secondary">
              <HiPlus size={16} /> Add Restaurant
            </Link>
          </div>

          <Link to="/owner/billing" className="bab-owner-due-card">
            <div className="bab-owner-due-card__icon"><HiOutlineCreditCard size={21} /></div>
            <div className="bab-owner-due-card__copy">
              <span>Platform dues</span>
              <strong>{billing ? `₹${Number(billing.amount_due).toLocaleString('en-IN')}` : '—'}</strong>
            </div>
            <span className="bab-owner-due-card__action">
              {billing?.amount_due > 0 ? 'Review & pay' : 'View billing'}
            </span>
          </Link>

          {/* METRIC CARDS */}
          <div className="bab-owner-metrics-grid">
            <div className="bab-metric-card">
              <div className="bab-metric-icon bab-metric-icon--terracotta">
                <HiOutlineCalendar size={22} />
              </div>
              <div>
                <span className="bab-metric-label">Total Reservations</span>
                <strong className="bab-metric-value">{bookings.length}</strong>
              </div>
            </div>

            <div className="bab-metric-card">
              <div className="bab-metric-icon bab-metric-icon--gold">
                <HiOutlineClock size={22} />
              </div>
              <div>
                <span className="bab-metric-label">Upcoming Tables</span>
                <strong className="bab-metric-value">{upcomingBookings.length}</strong>
              </div>
            </div>

            <div className="bab-metric-card">
              <div className="bab-metric-icon bab-metric-icon--success">
                <HiOutlineUserGroup size={22} />
              </div>
              <div>
                <span className="bab-metric-label">Diners Hosted</span>
                <strong className="bab-metric-value">{totalGuests}</strong>
              </div>
            </div>

            <div className="bab-metric-card">
              <div className="bab-metric-icon bab-metric-icon--primary">
                <HiOutlineOfficeBuilding size={22} />
              </div>
              <div>
                <span className="bab-metric-label">Active Venues</span>
                <strong className="bab-metric-value">{restaurants.length}</strong>
              </div>
            </div>
          </div>

          {/* MY RESTAURANTS LIST */}
          <section className="bab-owner-section">
            <div className="bab-owner-section__header">
              <h3>My Restaurants ({restaurants.length})</h3>
              <Link to="/owner/restaurants/new" className="bab-link-action">
                + Register Another Venue
              </Link>
            </div>

            {restaurants.length > 0 ? (
              <div className="bab-owner-venues-grid">
                {restaurants.map((rest) => (
                  <div key={rest.id} className="bab-venue-card">
                    <img src={rest.image} alt={rest.name} className="bab-venue-card__img" />
                    <div className="bab-venue-card__info">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 className="bab-venue-card__name">{rest.name}</h4>
                        <span className="bab-badge bab-badge--gold">★ {rest.rating || 4.5}</span>
                      </div>
                      <p className="bab-venue-card__loc">
                        <HiOutlineLocationMarker size={14} /> {rest.area}, {rest.city}
                      </p>
                      <p className="bab-venue-card__cuisine">{rest.cuisine} • ₹{rest.priceForTwo} for two</p>

                      <div className="bab-venue-card__actions">
                        <Link to={`/owner/restaurants/${rest.id}/manage-tables`} className="bab-btn bab-btn--outline bab-venue-action">
                          Manage Tables
                        </Link>
                        <Link to={`/owner/restaurants/${rest.id}/tables`} className="bab-btn bab-btn--outline bab-venue-action">
                          Table Status
                        </Link>
                        <Link to={`/restaurants/${rest.id}`} className="bab-btn bab-btn--outline bab-venue-action">
                          View Public Page
                        </Link>
                        <Link to={`/owner/restaurants/${rest.id}/edit`} className="bab-btn bab-btn--secondary bab-venue-action">
                          Edit Profile
                        </Link>
                        <Link to={`/owner/restaurants/${rest.id}/menu`} className="bab-btn bab-btn--glass bab-venue-action">
                          Manage Menu
                        </Link>
                        <button
                          type="button"
                          className="bab-btn bab-btn--outline"
                          onClick={() => handleDeleteRestaurant(rest)}
                          disabled={deletingRestaurantId !== null}
                          aria-label={`Delete ${rest.name}`}
                          title="Remove restaurant"
                          style={{
                            color: '#CF1322',
                            borderColor: '#FFA39E',
                          }}
                        >
                          <HiOutlineTrash size={15} />
                          {deletingRestaurantId === rest.id ? 'Removing...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bab-owner-empty-box">
                <FoodMascot mood="thinking" size={80} />
                <h4>No restaurants registered yet</h4>
                <p>Add your first restaurant or café profile to start accepting dining table bookings.</p>
                <Link to="/owner/restaurants/new" className="bab-btn bab-btn--secondary" style={{ marginTop: 12 }}>
                  Start Restaurant Onboarding
                </Link>
              </div>
            )}
          </section>

          {/* RECENT RESERVATIONS TABLE */}
          <section className="bab-owner-section">
            <div className="bab-owner-section__header">
              <h3>Recent Guest Reservations</h3>
              <Link to="/owner/bookings" className="bab-link-action">
                View All Bookings →
              </Link>
            </div>

            {bookings.length > 0 ? (
              <div className="bab-owner-table-wrap">
                <table className="bab-owner-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Guest Details</th>
                      <th>Venue</th>
                      <th>Date & Time</th>
                      <th>Party</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 6).map((b) => (
                      <tr key={b.booking_id}>
                        <td><strong>#{b.booking_id}</strong></td>
                        <td>
                          <div><strong>{b.customer_name || 'Guest Diner'}</strong></div>
                          <small style={{ color: 'var(--bab-text-muted)' }}>{b.customer_email}</small>
                        </td>
                        <td>{b.restaurant_name}</td>
                        <td>
                          <div>{b.booking_date}</div>
                          <small style={{ color: 'var(--bab-text-muted)' }}>{b.booking_time}</small>
                        </td>
                        <td><strong>{b.party_size} Guests</strong></td>
                        <td>
                          <span className={`bab-status-badge bab-status-badge--${b.status.toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {b.status === 'Pending' && (
                              <button
                                type="button"
                                className="bab-action-btn bab-action-btn--confirm"
                                onClick={() => handleUpdateStatus(b.booking_id, 'Confirmed')}
                                title="Accept & Confirm"
                              >
                                <HiOutlineCheck size={14} /> Accept
                              </button>
                            )}
                            {b.status === 'Confirmed' && (
                              <button
                                type="button"
                                className="bab-action-btn bab-action-btn--complete"
                                onClick={() => handleUpdateStatus(b.booking_id, 'Completed')}
                                title="Mark Completed"
                              >
                                <HiOutlineCheck size={14} /> Complete
                              </button>
                            )}
                            {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                              <button
                                type="button"
                                className="bab-action-btn bab-action-btn--reject"
                                onClick={() => handleUpdateStatus(b.booking_id, 'Cancelled')}
                                title="Reject / Cancel"
                              >
                                <HiOutlineX size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bab-owner-empty-box">
                <FoodMascot mood="idle" size={70} />
                <p>No table reservations booked yet. Your incoming reservations will appear here in real-time!</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
