import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineCheck,
  HiOutlineX,
  HiArrowLeft,
  HiOutlineSearch,
  HiOutlineFilter,
} from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import FoodMascot from '../../components/mascot/FoodMascot';
import { fetchOwnerBookings, updateBookingStatus } from '../../api/bookings';
import { fetchOwnerRestaurants } from '../../api/restaurants';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import './OwnerPages.css';

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function ManageBookingsPage() {
  const { user } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestId, setSelectedRestId] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (user?.id) {
          const [bList, rList] = await Promise.all([
            fetchOwnerBookings(user.id),
            fetchOwnerRestaurants(user.id),
          ]);
          setBookings(Array.isArray(bList) ? bList : []);
          setRestaurants(Array.isArray(rList) ? rList : []);
        }
      } catch (err) {
        console.error('Failed to load owner bookings:', err);
        showToast('Could not load reservations.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  async function handleStatusChange(bookingId, newStatus) {
    try {
      setUpdatingId(bookingId);
      await updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) =>
          (b.booking_id || b.id) === bookingId ? { ...b, booking_status: newStatus, status: newStatus } : b
        )
      );

      if (newStatus === 'Confirmed') {
        triggerReaction('celebrating', 'Table reservation confirmed!');
        showToast('Reservation confirmed.', 'success');
      } else if (newStatus === 'Completed') {
        triggerReaction('serving', 'Diners marked as served!');
        showToast('Booking marked as completed.', 'info');
      } else if (newStatus === 'Cancelled') {
        triggerReaction('thinking', 'Reservation cancelled.');
        showToast('Reservation rejected / cancelled.', 'info');
      }
    } catch (err) {
      console.error('Failed to update booking status:', err);
      showToast('Could not update booking status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredBookings = bookings.filter((b) => {
    const status = (b.booking_status || b.status || 'Pending').toLowerCase();
    if (activeStatus !== 'All' && status !== activeStatus.toLowerCase()) {
      return false;
    }
    if (selectedRestId !== 'All' && String(b.restaurant_id) !== String(selectedRestId)) {
      return false;
    }
    if (dateFilter && b.booking_date !== dateFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const guestMatch = (b.guest_name || b.name || '').toLowerCase().includes(q);
      const emailMatch = (b.guest_email || b.email || '').toLowerCase().includes(q);
      const phoneMatch = (b.guest_phone || b.phone || '').toLowerCase().includes(q);
      const restMatch = (b.restaurant_name || '').toLowerCase().includes(q);
      const idMatch = String(b.booking_id || b.id || '').includes(q);
      if (!guestMatch && !emailMatch && !phoneMatch && !restMatch && !idMatch) return false;
    }
    return true;
  });

  if (loading) return <PageLoader message="Loading guest bookings..." />;

  return (
    <div className="bab-owner-page">
      <div className="bab-owner-container">
        {/* Header */}
        <div className="bab-owner-header">
          <div>
            <Link to="/owner/dashboard" className="bab-link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <HiArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Manage Table Reservations</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Review incoming guest bookings, accept tables, and monitor seated diners.
            </p>
          </div>

          <div className="bab-owner-header__actions">
            {restaurants.length > 1 && (
              <select
                value={selectedRestId}
                onChange={(e) => setSelectedRestId(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  background: 'white',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                }}
              >
                <option value="All">All Restaurants</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            )}

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bab-form-input"
              style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
              title="Filter by reservation date"
            />
            {dateFilter && (
              <button
                type="button"
                className="bab-btn bab-btn--outline"
                onClick={() => setDateFilter('')}
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Filters bar */}
        <div className="bab-owner-filter-bar">
          <div className="bab-owner-tabs">
            {STATUS_TABS.map((tab) => {
              const count = bookings.filter((b) =>
                tab === 'All' ? true : (b.booking_status || b.status || '').toLowerCase() === tab.toLowerCase()
              ).length;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`bab-owner-tab-btn ${activeStatus === tab ? 'bab-owner-tab-btn--active' : ''}`}
                  onClick={() => setActiveStatus(tab)}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          <div style={{ position: 'relative', width: 260 }}>
            <HiOutlineSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by guest or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bab-form-input"
              style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 6, paddingBottom: 6, fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length > 0 ? (
          <div className="bab-owner-table-wrap" style={{ background: 'white' }}>
            <table className="bab-owner-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Guest Information</th>
                  <th>Restaurant</th>
                  <th>Schedule</th>
                  <th>Party</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const bId = b.booking_id || b.id;
                  const currentStatus = b.booking_status || b.status || 'Pending';
                  const isUpdating = updatingId === bId;

                  return (
                    <tr key={bId}>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>#{bId}</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {b.created_at ? new Date(b.created_at).toLocaleDateString() : ''}
                        </div>
                      </td>
                      <td>
                        <strong style={{ display: 'block', color: 'var(--color-text-dark)' }}>
                          {b.guest_name || b.name || 'Guest'}
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {(b.guest_phone || b.phone) && (
                            <span><HiOutlinePhone size={11} /> {b.guest_phone || b.phone}</span>
                          )}
                          {(b.guest_email || b.email) && (
                            <span><HiOutlineMail size={11} /> {b.guest_email || b.email}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>
                          {b.restaurant_name || 'Restaurant'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span><HiOutlineCalendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{b.booking_date}</span>
                          <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                            <HiOutlineClock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{b.booking_time}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="bab-badge" style={{ background: 'var(--color-bg-soft)', fontSize: '0.75rem' }}>
                          <HiOutlineUserGroup size={12} style={{ marginRight: 4 }} />
                          {b.number_of_guests || b.guests || 2} Guests
                        </span>
                      </td>
                      <td style={{ maxWidth: 160 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: b.special_requests ? 'normal' : 'italic' }}>
                          {b.special_requests || b.seating_preference || 'None'}
                        </span>
                      </td>
                      <td>
                        <span className={`bab-status-badge bab-status-badge--${currentStatus.toLowerCase()}`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {currentStatus === 'Pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(bId, 'Confirmed')}
                                disabled={isUpdating}
                                className="bab-btn bab-btn--secondary"
                                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                title="Accept & Confirm"
                              >
                                <HiOutlineCheck size={14} /> Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(bId, 'Cancelled')}
                                disabled={isUpdating}
                                className="bab-btn bab-btn--outline"
                                style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#CF1322', borderColor: '#FFA39E' }}
                                title="Reject"
                              >
                                <HiOutlineX size={14} /> Reject
                              </button>
                            </>
                          )}
                          {currentStatus === 'Confirmed' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(bId, 'Completed')}
                                disabled={isUpdating}
                                className="bab-btn bab-btn--outline"
                                style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                                title="Mark Completed"
                              >
                                <HiOutlineCheck size={14} /> Mark Seated
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(bId, 'Cancelled')}
                                disabled={isUpdating}
                                className="bab-btn bab-btn--outline"
                                style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#CF1322', borderColor: '#FFA39E' }}
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {(currentStatus === 'Completed' || currentStatus === 'Cancelled') && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              Closed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bab-owner-empty-box" style={{ background: 'white', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-border)' }}>
            <FoodMascot mood="idle" size={70} />
            <h4>No reservations found</h4>
            <p>
              {activeStatus === 'All'
                ? 'No guest bookings have been placed yet for this filter.'
                : `No ${activeStatus.toLowerCase()} bookings found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
