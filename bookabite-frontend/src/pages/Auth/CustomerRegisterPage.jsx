import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLockClosed, HiSparkles } from 'react-icons/hi';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import './AuthPages.css';

export default function CustomerRegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    try {
      const newUser = await register({
        fullName,
        email,
        phone,
        password,
        role: 'customer',
      });
      triggerReaction('celebrating', `Welcome to BookABite, ${newUser.full_name?.split(' ')[0]}! Your diner account is ready.`, 4000);
      showToast(`Account created successfully! Welcome, ${newUser.full_name}`, 'success');

      // Check if pending booking was stored in session
      const pending = sessionStorage.getItem('pending_booking');
      if (pending) {
        const parsed = JSON.parse(pending);
        sessionStorage.removeItem('pending_booking');
        navigate(`/restaurants/${parsed.restaurant_id}/book?date=${parsed.booking_date}&time=${encodeURIComponent(parsed.booking_time)}&guests=${parsed.party_size}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="bab-auth-page">
      <div className="bab-container bab-auth-container">
        <div className="bab-auth-card">
          <div className="bab-auth-mascot-wrap">
            <FoodMascot mood="happy" size={90} />
          </div>

          <div className="bab-auth-header">
            <span className="bab-badge bab-badge--terracotta">JOIN BOOKABITE</span>
            <h1 className="bab-auth-title">Create Your Diner Account</h1>
            <p className="bab-auth-subtitle">
              Join thousands of food lovers reserving boutique tables and discovering artisan gastronomy.
            </p>
          </div>

          {errorMsg && (
            <div className="bab-auth-error-banner">
              {errorMsg}
            </div>
          )}

          <form className="bab-auth-form" onSubmit={handleRegister}>
            <div className="bab-auth-field">
              <label htmlFor="reg-name">Full Name *</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineUser size={18} className="bab-auth-field-icon" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="e.g. Janhavi Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bab-auth-field">
              <label htmlFor="reg-email">Email Address *</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineMail size={18} className="bab-auth-field-icon" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bab-auth-field">
              <label htmlFor="reg-phone">Phone Number (Optional)</label>
              <div className="bab-auth-input-wrap">
                <HiOutlinePhone size={18} className="bab-auth-field-icon" />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="bab-auth-field">
              <label htmlFor="reg-pwd">Password *</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineLockClosed size={18} className="bab-auth-field-icon" />
                <input
                  id="reg-pwd"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bab-auth-field">
              <label htmlFor="reg-conf-pwd">Confirm Password *</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineLockClosed size={18} className="bab-auth-field-icon" />
                <input
                  id="reg-conf-pwd"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="bab-btn bab-btn--secondary bab-auth-submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Diner Account'}
            </button>
          </form>

          <div className="bab-auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="bab-auth-switch-link">
                Sign In Instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
