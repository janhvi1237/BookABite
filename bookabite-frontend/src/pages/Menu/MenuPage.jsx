import React, { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineSparkles, HiOutlineFilter } from 'react-icons/hi';
import FoodItemCard from '../../components/menu/FoodItemCard';
import FoodItemModal from '../../components/menu/FoodItemModal';
import { MenuSkeleton } from '../../components/common/RestaurantCardSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { fetchGlobalMenu } from '../../api/menu';
import { useMascot } from '../../context/MascotContext';
import './MenuPage.css';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

export default function MenuPage() {
  const { triggerReaction } = useMascot();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState(''); // '' | 'true' | 'false'

  const [activeItemModal, setActiveItemModal] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadMenu() {
      try {
        setLoading(true);
        const params = {
          category: selectedCategory === 'All' ? '' : selectedCategory,
          search: searchQuery,
          isVeg: vegFilter,
        };
        const data = await fetchGlobalMenu(params);
        if (active) setItems(data);
      } catch (err) {
        console.error("Failed to load menu:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMenu();
    return () => { active = false; };
  }, [selectedCategory, searchQuery, vegFilter]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    triggerReaction('thinking', `Showing delightful ${cat} options across Pune!`, 3000);
  };

  return (
    <div className="bab-menu-page">
      <div className="bab-menu-hero">
        <div className="bab-container">
          <span className="bab-section-eyebrow">CURATED MENUS</span>
          <h1 className="bab-menu-title">Artisan Menus & Delicacies</h1>
          <p className="bab-menu-subtitle">
            Explore chef-curated appetizers, slow-simmered mains, and handcrafted desserts prepared by top restaurants in Pune.
          </p>

          {/* CONTROLS */}
          <div className="bab-menu-controls">
            <div className="bab-menu-search">
              <HiOutlineSearch size={18} className="bab-menu-search-icon" />
              <input
                type="text"
                placeholder="Search food by name, spice, or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* VEG / NON-VEG TOGGLE */}
            <div className="bab-dietary-pills">
              <button
                type="button"
                className={`bab-dietary-pill ${vegFilter === '' ? 'bab-dietary-pill--active' : ''}`}
                onClick={() => setVegFilter('')}
              >
                All Diets
              </button>
              <button
                type="button"
                className={`bab-dietary-pill ${vegFilter === 'true' ? 'bab-dietary-pill--active' : ''}`}
                onClick={() => setVegFilter('true')}
              >
                🌱 Veg Only
              </button>
              <button
                type="button"
                className={`bab-dietary-pill ${vegFilter === 'false' ? 'bab-dietary-pill--active' : ''}`}
                onClick={() => setVegFilter('false')}
              >
                🍗 Non-Veg
              </button>
            </div>
          </div>

          {/* CATEGORY TABS */}
          <div className="bab-menu-categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`bab-menu-cat-btn ${selectedCategory === cat ? 'bab-menu-cat-btn--active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ITEMS GRID */}
      <div className="bab-container" style={{ marginTop: 36 }}>
        {loading ? (
          <MenuSkeleton />
        ) : items.length > 0 ? (
          <div className="bab-global-menu-grid">
            {items.map((item) => (
              <FoodItemCard
                key={item.item_id}
                item={item}
                onSelect={(selected) => setActiveItemModal(selected)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No dishes found"
            message="We couldn't find any dishes matching your dietary or search criteria. Try a different keyword or category."
            actionLabel="View All Dishes"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setVegFilter('');
            }}
            mood="thinking"
          />
        )}
      </div>

      {/* FOOD ITEM MODAL */}
      {activeItemModal && (
        <FoodItemModal
          item={activeItemModal}
          onClose={() => setActiveItemModal(null)}
        />
      )}
    </div>
  );
}
