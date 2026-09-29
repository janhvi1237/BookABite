import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineHeart,
  HiOutlineLogout,
  HiOutlineCheck,
} from 'react-icons/hi';
import PageLoader from '../../components/common/PageLoader';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import { updateUserProfile } from '../../api/auth';
import { fetchUserBookings } from '../../api/bookings';
import { fetchFavorites } from '../../api/favorites';
import './CustomerPages.css';

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalFavorites, setTotalFavorites] = useState(0);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredCity, setPreferredCity] = useState('Pune');
  const [dietaryPref, setDietaryPref] = useState('All');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFullName(user.name || user.fullName || user.full_name || '');
    setPhone(user.phone || '');

    async function loadStats() {
      try {
        setLoading(true);
        const [bList, fList] = await Promise.all([
          fetchUserBookings(user.id || user.user_id),
          fetchFavorites(user.id || user.user_id),
        ]);
        setTotalBookings(Array.isArray(bList) ? bList.length : 0);
        setTotalFavorites(Array.isArray(fList) ? fList.length : 0);
      } catch (err) {
        console.error('Failed to load customer stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user, navigate]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Full name cannot be blank.', 'error');
      return;
    }

    try {
      setSaving(true);
      const userId = user.id || user.user_id;
      await updateUserProfile(userId, {
        full_name: fullName,
        phone,
      });

      if (updateUser) {
        updateUser({
          ...user,
          name: fullName,
          fullName,
          phone,
        });
      }

      triggerReaction('happy', 'Profile information updated!');
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to save profile:', err);
      showToast('Could not save profile changes.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    triggerReaction('sad', 'See you again soon, food explorer!');
    showToast('You have been logged out.', 'info');
    navigate('/');
  }

  if (loading) return <PageLoader message="Loading your profile..." />;

  const initials = (fullName || user?.name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bab-customer-page">
      <div className="bab-customer-container">
        {/* Customer Header */}
        <div className="bab-customer-header">
          <div className="bab-customer-header__left">
            <div className="bab-customer-avatar">{initials}</div>
            <div className="bab-customer-header__info">
              <h1>{fullName || 'Food Lover'}</h1>
              <p>{user?.email} • Member since 2026</p>
            </div>
          </div>

          <div>
            <button
              onClick={handleLogout}
              className="bab-btn bab-btn--outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <HiOutlineLogout size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Customer Nav Tabs */}
        <div className="bab-customer-nav-tabs">
          <Link to="/profile" className="bab-customer-nav-tab bab-customer-nav-tab--active">
            <HiOutlineUser size={18} /> My Profile
          </Link>
          <Link to="/my-bookings" className="bab-customer-nav-tab">
            <HiOutlineCalendar size={18} /> My Bookings ({totalBookings})
          </Link>
          <Link to="/favorites" className="bab-customer-nav-tab">
            <HiOutlineHeart size={18} /> Saved Places ({totalFavorites})
          </Link>
        </div>

        {/* Stats Row */}
        <div className="bab-customer-stats-grid">
          <div className="bab-customer-stat-card">
            <div className="bab-customer-stat-icon">
              <HiOutlineCalendar size={22} />
            </div>
            <div>
              <span className="bab-customer-stat-label">Total Reservations</span>
              <strong className="bab-customer-stat-val">{totalBookings}</strong>
            </div>
          </div>

          <div className="bab-customer-stat-card">
            <div className="bab-customer-stat-icon" style={{ background: 'rgba(233, 180, 76, 0.16)', color: '#B57F1E' }}>
              <HiOutlineHeart size={22} />
            </div>
            <div>
              <span className="bab-customer-stat-label">Saved Favorites</span>
              <strong className="bab-customer-stat-val">{totalFavorites}</strong>
            </div>
          </div>

          <div className="bab-customer-stat-card">
            <div className="bab-customer-stat-icon" style={{ background: 'rgba(63, 166, 107, 0.12)', color: 'var(--color-success)' }}>
              <HiOutlineCheck size={22} />
            </div>
            <div>
              <span className="bab-customer-stat-label">Account Status</span>
              <strong className="bab-customer-stat-val" style={{ fontSize: '1.2rem', color: 'var(--color-success)' }}>Active</strong>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bab-customer-card">
          <div className="bab-customer-card__header">
            <h3>Personal Information</h3>
            <p>Manage your account info and dining contact details.</p>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="bab-wizard-form-grid">
              <div>
                <label className="bab-form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="bab-form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="bab-form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="bab-form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ background: 'var(--color-bg-soft)', cursor: 'not-allowed' }}
                />
              </div>

              <div>
                <label className="bab-form-label">Phone Number</label>
                <input
                  type="tel"
                  className="bab-form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="bab-form-label">Default City</label>
                <select
                  className="bab-form-select"
                  value={preferredCity}
                  onChange={(e) => setPreferredCity(e.target.value)}
                >
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <button
                type="submit"
                className="bab-btn bab-btn--secondary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
