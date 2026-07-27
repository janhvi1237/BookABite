import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/favorites', label: 'Cravings' },
  { to: '/bookings', label: 'My Bookings' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`bab-navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="bab-navbar__inner">
        <Link to="/" className="bab-brand" aria-label="BookABite home">
          <span className="bab-brand__mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="34" height="34">
              <circle cx="24" cy="32" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path className="wisp wisp--1" d="M17 20 C 15 16, 19 14, 17 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path className="wisp wisp--2" d="M24 18 C 22 14, 26 12, 24 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path className="wisp wisp--3" d="M31 20 C 29 16, 33 14, 31 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="bab-brand__text">BookABite</span>
        </Link>

        <nav className={`bab-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `bab-nav__link ${isActive ? 'is-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="bab-navbar__actions">
          <button
            className="bab-icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            )}
          </button>

          <Link to="/restaurants" className="bab-btn bab-btn--primary">
            Book a table
          </Link>

          <button
            className="bab-icon-btn bab-menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
