import React, { useEffect } from 'react';
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
import './BookingConfirmationPage.css';

export default function BookingConfirmationPage() {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();

  const restaurantName = searchParams.get('rest') || 'The Spice Terrace';
  const bookingDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const bookingTime = searchParams.get('time') || '07:30 PM';
  const partySize = searchParams.get('guests') || '2';
  const area = searchParams.get('area') || 'Koregaon Park';

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
            <span>Table Reserved Successfully</span>
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
                <HiOutlineLocationMarker size={15} /> {area}, Pune
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
                <strong>{new Date(bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
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
                <span className="bab-ticket-label">Status</span>
                <span className="bab-badge bab-badge--success" style={{ alignSelf: 'flex-start' }}>
                  Confirmed
                </span>
              </div>
            </div>

            {/* SIMULATED QR CODE PASS */}
            <div className="bab-ticket-qr-section">
              <div className="bab-simulated-qr">
                <svg viewBox="0 0 100 100" width="80" height="80">
                  <rect width="100" height="100" fill="#FFF8F0" />
                  <rect x="10" y="10" width="25" height="25" fill="#2B1712" />
                  <rect x="15" y="15" width="15" height="15" fill="#FFF8F0" />
                  <rect x="65" y="10" width="25" height="25" fill="#2B1712" />
                  <rect x="70" y="15" width="15" height="15" fill="#FFF8F0" />
                  <rect x="10" y="65" width="25" height="25" fill="#2B1712" />
                  <rect x="15" y="70" width="15" height="15" fill="#FFF8F0" />
                  <rect x="42" y="42" width="16" height="16" fill="#D65A3A" />
                  <rect x="45" y="15" width="8" height="20" fill="#2B1712" />
                  <rect x="15" y="45" width="20" height="8" fill="#2B1712" />
                  <rect x="65" y="65" width="15" height="15" fill="#2B1712" />
                </svg>
              </div>
              <p className="bab-ticket-qr-instruction">
                Present this QR code or Booking ID at the restaurant reception for VIP fast-track seating.
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="bab-confirm-actions">
          <Link to="/bookings" className="bab-btn bab-btn--secondary">
            View in My Bookings
          </Link>
          <button type="button" className="bab-btn bab-btn--outline" onClick={handlePrint}>
            <HiOutlineDownload size={16} /> Save / Print Pass
          </button>
          <Link to="/explore" className="bab-btn bab-btn--glass">
            Explore More Tables
          </Link>
        </div>
      </div>
    </div>
  );
}
