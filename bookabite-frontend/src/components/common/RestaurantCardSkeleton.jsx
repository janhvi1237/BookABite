import React from 'react';

export function RestaurantCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--bab-bg-card)',
        borderRadius: 'var(--bab-radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--bab-border)',
        boxShadow: 'var(--bab-shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 220,
          background: 'linear-gradient(90deg, #EFE6DE 25%, #F7EFE8 50%, #EFE6DE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: '65%', height: 22, background: '#EFE6DE', borderRadius: 4 }} />
        <div style={{ width: '40%', height: 16, background: '#F7EFE8', borderRadius: 4 }} />
        <div style={{ width: '90%', height: 14, background: '#F7EFE8', borderRadius: 4 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <div style={{ width: '30%', height: 18, background: '#EFE6DE', borderRadius: 4 }} />
          <div style={{ width: '35%', height: 32, background: '#EFE6DE', borderRadius: 9999 }} />
        </div>
      </div>
    </div>
  );
}

export function MenuSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            background: 'var(--bab-bg-card)',
            borderRadius: 'var(--bab-radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--bab-border)',
            padding: 16,
            display: 'flex',
            gap: 16,
          }}
        >
          <div style={{ width: 80, height: 80, borderRadius: 12, background: '#EFE6DE' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: '70%', height: 18, background: '#EFE6DE', borderRadius: 4 }} />
            <div style={{ width: '90%', height: 12, background: '#F7EFE8', borderRadius: 4 }} />
            <div style={{ width: '40%', height: 16, background: '#EFE6DE', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
