import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlineSearch, HiOutlineCalendar, HiOutlineHeart, HiOutlineUser } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import './MobileBottomNav.css';

export default function MobileBottomNav() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="bab-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `bab-bottom-nav__item ${isActive ? 'bab-bottom-nav__item--active' : ''}`}
      >
        <HiOutlineHome size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) => `bab-bottom-nav__item ${isActive ? 'bab-bottom-nav__item--active' : ''}`}
      >
        <HiOutlineSearch size={22} />
        <span>Explore</span>
      </NavLink>

      <NavLink
        to="/bookings"
        className={({ isActive }) => `bab-bottom-nav__item ${isActive ? 'bab-bottom-nav__item--active' : ''}`}
      >
        <HiOutlineCalendar size={22} />
        <span>Bookings</span>
      </NavLink>

      <NavLink
        to="/favorites"
        className={({ isActive }) => `bab-bottom-nav__item ${isActive ? 'bab-bottom-nav__item--active' : ''}`}
      >
        <HiOutlineHeart size={22} />
        <span>Cravings</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? "/profile" : "/login"}
        className={({ isActive }) => `bab-bottom-nav__item ${isActive ? 'bab-bottom-nav__item--active' : ''}`}
      >
        <HiOutlineUser size={22} />
        <span>{isAuthenticated ? 'Profile' : 'Log In'}</span>
      </NavLink>
    </nav>
  );
}
