import React from 'react';
import FoodMascot from '../mascot/FoodMascot';

export default function PageLoader({ text = "Preparing delicious experiences..." }) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: '60px 24px',
        textAlign: 'center',
      }}
    >
      <FoodMascot mood="serving" size={96} />
      <div>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--bab-primary)', marginBottom: 6 }}>
          {text}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--bab-text-muted)' }}>
          Please hold on while we set your table.
        </p>
      </div>
    </div>
  );
}
