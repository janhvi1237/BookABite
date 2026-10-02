import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiStar, HiHeart, HiOutlineHeart, HiOutlineSparkles, HiOutlineLocationMarker } from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import { ErrorState } from '../../components/common/ErrorState';
import FoodMascot from '../../components/mascot/FoodMascot';
import { fetchDishById } from '../../api/menu';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import './FoodDetailsPage.css';

export default function FoodDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadDish() {
      try {
        setLoading(true);
        const data = await fetchDishById(id);
        if (active) setDish(data);
      } catch (err) {
        if (active) setError("Could not find this delicacy.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDish();
    return () => { active = false; };
  }, [id]);

  const handleFavorite = () => {
    setIsFav((prev) => !prev);
    if (!isFav) {
      triggerReaction('happy', `Saved ${dish.name} to cravings!`, 3000);
      showToast(`Saved ${dish.name} to favourites`, 'success');
    }
  };

  const handleBookTable = () => {
    triggerReaction('excited', `Chef Pierre is setting up a table at ${dish.restaurant?.name || 'the restaurant'}!`, 4000);
    navigate(`/restaurants/${dish.restaurant_id}/book`);
  };

  if (loading) return <PageLoader text="Plating your chosen delicacy..." />;
  if (error || !dish) {
    return (
      <div className="bab-container" style={{ padding: '60px 0' }}>
        <ErrorState
          title="Dish Not Found"
          message="We couldn't locate this food item. It might be a seasonal special that has completed its rotation."
          onRetry={() => navigate("/menu")}
        />
      </div>
    );
  }

  return (
    <div className="bab-food-details-page">
      <div className="bab-container">
        <button
          type="button"
          className="bab-back-btn"
          onClick={() => navigate(-1)}
        >
          <HiArrowLeft size={16} /> Back
        </button>

        <div className="bab-food-details-grid">
          {/* FOOD IMAGE MEDIA */}
          <div className="bab-food-details-media">
            <img
              src={dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
              alt={dish.name}
              className="bab-food-details-img"
            />
            <button
              type="button"
              className={`bab-food-details-fav ${isFav ? 'bab-food-details-fav--active' : ''}`}
              onClick={handleFavorite}
              aria-label="Save dish"
            >
              {isFav ? <HiHeart size={24} color="#D65A3A" /> : <HiOutlineHeart size={24} />}
            </button>
          </div>

          {/* FOOD INFO */}
          <div className="bab-food-details-info">
            <div className="bab-food-details-header">
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span className={`bab-food-diet-tag ${dish.is_veg ? 'bab-food-diet-tag--veg' : 'bab-food-diet-tag--nonveg'}`}>
                  <span className="bab-food-diet-dot" />
                </span>
                <span className="bab-badge bab-badge--gold">{dish.category}</span>
                {dish.dietary_info && (
                  <span className="bab-badge bab-badge--terracotta">{dish.dietary_info}</span>
                )}
              </div>

              <h1 className="bab-food-details-title">{dish.name}</h1>

              {dish.restaurant && (
                <Link to={`/restaurants/${dish.restaurant_id}`} className="bab-food-restaurant-link">
                  <HiOutlineLocationMarker size={16} />
                  <span>Served at <strong>{dish.restaurant.name}</strong> ({dish.restaurant.area}, {dish.restaurant.city})</span>
                </Link>
              )}
            </div>

            <div className="bab-food-details-price-row">
              <span className="bab-food-price">₹{Number(dish.price).toFixed(0)}</span>
              <div className="bab-food-rating">
                <HiStar size={18} color="#E9B44C" />
                <span>{Number(dish.rating || 4.8).toFixed(1)}</span>
                <small>(Guest Favorite)</small>
              </div>
            </div>

            <p className="bab-food-description">{dish.description}</p>

            {/* INGREDIENTS & SPICE */}
            <div className="bab-food-meta-box">
              <div className="bab-food-meta-field">
                <strong>Spice Level:</strong>
                <span>🌶️ {dish.spice_level || 'Medium'}</span>
              </div>
              {dish.ingredients && (
                <div className="bab-food-meta-field">
                  <strong>Fresh Ingredients:</strong>
                  <span>{dish.ingredients}</span>
                </div>
              )}
            </div>

            {/* CHEF PIERRE NOTE */}
            <div className="bab-food-mascot-box">
              <FoodMascot mood="serving" size={75} />
              <div>
                <h4>Chef Pierre&apos;s Recommendation</h4>
                <p>
                  &ldquo;This specialty is prepared fresh upon table arrival. Pair it with an iced cold brew or house mocktail for the ultimate bite!&rdquo;
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="bab-food-actions-row">
              <button
                type="button"
                className="bab-btn bab-btn--secondary bab-food-book-cta"
                onClick={handleBookTable}
              >
                Reserve a Table
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
