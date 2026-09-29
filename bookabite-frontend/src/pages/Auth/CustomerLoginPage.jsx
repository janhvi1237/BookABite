import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiArrowRight, HiSparkles } from 'react-icons/hi';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import './AuthPages.css';

export default function CustomerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password');
      return;
    }

    try {
      const loggedUser = await login(email, password);
      triggerReaction('happy', `Welcome back, ${loggedUser.full_name?.split(' ')[0]}! Ready to discover tables?`, 3500);
      showToast(`Welcome back, ${loggedUser.full_name}!`, 'success');

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
      console.error("Login failed:", err);
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
      triggerReaction('thinking', 'Hmm, those credentials did not match our records.', 3000);
    }
  };

  return (
    <div className="bab-auth-page">
      <div className="bab-container bab-auth-container">
        <div className="bab-auth-card">
          <div className="bab-auth-mascot-wrap">
            <FoodMascot mood="serving" size={90} />
          </div>

          <div className="bab-auth-header">
            <span className="bab-badge bab-badge--terracotta">DINER SIGN IN</span>
            <h1 className="bab-auth-title">Welcome Back to BookABite</h1>
            <p className="bab-auth-subtitle">
              Sign in to manage your table reservations, review dining spots, and access saved cravings.
            </p>
          </div>

          {errorMsg && (
            <div className="bab-auth-error-banner">
              {errorMsg}
            </div>
          )}

          <form className="bab-auth-form" onSubmit={handleLogin}>
            <div className="bab-auth-field">
              <label htmlFor="auth-email">Email Address</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineMail size={18} className="bab-auth-field-icon" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bab-auth-field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label htmlFor="auth-pwd">Password</label>
                <Link to="/help" className="bab-auth-forgot">Forgot?</Link>
              </div>
              <div className="bab-auth-input-wrap">
                <HiOutlineLockClosed size={18} className="bab-auth-field-icon" />
                <input
                  id="auth-pwd"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ background: 'var(--color-bg-soft, #F7EFE8)', padding: '10px 14px', borderRadius: 'var(--radius-lg, 12px)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Demo: <strong>diner@bookabite.com</strong> / <strong>Password@123</strong></span>
              <button
                type="button"
                onClick={() => { setEmail('diner@bookabite.com'); setPassword('Password@123'); }}
                style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm, 6px)', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary)', cursor: 'pointer' }}
              >
                Auto-fill
              </button>
            </div>

            <button
              type="submit"
              className="bab-btn bab-btn--secondary bab-auth-submit"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Your Account'}
            </button>
          </form>

          <div className="bab-auth-footer">
            <p>
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="bab-auth-switch-link">
                Create Diner Account
              </Link>
            </p>

            <div className="bab-auth-divider">
              <span>OR</span>
            </div>

            <Link to="/owner/login" className="bab-auth-owner-portal-btn">
              Restaurant Partner Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
