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
import { createBooking, fetchFeeQuote } from '../../api/bookings';
import useAvailability from '../../hooks/useAvailability';
import { localDateString, formatTime, formatDate, formatMoney, to24 } from '../../utils/time';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import './TableBookingPage.css';

const PAY_METHODS = [
  { id: 'upi', label: 'UPI', hint: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Card', hint: 'Credit / debit' },
  { id: 'netbanking', label: 'Net banking', hint: 'All major banks' },
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
    searchParams.get('date') || localDateString()
  );
  // Always kept as 24h "HH:MM" (the format the API uses)
  const [bookingTime, setBookingTime] = useState(
    to24(searchParams.get('time'))
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
  const [payMethod, setPayMethod] = useState('upi');
  const [feeQuote, setFeeQuote] = useState(null);

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

  // Real availability from the server: only slots that can be booked right now.
  const availability = useAvailability(restaurant?.id, bookingDate, partySize);
  const slots = availability.slots;

  // On step 1, keep the selected time valid (prefer 7:30 PM, else the first free slot).
  useEffect(() => {
    if (step !== 1 || availability.loading) return;
    if (slots.length === 0) {
      setBookingTime('');
    } else if (!slots.some((s) => s.value === bookingTime)) {
      setBookingTime((slots.find((s) => s.value === '19:30') || slots[0]).value);
    }
  }, [availability.loading, slots, step]);

  // Booking fee for this party size
  useEffect(() => {
    let active = true;
    fetchFeeQuote(partySize)
      .then((q) => { if (active) setFeeQuote(q); })
      .catch(() => { if (active) setFeeQuote(null); });
    return () => { active = false; };
  }, [partySize]);

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
      if (!slots.some((s) => s.value === bookingTime)) {
        showToast("Please choose an available time slot", "info");
        return;
      }
      triggerReaction('thinking', `Checking availability for ${partySize} guests...`, 2500);
    }
    if (step === 2) {
      // The party size may have changed since a time was picked: make sure there is still room.
      if (!slots.some((s) => s.value === bookingTime)) {
        showToast(`There is no room for ${partySize} guests at that time. Please pick another time.`, "info");
        setStep(1);
        return;
      }
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
      // The server calculates the fee itself; we only say how the guest pays.
      const bookingPayload = {
        restaurant_id: restaurant.id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        party_size: partySize,
        payment_method: payMethod,
        special_request: `${seatingPref ? `[${seatingPref.toUpperCase()} SEATING] ` : ''}${specialRequest}`.trim(),
      };

      const res = await createBooking(bookingPayload);
      const newBookingId = res.booking?.booking_id;

      triggerReaction('celebrating', "Hooray! Your table is booked and reserved!", 5000);
      navigate(`/booking-confirmation/${newBookingId}`);
    } catch (err) {
      console.error("Booking failed:", err);
      showToast(err.message || "Failed to reserve table. Please try again.", "error");
      // Someone took the seats or the guest already holds a table: go back and re-pick.
      if (err.status === 409) setStep(1);
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
            {restaurant.area}, {restaurant.city} • ₹{restaurant.priceForTwo} for two (meal)
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
                    min={localDateString()}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="bab-form-input"
                  />
                </div>
              </div>

              <div className="bab-form-group" style={{ marginTop: 24 }}>
                <label>Available Time Slots</label>
                {restaurant?.openingTime && restaurant?.closingTime && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--bab-text-muted)', margin: '0 0 12px' }}>
                    Serving hours: {formatTime(restaurant.openingTime)} – {formatTime(restaurant.closingTime)}
                  </p>
                )}
                {availability.loading ? (
                  <div className="bab-slots-loading">
                    {[...Array(8)].map((_, i) => <span key={i} />)}
                  </div>
                ) : availability.error ? (
                  <p className="bab-slots-state bab-slots-state--warn">
                    We couldn&apos;t load the available times. Please try again in a moment.
                  </p>
                ) : slots.length > 0 ? (
                  <div className="bab-slots-picker-grid">
                    {slots.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        className={`bab-slot-pill ${bookingTime === slot.value ? 'bab-slot-pill--selected' : ''}`}
                        onClick={() => setBookingTime(slot.value)}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="bab-slots-state bab-slots-state--warn">
                    {availability.message
                      ? availability.message
                      : availability.heldByYou > 0 && availability.totalOpen === 0
                        ? 'You already have a table at this restaurant on this date. Pick another date to book again.'
                        : 'No tables are free on this date. Please pick another date.'}
                  </p>
                )}
                {availability.heldByYou > 0 && slots.length > 0 && (
                  <p className="bab-slots-state">
                    Times close to a table you already hold here are hidden, so you can&apos;t double-book.
                  </p>
                )}
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
                  <strong>{formatDate(bookingDate, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                </div>
                <div className="bab-summary-row">
                  <span>Time Slot:</span>
                  <strong>{formatTime(bookingTime)}</strong>
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
              </div>

              {/* BOOKING FEE */}
              <div className="bab-fee-box">
                <div className="bab-fee-row">
                  <span>Booking fee ({formatMoney(feeQuote?.per_guest ?? 0)} × {partySize} {partySize === 1 ? 'guest' : 'guests'})</span>
                  <strong>{formatMoney(feeQuote ? feeQuote.guests * feeQuote.per_guest : 0)}</strong>
                </div>
                {feeQuote?.capped && (
                  <div className="bab-fee-row">
                    <span>Large-party cap applied</span>
                    <strong>max {formatMoney(feeQuote.max_fee)}</strong>
                  </div>
                )}
                <div className="bab-fee-row bab-fee-row--total">
                  <span>Total to pay now</span>
                  <strong>{formatMoney(feeQuote?.fee ?? 0)}</strong>
                </div>
                <p className="bab-fee-note">
                  Your meal is paid at the restaurant. The fee is refunded in full if you cancel at least{' '}
                  {feeQuote?.refund_cutoff_minutes ?? 60} minutes before your booking, or if the restaurant cancels.
                </p>
              </div>

              <div className="bab-form-group" style={{ marginTop: 20 }}>
                <label>
                  Pay with <span className="bab-demo-pill">DEMO PAYMENT</span>
                </label>
                <div className="bab-pay-methods">
                  {PAY_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`bab-pay-method ${payMethod === m.id ? 'bab-pay-method--selected' : ''}`}
                      onClick={() => setPayMethod(m.id)}
                    >
                      {m.label}
                      <small>{m.hint}</small>
                    </button>
                  ))}
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
                {submitting ? 'Processing payment...' : `Pay ${formatMoney(feeQuote?.fee ?? 0)} & Reserve 🎉`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
