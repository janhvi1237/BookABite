import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHome, HiOutlineSearch } from 'react-icons/hi';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useMascot } from '../../context/MascotContext';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const { triggerReaction } = useMascot();

  useEffect(() => {
    triggerReaction('thinking', 'Looking for a table here? Looks like this page went off-menu!', 4500);
  }, []);

  return (
    <div className="bab-notfound-page">
      <div className="bab-notfound-card">
        <FoodMascot mood="thinking" size={110} />
        <span className="bab-notfound-code">404</span>
        <h1>Oops! Table Not Found</h1>
        <p>
          It seems the dish or page you were craving has either moved to another table or is still being prepared in the kitchen.
        </p>

        <div className="bab-notfound-actions">
          <Link to="/" className="bab-btn bab-btn--secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <HiOutlineHome size={18} /> Back to Home
          </Link>
          <Link to="/explore" className="bab-btn bab-btn--outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <HiOutlineSearch size={18} /> Explore Restaurants
          </Link>
        </div>
      </div>
    </div>
  );
}
