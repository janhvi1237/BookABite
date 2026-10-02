import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import SteamMark from './SteamMark';
import './Footer.css';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'All Restaurants', to: '/explore' },
      { label: 'Explore Menus', to: '/menu' },
      { label: 'Saved Cravings', to: '/favorites' },
      { label: 'My Bookings', to: '/bookings' },
    ],
  },
  {
    title: 'For Restaurants',
    links: [
      { label: 'Partner Login', to: '/owner/login' },
      { label: 'Register Restaurant', to: '/owner/register' },
      { label: 'Table Management', to: '/owner/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About BookABite', to: '/about' },
      { label: 'Help & FAQ', to: '/help' },
      { label: 'Contact Support', to: '/contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bab-footer">
      <div className="bab-footer__inner bab-container">
        <section className="bab-footer__cta">
          <div>
            <span className="bab-footer__eyebrow">MAKE IT A MEAL TO REMEMBER</span>
            <h2>Good food. Great company. Your table is waiting.</h2>
            <p>Find a new favourite and make a little more room for the moments that matter.</p>
          </div>
          <NavLink to="/explore" className="bab-footer__cta-link">
            Explore restaurants <HiArrowRight size={18} />
          </NavLink>
        </section>

        <div className="bab-footer__top">
          <div className="bab-footer__brand">
            <div className="bab-footer__brand-row">
              <SteamMark size={32} />
              <span className="bab-footer__brand-text">
                Book<em>A</em>Bite
              </span>
            </div>
            <p className="bab-footer__tagline">
              Discover boutique cafés, explore artisan food menus, and reserve the finest tables in just a few clicks.
            </p>
            <span className="bab-footer__brand-note">Thoughtful tables across Pune</span>
          </div>

          {COLUMNS.map((col) => (
            <div className="bab-footer__col" key={col.title}>
              <h6 className="bab-footer__col-title">{col.title}</h6>
              <ul className="bab-footer__col-list">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <NavLink to={link.to} className="bab-footer__col-link">
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bab-footer__bottom">
          <span>© {new Date().getFullYear()} BookABite. All rights reserved.</span>
          <span>Made for memorable meals.</span>
        </div>
      </div>
    </footer>
  );
}
