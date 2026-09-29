import React from 'react';
import { motion } from 'framer-motion';

export default function FoodMascot({ mood = 'idle', size = 120, className = '' }) {
  // Animation variants based on mood
  const bodyVariants = {
    idle: {
      y: [0, -4, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    happy: {
      y: [0, -10, 0],
      rotate: [-1, 2, -1],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
    },
    excited: {
      y: [0, -16, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
    },
    thinking: {
      rotate: [0, -5, -5, 0],
      y: [0, -2, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    celebrating: {
      y: [0, -14, 0],
      rotate: [-4, 4, -4],
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
    },
    serving: {
      x: [-6, 6, -6],
      y: [0, -3, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const trayVariants = {
    idle: { y: 0, rotate: 0 },
    serving: {
      y: [-2, -8, -2],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
    celebrating: {
      y: [-6, -16, -6],
      rotate: [-5, 5, -5],
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const eyeExpression = () => {
    switch (mood) {
      case 'happy':
      case 'celebrating':
        // Happy arcs ^ ^
        return (
          <>
            <path d="M 38 48 Q 44 42 50 48" stroke="#2B1712" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 62 48 Q 68 42 74 48" stroke="#2B1712" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        );
      case 'excited':
        // Stars/sparkling eyes
        return (
          <>
            <circle cx="44" cy="46" r="4.5" fill="#2B1712" />
            <circle cx="46" cy="44" r="1.8" fill="#FFF" />
            <circle cx="68" cy="46" r="4.5" fill="#2B1712" />
            <circle cx="70" cy="44" r="1.8" fill="#FFF" />
          </>
        );
      case 'thinking':
        // Curious eyes looking up
        return (
          <>
            <circle cx="44" cy="44" r="3.5" fill="#2B1712" />
            <circle cx="68" cy="44" r="3.5" fill="#2B1712" />
            <path d="M 38 39 Q 44 36 50 39" stroke="#2B1712" strokeWidth="2" fill="none" />
            <path d="M 62 37 Q 68 34 74 38" stroke="#2B1712" strokeWidth="2" fill="none" />
          </>
        );
      default:
        // Warm blinking idle eyes
        return (
          <>
            <circle cx="44" cy="47" r="3.5" fill="#2B1712" />
            <circle cx="45.5" cy="45.5" r="1.2" fill="#FFF" />
            <circle cx="68" cy="47" r="3.5" fill="#2B1712" />
            <circle cx="69.5" cy="45.5" r="1.2" fill="#FFF" />
          </>
        );
    }
  };

  const mouthExpression = () => {
    switch (mood) {
      case 'happy':
      case 'excited':
      case 'celebrating':
        return <path d="M 48 55 Q 56 64 64 55 Z" fill="#D65A3A" />;
      case 'thinking':
        return <circle cx="56" cy="56" r="3" fill="#2B1712" />;
      case 'serving':
        return <path d="M 49 55 Q 56 61 63 55" stroke="#2B1712" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
      default:
        return <path d="M 50 55 Q 56 60 62 55" stroke="#2B1712" strokeWidth="2.2" strokeLinecap="round" fill="none" />;
    }
  };

  return (
    <motion.div
      className={`bab-mascot ${className}`}
      style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}
      variants={bodyVariants}
      animate={mood}
    >
      <svg
        viewBox="0 0 120 120"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="hatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFF1E8" />
          </linearGradient>
          <linearGradient id="trayGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E9B44C" />
            <stop offset="100%" stopColor="#C9942C" />
          </linearGradient>
          <filter id="mascotShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#2B1712" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Shadow base */}
        <ellipse cx="56" cy="112" rx="30" ry="6" fill="#2B1712" fillOpacity="0.12" />

        {/* Mascot Body: Friendly round café waiter */}
        <g filter="url(#mascotShadow)">
          {/* Main Round Body / Head */}
          <circle cx="56" cy="52" r="32" fill="#FFF8F0" stroke="#2B1712" strokeWidth="2.5" />

          {/* Blush cheeks */}
          <ellipse cx="36" cy="53" rx="4" ry="2.5" fill="#F4A290" fillOpacity="0.6" />
          <ellipse cx="76" cy="53" rx="4" ry="2.5" fill="#F4A290" fillOpacity="0.6" />

          {/* Eyes & Mouth */}
          {eyeExpression()}
          {mouthExpression()}

          {/* Chef / Barista Toque (Hat) with Gold Trim */}
          <path
            d="M 38 30 C 32 20 44 10 50 16 C 54 8 66 8 68 16 C 76 12 84 20 78 30 Z"
            fill="url(#hatGrad)"
            stroke="#2B1712"
            strokeWidth="2.5"
          />
          {/* Hat band */}
          <rect x="36" y="27" width="40" height="7" rx="3" fill="#D65A3A" stroke="#2B1712" strokeWidth="2" />

          {/* Chic Barista Bow Tie */}
          <path
            d="M 46 80 L 56 83 L 46 86 Z M 66 80 L 56 83 L 66 86 Z"
            fill="#D65A3A"
            stroke="#2B1712"
            strokeWidth="1.5"
          />
          <circle cx="56" cy="83" r="2.5" fill="#E9B44C" />

          {/* Apron / Uniform */}
          <path
            d="M 34 85 C 34 78 78 78 78 85 L 82 108 C 82 110 30 110 30 108 Z"
            fill="#2B1712"
          />
          <path
            d="M 44 86 L 44 108 M 68 86 L 68 108"
            stroke="#E9B44C"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Waiter Tray & Cloche / Dish */}
          <motion.g variants={trayVariants} animate={mood}>
            {/* Hand holding tray */}
            <circle cx="86" cy="74" r="6" fill="#FFF8F0" stroke="#2B1712" strokeWidth="2" />
            {/* Silver / Gold Serving Platter */}
            <ellipse cx="92" cy="70" rx="22" ry="4" fill="url(#trayGrad)" stroke="#2B1712" strokeWidth="2" />

            {/* Cloche Dome with handle */}
            {mood === 'serving' ? (
              // Cloche lifted with delicious steam!
              <>
                <path
                  d="M 78 52 C 78 40 106 40 106 52 Z"
                  fill="#FFF8F0"
                  stroke="#2B1712"
                  strokeWidth="2"
                />
                <circle cx="92" cy="39" r="2.5" fill="#E9B44C" stroke="#2B1712" strokeWidth="1.5" />
                {/* Rising aromatic steam swirls */}
                <path
                  d="M 88 64 Q 92 58 88 54 Q 84 50 88 44"
                  stroke="#D65A3A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 96 65 Q 100 59 96 55 Q 92 51 96 45"
                  stroke="#E9B44C"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : (
              // Cloche resting on platter
              <>
                <path
                  d="M 76 69 C 76 56 108 56 108 69 Z"
                  fill="#FFF8F0"
                  stroke="#2B1712"
                  strokeWidth="2"
                />
                <circle cx="92" cy="55" r="2.5" fill="#E9B44C" stroke="#2B1712" strokeWidth="1.5" />
              </>
            )}
          </motion.g>

          {/* Celebration sparks or confetti */}
          {mood === 'celebrating' && (
            <g>
              <circle cx="20" cy="24" r="3" fill="#E9B44C" />
              <circle cx="102" cy="20" r="3.5" fill="#D65A3A" />
              <circle cx="14" cy="60" r="2.5" fill="#3FA66B" />
              <path d="M 98 36 L 104 38 L 102 44 Z" fill="#E9B44C" />
              <path d="M 18 42 L 24 44 L 20 48 Z" fill="#D65A3A" />
            </g>
          )}

          {/* Thinking question mark */}
          {mood === 'thinking' && (
            <g transform="translate(86, 12)">
              <circle cx="10" cy="10" r="10" fill="#FFF8F0" stroke="#2B1712" strokeWidth="1.5" />
              <text x="7" y="15" fontSize="13" fontWeight="bold" fill="#D65A3A">?</text>
            </g>
          )}
        </g>
      </svg>
    </motion.div>
  );
}
