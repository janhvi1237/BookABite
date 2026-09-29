import { Link, NavLink } from 'react-router-dom';
import { Heart, LogIn, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bab-navbar">
      <div className="bab-navbar__inner">

        {/* Logo */}
        <Link to="/" className="bab-navbar__logo">
          <span className="bab-navbar__logo-mark">B</span>

          <span className="bab-navbar__brand">
            Book<span>ABite</span>
          </span>
        </Link>

        {/* Main navigation */}
        <nav className="bab-navbar__links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/restaurants"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Restaurants
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                isActive ? 'active' : ''
              }
            >
              My Bookings
            </NavLink>
          )}
        </nav>

        {/* Right side */}
        <div className="bab-navbar__actions">

          {isAuthenticated ? (
            <>
              <Link
                to="/favorites"
                className="bab-navbar__icon-button"
                aria-label="Favorites"
                title="Favorites"
              >
                <Heart size={18} />
              </Link>

              <div className="bab-navbar__user">
                <div className="bab-navbar__avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                <span className="bab-navbar__user-name">
                  {user?.name || 'User'}
                </span>
              </div>

              <button
                type="button"
                className="bab-navbar__logout"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bab-navbar__login"
            >
              <LogIn size={16} />
              Login
            </Link>
          )}

          <Link
            to="/restaurants"
            className="bab-navbar__book"
          >
            Book a table
          </Link>

        </div>
      </div>
    </header>
  );
}