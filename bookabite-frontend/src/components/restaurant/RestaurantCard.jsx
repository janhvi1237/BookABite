import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiStar, HiOutlineLocationMarker, HiOutlineHeart, HiHeart, HiOutlineClock, HiOutlineLightningBolt } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../common/Toast';
import { toggleFavorite } from '../../api/favorites';
import './RestaurantCard.css';

export default function RestaurantCard({ restaurant, isFavoritedInitially = false, onFavoriteChange }) {
  const { user, isAuthenticated } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isFav, setIsFav] = useState(isFavoritedInitially);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast("Please log in to save favourite restaurants", "info");
      navigate("/login");
      return;
    }

    setFavLoading(true);
    try {
      const res = await toggleFavorite(user.user_id, restaurant.id);
      setIsFav(res.is_favorite);
      if (res.is_favorite) {
        triggerReaction('happy', `Added ${restaurant.name} to your cravings! 💖`, 3500);
        showToast(`Added ${restaurant.name} to favourites`, "success");
      } else {
        showToast(`Removed from favourites`, "info");
      }
      if (onFavoriteChange) onFavoriteChange(restaurant.id, res.is_favorite);
    } catch {
      showToast("Could not update favourite status", "error");
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="bab-rest-card">
      <Link to={`/restaurants/${restaurant.id}`} className="bab-rest-card__media-wrap">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="bab-rest-card__img"
          loading="lazy"
        />
        <div className="bab-rest-card__badges">
          {restaurant.isInstantBooking && (
            <span className="bab-badge bab-badge--terracotta">
              <HiOutlineLightningBolt size={12} /> Instant Book
            </span>
          )}
          <span className="bab-badge bab-badge--gold">
            {restaurant.cuisine}
          </span>
        </div>

        <button
          type="button"
          className={`bab-rest-card__fav-btn ${isFav ? 'bab-rest-card__fav-btn--active' : ''}`}
          onClick={handleFavoriteClick}
          disabled={favLoading}
          aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
        >
          {isFav ? <HiHeart size={20} color="#D65A3A" /> : <HiOutlineHeart size={20} />}
        </button>
      </Link>

      <div className="bab-rest-card__body">
        <div className="bab-rest-card__header">
          <Link to={`/restaurants/${restaurant.id}`} className="bab-rest-card__title">
            {restaurant.name}
          </Link>
          <div className="bab-rest-card__rating">
            <HiStar size={16} color="#E9B44C" />
            <span>{restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}</span>
            <small>({restaurant.totalReviews})</small>
          </div>
        </div>

        <div className="bab-rest-card__meta">
          <span className="bab-rest-card__location">
            <HiOutlineLocationMarker size={15} /> {restaurant.area}, {restaurant.city}
          </span>
          <span className="bab-rest-card__sep">•</span>
          <span className="bab-rest-card__price">₹{restaurant.priceForTwo} for two</span>
        </div>

        {restaurant.amenities && restaurant.amenities.length > 0 && (
          <div className="bab-rest-card__amenities">
            {restaurant.amenities.slice(0, 3).map((amenity, i) => (
              <span key={i} className="bab-rest-card__amenity-tag">
                {amenity}
              </span>
            ))}
            {restaurant.amenities.length > 3 && (
              <span className="bab-rest-card__amenity-tag">
                +{restaurant.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="bab-rest-card__actions">
          <Link
            to={`/restaurants/${restaurant.id}`}
            className="bab-btn bab-btn--outline bab-rest-card__btn-view"
          >
            View Details
          </Link>
          <Link
            to={`/restaurants/${restaurant.id}/book`}
            className="bab-btn bab-btn--secondary bab-rest-card__btn-book"
          >
            Book Table
          </Link>
        </div>
      </div>
    </div>
  );
}
