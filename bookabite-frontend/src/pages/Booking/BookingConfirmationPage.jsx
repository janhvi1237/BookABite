import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  HiCheckCircle,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineLocationMarker,
  HiOutlineTicket,
  HiOutlineDownload,
  HiOutlineShare,
} from 'react-icons/hi';
import FoodMascot from '../../components/mascot/FoodMascot';
import { fetchBooking } from '../../api/bookings';
import { formatDate, formatTime, formatMoney } from '../../utils/time';
import './BookingConfirmationPage.css';

export default function BookingConfirmationPage() {
  // The route is /booking-confirmation/:id
  const { id: bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);

  // Show the real booking (status, fee, invoice) from the server.
  useEffect(() => {
    if (!bookingId) return;
    let active = true;
    fetchBooking(bookingId)
      .then((b) => { if (active) setBooking(b); })
      .catch(() => { /* fall back to the details in the link */ });
    return () => { active = false; };
  }, [bookingId]);

  const restaurantName = booking?.restaurant_name || searchParams.get('rest') || 'Your restaurant';
  const bookingDate = booking?.booking_date || searchParams.get('date') || '';
  const bookingTime = booking?.booking_time ? formatTime(booking.booking_time) : searchParams.get('time') || '';
  const partySize = booking?.party_size || searchParams.get('guests') || '';
  const area = booking?.restaurant_area || searchParams.get('area') || '';
  const status = booking?.status || 'Pending';
  const fee = Number(booking?.booking_fee || 0);

  // Fire celebratory confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D65A3A', '#E9B44C', '#3FA66B', '#2B1712', '#FFF8F0'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bab-confirm-page">
      <div className="bab-container" style={{ maxWidth: 720 }}>
        {/* CELEBRATION HEADER */}
        <div className="bab-confirm-header">
          <FoodMascot mood="celebrating" size={130} />
          <div className="bab-confirm-badge">
            <HiCheckCircle size={20} color="#3FA66B" />
            <span>{fee > 0 ? 'Payment received · Table reserved' : 'Table reserved'}</span>
          </div>
          <h1 className="bab-confirm-title">Your Table is Reserved!</h1>
          <p className="bab-confirm-subtitle">
            A confirmation notification has been dispatched. Chef Pierre and the team at {restaurantName} look forward to welcoming you.
          </p>
        </div>

        {/* RESERVATION PASS TICKET */}
        <div className="bab-ticket-card">
          <div className="bab-ticket-card__top">
            <div>
              <span className="bab-ticket-eyebrow">BOOKABITE RESERVATION PASS</span>
              <h3 className="bab-ticket-rest-name">{restaurantName}</h3>
              <p className="bab-ticket-rest-area">
                <HiOutlineLocationMarker size={15} /> {area ? `${area}, Pune` : 'Pune'}
              </p>
            </div>
            <div className="bab-ticket-id-tag">
              <span>BOOKING ID</span>
              <strong>#{bookingId}</strong>
            </div>
          </div>

          <div className="bab-ticket-perforation">
            <div className="bab-perf-cut bab-perf-cut--left" />
            <div className="bab-perf-line" />
            <div className="bab-perf-cut bab-perf-cut--right" />
          </div>

          <div className="bab-ticket-card__bottom">
            <div className="bab-ticket-details-grid">
              <div className="bab-ticket-item">
                <span className="bab-ticket-label">
                  <HiOutlineCalendar size={14} /> Date
                </span>
                <strong>{formatDate(bookingDate, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </div>

              <div className="bab-ticket-item">
                <span className="bab-ticket-label">
                  <HiOutlineClock size={14} /> Time
                </span>
                <strong>{bookingTime}</strong>
              </div>

              <div className="bab-ticket-item">
                <span className="bab-ticket-label">
                  <HiOutlineUserGroup size={14} /> Party
                </span>
                <strong>{partySize} Guests</strong>
              </div>

              <div className="bab-ticket-item">
                <span className="bab-ticket-label">Table</span>
                <strong>{booking?.table_number || '—'}</strong>
              </div>

              <div className="bab-ticket-item">
                <span className="bab-ticket-label">Status</span>
                <span
                  className={`bab-badge ${status === 'Confirmed' ? 'bab-badge--success' : 'bab-badge--gold'}`}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {status === 'Pending' ? 'Awaiting restaurant' : status}
                </span>
              </div>
            </div>

            <div className="bab-ticket-reference-section">
              <div className="bab-ticket-reference">
                <span>Booking reference</span>
                <strong>#{bookingId}</strong>
              </div>
              <p className="bab-ticket-reference-instruction">
                Show this booking reference at the restaurant reception.
              </p>
            </div>
          </div>
        </div>

        {fee > 0 && (
          <div className="bab-paid-strip">
            <span>
              Booking fee paid: <strong>{formatMoney(fee)}</strong>
              {booking?.invoice_number ? ` · Invoice ${booking.invoice_number}` : ''}
            </span>
            <small>Refunded if you cancel 1 hr+ before your booking.</small>
          </div>
        )}

        {/* ACTIONS */}
        <div className="bab-confirm-actions">
          <Link to="/bookings" className="bab-btn bab-btn--secondary">
            View in My Bookings
          </Link>
          <button type="button" className="bab-btn bab-btn--outline" onClick={handlePrint}>
            <HiOutlineDownload size={16} /> Print / Save as PDF
          </button>
          <Link to="/explore" className="bab-btn bab-btn--glass">
            Explore More Tables
          </Link>
        </div>
      </div>
    </div>
  );
}
