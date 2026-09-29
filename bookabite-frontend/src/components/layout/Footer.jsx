import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiOutlineMail } from 'react-icons/hi';
import { FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';
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
            <div className="bab-footer__social">
              <a href="#" aria-label="Instagram" className="bab-footer__social-btn"><FaInstagram size={16} /></a>
              <a href="#" aria-label="Twitter" className="bab-footer__social-btn"><FaTwitter size={16} /></a>
              <a href="#" aria-label="Facebook" className="bab-footer__social-btn"><FaFacebookF size={16} /></a>
            </div>
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

          <div className="bab-footer__col bab-footer__newsletter">
            <h6 className="bab-footer__col-title">Culinary Newsletter</h6>
            <p className="bab-footer__col-text">Secret tasting menus, chef specials, and weekend tables delivered weekly.</p>
            <form className="bab-footer__newsletter-form" onSubmit={(e) => { e.preventDefault(); alert("Thank you for subscribing to BookABite newsletter!"); }}>
              <span className="bab-footer__newsletter-icon"><HiOutlineMail size={16} /></span>
              <input type="email" placeholder="you@example.com" aria-label="Email address" required />
              <button type="submit">Join</button>
            </form>
          </div>
        </div>

        <div className="bab-footer__bottom">
          <span>© {new Date().getFullYear()} BookABite Technologies Inc. All rights reserved.</span>
          <span className="bab-footer__bottom-sep" aria-hidden="true">•</span>
          <span>Crafted with passion for culinary lovers & boutique dining.</span>
        </div>
      </div>
    </footer>
  );
}
