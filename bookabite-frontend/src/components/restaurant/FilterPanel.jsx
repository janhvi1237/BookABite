import React from 'react';
import { HiOutlineFilter, HiOutlineRefresh } from 'react-icons/hi';
import './FilterPanel.css';

const CUISINES = ['All', 'North Indian', 'Italian', 'Multi-Cuisine', 'Indian Fusion', 'Desserts', 'Café', 'Continental'];
const FOOD_TYPES = ['All', 'Pure Veg', 'Veg', 'Non-Veg'];
const AMENITIES = ['Outdoor Seating', 'Rooftop', 'Live Music', 'Couple Friendly', 'Pet Friendly', 'Parking', 'Wheelchair Accessible'];
const RATINGS = [
  { label: 'All Ratings', value: '' },
  { label: '4.5 & above ★', value: '4.5' },
  { label: '4.0 & above ★', value: '4.0' },
  { label: '3.5 & above ★', value: '3.5' },
];

export default function FilterPanel({ filters, onChange, onReset }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <aside className="bab-filter-panel">
      <div className="bab-filter-panel__header">
        <div className="bab-filter-panel__title">
          <HiOutlineFilter size={18} color="#D65A3A" />
          <span>Filters</span>
        </div>
        <button
          type="button"
          className="bab-filter-panel__reset"
          onClick={onReset}
          title="Reset all filters"
        >
          <HiOutlineRefresh size={14} /> Reset
        </button>
      </div>

      {/* CUISINE FILTER */}
      <div className="bab-filter-group">
        <h4 className="bab-filter-group__title">Cuisine</h4>
        <div className="bab-filter-pills">
          {CUISINES.map((c) => (
            <button
              key={c}
              type="button"
              className={`bab-filter-pill ${(!filters.cuisine && c === 'All') || filters.cuisine === c ? 'bab-filter-pill--active' : ''}`}
              onClick={() => handleChange('cuisine', c === 'All' ? '' : c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* FOOD TYPE FILTER */}
      <div className="bab-filter-group">
        <h4 className="bab-filter-group__title">Dietary Preference</h4>
        <div className="bab-filter-pills">
          {FOOD_TYPES.map((ft) => (
            <button
              key={ft}
              type="button"
              className={`bab-filter-pill ${(!filters.foodType && ft === 'All') || filters.foodType === ft ? 'bab-filter-pill--active' : ''}`}
              onClick={() => handleChange('foodType', ft === 'All' ? '' : ft)}
            >
              {ft}
            </button>
          ))}
        </div>
      </div>

      {/* MIN RATING */}
      <div className="bab-filter-group">
        <h4 className="bab-filter-group__title">Rating</h4>
        <div className="bab-filter-radios">
          {RATINGS.map((r) => (
            <label key={r.label} className="bab-filter-radio">
              <input
                type="radio"
                name="rating"
                value={r.value}
                checked={filters.minRating === r.value || (!filters.minRating && r.value === '')}
                onChange={(e) => handleChange('minRating', e.target.value)}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* MAX BUDGET */}
      <div className="bab-filter-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <h4 className="bab-filter-group__title" style={{ margin: 0 }}>Max Budget (for two)</h4>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--bab-secondary)' }}>
            {filters.maxPrice ? `₹${filters.maxPrice}` : 'Any'}
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="3500"
          step="250"
          value={filters.maxPrice || 3500}
          onChange={(e) => handleChange('maxPrice', e.target.value >= 3500 ? '' : e.target.value)}
          className="bab-filter-range"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--bab-text-muted)' }}>
          <span>₹500</span>
          <span>₹3500+</span>
        </div>
      </div>

      {/* AMENITIES */}
      <div className="bab-filter-group">
        <h4 className="bab-filter-group__title">Amenities</h4>
        <div className="bab-filter-pills">
          {AMENITIES.map((a) => (
            <button
              key={a}
              type="button"
              className={`bab-filter-pill ${filters.amenity === a ? 'bab-filter-pill--active' : ''}`}
              onClick={() => handleChange('amenity', filters.amenity === a ? '' : a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
