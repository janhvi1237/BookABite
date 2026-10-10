import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineAdjustments, HiOutlineRefresh } from 'react-icons/hi';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import FilterPanel from '../../components/restaurant/FilterPanel';
import MobileFilterDrawer from '../../components/restaurant/MobileFilterDrawer';
import { RestaurantCardSkeleton } from '../../components/common/RestaurantCardSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import RestaurantSearchInput from '../../components/restaurant/RestaurantSearchInput';
import { fetchRestaurants } from '../../api/restaurants';
import { useMascot } from '../../context/MascotContext';
import './ExplorePage.css';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { triggerReaction } = useMascot();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Filter state synced with URL params where applicable
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    cuisine: searchParams.get('cuisine') || '',
    foodType: searchParams.get('foodType') || '',
    minRating: searchParams.get('minRating') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    amenity: searchParams.get('amenity') || '',
    sortBy: searchParams.get('sortBy') || 'rating_desc',
  });

  // Sync URL when query changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.city) params.set('city', filters.city);
    if (filters.cuisine) params.set('cuisine', filters.cuisine);
    if (filters.foodType) params.set('foodType', filters.foodType);
    if (filters.minRating) params.set('minRating', filters.minRating);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.amenity) params.set('amenity', filters.amenity);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch restaurants
  useEffect(() => {
    let isCurrent = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchRestaurants(filters);
        if (isCurrent) setRestaurants(data);
      } catch (err) {
        console.error("Failed to load restaurants:", err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }
    loadData();
    return () => { isCurrent = false; };
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      city: '',
      cuisine: '',
      foodType: '',
      minRating: '',
      maxPrice: '',
      amenity: '',
      sortBy: 'rating_desc',
    });
    triggerReaction('happy', "Reset all filters! Showing all restaurants in Pune.", 3000);
  };

  return (
    <div className="bab-explore-page">
      <div className="bab-explore-hero">
        <div className="bab-container">
          <span className="bab-section-eyebrow">RESTAURANTS & CAFÉS</span>
          <h1 className="bab-explore-title">Explore Culinary Destinations</h1>
          <p className="bab-explore-subtitle">
            From candlelit romantic bistros to sunny brunch garden cafés, discover top tables in Pune.
          </p>

          {/* SEARCH & SORT BAR */}
          <div className="bab-explore-controls">
            <div className="bab-explore-search-wrap">
              <HiOutlineSearch size={18} className="bab-explore-search-icon" />
              <RestaurantSearchInput
                id="explore-search"
                placeholder="Search by restaurant name, area, or keywords..."
                value={filters.search}
                onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
                city={filters.city}
                className="bab-explore-search-input"
              />
            </div>

            <div className="bab-explore-sort-wrap">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                className="bab-explore-sort-select"
              >
                <option value="rating_desc">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>

              <button
                type="button"
                className="bab-btn bab-btn--glass bab-mobile-filter-btn"
                onClick={() => setMobileDrawerOpen(true)}
              >
                <HiOutlineAdjustments size={18} /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bab-container bab-explore-layout">
        {/* DESKTOP SIDEBAR */}
        <div className="bab-explore-sidebar">
          <FilterPanel
            filters={filters}
            onChange={(newFilters) => setFilters(newFilters)}
            onReset={handleResetFilters}
          />
        </div>

        {/* MAIN RESULTS GRID */}
        <main className="bab-explore-results">
          <div className="bab-results-count">
            <span>
              Showing <strong>{loading ? '...' : restaurants.length}</strong> restaurants
            </span>
            {(filters.cuisine || filters.foodType || filters.amenity || filters.minRating || filters.maxPrice || filters.search) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="bab-clear-filters-btn"
              >
                Clear all filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="bab-explore-grid">
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
            </div>
          ) : restaurants.length > 0 ? (
            <div className="bab-explore-grid">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No restaurants found"
              message="We couldn't find any dining places matching your current filters. Try changing your cuisine or price preferences."
              actionLabel="Reset Filters"
              onAction={handleResetFilters}
              mood="thinking"
            />
          )}
        </main>
      </div>

      {/* MOBILE DRAWER */}
      <MobileFilterDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={handleResetFilters}
      />
    </div>
  );
}
