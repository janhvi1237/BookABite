import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineStar,
  HiArrowRight,
} from 'react-icons/hi';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useMascot } from '../../context/MascotContext';
import './AboutPage.css';

export default function AboutPage() {
  const { triggerReaction } = useMascot();

  useEffect(() => {
    triggerReaction('serving', 'Welcome to BookABite! Here is how our story began.', 4000);
  }, []);

  return (
    <div className="bab-about-page">
      {/* Hero Section */}
      <section className="bab-about-hero">
        <div className="bab-about-container">
          <span className="bab-about-hero__badge">Our Philosophy</span>
          <h1>Every Meal Tells a Story. We Reserve Your Front Row Seat.</h1>
          <p>
            BookABite connects culinary creators, artisan café roasters, and passionate diners across the country for unforgettable gastronomic memories.
          </p>
        </div>
      </section>

      <div className="bab-about-container">
        {/* Story Section */}
        <section className="bab-about-story">
          <div className="bab-about-story__content">
            <h2>Born from a Passion for Genuine Flavours & Effortless Dining</h2>
            <p>
              In 2025, we noticed a recurring dining frustration: waiting in chaotic queues outside your favourite bistro, navigating confusing PDF menus on clunky phone screens, and missing out on the best tables for anniversary dinners and lively weekend brunches.
            </p>
            <p>
              We founded BookABite to reimagine restaurant discovery into an intimate, sensory experience. Real-time table reservations, high-definition dish showcases, interactive culinary companionship, and deep empowerment for restaurant owners.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <Link to="/explore" className="bab-btn bab-btn--secondary">
                Explore Restaurants
              </Link>
              <Link to="/contact" className="bab-btn bab-btn--outline">
                Get in Touch
              </Link>
            </div>
          </div>

          <div className="bab-about-story__image-wrap">
            <img
              src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1000&auto=format&fit=crop&q=80"
              alt="Artisan restaurant interior"
              className="bab-about-story__image"
            />
            <div className="bab-about-story__floater">
              <HiOutlineStar size={24} style={{ color: 'var(--color-accent-gold)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Top Rated Dining Platform</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>4.9/5 stars from over 50k diners</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars / Values Section */}
        <section className="bab-pillars-section">
          <div className="bab-pillars-section__header">
            <h2>Our Core Pillars</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>The standards that guide every experience on BookABite</p>
          </div>

          <div className="bab-pillars-grid">
            <div className="bab-pillar-card">
              <div className="bab-pillar-icon">
                <HiOutlineHeart size={26} />
              </div>
              <h3>Curated with Love</h3>
              <p>
                From hidden artisan roasters to Michelin-grade bistros, every restaurant on BookABite is vetted for atmosphere, hygiene, and exceptional taste.
              </p>
            </div>

            <div className="bab-pillar-card">
              <div className="bab-pillar-icon">
                <HiOutlineClock size={26} />
              </div>
              <h3>Instant Table Confirmations</h3>
              <p>
                No callback delays or uncertain waits. Book your preferred time slot, party size, and seating zone with immediate confirmation.
              </p>
            </div>

            <div className="bab-pillar-card">
              <div className="bab-pillar-icon">
                <HiOutlineSparkles size={26} />
              </div>
              <h3>Menu Transparency</h3>
              <p>
                Inspect detailed dish descriptions, spice indicators, allergens, and verified photos before setting foot inside the restaurant.
              </p>
            </div>

            <div className="bab-pillar-card">
              <div className="bab-pillar-icon">
                <HiOutlineShieldCheck size={26} />
              </div>
              <h3>Partner Empowerment</h3>
              <p>
                We equip chefs and restaurant owners with modern table-management suites, real-time booking insights, and zero predatory platform fees.
              </p>
            </div>
          </div>
        </section>

        {/* Mascot Spotlight */}
        <section className="bab-mascot-spotlight">
          <div>
            <FoodMascot mood="celebrating" size={130} />
          </div>
          <div className="bab-mascot-spotlight__text">
            <h2>Meet Chef Pierre, Your Digital Sommelier</h2>
            <p>
              Dining should be fun, warm, and interactive. Chef Pierre pops in to celebrate your table confirmations, recommend specialty appetizers, and make your food discovery feel alive.
            </p>
            <Link to="/explore" className="bab-btn bab-btn--gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Let Chef Pierre Guide You <HiArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Platform Milestones */}
        <section className="bab-about-stats">
          <div className="bab-about-stat-item">
            <h3>50,000+</h3>
            <span>Delighted Diners</span>
          </div>
          <div className="bab-about-stat-item">
            <h3>250+</h3>
            <span>Artisan Restaurants</span>
          </div>
          <div className="bab-about-stat-item">
            <h3>98.7%</h3>
            <span>Booking Reliability</span>
          </div>
          <div className="bab-about-stat-item">
            <h3>15,000+</h3>
            <span>Catalogued Dishes</span>
          </div>
        </section>
      </div>
    </div>
  );
}
