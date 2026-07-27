import { Link } from 'react-router-dom';
import './Footer.css';

const FOOTER_COLUMNS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Restaurants in Pune', to: '/restaurants' },
      { label: 'Surprise Me', to: '/restaurants?surprise=1' },
      { label: 'Offers', to: '/restaurants?filter=offers' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'My Bookings', to: '/bookings' },
      { label: 'Cravings', to: '/favorites' },
      { label: 'Profile & Settings', to: '/profile' },
    ],
  },
  {
    heading: 'BookABite',
    links: [
      { label: 'About', to: '/about' },
      { label: 'For Restaurant Owners', to: '/partner' },
      { label: 'Help', to: '/help' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bab-footer">
      <div className="bab-footer__inner">
        <div className="bab-footer__top">
          <div className="bab-footer__brand">
            <span className="bab-footer__logo">BookABite</span>
            <p className="bab-footer__tagline">
              Find your table in Pune — no queues, no guesswork, just good food.
            </p>
          </div>

          <div className="bab-footer__columns">
            {FOOTER_COLUMNS.map((col) => (
              <div className="bab-footer__col" key={col.heading}>
                <h4>{col.heading}</h4>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bab-footer__divider" aria-hidden="true" />

        <div className="bab-footer__bottom">
          <span>© {year} BookABite. Made in Pune.</span>
          <div className="bab-footer__socials">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Twitter / X">X</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
