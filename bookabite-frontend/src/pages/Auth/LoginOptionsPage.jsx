import React from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineShieldCheck,
  HiArrowRight,
} from 'react-icons/hi';
import './AuthPages.css';

const LOGIN_OPTIONS = [
  {
    title: 'Customer',
    description: 'Book tables, manage reservations, and save your favourite restaurants.',
    path: '/login/customer',
    icon: HiOutlineUser,
    className: 'customer',
  },
  {
    title: 'Restaurant Owner',
    description: 'Manage your restaurant, tables, menu, and reservations.',
    path: '/owner/login',
    icon: HiOutlineOfficeBuilding,
    className: 'owner',
  },
  {
    title: 'Admin',
    description: 'Access platform administration and manage BookABite.',
    path: '/admin/login',
    icon: HiOutlineShieldCheck,
    className: 'admin',
  },
];

export default function LoginOptionsPage() {
  return (
    <div className="bab-auth-page">
      <div className="bab-container bab-auth-container">
        <section className="bab-auth-card bab-login-options">
          <header className="bab-auth-header">
            <span className="bab-badge bab-badge--terracotta">WELCOME TO BOOKABITE</span>
            <h1 className="bab-auth-title">Choose how to sign in</h1>
            <p className="bab-auth-subtitle">
              Select the account type you want to use.
            </p>
          </header>

          <div className="bab-login-options__list">
            {LOGIN_OPTIONS.map(({ title, description, path, icon: Icon, className }) => (
              <Link
                to={path}
                className={`bab-login-option bab-login-option--${className}`}
                key={path}
              >
                <span className="bab-login-option__icon"><Icon size={24} /></span>
                <span className="bab-login-option__copy">
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
                <HiArrowRight className="bab-login-option__arrow" size={20} />
              </Link>
            ))}
          </div>

          <div className="bab-auth-footer">
            <p>
              New to BookABite?{' '}
              <Link to="/register" className="bab-auth-switch-link">Create a customer account</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
