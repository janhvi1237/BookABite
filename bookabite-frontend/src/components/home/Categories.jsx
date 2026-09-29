import React from 'react';
import { ArrowUpRight, Heart, Sparkles, Utensils, Wine, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Categories.css';

const categories = [
  {
    title: 'Date Night',
    description: 'Intimate tables and memorable evenings.',
    icon: Heart,
    query: 'date-night',
  },
  {
    title: 'Quick Bite',
    description: 'Good food when time is short.',
    icon: Utensils,
    query: 'quick-bite',
  },
  {
    title: 'Celebration',
    description: 'Tables worth raising a glass to.',
    icon: Sparkles,
    query: 'celebration',
  },
  {
    title: 'Work Meeting',
    description: 'Comfortable spaces for productive conversations.',
    icon: Utensils,
    query: 'work-meeting',
  },
  {
    title: 'Rooftop',
    description: 'Great food with an even better view.',
    icon: Wine,
    query: 'rooftop',
  },
  {
    title: 'Pure Veg',
    description: 'Thoughtful vegetarian dining.',
    icon: Leaf,
    query: 'pure-veg',
  },
];

export default function Categories() {
  const navigate = useNavigate();

  const handleCategoryClick = (query) => {
    navigate(`/explore?category=${encodeURIComponent(query)}`);
  };

  return (
    <section className="categories-section">
      <div className="categories-container">

        <div className="categories-heading">
          <div>
            <span className="categories-eyebrow">
              FIND YOUR TABLE
            </span>

            <h2>
              What's the <em>mood?</em>
            </h2>
          </div>

          <p>
            Search by vibe, not just cuisine.
            <br />
            Find a place that fits the moment.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                key={category.query}
                type="button"
                className="category-card"
                onClick={() => handleCategoryClick(category.query)}
              >
                <div className="category-card-top">
                  <span className="category-icon">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>

                  <ArrowUpRight
                    className="category-arrow"
                    size={19}
                    strokeWidth={1.5}
                  />
                </div>

                <div className="category-card-content">
                  <h3>{category.title}</h3>

                  <p>{category.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="categories-bottom">
          <span>
            Can't decide?
          </span>

          <button
            type="button"
            onClick={() => navigate('/explore')}
          >
            Explore all restaurants
            <ArrowUpRight size={17} />
          </button>
        </div>

      </div>
    </section>
  );
}