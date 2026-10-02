import React from 'react';

export default function HeroDiningIllustration() {
  return (
    <div
      className="bab-hero-dining"
      role="img"
      aria-label="A freshly served pasta dish on a cafe table"
    >
      <div className="bab-hero-dining__glow" />
      <svg
        className="bab-hero-dining__art"
        viewBox="0 0 560 440"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="dining-table" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f9ead3" />
            <stop offset="100%" stopColor="#e9c7a7" />
          </linearGradient>
          <linearGradient id="dining-plate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fffefa" />
            <stop offset="100%" stopColor="#f3e7d8" />
          </linearGradient>
          <linearGradient id="dining-sauce" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d97942" />
            <stop offset="100%" stopColor="#a9432c" />
          </linearGradient>
          <filter id="dining-shadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#573622" floodOpacity="0.2" />
          </filter>
        </defs>

        <ellipse cx="280" cy="390" rx="170" ry="22" fill="#76523b" opacity="0.12" />
        <g filter="url(#dining-shadow)">
          <circle cx="280" cy="220" r="166" fill="url(#dining-plate)" />
          <circle cx="280" cy="220" r="148" fill="none" stroke="#d9b77f" strokeWidth="2" />
          <circle cx="280" cy="220" r="113" fill="#fffaf2" />
          <circle cx="280" cy="220" r="98" fill="url(#dining-sauce)" />

          <g fill="none" stroke="#f4c778" strokeLinecap="round">
            <path d="M210 207c28-48 100-45 126-4 25 39-18 72-57 61-35-10-34-49-3-57 24-6 42 12 32 29" strokeWidth="8" />
            <path d="M222 239c16 29 59 42 87 23 19-13 20-31 7-42" strokeWidth="6" />
            <path d="M231 185c31-24 77-14 93 10" strokeWidth="5" />
            <path d="M197 224c-2 20 9 39 25 50" strokeWidth="5" />
          </g>

          <g fill="#e98a58">
            <circle cx="236" cy="197" r="12" />
            <circle cx="316" cy="190" r="11" />
            <circle cx="300" cy="260" r="12" />
            <circle cx="224" cy="247" r="10" />
          </g>
          <g fill="#6c3325">
            <ellipse cx="263" cy="177" rx="7" ry="10" />
            <ellipse cx="335" cy="226" rx="7" ry="10" />
            <ellipse cx="260" cy="274" rx="7" ry="10" />
          </g>
          <g fill="#5e8060">
            <path d="M278 194c-22-19-10-32 8-24 12 6 10 17-8 24Z" />
            <path d="M328 253c-24-8-22-25-3-25 14 0 17 11 3 25Z" />
            <path d="M210 216c-8-22 7-29 18-15 9 11 2 20-18 15Z" />
          </g>
          <g fill="none" stroke="#d9b77f" strokeLinecap="round" strokeWidth="2">
            <path d="M278 194l5-17" />
            <path d="M328 253l8-20" />
            <path d="M210 216l15-10" />
          </g>
        </g>

        <g className="bab-hero-dining__sparkle" fill="#c9794f">
          <path d="M92 147c3 11 7 15 18 18-11 3-15 7-18 18-3-11-7-15-18-18 11-3 15-7 18-18Z" />
          <path d="M443 266c2 7 5 10 12 12-7 2-10 5-12 12-2-7-5-10-12-12 7-2 10-5 12-12Z" />
        </g>
        <circle cx="424" cy="155" r="5" fill="#e0ae51" />
        <circle cx="124" cy="294" r="4" fill="#e0ae51" />
      </svg>

      <div className="bab-hero-dining__note bab-hero-dining__note--top">
        <span className="bab-hero-dining__note-icon">✦</span>
        <span>Made for sharing</span>
      </div>
      <div className="bab-hero-dining__note bab-hero-dining__note--bottom">
        <strong>Good food.</strong>
        <span>Great company.</span>
      </div>
    </div>
  );
}
