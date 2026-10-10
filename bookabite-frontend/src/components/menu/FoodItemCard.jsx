import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiStar, HiOutlineHeart, HiHeart } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../common/Toast';
import './FoodItemCard.css';

export default function FoodItemCard({ item, onSelect, isSelected = false }) {
  const { isAuthenticated } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(false);

  const handleCardClick = () => {
    if (onSelect) onSelect(item);
    triggerReaction('serving', `You'll love the ${item.name}! `, 3500);
  };

  const handleFav = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please log in to save favourite dishes', 'info');
      navigate('/login');
      return;
    }

    setIsFav((prev) => !prev);
    if (!isFav) {
      triggerReaction('happy', `Saved ${item.name} to your cravings!`, 3000);
      showToast(`Saved ${item.name} to favourites`, 'success');
    } else {
      showToast(`Removed from favourites`, 'info');
    }
  };

  return (
    <div
      className={`bab-food-card ${isSelected ? 'bab-food-card--selected' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(); }}
    >
      <div className="bab-food-card__media">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
          alt={item.name}
          className="bab-food-card__img"
          loading="lazy"
        />
        <div className="bab-food-card__dietary">
          <span className={`bab-food-diet-tag ${item.is_veg ? 'bab-food-diet-tag--veg' : 'bab-food-diet-tag--nonveg'}`}>
            <span className="bab-food-diet-dot" />
          </span>
          {item.spice_level && (
            <span className="bab-badge bab-badge--terracotta" style={{ fontSize: '0.7rem' }}>
              🌶️ {item.spice_level}
            </span>
          )}
        </div>

        <button
          type="button"
          className={`bab-food-card__fav ${isFav ? 'bab-food-card__fav--active' : ''}`}
          onClick={handleFav}
          aria-label="Favorite dish"
        >
          {isFav ? <HiHeart size={18} /> : <HiOutlineHeart size={18} />}
        </button>
      </div>

      <div className="bab-food-card__body">
        <div className="bab-food-card__header">
          <h4 className="bab-food-card__title">{item.name}</h4>
          <div className="bab-food-card__rating">
            <HiStar size={14} color="#E9B44C" />
            <span>{Number(item.rating || 4.5).toFixed(1)}</span>
          </div>
        </div>

        <p className="bab-food-card__desc">
          {item.description || 'Artisan preparation crafted with farm-fresh ingredients.'}
        </p>

        {item.dietary_info && (
          <span className="bab-food-card__diet-info">
            ✨ {item.dietary_info}
          </span>
        )}

        <div className="bab-food-card__footer">
          <span className="bab-food-card__price">₹{Number(item.price).toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
