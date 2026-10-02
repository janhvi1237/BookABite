import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import '../Auth/AuthPages.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, logout, loading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const loggedUser = await login(email, password);
      const isAdmin = loggedUser.is_admin === true || loggedUser.role === 'admin';

      if (!isAdmin) {
        logout();
        setErrorMsg('This account does not have admin access.');
        return;
      }

      showToast(`Welcome, ${loggedUser.full_name}!`, 'success');
      navigate('/admin');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="bab-auth-page bab-auth-page--owner">
      <div className="bab-container bab-auth-container">
        <div className="bab-auth-card">
          <div className="bab-auth-mascot-wrap">
            <FoodMascot mood="thinking" size={90} />
          </div>

          <div className="bab-auth-header">
            <span className="bab-badge bab-badge--gold">ADMIN</span>
            <h1 className="bab-auth-title">Admin Login</h1>
            <p className="bab-auth-subtitle">
              Manage users, restaurant owners, restaurants and bookings.
            </p>
          </div>

          {errorMsg && <div className="bab-auth-error-banner">{errorMsg}</div>}

          <form className="bab-auth-form" onSubmit={handleSubmit}>
            <div className="bab-auth-field">
              <label htmlFor="admin-email">Email</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineMail size={18} className="bab-auth-field-icon" />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@bookabite.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bab-auth-field">
              <label htmlFor="admin-pwd">Password</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineLockClosed size={18} className="bab-auth-field-icon" />
                <input
                  id="admin-pwd"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="bab-btn bab-btn--primary bab-auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in to Admin'}
            </button>
          </form>

          <div className="bab-auth-footer">
            <Link to="/" className="bab-auth-owner-portal-btn">← Back to BookABite</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
