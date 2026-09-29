import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineSearch,
} from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import FoodMascot from '../../components/mascot/FoodMascot';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import { fetchFavorites } from '../../api/favorites';
import './CustomerPages.css';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login?redirect=/favorites');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchFavorites(user.user_id || user.id);
        setFavorites(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load favorites:', err);
        showToast('Unable to load saved restaurants.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated, user, navigate]);

  const handleFavoriteChange = (restaurantId, isFav) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((r) => r.id !== restaurantId));
    }
  };

  const filteredFavorites = favorites.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.cuisine && r.cuisine.toLowerCase().includes(q)) ||
      (r.area && r.area.toLowerCase().includes(q))
    );
  });

  if (loading) return <PageLoader message="Loading your favorite spots..." />;

  return (
    <div className="bab-customer-page">
      <div className="bab-customer-container">
        {/* Customer Header */}
        <div className="bab-customer-header">
          <div className="bab-customer-header__left">
            <div className="bab-customer-header__info">
              <h1>Saved Cravings & Favorites</h1>
              <p>Your curated collection of beloved cafés, bakeries, and dining lounges.</p>
            </div>
          </div>
          <div>
            <Link to="/explore" className="bab-btn bab-btn--secondary">
              Find More Venues
            </Link>
          </div>
        </div>

        {/* Customer Nav Tabs */}
        <div className="bab-customer-nav-tabs">
          <Link to="/profile" className="bab-customer-nav-tab">
            <HiOutlineUser size={18} /> My Profile
          </Link>
          <Link to="/my-bookings" className="bab-customer-nav-tab">
            <HiOutlineCalendar size={18} /> My Bookings
          </Link>
          <Link to="/favorites" className="bab-customer-nav-tab bab-customer-nav-tab--active">
            <HiOutlineHeart size={18} /> Saved Places ({favorites.length})
          </Link>
        </div>

        {/* Search input if multiple favorites */}
        {favorites.length > 3 && (
          <div style={{ marginBottom: 24, maxWidth: 360, position: 'relative' }}>
            <HiOutlineSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search saved places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bab-form-input"
              style={{ paddingLeft: 34, fontSize: '0.85rem' }}
            />
          </div>
        )}

        {/* Favorites Grid */}
        {filteredFavorites.length > 0 ? (
          <div className="bab-favorites-grid">
            {filteredFavorites.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFavoritedInitially={true}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        ) : (
          <div className="bab-customer-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FoodMascot mood="thinking" size={80} />
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginTop: 16 }}>
              {searchQuery ? 'No matching saved restaurants' : 'No favorites saved yet'}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 440, margin: '8px auto 20px' }}>
              {searchQuery
                ? 'Try a different search keyword or clear the filter.'
                : 'Whenever you see a café or restaurant you love, tap the heart icon to save it here for quick table reservations.'}
            </p>
            <Link to="/explore" className="bab-btn bab-btn--secondary">
              Explore Top Restaurants
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
