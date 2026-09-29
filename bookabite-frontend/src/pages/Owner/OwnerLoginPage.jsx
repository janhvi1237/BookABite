import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineOfficeBuilding } from 'react-icons/hi';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import '../Auth/AuthPages.css';

export default function OwnerLoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOwnerLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const loggedUser = await login(email, password);
      showToast(`Welcome to Owner Portal, ${loggedUser.full_name}!`, 'success');
      triggerReaction('serving', `Ready to manage your restaurant tables and reservations!`, 3500);
      navigate('/owner/dashboard');
    } catch (err) {
      console.error("Owner login error:", err);
      setErrorMsg(err.message || 'Invalid partner credentials. Please check your email and password.');
    }
  };

  return (
    <div className="bab-auth-page bab-auth-page--owner">
      <div className="bab-container bab-auth-container">
        <div className="bab-auth-card">
          <div className="bab-auth-mascot-wrap">
            <FoodMascot mood="serving" size={90} />
          </div>

          <div className="bab-auth-header">
            <span className="bab-badge bab-badge--gold">RESTAURANT OWNER PORTAL</span>
            <h1 className="bab-auth-title">Partner Management Login</h1>
            <p className="bab-auth-subtitle">
              Manage your dining inventory, menu items, table requests, and customer reviews.
            </p>
          </div>

          {/* DEMO OWNER QUICK LOGIN HELPER */}
          <div className="bab-demo-owner-hint">
            <strong>Demo Owner Account:</strong>
            <code>owner@bookabite.com</code> / <code>Password@123</code>
          </div>

          {errorMsg && (
            <div className="bab-auth-error-banner">
              {errorMsg}
            </div>
          )}

          <form className="bab-auth-form" onSubmit={handleOwnerLogin}>
            <div className="bab-auth-field">
              <label htmlFor="owner-email">Business Email</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineMail size={18} className="bab-auth-field-icon" />
                <input
                  id="owner-email"
                  type="email"
                  placeholder="manager@restaurant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bab-auth-field">
              <label htmlFor="owner-pwd">Password</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineLockClosed size={18} className="bab-auth-field-icon" />
                <input
                  id="owner-pwd"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ background: 'var(--color-bg-soft, #F7EFE8)', padding: '10px 14px', borderRadius: 'var(--radius-lg, 12px)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Demo Owner: <strong>owner@bookabite.com</strong> / <strong>Password@123</strong></span>
              <button
                type="button"
                onClick={() => { setEmail('owner@bookabite.com'); setPassword('Password@123'); }}
                style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm, 6px)', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary)', cursor: 'pointer' }}
              >
                Auto-fill
              </button>
            </div>

            <button
              type="submit"
              className="bab-btn bab-btn--primary bab-auth-submit"
              disabled={loading}
            >
              {loading ? 'Entering Portal...' : 'Access Owner Dashboard'}
            </button>
          </form>

          <div className="bab-auth-footer">
            <p>
              New restaurant partner?{' '}
              <Link to="/owner/register" className="bab-auth-switch-link">
                Register Your Restaurant
              </Link>
            </p>

            <div className="bab-auth-divider">
              <span>OR</span>
            </div>

            <Link to="/login" className="bab-auth-owner-portal-btn">
              ← Switch to Diner Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
