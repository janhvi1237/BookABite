import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLockClosed, HiSparkles } from 'react-icons/hi';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import '../Auth/AuthPages.css';

export default function OwnerRegisterPage() {
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

  const handleOwnerRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      const newOwner = await register({
        fullName,
        email,
        phone,
        password,
        role: 'owner',
      });
      showToast('Partner account created! An admin will approve it shortly.', 'success');
      triggerReaction('celebrating', `Welcome to the BookABite family, Chef ${fullName.split(' ')[0]}!`, 4000);
      navigate('/owner/pending');
    } catch (err) {
      console.error("Owner register error:", err);
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="bab-auth-page bab-auth-page--owner">
      <div className="bab-container bab-auth-container">
        <div className="bab-auth-card">
          <div className="bab-auth-mascot-wrap">
            <FoodMascot mood="celebrating" size={90} />
          </div>

          <div className="bab-auth-header">
            <span className="bab-badge bab-badge--gold">NEW RESTAURANT PARTNER</span>
            <h1 className="bab-auth-title">Partner with BookABite</h1>
            <p className="bab-auth-subtitle">
              Join Pune&apos;s premier dining network. Showcase your food, fill tables, and manage reservations effortlessly.
            </p>
          </div>

          {errorMsg && (
            <div className="bab-auth-error-banner">
              {errorMsg}
            </div>
          )}

          <form className="bab-auth-form" onSubmit={handleOwnerRegister}>
            <div className="bab-auth-field">
              <label htmlFor="owner-reg-name">Full Name / Primary Contact *</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineUser size={18} className="bab-auth-field-icon" />
                <input
                  id="owner-reg-name"
                  type="text"
                  placeholder="e.g. Aarav Mehta"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bab-auth-field">
              <label htmlFor="owner-reg-email">Business Email Address *</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineMail size={18} className="bab-auth-field-icon" />
                <input
                  id="owner-reg-email"
                  type="email"
                  placeholder="contact@restaurant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bab-auth-field">
              <label htmlFor="owner-reg-phone">Direct Phone / Mobile *</label>
              <div className="bab-auth-input-wrap">
                <HiOutlinePhone size={18} className="bab-auth-field-icon" />
                <input
                  id="owner-reg-phone"
                  type="tel"
                  placeholder="10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bab-auth-field">
              <label htmlFor="owner-reg-pwd">Account Password *</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineLockClosed size={18} className="bab-auth-field-icon" />
                <input
                  id="owner-reg-pwd"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bab-auth-field">
              <label htmlFor="owner-reg-conf">Confirm Password *</label>
              <div className="bab-auth-input-wrap">
                <HiOutlineLockClosed size={18} className="bab-auth-field-icon" />
                <input
                  id="owner-reg-conf"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="bab-btn bab-btn--primary bab-auth-submit"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Continue to Restaurant Setup →'}
            </button>
          </form>

          <div className="bab-auth-footer">
            <p>
              Already an owner?{' '}
              <Link to="/owner/login" className="bab-auth-switch-link">
                Partner Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
