import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import { fetchRestaurantById } from "../api/restaurants";
import {
  createBooking,
  fetchBookingAvailability,
} from "../api/bookings";
import { useAuth } from "../context/AuthContext";

import "./Booking.css";


/* ============================================================
   DATE HELPERS
============================================================ */

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function getTomorrow() {
  const date = new Date();

  date.setDate(
    date.getDate() + 1
  );

  return formatDateInput(date);
}


/* ============================================================
   BOOKING PAGE
============================================================ */

export default function Booking() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    user,
    isAuthenticated,
  } = useAuth();


  /* ----------------------------------------------------------
     Restaurant
  ---------------------------------------------------------- */

  const [
    restaurant,
    setRestaurant
  ] = useState(null);

  const [
    loadingRestaurant,
    setLoadingRestaurant
  ] = useState(true);


  /* ----------------------------------------------------------
     Booking form
  ---------------------------------------------------------- */

  const [
    date,
    setDate
  ] = useState(getTomorrow());

  const [
    guests,
    setGuests
  ] = useState(2);

  const [
    time,
    setTime
  ] = useState("");

  const [
    specialRequest,
    setSpecialRequest
  ] = useState("");


  /* ----------------------------------------------------------
     Availability
  ---------------------------------------------------------- */

  const [
    availability,
    setAvailability
  ] = useState(null);

  const [
    loadingAvailability,
    setLoadingAvailability
  ] = useState(false);


  /* ----------------------------------------------------------
     Booking submission
  ---------------------------------------------------------- */

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    bookingResult,
    setBookingResult
  ] = useState(null);


  /* ==========================================================
     LOAD RESTAURANT
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadRestaurant() {
      try {
        setLoadingRestaurant(true);
        setError("");

        const data =
          await fetchRestaurantById(id);

        if (mounted) {
          setRestaurant(data);
        }
      } catch (err) {
        console.error(
          "BOOKABITE RESTAURANT ERROR:",
          err
        );

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load restaurant details."
          );
        }
      } finally {
        if (mounted) {
          setLoadingRestaurant(false);
        }
      }
    }

    if (id) {
      loadRestaurant();
    }

    return () => {
      mounted = false;
    };
  }, [id]);


  /* ==========================================================
     LOAD AVAILABILITY
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadAvailability() {
      if (!id || !date) {
        return;
      }

      try {
        setLoadingAvailability(true);
        setError("");
        setAvailability(null);

        const data =
          await fetchBookingAvailability(
            id,
            date
          );

        if (mounted) {
          setAvailability(data);
        }
      } catch (err) {
        console.error(
          "BOOKABITE AVAILABILITY ERROR:",
          err
        );

        if (mounted) {
          setAvailability(null);

          setError(
            err?.message ||
              "Unable to check table availability."
          );
        }
      } finally {
        if (mounted) {
          setLoadingAvailability(false);
        }
      }
    }

    loadAvailability();

    return () => {
      mounted = false;
    };
  }, [id, date]);


  /* ==========================================================
     AVAILABLE TIME SLOTS
  ========================================================== */

  const timeSlots = useMemo(() => {
    return Array.isArray(
      availability?.slots
    )
      ? availability.slots
      : [];
  }, [availability]);


  /* ==========================================================
     RESET TIME WHEN DATE / AVAILABILITY CHANGES
  ========================================================== */

  useEffect(() => {
    if (!timeSlots.length) {
      setTime("");
      return;
    }

    const selectedSlot =
      timeSlots.find(
        (slot) =>
          slot.value === time
      );

    /*
      If the current time is still available
      for the selected party size, keep it.
    */

    if (
      selectedSlot?.available &&
      Number(
        selectedSlot.remaining_capacity || 0
      ) >= guests
    ) {
      return;
    }

    /*
      Otherwise select the first slot that
      can accommodate the current party size.
    */

    const firstAvailable =
      timeSlots.find(
        (slot) =>
          slot.available &&
          Number(
            slot.remaining_capacity || 0
          ) >= guests
      );

    setTime(
      firstAvailable?.value || ""
    );
  }, [
    timeSlots,
    time,
    guests
  ]);


  /* ==========================================================
     SELECTED SLOT
  ========================================================== */

  const selectedSlot =
    timeSlots.find(
      (slot) =>
        slot.value === time
    );


  /* ==========================================================
     SUBMIT BOOKING
  ========================================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");


    /* --------------------------------------------------------
       Login check
    -------------------------------------------------------- */

    if (
      !isAuthenticated ||
      !user
    ) {
      navigate("/login", {
        state: {
          from:
            `/restaurants/${id}/book`,
        },
      });

      return;
    }


    /* --------------------------------------------------------
       Basic validation
    -------------------------------------------------------- */

    if (
      !date ||
      !time ||
      !guests
    ) {
      setError(
        "Please complete all required booking details."
      );

      return;
    }


    /* --------------------------------------------------------
       Date validation
    -------------------------------------------------------- */

    const tomorrow =
      getTomorrow();

    if (date < tomorrow) {
      setError(
        "Please choose tomorrow or a later date."
      );

      return;
    }


    /* --------------------------------------------------------
       Availability validation
    -------------------------------------------------------- */

    if (
      !selectedSlot ||
      !selectedSlot.available
    ) {
      setError(
        "This time slot is no longer available. Please choose another time."
      );

      return;
    }


    if (
      Number(
        selectedSlot.remaining_capacity || 0
      ) < guests
    ) {
      setError(
        "This time slot does not have enough capacity for your party size."
      );

      return;
    }


    /* --------------------------------------------------------
       User ID
    -------------------------------------------------------- */

    const userId =
      user.user_id ||
      user.id;

    if (!userId) {
      setError(
        "Unable to identify your account. Please log in again."
      );

      return;
    }


    /* --------------------------------------------------------
       Create booking
    -------------------------------------------------------- */

    try {
      setSubmitting(true);

      const bookingData = {
        restaurant_id:
          Number(id),

        user_id:
          Number(userId),

        booking_date:
          date,

        booking_time:
          time,

        party_size:
          Number(guests),

        special_request:
          specialRequest.trim() ||
          null,
      };


      console.log(
        "BOOKABITE BOOKING DATA:",
        bookingData
      );


      const result =
        await createBooking(
          bookingData
        );


      console.log(
        "BOOKABITE BOOKING RESPONSE:",
        result
      );


      setBookingResult(
        result
      );

    } catch (err) {
      console.error(
        "BOOKABITE BOOKING ERROR:",
        err
      );


      /*
        409 means another customer may
        have taken the slot between the
        availability check and submission.
      */

      if (
        err?.status === 409 ||
        err?.response?.status === 409
      ) {
        setError(
          "Sorry, this time slot just became unavailable. Please choose another time."
        );

        /*
          Refresh availability.
        */

        try {
          const fresh =
            await fetchBookingAvailability(
              id,
              date
            );

          setAvailability(
            fresh
          );
        } catch {
          // Keep the original booking error.
        }

        return;
      }


      setError(
        err?.message ||
          "Unable to create your reservation. Please try again."
      );

    } finally {
      setSubmitting(false);
    }
  };


  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    loadingRestaurant
  ) {
    return (
      <section className="bab-booking-page">
        <div className="bab-booking-container">
          <div className="bab-booking-loading">
            Loading restaurant...
          </div>
        </div>
      </section>
    );
  }


  /* ==========================================================
     RESTAURANT ERROR
  ========================================================== */

  if (
    error &&
    !restaurant
  ) {
    return (
      <section className="bab-booking-page">
        <div className="bab-booking-container">
          <div className="bab-booking-error-card">

            <h2>
              Unable to load restaurant
            </h2>

            <p>
              {error}
            </p>

            <Link
              to="/restaurants"
              className="bab-booking-back-button"
            >
              <ArrowLeft
                size={18}
              />

              Back to Restaurants
            </Link>

          </div>
        </div>
      </section>
    );
  }


  if (!restaurant) {
    return null;
  }


  /* ==========================================================
     SUCCESS SCREEN
  ========================================================== */

  if (bookingResult) {
    const booking =
      bookingResult.booking ||
      bookingResult;

    return (
      <section className="bab-booking-page">

        <div className="bab-booking-success">

          <div className="bab-success-icon">
            <Check size={42} />
          </div>


          <span className="bab-booking-eyebrow">
            BOOKABITE · RESERVATION CONFIRMED
          </span>


          <h1>
            Your table is booked.
          </h1>


          <p>
            Your reservation at{" "}
            <strong>
              {restaurant.name}
            </strong>{" "}
            has been successfully created.
          </p>


          {booking.booking_id && (
            <div className="bab-booking-id">

              <span>
                Booking ID
              </span>

              <strong>
                #{booking.booking_id}
              </strong>

            </div>
          )}


          <div className="bab-success-details">

            <div>
              <CalendarDays
                size={18}
              />

              <span>
                {date}
              </span>
            </div>


            <div>
              <Clock3
                size={18}
              />

              <span>
                {selectedSlot?.label ||
                  time}
              </span>
            </div>


            <div>
              <Users
                size={18}
              />

              <span>
                {guests}{" "}
                {guests === 1
                  ? "guest"
                  : "guests"}
              </span>
            </div>

          </div>


          <div className="bab-success-actions">

            <Link
              to="/bookings"
              className="bab-primary-button"
            >
              View My Bookings
            </Link>

            <Link
              to="/restaurants"
              className="bab-secondary-button"
            >
              Browse Restaurants
            </Link>

          </div>

        </div>

      </section>
    );
  }


  /* ==========================================================
     MAIN BOOKING PAGE
  ========================================================== */

  return (
    <section className="bab-booking-page">

      <div className="bab-booking-container">

        {/* Back */}

        <Link
          to={`/restaurants/${id}`}
          className="bab-booking-back"
        >
          <ArrowLeft
            size={18}
          />

          Back to restaurant
        </Link>


        <div className="bab-booking-layout">


          {/* ==================================================
             RESTAURANT SUMMARY
          ================================================== */}

          <aside className="bab-booking-restaurant">

            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="bab-booking-restaurant-image"
            />


            <div className="bab-booking-restaurant-content">

              <span className="bab-booking-eyebrow">
                YOUR TABLE
              </span>


              <h2>
                {restaurant.name}
              </h2>


              <p className="bab-booking-cuisine">
                {restaurant.cuisine}
              </p>


              <div className="bab-booking-info">

                <div>
                  <MapPin
                    size={18}
                  />

                  <span>
                    {restaurant.area ||
                      restaurant.city}
                  </span>
                </div>


                <div>
                  <Clock3
                    size={18}
                  />

                  <span>
                    {restaurant.openingTime}
                    {" – "}
                    {restaurant.closingTime}
                  </span>
                </div>


                <div>
                  <Users
                    size={18}
                  />

                  <span>
                    ₹
                    {Number(
                      restaurant.priceForTwo ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}{" "}
                    for two
                  </span>
                </div>

              </div>

            </div>

          </aside>


          {/* ==================================================
             BOOKING FORM
          ================================================== */}

          <div className="bab-booking-form-card">

            <div className="bab-booking-form-header">

              <span className="bab-booking-eyebrow">
                BOOKABITE · RESERVATION
              </span>

              <h1>
                Book your table.
              </h1>

              <p>
                Choose your date, time and party size.
              </p>

            </div>


            {error && (
              <div className="bab-booking-error">
                {error}
              </div>
            )}


            <form
              onSubmit={handleSubmit}
            >


              {/* =================================================
                 DATE
              ================================================= */}

              <div className="bab-form-section">

                <label htmlFor="booking-date">

                  <CalendarDays
                    size={18}
                  />

                  Date

                </label>


                <input
                  id="booking-date"
                  type="date"
                  value={date}
                  min={getTomorrow()}
                  onChange={(event) => {
                    setDate(
                      event.target.value
                    );

                    setTime("");
                  }}
                  required
                />

              </div>


              {/* =================================================
                 GUESTS
              ================================================= */}

              <div className="bab-form-section">

                <label>

                  <Users
                    size={18}
                  />

                  Number of guests

                </label>


                <div className="bab-guest-selector">

                  <button
                    type="button"
                    onClick={() =>
                      setGuests(
                        (current) =>
                          Math.max(
                            1,
                            current - 1
                          )
                      )
                    }
                    disabled={
                      guests <= 1
                    }
                  >
                    −
                  </button>


                  <div>

                    <strong>
                      {guests}
                    </strong>

                    <span>
                      {guests === 1
                        ? "guest"
                        : "guests"}
                    </span>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      setGuests(
                        (current) =>
                          Math.min(
                            20,
                            current + 1
                          )
                      )
                    }
                    disabled={
                      guests >= 20
                    }
                  >
                    +
                  </button>

                </div>

              </div>


              {/* =================================================
                 TIME
              ================================================= */}

              <div className="bab-form-section">

                <label>

                  <Clock3
                    size={18}
                  />

                  Choose a time

                </label>


                {loadingAvailability ? (

                  <div className="bab-booking-availability-loading">
                    Checking available tables...
                  </div>

                ) : timeSlots.length > 0 ? (

                  <div className="bab-time-grid">

                    {timeSlots.map(
                      (slot) => {

                        const canFitParty =
                          Number(
                            slot.remaining_capacity ||
                              0
                          ) >= guests;

                        const disabled =
                          !slot.available ||
                          !canFitParty;

                        const isSelected =
                          time ===
                          slot.value;


                        return (
                          <button
                            key={
                              slot.value
                            }
                            type="button"
                            disabled={
                              disabled
                            }
                            title={
                              disabled
                                ? slot.available
                                  ? `Only ${slot.remaining_capacity} seats remaining`
                                  : "Fully booked"
                                : `${slot.remaining_capacity} seats available`
                            }
                            className={
                              isSelected
                                ? "bab-time-slot selected"
                                : disabled
                                ? "bab-time-slot disabled"
                                : "bab-time-slot"
                            }
                            onClick={() => {
                              if (
                                !disabled
                              ) {
                                setTime(
                                  slot.value
                                );

                                setError(
                                  ""
                                );
                              }
                            }}
                          >
                            {slot.label}

                            {disabled && (
                              <span className="bab-slot-unavailable">
                                Full
                              </span>
                            )}
                          </button>
                        );
                      }
                    )}

                  </div>

                ) : (

                  <div className="bab-booking-error">
                    No booking times are available for this date.
                  </div>

                )}

              </div>


              {/* =================================================
                 AVAILABILITY MESSAGE
              ================================================= */}

              {selectedSlot &&
                selectedSlot.available && (
                  <div className="bab-availability-message">

                    <Check
                      size={16}
                    />

                    <span>
                      {selectedSlot.remaining_capacity}{" "}
                      {selectedSlot.remaining_capacity ===
                      1
                        ? "seat"
                        : "seats"}{" "}
                      remaining for this time
                    </span>

                  </div>
                )}


              {/* =================================================
                 SPECIAL REQUEST
              ================================================= */}

              <div className="bab-form-section">

                <label htmlFor="special-request">

                  Special request{" "}

                  <span className="bab-optional">
                    Optional
                  </span>

                </label>


                <textarea
                  id="special-request"
                  value={
                    specialRequest
                  }
                  onChange={(
                    event
                  ) =>
                    setSpecialRequest(
                      event.target.value
                    )
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="Birthday celebration, window seat, dietary request..."
                />


                <div className="bab-character-count">
                  {specialRequest.length}/500
                </div>

              </div>


              {/* =================================================
                 CONFIRM
              ================================================= */}

              <button
                type="submit"
                className="bab-confirm-button"
                disabled={
                  submitting ||
                  loadingAvailability ||
                  !selectedSlot ||
                  !selectedSlot.available ||
                  Number(
                    selectedSlot.remaining_capacity ||
                      0
                  ) < guests
                }
              >

                {submitting
                  ? "Confirming reservation..."
                  : "Confirm Reservation"}

                {!submitting && (
                  <span>
                    →
                  </span>
                )}

              </button>


              <p className="bab-booking-note">
                By confirming, you agree to the
                restaurant's reservation policies.
              </p>

            </form>

          </div>

        </div>

      </div>

    </section>
  );
}