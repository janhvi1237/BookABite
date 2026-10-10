import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineQuestionMarkCircle,
  HiOutlineChatAlt,
} from 'react-icons/hi';
import FoodMascot from '../../components/mascot/FoodMascot';
import './HelpFAQPage.css';

const FAQ_CATEGORIES = ['All Questions', 'Table Reservations', 'Menus & Food', 'For Restaurant Owners', 'Account & Privacy'];

const FAQ_ITEMS = [
  {
    category: 'Table Reservations',
    question: 'How do I book a table on BookABite?',
    answer: 'Browse any restaurant from the Explore page, select your preferred date, time slot, and guest count, choose any special seating preferences (like outdoor or quiet corner), and confirm your reservation. You receive an instant digital confirmation pass with a reservation ID.',
  },
  {
    category: 'Table Reservations',
    question: 'Is there a booking fee for reserving tables?',
    answer: 'No! Reserving tables on BookABite is 100% free for diners. You only pay for the delicious food and beverages you enjoy directly at the restaurant.',
  },
  {
    category: 'Table Reservations',
    question: 'How do I cancel or modify an existing table reservation?',
    answer: 'Navigate to "My Bookings" from the top navigation bar. Under upcoming reservations, you will find a "Cancel Table" button. You can cancel free of charge at any point prior to your reserved time slot.',
  },
  {
    category: 'Table Reservations',
    question: 'What happens if our party is running late?',
    answer: 'Most partner restaurants hold reserved tables for up to 15-20 minutes past the booking time. If you anticipate being later than that, we recommend contacting the venue directly using the phone number listed on their profile.',
  },
  {
    category: 'Menus & Food',
    question: 'Are menu prices and dish availability accurate?',
    answer: 'Yes! Restaurant chefs and managers manage their menus in real-time through the BookABite Owner Suite. When a specialty dish is sold out for the evening, it is immediately updated on the platform.',
  },
  {
    category: 'Menus & Food',
    question: 'How are dietary preferences and spice levels indicated?',
    answer: 'Every dish card includes clear visual tags indicating Vegetarian or Non-Vegetarian, spice intensity (Mild, Medium, Hot, Extra Hot), calorie estimates, and key culinary ingredients so you can order with confidence.',
  },
  {
    category: 'For Restaurant Owners',
    question: 'How do I list my restaurant or café on BookABite?',
    answer: 'Simply click "Register Restaurant" or "Partner With Us" in the navigation bar. Complete our 6-step onboarding wizard with your venue details, photos, timings, and initial menu. Once submitted, your profile is immediately active to receive reservations.',
  },
  {
    category: 'For Restaurant Owners',
    question: 'How do restaurant managers receive reservation notices?',
    answer: 'Incoming table reservations appear instantly in real-time on your BookABite Owner Dashboard. You can view party sizes, special requests, guest contact details, and update table statuses (Confirmed, Seated, Completed).',
  },
  {
    category: 'Account & Privacy',
    question: 'How is my personal phone number and email used?',
    answer: 'Your contact details are strictly used to communicate your reservation confirmations, reminders, and updates regarding your booking. We never sell your personal data or spam you with unwanted marketing calls.',
  },
];

export default function HelpFAQPage() {
  const [activeCategory, setActiveCategory] = useState('All Questions');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndices, setOpenIndices] = useState([0]); // first open by default

  const toggleAccordion = (idx) => {
    if (openIndices.includes(idx)) {
      setOpenIndices(openIndices.filter((i) => i !== idx));
    } else {
      setOpenIndices([...openIndices, idx]);
    }
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'All Questions' || item.category === activeCategory;
    const matchesQuery =
      !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="bab-faq-page">
      <div className="bab-faq-container">
        {/* Header */}
        <div className="bab-faq-header">
          <h1>Help Center & FAQs</h1>
          <p>
            Everything you need to know about reserving dining tables, browsing menus, and managing your restaurant on BookABite.
          </p>

          <div className="bab-faq-search-wrap">
            <HiOutlineSearch
              size={20}
              style={{
                position: 'absolute',
                left: 18,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              className="bab-faq-search-input"
              placeholder="Search help topics, reservation questions, menus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="bab-faq-category-tabs">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`bab-faq-category-btn ${activeCategory === cat ? 'bab-faq-category-btn--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className="bab-faq-list">
            {filteredFaqs.map((item, idx) => {
              const isOpen = openIndices.includes(idx);
              return (
                <div
                  key={idx}
                  className={`bab-faq-item ${isOpen ? 'bab-faq-item--open' : ''}`}
                >
                  <button
                    type="button"
                    className="bab-faq-question"
                    onClick={() => toggleAccordion(idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <HiOutlineChevronUp size={20} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
                    ) : (
                      <HiOutlineChevronDown size={20} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    )}
                  </button>
                  {isOpen && (
                    <div className="bab-faq-answer">
                      <p style={{ margin: 0 }}>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', marginBottom: 40 }}>
            <p style={{ color: 'var(--color-text-muted)' }}>
              No help articles found matching "{searchQuery}". Try a different keyword or contact our support team.
            </p>
          </div>
        )}

        {/* Support CTA Card */}
        <div className="bab-faq-support-card">
          <FoodMascot mood="happy" size={76} />
          <h3>Still Have Questions?</h3>
          <p>
            Can't find what you are looking for? Our support team is ready to assist you.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Link to="/contact" className="bab-btn bab-btn--secondary">
              Contact Concierge
            </Link>
            <Link to="/explore" className="bab-btn bab-btn--outline">
              Explore Restaurants
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
