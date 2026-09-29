import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UtensilsCrossed, CalendarCheck, Heart, Shuffle } from 'lucide-react';
import './LovableHero.css';

const VIBES = ['Date Night', 'Quick Bite', 'Weekend Brunch', 'Solo & Cozy', 'Big Group'];

const PREVIEW_CARDS = [
  {
    id: 'main',
    name: 'Ember & Oak',
    meta: 'North Indian · ₹₹₹ · Pune',
    variant: 'main',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
    live: true,
  },
  {
    id: 'tall',
    name: 'Rooftop Brew',
    meta: 'Café · ₹₹ · Pune',
    variant: 'tall',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=700&q=80',
    live: false,
  },
  {
    id: 'wide',
    name: 'The Marigold Table',
    meta: 'Fine Dining · Pune',
    variant: 'wide',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    live: true,
  },
];

const STEPS = [
  { icon: Search, title: 'Discover', body: 'Filter by cuisine, budget and neighbourhood until something makes you hungry.' },
  { icon: UtensilsCrossed, title: 'Browse the menu', body: 'See dishes, prices and restaurant details before you arrive.' },
  { icon: CalendarCheck, title: 'Book the table', body: 'Pick a date, time and party size and confirm in a few taps.' },
  { icon: Heart, title: 'Save the good ones', body: 'Keep favourite restaurants close for your next spontaneous meal.' },
];

export default function LovableHero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeVibe, setActiveVibe] = useState(null);

  const goToRestaurants = (search = query, vibe = activeVibe) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (vibe) params.set('vibe', vibe);
    const qs = params.toString();
    navigate(qs ? `/restaurants?${qs}` : '/restaurants');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    goToRestaurants();
  };

  const handleVibe = (vibe) => {
    const next = activeVibe === vibe ? null : vibe;
    setActiveVibe(next);
    if (next) goToRestaurants(query, next);
  };

  const surprise = () => {
    const vibe = VIBES[Math.floor(Math.random() * VIBES.length)];
    setActiveVibe(vibe);
    goToRestaurants('', vibe);
  };

  return (
    <>
      <section className="bab-lovable-hero">
        <div className="bab-lovable-hero__glow bab-lovable-hero__glow--one" />
        <div className="bab-lovable-hero__glow bab-lovable-hero__glow--two" />
        <div className="bab-lovable-container bab-lovable-hero__grid">
          <div className="bab-lovable-hero__copy">
            <span className="bab-lovable-eyebrow"><span /> Tables worth showing up for</span>
            <h1>Find the table you'll talk about <em>tomorrow.</em></h1>
            <p>Discover neighbourhood cafés and celebrated kitchens, browse real menus, read honest reviews and reserve your table in a few taps.</p>

            <div className="bab-lovable-vibes" aria-label="Filter by vibe">
              {VIBES.map((vibe) => (
                <button key={vibe} type="button" className={activeVibe === vibe ? 'is-active' : ''} onClick={() => handleVibe(vibe)}>
                  {vibe}
                </button>
              ))}
            </div>

            <form className="bab-lovable-search" onSubmit={handleSearch}>
              <Search size={19} aria-hidden="true" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search restaurants, cuisines, areas…" aria-label="Search restaurants" />
              <button type="submit">Explore</button>
            </form>

            <div className="bab-lovable-actions">
              <button type="button" className="bab-lovable-surprise" onClick={surprise}><Shuffle size={16} /> Surprise me</button>
              <span className="bab-lovable-live"><i /> BookABite is ready for your next table</span>
            </div>
          </div>

          <div className="bab-lovable-bento" aria-label="Restaurant preview">
            {PREVIEW_CARDS.map((card) => (
              <article key={card.id} className={`bab-lovable-card bab-lovable-card--${card.variant}`} style={{ backgroundImage: `url(${card.image})` }}>
                <div className="bab-lovable-card__overlay" />
                {card.live && <span className="bab-lovable-card__live">● Live</span>}
                <div className="bab-lovable-card__content">
                  <strong>{card.name}</strong>
                  <span>{card.meta}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bab-lovable-container bab-lovable-steps">
        {STEPS.map(({ icon: Icon, title, body }) => (
          <article key={title} className="bab-lovable-step">
            <span><Icon size={20} /></span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
