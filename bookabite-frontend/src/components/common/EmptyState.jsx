import React from 'react';
import FoodMascot from '../mascot/FoodMascot';
import { Link } from 'react-router-dom';

export function EmptyState({
  title = "Nothing to display",
  message = "Looks like we're preparing something delicious here soon!",
  actionLabel = "Explore Restaurants",
  actionTo = "/explore",
  onAction,
  mood = "thinking",
}) {
  return (
    <div
      style={{
        padding: '60px 24px',
        textAlign: 'center',
        background: 'var(--bab-bg-card)',
        borderRadius: 'var(--bab-radius-lg)',
        border: '1px solid var(--bab-border)',
        boxShadow: 'var(--bab-shadow-sm)',
        maxWidth: 560,
        margin: '32px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <FoodMascot mood={mood} size={90} />
      <h3 style={{ fontSize: '1.4rem', color: 'var(--bab-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--bab-text-muted)', maxWidth: 420, margin: 0 }}>{message}</p>
      {onAction ? (
        <button type="button" className="bab-btn bab-btn--secondary" onClick={onAction} style={{ marginTop: 8 }}>
          {actionLabel}
        </button>
      ) : actionTo ? (
        <Link to={actionTo} className="bab-btn bab-btn--secondary" style={{ marginTop: 8 }}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content right now. Please try again.",
  onRetry,
}) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        background: 'var(--bab-danger-light)',
        borderRadius: 'var(--bab-radius-md)',
        border: '1px solid rgba(214, 69, 69, 0.2)',
        maxWidth: 520,
        margin: '32px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <FoodMascot mood="thinking" size={72} />
      <h3 style={{ fontSize: '1.25rem', color: 'var(--bab-danger)' }}>{title}</h3>
      <p style={{ color: 'var(--bab-text)', fontSize: '0.95rem', margin: 0 }}>{message}</p>
      {onRetry && (
        <button type="button" className="bab-btn bab-btn--primary" onClick={onRetry} style={{ marginTop: 8 }}>
          Try Again
        </button>
      )}
    </div>
  );
}
