import React from 'react';
import FoodMascot from '../mascot/FoodMascot';

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
        background: 'rgba(214, 69, 69, 0.08)',
        borderRadius: 'var(--radius-xl, 16px)',
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
      <h3 style={{ fontSize: '1.25rem', color: '#D64545', fontFamily: 'var(--font-heading, inherit)' }}>{title}</h3>
      <p style={{ color: 'var(--color-text-dark, #1F1715)', fontSize: '0.95rem', margin: 0 }}>{message}</p>
      {onRetry && (
        <button type="button" className="bab-btn bab-btn--secondary" onClick={onRetry} style={{ marginTop: 8 }}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
