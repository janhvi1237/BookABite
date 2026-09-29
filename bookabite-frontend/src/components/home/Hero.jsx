import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

const VIBES = [
  "Date Night",
  "Quick Bite",
  "Weekend Brunch",
  "Solo & Cozy",
  "Big Group",
];

const PREVIEW_CARDS = [
  {
    id: "main",
    name: "Ember & Oak",
    meta: "North Indian · ₹₹₹ · Kothrud",
    variant: "main",
    live: true,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=60",
  },
  {
    id: "tall",
    name: "Rooftop Brew",
    meta: "Café · ₹₹ · Koregaon Park",
    variant: "tall",
    live: false,
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=60",
  },
  {
    id: "wide",
    name: "The Marigold Table",
    meta: "Fine Dining · Baner",
    variant: "wide",
    live: true,
    image: null,
  },
];

export default function Hero({ theme = "light" }) {
  const navigate = useNavigate();

  const [activeVibe, setActiveVibe] = useState(null);
  const [query, setQuery] = useState("");

  /*
   * Send the user to the restaurant listing page.
   *
   * Example:
   * /restaurants?vibe=Date%20Night&search=pizza
   */
  const goToRestaurants = ({ search = "", vibe = null } = {}) => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (vibe) {
      params.set("vibe", vibe);
    }

    const queryString = params.toString();

    navigate(queryString ? `/restaurants?${queryString}` : "/restaurants");
  };

  const handleSearch = (e) => {
    e.preventDefault();

    goToRestaurants({
      search: query,
      vibe: activeVibe,
    });
  };

  const handleVibeClick = (vibe) => {
    const nextVibe = activeVibe === vibe ? null : vibe;

    setActiveVibe(nextVibe);

    /*
     * Selecting a vibe immediately takes the user
     * to restaurants matching that vibe.
     */
    if (nextVibe) {
      goToRestaurants({
        vibe: nextVibe,
        search: query,
      });
    }
  };

  const handleSurprise = () => {
    const randomVibe =
      VIBES[Math.floor(Math.random() * VIBES.length)];

    setActiveVibe(randomVibe);

    goToRestaurants({
      vibe: randomVibe,
    });
  };

  return (
    <section className="bab-hero" data-theme={theme}>
      <div className="container bab-hero__inner">
        <div className="row align-items-center gy-5">

          {/* =========================
              LEFT CONTENT
          ========================== */}
          <div className="col-12 col-lg-6">

            <span className="bab-eyebrow">
              <span
                className="bab-eyebrow__dot"
                aria-hidden="true"
              />

              Pune&apos;s tables, sorted by vibe
            </span>

            <h1 className="bab-headline">
              Find a table that{" "}
              <em>matches the mood</em>, not just the menu.
            </h1>

            <p className="bab-subhead">
              Skip the endless scrolling. Tell us what tonight&apos;s
              for — a first date, a quick solo bite, or a table for
              twelve — and we&apos;ll pull up Pune spots that actually
              fit.
            </p>

            {/* =========================
                VIBE FILTERS
            ========================== */}
            <div
              className="bab-vibes"
              role="group"
              aria-label="Filter by vibe"
            >
              {VIBES.map((vibe) => (
                <button
                  key={vibe}
                  type="button"
                  className={`bab-vibe${
                    activeVibe === vibe ? " is-active" : ""
                  }`}
                  onClick={() => handleVibeClick(vibe)}
                  aria-pressed={activeVibe === vibe}
                >
                  {vibe}
                </button>
              ))}
            </div>

            {/* =========================
                SEARCH
            ========================== */}
            <form
              className="bab-search"
              onSubmit={handleSearch}
            >
              <input
                type="text"
                placeholder="Search restaurants, cuisines, areas…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search restaurants"
              />

              <button type="submit">
                Find My Table
              </button>
            </form>

            {/* =========================
                ACTIONS
            ========================== */}
            <div className="bab-actions">

              <button
                type="button"
                className="bab-surprise"
                onClick={handleSurprise}
              >
                <span
                  className="bab-surprise__icon"
                  aria-hidden="true"
                >
                  🎲
                </span>

                Surprise Me
              </button>

              <span className="bab-pulse">
                <span
                  className="bab-pulse__dot"
                  aria-hidden="true"
                />

                <strong>14 tables</strong>
                &nbsp;opened up in the last hour
              </span>

            </div>
          </div>

          {/* =========================
              RIGHT BENTO PREVIEW
          ========================== */}
          <div className="col-12 col-lg-6">
            <div
              className="bab-bento"
              aria-hidden="true"
            >
              {PREVIEW_CARDS.map((card) => (
                <div
                  key={card.id}
                  className={`bab-card bab-card--${card.variant}`}
                  style={
                    card.image
                      ? {
                          backgroundImage: `url(${card.image})`,
                        }
                      : undefined
                  }
                >
                  {card.image && (
                    <div className="bab-card__overlay" />
                  )}

                  {card.live && (
                    <span className="bab-card__badge bab-card__badge--live">
                      ● Live
                    </span>
                  )}

                  <div className="bab-card__body">
                    <div className="bab-card__name">
                      {card.name}
                    </div>

                    <div className="bab-card__meta">
                      {card.meta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}