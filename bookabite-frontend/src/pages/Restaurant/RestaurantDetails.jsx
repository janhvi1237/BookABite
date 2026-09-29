import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiStar,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineHeart,
  HiHeart,
  HiOutlineCheckCircle,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiArrowLeft,
  HiOutlineSparkles,
} from 'react-icons/hi';
import FoodItemCard from '../../components/menu/FoodItemCard';
import FoodItemModal from '../../components/menu/FoodItemModal';
import PageLoader from '../../components/common/PageLoader';
import { ErrorState } from '../../components/common/ErrorState';
import FoodMascot from '../../components/mascot/FoodMascot';
import { fetchRestaurantById } from '../../api/restaurants';
import { fetchRestaurantMenu } from '../../api/menu';
import { fetchRestaurantReviews, submitReview } from '../../api/reviews';
import { toggleFavorite } from '../../api/favorites';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import './RestaurantDetails.css';

const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM',
];

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [menuData, setMenuData] = useState({ categories: {}, items: [] });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tabs: 'about' | 'menu' | 'photos' | 'reviews' | 'location'
  const [activeTab, setActiveTab] = useState('about');

  // Selected food item modal
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);

  // Sticky Booking Card state
  const [bookDate, setBookDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookTime, setBookTime] = useState('07:30 PM');
  const [bookGuests, setBookGuests] = useState('2');

  // Favorites
  const [isFav, setIsFav] = useState(false);

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadAll() {
      try {
        setLoading(true);
        setError(null);
        const [restRes, menuRes, reviewsRes] = await Promise.all([
          fetchRestaurantById(id),
          fetchRestaurantMenu(id).catch(() => ({ categories: {}, items: [] })),
          fetchRestaurantReviews(id).catch(() => ({ reviews: [] })),
        ]);

        if (!active) return;
        setRestaurant(restRes);
        setMenuData(menuRes);
        setReviews(reviewsRes.reviews || []);
      } catch (err) {
        console.error("Failed to load restaurant details:", err);
        if (active) setError(err.message || "Failed to load restaurant details");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadAll();
    return () => { active = false; };
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast("Please log in to save favourite restaurants", "info");
      navigate("/login");
      return;
    }
    try {
      const res = await toggleFavorite(user.user_id, restaurant.id);
      setIsFav(res.is_favorite);
      if (res.is_favorite) {
        triggerReaction('happy', `Saved ${restaurant.name} to favourites!`, 3000);
        showToast("Saved to favourites", "success");
      } else {
        showToast("Removed from favourites", "info");
      }
    } catch {
      showToast("Failed to update favourites", "error");
    }
  };

  const handleProceedBooking = () => {
    triggerReaction('excited', `Setting up reservation for ${bookGuests} guests on ${bookDate} at ${bookTime}!`, 4000);
    navigate(`/restaurants/${restaurant.id}/book?date=${bookDate}&time=${encodeURIComponent(bookTime)}&guests=${bookGuests}`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast("Please log in to submit a review", "info");
      navigate("/login");
      return;
    }
    if (!newComment.trim()) {
      showToast("Please write a short comment about your experience", "info");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await submitReview(restaurant.id, {
        user_id: user.user_id,
        rating: newRating,
        comment: newComment,
      });
      setReviews((prev) => [res.review, ...prev]);
      setNewComment('');
      showToast("Thank you! Review submitted successfully", "success");
      triggerReaction('celebrating', "Thank you for sharing your dining review!", 3500);
    } catch {
      showToast("Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <PageLoader text="Loading restaurant ambiance and menu..." />;
  if (error || !restaurant) {
    return (
      <div className="bab-container" style={{ padding: '60px 0' }}>
        <ErrorState
          title="Restaurant Not Found"
          message="We couldn't locate this restaurant. It may have been relocated or updated."
          onRetry={() => navigate("/explore")}
        />
      </div>
    );
  }

  return (
    <div className="bab-details-page">
      {/* =====================================================
          HERO GALLERY & BANNER
      ===================================================== */}
      <div className="bab-details-hero-wrap">
        <div className="bab-container">
          <button
            type="button"
            className="bab-back-btn"
            onClick={() => navigate(-1)}
          >
            <HiArrowLeft size={16} /> Back to Restaurants
          </button>

          <div className="bab-details-gallery-grid">
            <div className="bab-gallery-main">
              <img src={restaurant.image} alt={restaurant.name} className="bab-gallery-main-img" />
              <button
                type="button"
                className={`bab-details-fav-btn ${isFav ? 'bab-details-fav-btn--active' : ''}`}
                onClick={handleToggleFavorite}
                aria-label="Save restaurant"
              >
                {isFav ? <HiHeart size={22} color="#D65A3A" /> : <HiOutlineHeart size={22} />}
              </button>
            </div>

            <div className="bab-gallery-thumbnails">
              {restaurant.images.slice(0, 3).map((imgUrl, i) => (
                <img
                  key={i}
                  src={imgUrl}
                  alt={`${restaurant.name} preview ${i + 1}`}
                  className="bab-gallery-thumb"
                />
              ))}
            </div>
          </div>

          {/* HEADER SUMMARY */}
          <div className="bab-details-header">
            <div>
              <div className="bab-details-meta-tags">
                <span className="bab-badge bab-badge--terracotta">{restaurant.cuisine}</span>
                <span className="bab-badge bab-badge--gold">{restaurant.foodType}</span>
                {restaurant.isInstantBooking && (
                  <span className="bab-badge bab-badge--success">⚡ Instant Confirmation</span>
                )}
              </div>
              <h1 className="bab-details-title">{restaurant.name}</h1>
              <div className="bab-details-submeta">
                <span className="bab-submeta-item">
                  <HiOutlineLocationMarker size={16} color="#D65A3A" />
                  {restaurant.address || `${restaurant.area}, ${restaurant.city}`}
                </span>
                <span className="bab-submeta-item">
                  <HiOutlineClock size={16} color="#D65A3A" />
                  {restaurant.openingTime} - {restaurant.closingTime}
                </span>
                <span className="bab-submeta-item">
                  ₹{restaurant.priceForTwo} for two
                </span>
              </div>
            </div>

            <div className="bab-details-rating-box">
              <div className="bab-details-rating-score">
                <HiStar size={24} color="#E9B44C" />
                <span>{restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}</span>
              </div>
              <small>{restaurant.totalReviews} guest reviews</small>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT WITH TABS & STICKY BOOKING CARD
      ===================================================== */}
      <div className="bab-container bab-details-content-grid">
        {/* LEFT COLUMN: TABS & CONTENT */}
        <div className="bab-details-main">
          {/* TAB BUTTONS */}
          <div className="bab-details-tabs">
            {['about', 'menu', 'photos', 'reviews', 'location'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`bab-details-tab-btn ${activeTab === tab ? 'bab-details-tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'about' && 'About'}
                {tab === 'menu' && `Menu (${menuData.items ? menuData.items.length : 0})`}
                {tab === 'photos' && 'Photos'}
                {tab === 'reviews' && `Reviews (${reviews.length})`}
                {tab === 'location' && 'Location & Hours'}
              </button>
            ))}
          </div>

          {/* TAB 1: ABOUT */}
          {activeTab === 'about' && (
            <div className="bab-tab-pane">
              <h3 className="bab-tab-heading">Story & Ambiance</h3>
              <p className="bab-tab-paragraph">
                {restaurant.description || `${restaurant.name} is an exquisite culinary retreat celebrated for its artisan cuisine, serene ambiance, and memorable dining moments.`}
              </p>

              <h4 className="bab-tab-subheading">Features & Amenities</h4>
              <div className="bab-amenities-grid">
                {restaurant.amenities && restaurant.amenities.length > 0 ? (
                  restaurant.amenities.map((amenity, i) => (
                    <div key={i} className="bab-amenity-item">
                      <HiOutlineCheckCircle size={18} color="#3FA66B" />
                      <span>{amenity}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--bab-text-muted)' }}>Standard dining amenities available.</p>
                )}
              </div>

              {/* CHEF'S TIP */}
              <div className="bab-chef-highlight-box">
                <FoodMascot mood="happy" size={70} />
                <div>
                  <h4>Chef Pierre&apos;s Ambiance Note</h4>
                  <p>
                    &ldquo;Arrive 15 minutes before sunset if you are reserving an outdoor or rooftop table to enjoy the golden hour skyline of {restaurant.area}!&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MENU */}
          {activeTab === 'menu' && (
            <div className="bab-tab-pane">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 className="bab-tab-heading" style={{ margin: 0 }}>Artisan Food & Drinks</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--bab-text-muted)', margin: 0 }}>
                    Click any item to inspect ingredients, dietary highlights, and add to your reservation plan.
                  </p>
                </div>
              </div>

              {menuData.items && menuData.items.length > 0 ? (
                Object.entries(menuData.categories).map(([category, items]) => (
                  <div key={category} className="bab-menu-category-section">
                    <h4 className="bab-menu-category-title">{category}</h4>
                    <div className="bab-menu-items-grid">
                      {items.map((item) => (
                        <FoodItemCard
                          key={item.item_id}
                          item={item}
                          onSelect={(selected) => setSelectedFoodItem(selected)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <FoodMascot mood="thinking" size={90} />
                  <p>Menu is being curated by the chef. Please check back soon!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PHOTOS */}
          {activeTab === 'photos' && (
            <div className="bab-tab-pane">
              <h3 className="bab-tab-heading">Restaurant Gallery</h3>
              <div className="bab-photos-grid">
                {restaurant.images.map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt={`${restaurant.name} photo ${i + 1}`}
                    className="bab-photos-item"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bab-tab-pane">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 className="bab-tab-heading" style={{ margin: 0 }}>Guest Reviews</h3>
              </div>

              {/* WRITE A REVIEW FORM */}
              <form className="bab-write-review-card" onSubmit={handleSubmitReview}>
                <h4>Share Your Experience</h4>
                <div className="bab-rating-picker">
                  <span>Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="bab-star-btn"
                    >
                      <HiStar size={24} color={star <= newRating ? '#E9B44C' : '#E0D6CD'} />
                    </button>
                  ))}
                </div>

                <textarea
                  rows="3"
                  placeholder="What did you love about the food, service, or ambiance?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bab-review-textarea"
                />

                <button
                  type="submit"
                  className="bab-btn bab-btn--secondary"
                  disabled={submittingReview}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>

              {/* REVIEW LIST */}
              <div className="bab-reviews-list">
                {reviews.length > 0 ? (
                  reviews.map((rev, i) => (
                    <div key={i} className="bab-review-item">
                      <div className="bab-review-item__header">
                        <div className="bab-review-user">
                          <div className="bab-review-avatar">
                            {rev.user_name ? rev.user_name[0] : 'U'}
                          </div>
                          <div>
                            <strong>{rev.user_name || 'BookABite Diner'}</strong>
                            <small>{rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Verified Guest'}</small>
                          </div>
                        </div>
                        <div className="bab-review-stars">
                          {[...Array(rev.rating || 5)].map((_, s) => (
                            <HiStar key={s} size={16} color="#E9B44C" />
                          ))}
                        </div>
                      </div>
                      <p className="bab-review-comment">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--bab-text-muted)' }}>No reviews yet. Be the first to leave a review!</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LOCATION */}
          {activeTab === 'location' && (
            <div className="bab-tab-pane">
              <h3 className="bab-tab-heading">Address & Timings</h3>
              <p style={{ fontSize: '1.05rem', color: 'var(--bab-text)' }}>
                <strong>Address:</strong> {restaurant.address}
              </p>
              <p style={{ fontSize: '1.05rem', color: 'var(--bab-text)' }}>
                <strong>Area / Neighborhood:</strong> {restaurant.area}, {restaurant.city}
              </p>
              <p style={{ fontSize: '1.05rem', color: 'var(--bab-text)' }}>
                <strong>Hours:</strong> Open daily from {restaurant.openingTime} to {restaurant.closingTime}
              </p>

              {/* Simulated Map Visual */}
              <div className="bab-simulated-map">
                <div className="bab-map-pin">
                  <HiOutlineLocationMarker size={28} color="#D65A3A" />
                  <span>{restaurant.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STICKY BOOKING CARD */}
        <aside className="bab-details-sidebar">
          <div className="bab-sticky-booking-card">
            <div className="bab-booking-card__header">
              <span className="bab-booking-card__eyebrow">RESERVE A TABLE</span>
              <h3 className="bab-booking-card__title">Book Your Dining Experience</h3>
              <span className="bab-booking-card__price">Average ₹{restaurant.priceForTwo} for two</span>
            </div>

            <div className="bab-booking-form-group">
              <label htmlFor="book-date">Select Date</label>
              <div className="bab-booking-input-wrap">
                <HiOutlineCalendar size={18} className="bab-booking-input-icon" />
                <input
                  id="book-date"
                  type="date"
                  value={bookDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookDate(e.target.value)}
                />
              </div>
            </div>

            <div className="bab-booking-form-group">
              <label htmlFor="book-guests">Number of Guests</label>
              <div className="bab-booking-input-wrap">
                <HiOutlineUserGroup size={18} className="bab-booking-input-icon" />
                <select
                  id="book-guests"
                  value={bookGuests}
                  onChange={(e) => setBookGuests(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bab-booking-form-group">
              <label>Select Time Slot</label>
              <div className="bab-time-slots-grid">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`bab-time-slot-btn ${bookTime === slot ? 'bab-time-slot-btn--selected' : ''}`}
                    onClick={() => setBookTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="bab-btn bab-btn--secondary bab-booking-submit-btn"
              onClick={handleProceedBooking}
            >
              Continue to Reservation
            </button>

            <div className="bab-booking-card__guarantees">
              <span>✦ Instant table confirmation</span>
              <span>✦ Free cancellation up to 1 hr prior</span>
            </div>
          </div>
        </aside>
      </div>

      {/* FOOD ITEM MODAL */}
      {selectedFoodItem && (
        <FoodItemModal
          item={selectedFoodItem}
          onClose={() => setSelectedFoodItem(null)}
        />
      )}
    </div>
  );
}
