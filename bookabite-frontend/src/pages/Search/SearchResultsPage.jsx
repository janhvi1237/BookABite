import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  HiOutlineLocationMarker,
  HiOutlineFilter,
  HiOutlineSparkles,
} from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import FoodMascot from '../../components/mascot/FoodMascot';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import FoodItemCard from '../../components/menu/FoodItemCard';
import FoodItemModal from '../../components/menu/FoodItemModal';
import RestaurantSearchInput from '../../components/restaurant/RestaurantSearchInput';
import { fetchRestaurants } from '../../api/restaurants';
import { fetchMenuItems } from '../../api/menu';
import { useMascot } from '../../context/MascotContext';
import './SearchResultsPage.css';

const CITIES = ['All Cities', 'Pune', 'Mumbai', 'Bengaluru', 'Delhi NCR'];

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { triggerReaction } = useMascot();

  const queryParam = searchParams.get('q') || searchParams.get('search') || '';
  const cityParam = searchParams.get('city') || 'All Cities';
  const cuisineParam = searchParams.get('cuisine') || '';

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'restaurants' | 'dishes'

  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState(null);

  useEffect(() => {
    setInputQuery(queryParam);
    setSelectedCity(cityParam);

    async function executeSearch() {
      try {
        setLoading(true);
        const cityFilter = cityParam !== 'All Cities' ? cityParam : undefined;

        const [restList, dishList] = await Promise.all([
          fetchRestaurants({
            search: queryParam,
            city: cityFilter,
            cuisine: cuisineParam || undefined,
          }),
          fetchMenuItems({
            search: queryParam,
          }),
        ]);

        setRestaurants(restList);
        setDishes(dishList);

        if (restList.length > 0 || dishList.length > 0) {
          triggerReaction('happy', `Found great bites matching "${queryParam || 'your search'}"!`, 3000);
        } else {
          triggerReaction('thinking', `Hmm, no direct matches for "${queryParam}". Try another dish or cuisine!`, 3500);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }

    executeSearch();
  }, [queryParam, cityParam, cuisineParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (inputQuery.trim()) params.set('q', inputQuery.trim());
    if (selectedCity && selectedCity !== 'All Cities') params.set('city', selectedCity);
    if (cuisineParam) params.set('cuisine', cuisineParam);
    setSearchParams(params);
  };

  const totalMatches = restaurants.length + dishes.length;

  return (
    <div className="bab-search-page">
      <div className="bab-search-container">
        {/* Search Hero Box */}
        <div className="bab-search-hero">
          <h2 className="bab-search-hero__title">
            Search Restaurants & Menus
          </h2>

          <form onSubmit={handleSearchSubmit} className="bab-search-bar-inline">
            <div className="bab-search-bar-inline__input-wrap">
              <RestaurantSearchInput
                id="results-search"
                className="bab-form-input"
                placeholder="Search by restaurant name, cuisine, or specific dish..."
                value={inputQuery}
                onChange={setInputQuery}
                city={selectedCity === 'All Cities' ? '' : selectedCity}
              />
            </div>

            <div className="bab-search-bar-inline__select-wrap">
              <select
                className="bab-form-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="bab-btn bab-btn--secondary">
              Search
            </button>
          </form>

          {queryParam && (
            <div style={{ marginTop: 16, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Showing results for <strong style={{ color: 'var(--color-primary)' }}>"{queryParam}"</strong>
              {selectedCity !== 'All Cities' && <span> in <strong>{selectedCity}</strong></span>}
              {' '}({totalMatches} matches found)
            </div>
          )}
        </div>

        {/* Tab switchers */}
        <div className="bab-search-tabs">
          <button
            type="button"
            className={`bab-search-tab-btn ${activeTab === 'all' ? 'bab-search-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Results ({totalMatches})
          </button>
          <button
            type="button"
            className={`bab-search-tab-btn ${activeTab === 'restaurants' ? 'bab-search-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            Restaurants ({restaurants.length})
          </button>
          <button
            type="button"
            className={`bab-search-tab-btn ${activeTab === 'dishes' ? 'bab-search-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('dishes')}
          >
            Dishes & Menus ({dishes.length})
          </button>
        </div>

        {loading ? (
          <PageLoader message="Discovering bites and restaurants..." />
        ) : totalMatches === 0 ? (
          <div className="bab-customer-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FoodMascot mood="thinking" size={90} />
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginTop: 16 }}>
              No matches found for "{queryParam}"
            </h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 460, margin: '8px auto 20px' }}>
              We couldn't find any restaurants or menu items matching your search. Try checking your spelling, selecting a broader city, or exploring popular cuisines.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/explore" className="bab-btn bab-btn--secondary">
                Explore All Restaurants
              </Link>
              <Link to="/menu" className="bab-btn bab-btn--outline">
                Browse Full Food Menu
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* RESTAURANTS SECTION */}
            {(activeTab === 'all' || activeTab === 'restaurants') && restaurants.length > 0 && (
              <section className="bab-search-results-section">
                <div className="bab-search-results-section__header">
                  <h3>Restaurants & Cafés ({restaurants.length})</h3>
                  {activeTab === 'all' && restaurants.length > 4 && (
                    <button
                      className="bab-link-action"
                      onClick={() => setActiveTab('restaurants')}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      View All Restaurants →
                    </button>
                  )}
                </div>

                <div className="bab-search-grid">
                  {(activeTab === 'all' ? restaurants.slice(0, 6) : restaurants).map((rest) => (
                    <RestaurantCard key={rest.id} restaurant={rest} />
                  ))}
                </div>
              </section>
            )}

            {/* DISHES SECTION */}
            {(activeTab === 'all' || activeTab === 'dishes') && dishes.length > 0 && (
              <section className="bab-search-results-section">
                <div className="bab-search-results-section__header">
                  <h3>Matching Dishes & Specialties ({dishes.length})</h3>
                  {activeTab === 'all' && dishes.length > 6 && (
                    <button
                      className="bab-link-action"
                      onClick={() => setActiveTab('dishes')}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      View All Dishes →
                    </button>
                  )}
                </div>

                <div className="bab-dishes-grid">
                  {(activeTab === 'all' ? dishes.slice(0, 8) : dishes).map((dish) => (
                    <FoodItemCard
                      key={dish.id}
                      item={dish}
                      onSelect={(item) => setSelectedDish(item)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Food item modal */}
        {selectedDish && (
          <FoodItemModal
            item={selectedDish}
            onClose={() => setSelectedDish(null)}
          />
        )}
      </div>
    </div>
  );
}
