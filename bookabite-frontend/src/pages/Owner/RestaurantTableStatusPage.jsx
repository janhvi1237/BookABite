import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageLoader from '../../components/common/PageLoader';
import { fetchTableAvailability } from '../../api/tables';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import './OwnerPages.css';
import './RestaurantTableStatusPage.css';

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function RestaurantTableStatusPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bookingDate, setBookingDate] = useState(localDate());
  const [bookingTime, setBookingTime] = useState('19:00');
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchTableAvailability(id, bookingDate, bookingTime)
      .then((data) => { if (active) setAvailability(data); })
      .catch((error) => {
        if (active) showToast(error.message || 'Could not load table availability.', 'error');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, bookingDate, bookingTime, showToast]);

  if (loading && !availability) return <PageLoader text="Loading table availability..." />;
  const isAdmin = user?.role === 'admin' || user?.is_admin;

  return (
    <div className="bab-owner-page">
      <main className="bab-container bab-owner-container bab-table-status">
        <header className="bab-owner-header">
          <div>
            <span className="bab-section-eyebrow">TABLE AVAILABILITY</span>
            <h1 className="bab-owner-title">{availability?.restaurant_name || 'Restaurant tables'}</h1>
            <p>Availability for the selected seating time ({availability?.end_time || '—'} end).</p>
          </div>
          <Link className="bab-btn bab-btn--outline" to={isAdmin ? '/admin' : '/owner/dashboard'}>
            Back to dashboard
          </Link>
        </header>

        <section className="bab-owner-section">
          <div className="bab-table-status__filters">
            <label>Date<input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} /></label>
            <label>Seating time<input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} /></label>
            {loading && <span role="status">Refreshing availability...</span>}
          </div>
          {availability && (
            <>
              <div className="bab-table-status__summary">
                <span>{availability.summary.available} available</span>
                <span>{availability.summary.booked} booked</span>
                <span>{availability.summary.out_of_service} out of service</span>
              </div>
              <div className="bab-admin__table-wrap">
                <table className="bab-admin__table">
                  <thead><tr><th>Table</th><th>Type</th><th>Seats</th><th>Status</th><th>Reservation</th></tr></thead>
                  <tbody>
                    {availability.tables.map((table) => (
                      <tr key={table.table_id}>
                        <td>{table.table_number}</td>
                        <td>{table.table_type || '—'}</td>
                        <td>{table.capacity}</td>
                        <td><span className={`bab-table-status__badge is-${table.status}`}>{table.status.replaceAll('_', ' ')}</span></td>
                        <td>{table.booking ? `#${table.booking.booking_id} · ${table.booking.party_size} guests · ${table.booking.status}` : '—'}</td>
                      </tr>
                    ))}
                    {availability.tables.length === 0 && (
                      <tr><td colSpan="5" className="bab-admin__empty">No tables have been configured for this restaurant.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
