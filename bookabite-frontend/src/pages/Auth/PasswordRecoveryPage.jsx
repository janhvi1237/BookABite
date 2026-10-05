import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiOutlineLockClosed, HiOutlineMail } from 'react-icons/hi';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useToast } from '../../components/common/Toast';
import { requestPasswordReset, resetPassword } from '../../api/passwordReset';
import './AuthPages.css';

export default function PasswordRecoveryPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const handleRequest = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await requestPasswordReset(email);
      setRequestSent(true);
      showToast(response.message, 'success');
    } catch (err) {
      setError(err.message || 'Could not request a password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await resetPassword(token, password);
      setResetComplete(true);
      showToast(response.message, 'success');
    } catch (err) {
      setError(err.message || 'Could not reset your password.');
    } finally {
      setLoading(false);
    }
  };

  const isResetForm = Boolean(token);

  return (
    <div className="bab-auth-page">
      <div className="bab-container bab-auth-container">
        <div className="bab-auth-card">
          <div className="bab-auth-mascot-wrap"><FoodMascot mood="serving" size={90} /></div>
          <header className="bab-auth-header">
            <span className="bab-badge bab-badge--terracotta">ACCOUNT RECOVERY</span>
            <h1 className="bab-auth-title">
              {isResetForm ? 'Choose a New Password' : 'Forgot Your Password?'}
            </h1>
            <p className="bab-auth-subtitle">
              {isResetForm
                ? 'Your reset link is valid for one hour and can only be used once.'
                : 'Enter the email address associated with your BookABite account. We will email you a secure reset link.'}
            </p>
          </header>

          {error && <div className="bab-auth-error-banner" role="alert">{error}</div>}
          {resetComplete ? (
            <div className="bab-auth-success-banner" role="status">
              Your password has been changed. You can now sign in with your new password.
            </div>
          ) : requestSent ? (
            <div className="bab-auth-success-banner" role="status">
              If an account exists for that email, a password reset link has been sent. Check your inbox.
            </div>
          ) : isResetForm ? (
            <form className="bab-auth-form" onSubmit={handleReset}>
              <div className="bab-auth-field">
                <label htmlFor="reset-password">New password</label>
                <div className="bab-auth-input-wrap">
                  <HiOutlineLockClosed size={18} className="bab-auth-field-icon" />
                  <input
                    id="reset-password"
                    type="password"
                    autoComplete="new-password"
                    minLength="8"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
                <small>At least 8 characters, including a letter and a number.</small>
              </div>
              <div className="bab-auth-field">
                <label htmlFor="reset-password-confirm">Confirm new password</label>
                <div className="bab-auth-input-wrap">
                  <HiOutlineLockClosed size={18} className="bab-auth-field-icon" />
                  <input
                    id="reset-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    minLength="8"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>
              </div>
              <button className="bab-btn bab-btn--secondary bab-auth-submit" type="submit" disabled={loading}>
                {loading ? 'Saving password...' : 'Reset password'}
              </button>
            </form>
          ) : (
            <form className="bab-auth-form" onSubmit={handleRequest}>
              <div className="bab-auth-field">
                <label htmlFor="recovery-email">Email address</label>
                <div className="bab-auth-input-wrap">
                  <HiOutlineMail size={18} className="bab-auth-field-icon" />
                  <input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>
              <button className="bab-btn bab-btn--secondary bab-auth-submit" type="submit" disabled={loading}>
                {loading ? 'Sending link...' : 'Send reset link'}
              </button>
            </form>
          )}

          <div className="bab-auth-footer">
            <Link to="/login/customer" className="bab-auth-owner-portal-btn">Back to diner sign in</Link>
            {' '}
            <Link to="/owner/login" className="bab-auth-owner-portal-btn">Owner sign in</Link>
            {' '}
            <Link to="/admin/login" className="bab-auth-owner-portal-btn">Admin sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
