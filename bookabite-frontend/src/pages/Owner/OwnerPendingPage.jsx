import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import '../Auth/AuthPages.css';

export default function OwnerPendingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser, logout } = useAuth();
  const { showToast } = useToast();
  const [checking, setChecking] = useState(false);

  if (!isAuthenticated) return <Navigate to="/owner/login" replace />;

  const isAdmin = user?.role === 'admin' || user?.is_admin === true;
  const approved = isAdmin || user?.role !== 'owner' || user?.is_approved !== false;
  if (approved) return <Navigate to={user?.role === 'owner' ? '/owner/dashboard' : '/'} replace />;

  const checkAgain = async () => {
    setChecking(true);
    try {
      const fresh = await refreshUser();
      if (fresh && fresh.is_approved !== false) {
        showToast('Your account is approved. Welcome aboard!', 'success');
        navigate('/owner/dashboard');
      } else {
        showToast('Still waiting for admin approval.', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Could not check right now.', 'error');
    } finally {
      setChecking(false);
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
            <span className="bab-badge bab-badge--gold">PENDING APPROVAL</span>
            <h1 className="bab-auth-title">Thanks for joining, {user?.full_name?.split(' ')[0]}!</h1>
            <p className="bab-auth-subtitle">
              Your restaurant partner account is waiting for approval from the BookABite team.
              You can add your restaurant as soon as it is approved.
            </p>
          </div>

          <button
            type="button"
            className="bab-btn bab-btn--primary bab-auth-submit"
            onClick={checkAgain}
            disabled={checking}
          >
            {checking ? 'Checking...' : 'Check again'}
          </button>

          <div className="bab-auth-footer">
            <Link to="/" className="bab-auth-owner-portal-btn">← Back to BookABite</Link>
            <button
              type="button"
              className="bab-auth-owner-portal-btn"
              onClick={() => { logout(); navigate('/owner/login'); }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
