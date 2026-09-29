import { useEffect, useState } from 'react';
import { ArrowRight, Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchRestaurants } from '../../api/restaurants';
import './PopularRestaurants.css';

export default function PopularRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadRestaurants() {
      try {
        setLoading(true);
        setError('');

        const result = await fetchRestaurants({
          city: 'Pune',
          sortBy: 'rating_desc',
        });

        if (!mounted) return;

        const items = Array.isArray(result) ? result : [];

        // Remove duplicate restaurants using their ID
        const uniqueRestaurants = Array.from(
          new Map(
            items.map((restaurant) => [
              restaurant.id,
              restaurant,
            ])
          ).values()
        );

        setRestaurants(uniqueRestaurants.slice(0, 6));
      } catch (err) {
        console.error('Failed to load restaurants:', err);

        if (mounted) {
          setError('Unable to load restaurants right now.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRestaurants();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="popular-restaurants">
      <div className="popular-restaurants__header">
        <div>
          <p className="popular-restaurants__eyebrow">
            Popular right now in Pune
          </p>

          <h2>Restaurants worth booking.</h2>

          <p className="popular-restaurants__subtitle">
            Discover places people are booking this week.
          </p>
        </div>

        <Link
          to="/restaurants"
          className="popular-restaurants__view-all"
        >
          See all restaurants
          <ArrowRight size={17} />
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="popular-restaurants__grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="restaurant-card restaurant-card--loading"
              key={index}
            >
              <div className="restaurant-card__image skeleton" />

              <div className="restaurant-card__body">
                <div className="skeleton skeleton--title" />
                <div className="skeleton skeleton--text" />
                <div className="skeleton skeleton--text small" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="popular-restaurants__message">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && restaurants.length === 0 && (
        <div className="popular-restaurants__message">
          <p>No restaurants are available right now.</p>
        </div>
      )}

      {/* Restaurants */}
      {!loading && !error && restaurants.length > 0 && (
        <div className="popular-restaurants__grid">
          {restaurants.map((restaurant) => {
            const id = restaurant.id;

            const name =
              restaurant.name || 'Restaurant';

            const cuisine =
              restaurant.cuisine || 'Multi-Cuisine';

            const location =
              restaurant.address ||
              restaurant.area ||
              restaurant.city ||
              'Pune';

            const rating = Number(
              restaurant.rating || 0
            );

            const reviews =
              Number(restaurant.totalReviews || 0);

            const image =
              restaurant.image || '';

            const price =
              restaurant.priceForTwo || null;

            return (
              <article
                className="restaurant-card"
                key={id || name}
              >
                {/* Image */}
                <div className="restaurant-card__image-wrap">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="restaurant-card__image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="restaurant-card__image restaurant-card__image--placeholder">
                      <span>
                        {name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="restaurant-card__favorite"
                    aria-label={`Save ${name}`}
                  >
                    <Heart size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="restaurant-card__body">
                  <div className="restaurant-card__title-row">
                    <h3>{name}</h3>

                    <span className="restaurant-card__rating">
                      <Star
                        size={14}
                        fill="currentColor"
                      />

                      {rating > 0
                        ? rating.toFixed(1)
                        : 'New'}
                    </span>
                  </div>

                  <p className="restaurant-card__cuisine">
                    {Array.isArray(cuisine)
                      ? cuisine.join(' · ')
                      : cuisine}
                  </p>

                  <div className="restaurant-card__meta">
                    <span>
                      <MapPin size={14} />
                      {location}
                    </span>

                    {reviews > 0 && (
                      <span>
                        {reviews} reviews
                      </span>
                    )}
                  </div>

                  {price && (
                    <p className="restaurant-card__price">
                      ₹
                      {Number(price).toLocaleString(
                        'en-IN'
                      )}{' '}
                      for two
                    </p>
                  )}

                  <Link
                    to={
                      id
                        ? `/restaurants/${id}`
                        : '/restaurants'
                    }
                    className="restaurant-card__button"
                  >
                    Book a table
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}