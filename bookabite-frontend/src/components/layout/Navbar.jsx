import { Link, NavLink } from 'react-router-dom';
import { Heart, LogIn, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SteamMark from './SteamMark';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isOwnerAccount = user?.role === 'owner';

  return (
    <header className="bab-navbar">
      <div className="bab-navbar__inner">

        {/* Logo */}
        <Link to="/" className="bab-navbar__logo">
          <SteamMark size={36} animate />

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

          {isAuthenticated && isOwnerAccount && (
            <NavLink to="/owner/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              My Restaurant
            </NavLink>
          )}

          {isAuthenticated && isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right side */}
        <div className="bab-navbar__actions">
          <button
            type="button"
            className="bab-navbar__theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

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
                  {(user?.full_name || user?.name)?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                <span className="bab-navbar__user-name">
                  {user?.full_name || user?.name || 'User'}
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