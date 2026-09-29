import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiCheck,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineChatAlt,
  HiArrowLeft,
  HiArrowRight,
} from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import { ErrorState } from '../../components/common/ErrorState';
import FoodMascot from '../../components/mascot/FoodMascot';
import { fetchRestaurantById, fetchRestaurants } from '../../api/restaurants';
import { createBooking } from '../../api/bookings';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import './TableBookingPage.css';

const TIME_OPTIONS = [
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM',
];

const SEATING_AREAS = [
  { id: 'standard', title: 'Main Dining Hall', desc: 'Warm café ambiance with acoustic music' },
  { id: 'outdoor', title: 'Garden / Outdoor Patio', desc: 'Breezy greenery with lantern lighting' },
  { id: 'rooftop', title: 'Skyline Rooftop', desc: 'Elevated twilight views of the city' },
];

export default function TableBookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // 5 Step Flow: 1: Date & Time, 2: Guests & Seating, 3: Contact & Notes, 4: Review & Reserve
  const [step, setStep] = useState(1);

  // Form State
  const [bookingDate, setBookingDate] = useState(
    searchParams.get('date') || new Date().toISOString().split('T')[0]
  );
  const [bookingTime, setBookingTime] = useState(
    searchParams.get('time') || '07:30 PM'
  );
  const [partySize, setPartySize] = useState(
    Number(searchParams.get('guests')) || 2
  );
  const [seatingPref, setSeatingPref] = useState('standard');
  const [guestName, setGuestName] = useState(user?.full_name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [specialRequest, setSpecialRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        if (id) {
          const r = await fetchRestaurantById(id);
          if (active) setRestaurant(r);
        } else {
          // If accessing /book without an ID, load all restaurants to select one
          const list = await fetchRestaurants();
          if (active) {
            setAllRestaurants(list);
            if (list.length > 0) setRestaurant(list[0]);
          }
        }
      } catch (err) {
        console.error("Booking load error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, [id]);

  // Update guest details if user logs in during booking
  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.full_name || '');
      if (!guestEmail) setGuestEmail(user.email || '');
      if (!guestPhone && user.phone) setGuestPhone(user.phone || '');
    }
  }, [user]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!bookingDate || !bookingTime) {
        showToast("Please select your date and time slot", "info");
        return;
      }
      triggerReaction('thinking', `Checking availability for ${partySize} guests...`, 2500);
    }
    if (step === 2) {
      triggerReaction('happy', "Almost there! Please tell us who is dining with us.", 2500);
    }
    if (step === 3) {
      if (!guestName.trim() || !guestEmail.trim()) {
        showToast("Please provide your name and contact email", "info");
        return;
      }
      triggerReaction('serving', "Reviewing your table reservation pass...", 2500);
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const handlePrevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleConfirmReservation = async () => {
    if (!isAuthenticated) {
      showToast("Please sign in or register to confirm your table", "info");
      // Save current booking form state in sessionStorage
      sessionStorage.setItem('pending_booking', JSON.stringify({
        restaurant_id: restaurant.id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        party_size: partySize,
        special_request: specialRequest,
      }));
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      // Backend expects: user_id, restaurant_id, booking_date (YYYY-MM-DD), booking_time (HH:MM 24h format), party_size
      // Convert bookingTime e.g. "07:30 PM" to "19:30"
      const [timePart, modifier] = bookingTime.split(' ');
      let [hours, minutes] = timePart.split(':');
      if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours, 10) + 12);
      if (modifier === 'AM' && hours === '12') hours = '00';
      const time24 = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

      const bookingPayload = {
        user_id: user.user_id,
        restaurant_id: restaurant.id,
        booking_date: bookingDate,
        booking_time: time24,
        party_size: partySize,
        special_request: `${seatingPref ? `[${seatingPref.toUpperCase()} SEATING] ` : ''}${specialRequest}`.trim(),
      };

      const res = await createBooking(bookingPayload);
      const newBookingId = res.booking?.booking_id || 'BK-' + Math.floor(100000 + Math.random() * 900000);

      triggerReaction('celebrating', "Hooray! Your table is booked and reserved!", 5000);
      navigate(`/booking-confirmation/${newBookingId}?rest=${encodeURIComponent(restaurant.name)}&date=${bookingDate}&time=${encodeURIComponent(bookingTime)}&guests=${partySize}&area=${encodeURIComponent(restaurant.area)}`);
    } catch (err) {
      console.error("Booking failed:", err);
      showToast(err.message || "Failed to reserve table. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader text="Setting the stage for your reservation..." />;
  if (!restaurant) {
    return (
      <div className="bab-container" style={{ padding: '60px 0' }}>
        <ErrorState
          title="Restaurant not available"
          message="Please choose a restaurant from the explore directory to reserve a table."
          onRetry={() => navigate("/explore")}
        />
      </div>
    );
  }

  return (
    <div className="bab-booking-page">
      <div className="bab-container" style={{ maxWidth: 860 }}>
        <button
          type="button"
          className="bab-back-btn"
          onClick={() => navigate(-1)}
        >
          <HiArrowLeft size={16} /> Back
        </button>

        {/* HEADER */}
        <div className="bab-booking-header">
          <span className="bab-booking-eyebrow">RESERVATION WIZARD</span>
          <h1 className="bab-booking-title">Reserve Your Table at {restaurant.name}</h1>
          <p className="bab-booking-subtitle">
            {restaurant.area}, {restaurant.city} • ₹{restaurant.priceForTwo} for two
          </p>
        </div>

        {/* PROGRESS STEP BAR */}
        <div className="bab-progress-bar-container">
          <div className="bab-progress-step">
            <div className={`bab-progress-circle ${step >= 1 ? 'bab-progress-circle--active' : ''}`}>
              {step > 1 ? <HiCheck size={16} /> : '1'}
            </div>
            <span>Date & Time</span>
          </div>
          <div className={`bab-progress-line ${step >= 2 ? 'bab-progress-line--active' : ''}`} />

          <div className="bab-progress-step">
            <div className={`bab-progress-circle ${step >= 2 ? 'bab-progress-circle--active' : ''}`}>
              {step > 2 ? <HiCheck size={16} /> : '2'}
            </div>
            <span>Guests & Seating</span>
          </div>
          <div className={`bab-progress-line ${step >= 3 ? 'bab-progress-line--active' : ''}`} />

          <div className="bab-progress-step">
            <div className={`bab-progress-circle ${step >= 3 ? 'bab-progress-circle--active' : ''}`}>
              {step > 3 ? <HiCheck size={16} /> : '3'}
            </div>
            <span>Contact Details</span>
          </div>
          <div className={`bab-progress-line ${step >= 4 ? 'bab-progress-line--active' : ''}`} />

          <div className="bab-progress-step">
            <div className={`bab-progress-circle ${step >= 4 ? 'bab-progress-circle--active' : ''}`}>
              4
            </div>
            <span>Confirm</span>
          </div>
        </div>

        {/* FORM CONTAINER */}
        <div className="bab-booking-card">
          {/* STEP 1: DATE & TIME */}
          {step === 1 && (
            <div className="bab-booking-step-pane">
              <h3 className="bab-step-heading">Step 1: Choose Your Dining Date & Time</h3>
              <div className="bab-form-group">
                <label htmlFor="res-date">Select Reservation Date</label>
                <div className="bab-input-with-icon">
                  <HiOutlineCalendar size={20} className="bab-field-icon" />
                  <input
                    id="res-date"
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="bab-form-input"
                  />
                </div>
              </div>

              <div className="bab-form-group" style={{ marginTop: 24 }}>
                <label>Select Preferred Time Slot</label>
                <div className="bab-slots-picker-grid">
                  {TIME_OPTIONS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`bab-slot-pill ${bookingTime === slot ? 'bab-slot-pill--selected' : ''}`}
                      onClick={() => setBookingTime(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GUESTS & SEATING PREFERENCE */}
          {step === 2 && (
            <div className="bab-booking-step-pane">
              <h3 className="bab-step-heading">Step 2: Party Size & Seating Ambiance</h3>
              <div className="bab-form-group">
                <label>Number of Guests</label>
                <div className="bab-party-size-selector">
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`bab-party-btn ${partySize === num ? 'bab-party-btn--selected' : ''}`}
                      onClick={() => setPartySize(num)}
                    >
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bab-form-group" style={{ marginTop: 28 }}>
                <label>Table Seating Preference</label>
                <div className="bab-seating-cards-grid">
                  {SEATING_AREAS.map((area) => (
                    <div
                      key={area.id}
                      className={`bab-seating-card ${seatingPref === area.id ? 'bab-seating-card--selected' : ''}`}
                      onClick={() => setSeatingPref(area.id)}
                    >
                      <input
                        type="radio"
                        name="seating"
                        checked={seatingPref === area.id}
                        onChange={() => setSeatingPref(area.id)}
                      />
                      <div>
                        <strong>{area.title}</strong>
                        <p>{area.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT DETAILS & REQUESTS */}
          {step === 3 && (
            <div className="bab-booking-step-pane">
              <h3 className="bab-step-heading">Step 3: Diner Information & Special Occasions</h3>
              <div className="bab-form-row">
                <div className="bab-form-group">
                  <label htmlFor="guest-name">Full Name *</label>
                  <div className="bab-input-with-icon">
                    <HiOutlineUser size={18} className="bab-field-icon" />
                    <input
                      id="guest-name"
                      type="text"
                      placeholder="Your full name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="bab-form-input"
                      required
                    />
                  </div>
                </div>

                <div className="bab-form-group">
                  <label htmlFor="guest-email">Email Address *</label>
                  <div className="bab-input-with-icon">
                    <HiOutlineMail size={18} className="bab-field-icon" />
                    <input
                      id="guest-email"
                      type="email"
                      placeholder="confirmation@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="bab-form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bab-form-group" style={{ marginTop: 16 }}>
                <label htmlFor="guest-phone">Phone Number (For Table SMS & Updates)</label>
                <div className="bab-input-with-icon">
                  <HiOutlinePhone size={18} className="bab-field-icon" />
                  <input
                    id="guest-phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="bab-form-input"
                  />
                </div>
              </div>

              <div className="bab-form-group" style={{ marginTop: 16 }}>
                <label htmlFor="special-req">Special Requests or Occasion Notes</label>
                <textarea
                  id="special-req"
                  rows="3"
                  placeholder="Anniversary, birthday cake request, quiet corner table, allergies, etc."
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="bab-form-input"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="bab-booking-step-pane">
              <h3 className="bab-step-heading">Step 4: Review Reservation Summary</h3>

              <div className="bab-booking-summary-box">
                <div className="bab-summary-row">
                  <span>Restaurant:</span>
                  <strong>{restaurant.name}</strong>
                </div>
                <div className="bab-summary-row">
                  <span>Location:</span>
                  <span>{restaurant.address}</span>
                </div>
                <div className="bab-summary-row">
                  <span>Date:</span>
                  <strong>{new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                </div>
                <div className="bab-summary-row">
                  <span>Time Slot:</span>
                  <strong>{bookingTime}</strong>
                </div>
                <div className="bab-summary-row">
                  <span>Number of Guests:</span>
                  <strong>{partySize} Guests</strong>
                </div>
                <div className="bab-summary-row">
                  <span>Diner:</span>
                  <span>{guestName} ({guestEmail})</span>
                </div>
                {specialRequest && (
                  <div className="bab-summary-row">
                    <span>Special Notes:</span>
                    <em>&ldquo;{specialRequest}&rdquo;</em>
                  </div>
                )}
                <div className="bab-summary-divider" />
                <div className="bab-summary-row">
                  <span>Reservation Fee:</span>
                  <strong style={{ color: 'var(--bab-success)' }}>₹0 (Complimentary via BookABite)</strong>
                </div>
              </div>

              <div className="bab-booking-mascot-cheer">
                <FoodMascot mood="celebrating" size={80} />
                <p>Chef Pierre is getting everything ready. Your table will be held exclusively for you.</p>
              </div>
            </div>
          )}

          {/* STEP NAVIGATION BUTTONS */}
          <div className="bab-step-nav-buttons">
            {step > 1 && (
              <button
                type="button"
                className="bab-btn bab-btn--outline"
                onClick={handlePrevStep}
              >
                Previous Step
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                className="bab-btn bab-btn--secondary"
                onClick={handleNextStep}
                style={{ marginLeft: 'auto' }}
              >
                Continue <HiArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="bab-btn bab-btn--secondary"
                onClick={handleConfirmReservation}
                disabled={submitting}
                style={{ marginLeft: 'auto', padding: '14px 28px' }}
              >
                {submitting ? 'Confirming with Restaurant...' : 'Complete Reservation 🎉'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
