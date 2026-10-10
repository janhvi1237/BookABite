import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineLocationMarker,
  HiOutlineSearch,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiArrowRight,
  HiSparkles,
  HiOutlineShieldCheck,
  HiOutlineBadgeCheck,
  HiOutlineHeart,
} from 'react-icons/hi';
import HeroDiningIllustration from '../../components/home/HeroDiningIllustration';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import { RestaurantCardSkeleton } from '../../components/common/RestaurantCardSkeleton';
import FoodMascot from '../../components/mascot/FoodMascot';
import RestaurantSearchInput from '../../components/restaurant/RestaurantSearchInput';
import { fetchRestaurants } from '../../api/restaurants';
import { useMascot } from '../../context/MascotContext';
import './HomePage.css';

const ROTATING_PHRASES = [
  "Find Your Next Perfect Bite.",
  "Your Perfect Café Awaits.",
  "Discover Flavours Near You.",
  "Book. Bite. Enjoy.",
];

const CUISINES_LIST = [
  { name: 'North Indian', img: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=80', count: '14 places' },
  { name: 'Italian', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80', count: '8 places' },
  { name: 'Café & Coffee', img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80', count: '12 places' },
  { name: 'Indian Fusion', img: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=500&auto=format&fit=crop&q=80', count: '6 places' },
  { name: 'Desserts & Bakes', img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80', count: '9 places' },
  { name: 'Pure Veg', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80', count: '10 places' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { triggerReaction } = useMascot();

  // Rotating headline
  const [headlineIndex, setHeadlineIndex] = useState(0);

  // Search inputs
  const [searchLocation, setSearchLocation] = useState('Pune');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchGuests, setSearchGuests] = useState('2');

  // Featured restaurants from backend
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadFeatured() {
      try {
        setLoading(true);
        const data = await fetchRestaurants({ city: 'Pune' });
        if (active) setRestaurants(data);
      } catch (err) {
        console.error("Failed to load featured restaurants:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadFeatured();
    return () => { active = false; };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    triggerReaction('thinking', `Searching best tables for ${searchGuests} guests in ${searchLocation}...`, 3500);
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (searchLocation) params.append('city', searchLocation);
    if (searchDate) params.append('date', searchDate);
    if (searchGuests) params.append('guests', searchGuests);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="bab-home">
      {/* =====================================================
          HERO SECTION + 3D CANVAS
      ===================================================== */}
      <section className="bab-home-hero">
        <div className="bab-container bab-home-hero__grid">
          <div className="bab-home-hero__content">
            <div className="bab-home-hero__eyebrow">
              <HiSparkles size={16} color="#D65A3A" />
              <span>Pune&apos;s Boutique Dining Platform</span>
            </div>

            <h1 className="bab-home-hero__headline">
              {ROTATING_PHRASES[headlineIndex]}
            </h1>

            <p className="bab-home-hero__subheading">
              Discover the best cafés and restaurants, explore delicious menus, and reserve your perfect table in just a few clicks.
            </p>

            <div className="bab-home-hero__cta-group">
              <Link to="/explore" className="bab-btn bab-btn--secondary">
                Explore Restaurants <HiArrowRight size={16} />
              </Link>
              <Link to="/menu" className="bab-btn bab-btn--outline">
                Browse Menus
              </Link>
            </div>

            {/* QUICK STATS */}
            <div className="bab-home-hero__stats">
              <div className="bab-home-stat">
                <strong>100%</strong>
                <span>Verified Tables</span>
              </div>
              <div className="bab-home-stat__divider" />
              <div className="bab-home-stat">
                <strong>Easy</strong>
                <span>Table Reservations</span>
              </div>
              <div className="bab-home-stat__divider" />
              <div className="bab-home-stat">
                <strong>Instant</strong>
                <span>Booking Confirmations</span>
              </div>
            </div>
          </div>

          {/* HERO FOOD ILLUSTRATION */}
          <div className="bab-home-hero__visual-wrap">
            <HeroDiningIllustration />
          </div>
        </div>

        {/* ELEGANT SEARCH BAR */}
        <div className="bab-container">
          <form className="bab-hero-search-bar" onSubmit={handleSearch}>
            <div className="bab-search-field">
              <HiOutlineLocationMarker size={20} className="bab-search-icon" />
              <div className="bab-search-field__inner">
                <label htmlFor="search-loc">Location</label>
                <input
                  id="search-loc"
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Koregaon Park, FC Road..."
                />
              </div>
            </div>

            <div className="bab-search-field__divider" />

            <div className="bab-search-field bab-search-field--wide">
              <HiOutlineSearch size={20} className="bab-search-icon" />
              <div className="bab-search-field__inner">
                <label htmlFor="search-query">Restaurant or Cuisine</label>
                <RestaurantSearchInput
                  id="search-query"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="e.g. The Spice Terrace, Italian, Coffee..."
                />
              </div>
            </div>

            <div className="bab-search-field__divider" />

            <div className="bab-search-field">
              <HiOutlineCalendar size={20} className="bab-search-icon" />
              <div className="bab-search-field__inner">
                <label htmlFor="search-date">Date</label>
                <input
                  id="search-date"
                  type="date"
                  value={searchDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
            </div>

            <div className="bab-search-field__divider" />

            <div className="bab-search-field">
              <HiOutlineUserGroup size={20} className="bab-search-icon" />
              <div className="bab-search-field__inner">
                <label htmlFor="search-guests">Guests</label>
                <select
                  id="search-guests"
                  value={searchGuests}
                  onChange={(e) => setSearchGuests(e.target.value)}
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="6">6+ Party</option>
                </select>
              </div>
            </div>

            <button type="submit" className="bab-btn bab-btn--secondary bab-search-submit">
              <HiOutlineSearch size={18} />
              <span>Search Tables</span>
            </button>
          </form>
        </div>
      </section>

      {/* =====================================================
          EXPLORE BY CUISINE
      ===================================================== */}
      <section className="bab-home-section">
        <div className="bab-container">
          <div className="bab-section-header">
            <div>
              <span className="bab-section-eyebrow">CURATED FLAVOURS</span>
              <h2 className="bab-section-title">Explore by Cuisine</h2>
            </div>
            <Link to="/explore" className="bab-section-link">
              View all cuisines <HiArrowRight size={16} />
            </Link>
          </div>

          <div className="bab-cuisines-grid">
            {CUISINES_LIST.map((cuisine) => (
              <div
                key={cuisine.name}
                className="bab-cuisine-card"
                onClick={() => {
                  triggerReaction('serving', `Filtering delicious ${cuisine.name} places for you!`, 3000);
                  navigate(`/explore?cuisine=${encodeURIComponent(cuisine.name)}`);
                }}
              >
                <img src={cuisine.img} alt={cuisine.name} className="bab-cuisine-card__img" loading="lazy" />
                <div className="bab-cuisine-card__overlay">
                  <h4 className="bab-cuisine-card__name">{cuisine.name}</h4>
                  <span className="bab-cuisine-card__count">{cuisine.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED RESTAURANTS (REAL BACKEND INTEGRATION)
      ===================================================== */}
      <section className="bab-home-section bab-home-section--alt">
        <div className="bab-container">
          <div className="bab-section-header">
            <div>
              <span className="bab-section-eyebrow">HANDPICKED EXPERIENCES</span>
              <h2 className="bab-section-title">Popular Restaurants Near You</h2>
            </div>
            <Link to="/explore" className="bab-section-link">
              Explore all restaurants <HiArrowRight size={16} />
            </Link>
          </div>

          <div className="bab-featured-grid">
            {loading ? (
              <>
                <RestaurantCardSkeleton />
                <RestaurantCardSkeleton />
                <RestaurantCardSkeleton />
                <RestaurantCardSkeleton />
              </>
            ) : restaurants.length > 0 ? (
              restaurants.slice(0, 6).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
                <p>No restaurants found. Please ensure backend is running.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section className="bab-home-section">
        <div className="bab-container">
          <div className="bab-how-it-works-box">
            <div className="bab-how-it-works__intro">
              <strong>Dining, made easy.</strong>
              <p>Discover a place you love, choose a time, and reserve your table in just a few steps.</p>
            </div>

            <div className="bab-how-steps">
              <div className="bab-how-step">
                <div className="bab-how-step__num">01</div>
                <h4>Discover Places</h4>
                <p>Explore high-res dish menus, guest reviews, ambiance photos, and real-time table availability.</p>
              </div>

              <div className="bab-how-step">
                <div className="bab-how-step__num">02</div>
                <h4>Select Date & Time</h4>
                <p>Choose your preferred seating time, seating area (rooftop, outdoor, indoor), and guest count.</p>
              </div>

              <div className="bab-how-step">
                <div className="bab-how-step__num">03</div>
                <h4>Instant Confirmation</h4>
                <p>Receive your digital reservation pass instantly with zero waiting lines and personalized dining.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RESTAURANT OWNER CTA BANNER
      ===================================================== */}
      <section className="bab-home-section bab-home-owner-banner">
        <div className="bab-container">
          <div className="bab-owner-banner-card">
            <div className="bab-owner-banner__text">
              <span className="bab-badge bab-badge--gold" style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
                FOR RESTAURANT OWNERS & CHEFS
              </span>
              <h2>Are you a Café or Restaurant Owner?</h2>
              <p>
                Grow your guest bookings, showcase your artisan food menu, manage reservations seamlessly, and delight food lovers across the city.
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
                <Link to="/owner/register" className="bab-btn bab-btn--gold">
                  Partner with Us
                </Link>
                <Link to="/owner/login" className="bab-btn bab-btn--outline bab-owner-signin">
                  Owner Sign In
                </Link>
              </div>
            </div>
            <div className="bab-owner-banner__media">
              <FoodMascot mood="celebrating" size={140} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
