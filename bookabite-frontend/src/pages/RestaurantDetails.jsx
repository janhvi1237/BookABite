import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Star,
  Utensils,
  X,
} from "lucide-react";

import { fetchRestaurantById } from "../api/restaurants";
import { fetchRestaurantMenu } from "../api/menu";
import {
  fetchRestaurantReviews,
  submitReview,
} from "../api/reviews";
import { useAuth } from "../context/AuthContext";

import "./RestaurantDetails.css";

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [restaurant, setRestaurant] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedMenuItem, setSelectedMenuItem] =
    useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] =
    useState(true);
  const [reviewsError, setReviewsError] =
    useState("");

  const [showReviewModal, setShowReviewModal] =
    useState(false);

  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] =
    useState("");

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);
  const [reviewSuccess, setReviewSuccess] =
    useState("");
  const [reviewSubmitError, setReviewSubmitError] =
    useState("");

  const [loadingRestaurant, setLoadingRestaurant] =
    useState(true);
  const [restaurantError, setRestaurantError] =
    useState("");

  // ----------------------------------------------------------
  // LOAD RESTAURANT
  // ----------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadRestaurant() {
      setLoadingRestaurant(true);
      setRestaurantError("");

      try {
        const data = await fetchRestaurantById(id);

        if (mounted) {
          setRestaurant(data);
        }
      } catch (error) {
        console.error(
          "Failed to load restaurant:",
          error
        );

        if (mounted) {
          setRestaurantError(
            error?.message ||
              "Failed to load restaurant."
          );
        }
      } finally {
        if (mounted) {
          setLoadingRestaurant(false);
        }
      }
    }

    loadRestaurant();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ----------------------------------------------------------
  // LOAD MENU
  // ----------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadMenu() {
      setMenuLoading(true);
      setMenuError("");

      try {
        const data =
          await fetchRestaurantMenu(id);

        if (mounted) {
          const availableItems =
            Array.isArray(data?.items)
              ? data.items.filter(
                  (item) => item.isAvailable
                )
              : [];

          setMenuItems(availableItems);
        }
      } catch (error) {
        console.error(
          "Failed to load restaurant menu:",
          error
        );

        if (mounted) {
          setMenuError(
            error?.message ||
              "Failed to load menu."
          );
        }
      } finally {
        if (mounted) {
          setMenuLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ----------------------------------------------------------
  // LOAD REVIEWS
  // ----------------------------------------------------------

  async function loadReviews() {
    setReviewsLoading(true);
    setReviewsError("");

    try {
      const data =
        await fetchRestaurantReviews(id);

      setReviews(
        Array.isArray(data?.reviews)
          ? data.reviews
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load reviews:",
        error
      );

      setReviewsError(
        error?.message ||
          "Failed to load reviews."
      );
    } finally {
      setReviewsLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [id]);

  // ----------------------------------------------------------
  // MENU CATEGORIES
  // ----------------------------------------------------------

  const menuCategories = useMemo(() => {
    const categories = menuItems
      .map((item) => item.category)
      .filter(Boolean);

    return ["All", ...new Set(categories)];
  }, [menuItems]);

  // ----------------------------------------------------------
  // FILTER MENU
  // ----------------------------------------------------------

  const filteredMenuItems = useMemo(() => {
    if (selectedCategory === "All") {
      return menuItems;
    }

    return menuItems.filter(
      (item) =>
        item.category === selectedCategory
    );
  }, [menuItems, selectedCategory]);

  // ----------------------------------------------------------
  // ESCAPE KEY
  // ----------------------------------------------------------

  useEffect(() => {
    if (
      !selectedMenuItem &&
      !showReviewModal
    ) {
      return;
    }

    function handleEscape(event) {
      if (event.key !== "Escape") {
        return;
      }

      setSelectedMenuItem(null);
      setShowReviewModal(false);
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "";
    };
  }, [
    selectedMenuItem,
    showReviewModal,
  ]);

  // ----------------------------------------------------------
  // REVIEW MODAL
  // ----------------------------------------------------------

  function openReviewModal() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setReviewRating(0);
    setHoverRating(0);
    setReviewComment("");
    setReviewSuccess("");
    setReviewSubmitError("");
    setShowReviewModal(true);
  }

  function closeReviewModal() {
    if (reviewSubmitting) {
      return;
    }

    setShowReviewModal(false);
  }

  // ----------------------------------------------------------
  // SUBMIT REVIEW
  // ----------------------------------------------------------

  async function handleSubmitReview(event) {
    event.preventDefault();

    setReviewSubmitError("");
    setReviewSuccess("");

    if (!isAuthenticated || !user?.user_id) {
      setReviewSubmitError(
        "Please log in before submitting a review."
      );
      return;
    }

    if (!reviewRating) {
      setReviewSubmitError(
        "Please select a rating."
      );
      return;
    }

    try {
      setReviewSubmitting(true);

      await submitReview(id, {
        user_id: user.user_id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      setReviewSuccess(
        "Your review was submitted successfully!"
      );

      setReviewRating(0);
      setHoverRating(0);
      setReviewComment("");

      await loadReviews();

      // Refresh restaurant data so the new
      // rating and review count appear.
      try {
        const updatedRestaurant =
          await fetchRestaurantById(id);

        setRestaurant(updatedRestaurant);
      } catch (error) {
        console.warn(
          "Could not refresh restaurant rating:",
          error
        );
      }

      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSuccess("");
      }, 1200);
    } catch (error) {
      console.error(
        "Failed to submit review:",
        error
      );

      setReviewSubmitError(
        error?.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setReviewSubmitting(false);
    }
  }

  // ----------------------------------------------------------
  // HELPERS
  // ----------------------------------------------------------

  function renderStars(rating, size = 16) {
    return (
      <div className="restaurant-review-stars">
        {[1, 2, 3, 4, 5].map((starNumber) => (
          <Star
            key={starNumber}
            size={size}
            fill={
              starNumber <=
              Math.round(Number(rating || 0))
                ? "currentColor"
                : "none"
            }
          />
        ))}
      </div>
    );
  }

  function formatReviewDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (loadingRestaurant) {
    return (
      <section className="restaurant-details-page">
        <div className="restaurant-details-container">
          <div className="restaurant-details-loading">
            Loading restaurant...
          </div>
        </div>
      </section>
    );
  }

  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  if (
    restaurantError ||
    !restaurant
  ) {
    return (
      <section className="restaurant-details-page">
        <div className="restaurant-details-container">
          <div className="restaurant-details-error">
            {restaurantError ||
              "Restaurant not found."}
          </div>

          <Link
            to="/restaurants"
            className="restaurant-details-back-btn"
          >
            <ArrowLeft size={17} />
            Back to Restaurants
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="restaurant-details-page">
      <div className="restaurant-details-container">

        {/* ==================================================
            BACK BUTTON
        ================================================== */}

        <Link
          to="/restaurants"
          className="restaurant-details-back-btn"
        >
          <ArrowLeft size={17} />
          Back to Restaurants
        </Link>

        {/* ==================================================
            HERO
        ================================================== */}

        <div className="restaurant-details-hero">

          <div className="restaurant-details-hero-image-wrap">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="restaurant-details-hero-image"
            />
          </div>

          <div className="restaurant-details-hero-content">

            <div className="restaurant-details-eyebrow">
              {restaurant.cuisine}
            </div>

            <h1 className="restaurant-details-title">
              {restaurant.name}
            </h1>

            <p className="restaurant-details-description">
              {restaurant.description ||
                "Discover delicious food, comfortable dining and memorable experiences."}
            </p>

            <div className="restaurant-details-meta">

              <div className="restaurant-details-meta-item">
                <MapPin size={17} />
                <span>
                  {restaurant.area},{" "}
                  {restaurant.city}
                </span>
              </div>

              <div className="restaurant-details-meta-item">
                <Clock3 size={17} />
                <span>
                  {restaurant.openingTime} –{" "}
                  {restaurant.closingTime}
                </span>
              </div>

              <div className="restaurant-details-rating">
                <Star
                  size={17}
                  fill="currentColor"
                />
                <strong>
                  {Number(
                    restaurant.rating || 0
                  ).toFixed(1)}
                </strong>

                <span>
                  ({restaurant.totalReviews || 0}{" "}
                  reviews)
                </span>
              </div>

            </div>

            <div className="restaurant-details-hero-actions">

              <Link
                to={`/restaurants/${restaurant.id}/book`}
                className="restaurant-details-book-btn"
              >
                <CalendarDays size={18} />
                Book a Table
              </Link>

              <button
                type="button"
                className="restaurant-details-review-btn"
                onClick={openReviewModal}
              >
                <Star size={17} />
                Write a Review
              </button>

            </div>

          </div>
        </div>

        {/* ==================================================
            ABOUT
        ================================================== */}

        <section className="restaurant-details-section">

          <div className="restaurant-details-section-heading">
            <div>
              <span className="restaurant-details-section-eyebrow">
                About
              </span>

              <h2>
                About this restaurant
              </h2>
            </div>
          </div>

          <p className="restaurant-details-about">
            {restaurant.description ||
              `${restaurant.name} offers a welcoming dining experience with ${restaurant.cuisine} cuisine in ${restaurant.city}.`}
          </p>

          <div className="restaurant-details-info-grid">

            <div className="restaurant-details-info-card">
              <span>Food Type</span>
              <strong>
                {restaurant.foodType}
              </strong>
            </div>

            <div className="restaurant-details-info-card">
              <span>Average for Two</span>
              <strong>
                ₹
                {Number(
                  restaurant.priceForTwo || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="restaurant-details-info-card">
              <span>Opening Hours</span>
              <strong>
                {restaurant.openingTime} –{" "}
                {restaurant.closingTime}
              </strong>
            </div>

            <div className="restaurant-details-info-card">
              <span>Booking</span>
              <strong>
                {restaurant.isInstantBooking
                  ? "Instant Booking"
                  : "Reservation Required"}
              </strong>
            </div>

          </div>
        </section>

        {/* ==================================================
            MENU
        ================================================== */}

        <section className="restaurant-details-section">

          <div className="restaurant-details-section-heading">

            <div>
              <span className="restaurant-details-section-eyebrow">
                Menu
              </span>

              <h2>
                Explore the menu
              </h2>
            </div>

            <div className="restaurant-details-menu-count">
              {menuItems.length}{" "}
              {menuItems.length === 1
                ? "item"
                : "items"}
            </div>

          </div>

          {menuCategories.length > 1 && (
            <div className="restaurant-menu-category-list">

              {menuCategories.map(
                (category) => {

                  const count =
                    category === "All"
                      ? menuItems.length
                      : menuItems.filter(
                          (item) =>
                            item.category ===
                            category
                        ).length;

                  return (
                    <button
                      type="button"
                      key={category}
                      className={`restaurant-menu-category-btn ${
                        selectedCategory ===
                        category
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                    >
                      {category}
                      <span>{count}</span>
                    </button>
                  );
                }
              )}

            </div>
          )}

          {menuLoading && (
            <div className="restaurant-menu-loading">
              Loading menu...
            </div>
          )}

          {menuError && (
            <div className="restaurant-menu-error">
              {menuError}
            </div>
          )}

          {!menuLoading &&
            !menuError &&
            filteredMenuItems.length === 0 && (
              <div className="restaurant-menu-empty">
                <Utensils size={28} />
                <h3>
                  No menu items available
                </h3>
                <p>
                  This restaurant has not added
                  items to this category yet.
                </p>
              </div>
            )}

          {!menuLoading &&
            filteredMenuItems.length > 0 && (
              <div className="restaurant-menu-grid">

                {filteredMenuItems.map(
                  (item) => (
                    <button
                      type="button"
                      className="restaurant-menu-card"
                      key={item.id}
                      onClick={() =>
                        setSelectedMenuItem(
                          item
                        )
                      }
                      aria-label={`View details for ${item.name}`}
                    >

                      <div className="restaurant-menu-card-image-wrap">

                        <img
                          src={item.image}
                          alt={item.name}
                          className="restaurant-menu-card-image"
                        />

                        <span className="restaurant-menu-card-category">
                          {item.category}
                        </span>

                      </div>

                      <div className="restaurant-menu-card-content">

                        <div className="restaurant-menu-card-title-row">

                          <h3>
                            {item.name}
                          </h3>

                          <span className="restaurant-menu-card-price">
                            ₹
                            {Number(
                              item.price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                        </div>

                        <p>
                          {item.description ||
                            "Deliciously prepared with fresh ingredients."}
                        </p>

                        <div className="restaurant-menu-card-footer">

                          <span
                            className={
                              item.isVeg
                                ? "restaurant-menu-card-veg"
                                : "restaurant-menu-card-nonveg"
                            }
                          >
                            {item.isVeg
                              ? "VEG"
                              : "NON-VEG"}
                          </span>

                          <span className="restaurant-menu-card-view">
                            View details
                          </span>

                        </div>

                      </div>
                    </button>
                  )
                )}

              </div>
            )}

        </section>

        {/* ==================================================
            REVIEWS
        ================================================== */}

        <section className="restaurant-details-section restaurant-reviews-section">

          <div className="restaurant-details-section-heading">

            <div>
              <span className="restaurant-details-section-eyebrow">
                Reviews
              </span>

              <h2>
                What customers say
              </h2>
            </div>

            <button
              type="button"
              className="restaurant-details-review-btn"
              onClick={openReviewModal}
            >
              <Star size={17} />
              Write a Review
            </button>

          </div>

          {reviewsLoading && (
            <div className="restaurant-reviews-loading">
              Loading reviews...
            </div>
          )}

          {reviewsError && (
            <div className="restaurant-reviews-error">
              {reviewsError}
            </div>
          )}

          {!reviewsLoading &&
            !reviewsError &&
            reviews.length === 0 && (
              <div className="restaurant-reviews-empty">

                <div className="restaurant-reviews-empty-icon">
                  <Star size={28} />
                </div>

                <h3>
                  No reviews yet
                </h3>

                <p>
                  Be the first customer to
                  share your experience.
                </p>

                <button
                  type="button"
                  className="restaurant-details-review-btn"
                  onClick={openReviewModal}
                >
                  <Star size={17} />
                  Write the First Review
                </button>

              </div>
            )}

          {!reviewsLoading &&
            reviews.length > 0 && (
              <div className="restaurant-reviews-list">

                {reviews.map((review) => (
                  <article
                    className="restaurant-review-card"
                    key={
                      review.review_id ||
                      review.id
                    }
                  >

                    <div className="restaurant-review-card-top">

                      <div className="restaurant-review-user">

                        <div className="restaurant-review-avatar">

                          {review.user_profile ? (
                            <img
                              src={
                                review.user_profile
                              }
                              alt={
                                review.user_name ||
                                "Customer"
                              }
                            />
                          ) : (
                            (
                              review.user_name ||
                              "C"
                            )
                              .charAt(0)
                              .toUpperCase()
                          )}

                        </div>

                        <div>
                          <h3>
                            {review.user_name ||
                              "Customer"}
                          </h3>

                          {review.created_at && (
                            <span>
                              {formatReviewDate(
                                review.created_at
                              )}
                            </span>
                          )}
                        </div>

                      </div>

                      <div className="restaurant-review-rating">

                        {renderStars(
                          review.rating,
                          15
                        )}

                        <strong>
                          {review.rating}/5
                        </strong>

                      </div>

                    </div>

                    {review.comment && (
                      <p className="restaurant-review-comment">
                        “{review.comment}”
                      </p>
                    )}

                  </article>
                ))}

              </div>
            )}

        </section>

        {/* ==================================================
            FINAL BOOKING CTA
        ================================================== */}

        <section className="restaurant-details-final-cta">

          <div>
            <span>
              Ready for a great meal?
            </span>

            <h2>
              Reserve your table at{" "}
              {restaurant.name}
            </h2>
          </div>

          <Link
            to={`/restaurants/${restaurant.id}/book`}
            className="restaurant-details-book-btn"
          >
            <CalendarDays size={18} />
            Book a Table
          </Link>

        </section>

      </div>

      {/* ====================================================
          FOOD DETAIL MODAL
      ==================================================== */}

      {selectedMenuItem && (
        <div
          className="restaurant-food-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedMenuItem(null);
            }
          }}
        >
          <div
            className="restaurant-food-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="restaurant-food-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="restaurant-food-modal-close"
              onClick={() =>
                setSelectedMenuItem(null)
              }
              aria-label="Close food details"
            >
              <X size={20} />
            </button>

            <img
              src={selectedMenuItem.image}
              alt={selectedMenuItem.name}
              className="restaurant-food-modal-image"
            />

            <div className="restaurant-food-modal-content">

              <span className="restaurant-food-modal-category">
                {selectedMenuItem.category}
              </span>

              <div className="restaurant-food-modal-title-row">

                <h2 id="restaurant-food-modal-title">
                  {selectedMenuItem.name}
                </h2>

                <span className="restaurant-food-modal-price">
                  ₹
                  {Number(
                    selectedMenuItem.price
                  ).toLocaleString("en-IN")}
                </span>

              </div>

              <div className="restaurant-food-modal-badges">

                <span
                  className={
                    selectedMenuItem.isVeg
                      ? "restaurant-menu-card-veg"
                      : "restaurant-menu-card-nonveg"
                  }
                >
                  {selectedMenuItem.isVeg
                    ? "VEG"
                    : "NON-VEG"}
                </span>

                <span className="restaurant-food-modal-available">
                  Available
                </span>

              </div>

              {selectedMenuItem.description && (
                <div className="restaurant-food-modal-section">

                  <h3>
                    About this dish
                  </h3>

                  <p>
                    {
                      selectedMenuItem.description
                    }
                  </p>

                </div>
              )}

              {selectedMenuItem.ingredients && (
                <div className="restaurant-food-modal-section">

                  <h3>
                    Ingredients
                  </h3>

                  <p>
                    {
                      selectedMenuItem.ingredients
                    }
                  </p>

                </div>
              )}

              <div className="restaurant-food-modal-details">

                {selectedMenuItem.spiceLevel && (
                  <div className="restaurant-food-modal-detail">
                    <span>
                      Spice Level
                    </span>
                    <strong>
                      {
                        selectedMenuItem.spiceLevel
                      }
                    </strong>
                  </div>
                )}

                {selectedMenuItem.dietaryInfo && (
                  <div className="restaurant-food-modal-detail">
                    <span>
                      Dietary Info
                    </span>
                    <strong>
                      {
                        selectedMenuItem.dietaryInfo
                      }
                    </strong>
                  </div>
                )}

              </div>

              <div className="restaurant-food-modal-actions">

                <button
                  type="button"
                  className="restaurant-food-modal-secondary-btn"
                  onClick={() =>
                    setSelectedMenuItem(null)
                  }
                >
                  Close
                </button>

                <Link
                  to={`/restaurants/${restaurant.id}/book`}
                  className="restaurant-food-modal-book-btn"
                  onClick={() =>
                    setSelectedMenuItem(null)
                  }
                >
                  <CalendarDays size={17} />
                  Book a Table
                </Link>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          REVIEW MODAL
      ==================================================== */}

      {showReviewModal && (
        <div
          className="restaurant-review-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeReviewModal();
            }
          }}
        >

          <div
            className="restaurant-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="restaurant-review-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="restaurant-review-modal-close"
              onClick={closeReviewModal}
              disabled={reviewSubmitting}
              aria-label="Close review form"
            >
              <X size={20} />
            </button>

            <div className="restaurant-review-modal-header">

              <span>
                Share your experience
              </span>

              <h2 id="restaurant-review-modal-title">
                Review {restaurant.name}
              </h2>

              <p>
                Your feedback helps other
                customers make better choices.
              </p>

            </div>

            <form
              className="restaurant-review-form"
              onSubmit={handleSubmitReview}
            >

              <div className="restaurant-review-rating-input">

                <label>
                  Your rating
                </label>

                <div
                  className="restaurant-review-rating-buttons"
                  onMouseLeave={() =>
                    setHoverRating(0)
                  }
                >

                  {[1, 2, 3, 4, 5].map(
                    (starNumber) => (
                      <button
                        type="button"
                        key={starNumber}
                        className={
                          starNumber <=
                          (hoverRating ||
                            reviewRating)
                            ? "active"
                            : ""
                        }
                        onMouseEnter={() =>
                          setHoverRating(
                            starNumber
                          )
                        }
                        onClick={() =>
                          setReviewRating(
                            starNumber
                          )
                        }
                        aria-label={`${starNumber} star`}
                      >
                        <Star
                          size={34}
                          fill="currentColor"
                        />
                      </button>
                    )
                  )}

                </div>

                <span className="restaurant-review-rating-label">
                  {reviewRating
                    ? `${reviewRating} out of 5`
                    : "Select a rating"}
                </span>

              </div>

              <div className="restaurant-review-field">

                <label htmlFor="restaurant-review-comment">
                  Your review
                </label>

                <textarea
                  id="restaurant-review-comment"
                  value={reviewComment}
                  onChange={(event) =>
                    setReviewComment(
                      event.target.value
                    )
                  }
                  placeholder="Tell us about the food, service, ambience..."
                  rows={5}
                  maxLength={1000}
                />

                <div className="restaurant-review-character-count">
                  {reviewComment.length}/1000
                </div>

              </div>

              {reviewSubmitError && (
                <div className="restaurant-review-submit-error">
                  {reviewSubmitError}
                </div>
              )}

              {reviewSuccess && (
                <div className="restaurant-review-submit-success">
                  {reviewSuccess}
                </div>
              )}

              <div className="restaurant-review-form-actions">

                <button
                  type="button"
                  className="restaurant-review-cancel-btn"
                  onClick={closeReviewModal}
                  disabled={reviewSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="restaurant-review-submit-btn"
                  disabled={reviewSubmitting}
                >
                  <Star size={17} />

                  {reviewSubmitting
                    ? "Submitting..."
                    : "Submit Review"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </section>
  );
}