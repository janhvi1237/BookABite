import './SteamMark.jsx';

/**
 * The BookABite brand mark: a plate with rising steam wisps.
 * This same silhouette recurs as the "Simmering..." loader elsewhere in the app —
 * here it sits still by default and only animates on hover, so the motion
 * stays meaningful instead of decorative.
 */
export default function SteamMark({ size = 34, animate = false }) {
  return (
    <svg
      className={`steam-mark${animate ? ' steam-mark--animate' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="32" cy="42" r="17" fill="var(--bab-accent)" />
      <ellipse cx="32" cy="42" rx="11.5" ry="5.5" fill="var(--bab-bg)" opacity="0.9" />
      <path
        className="steam-wisp steam-wisp--1"
        d="M23 20c-2.2 3.2 2.2 4.4 0 8.6"
        stroke="var(--bab-accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        className="steam-wisp steam-wisp--2"
        d="M32 15c-2.2 3.2 2.2 4.4 0 8.6"
        stroke="var(--bab-accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        className="steam-wisp steam-wisp--3"
        d="M41 20c-2.2 3.2 2.2 4.4 0 8.6"
        stroke="var(--bab-accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
