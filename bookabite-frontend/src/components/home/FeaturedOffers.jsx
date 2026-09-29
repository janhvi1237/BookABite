import { ArrowRight, BadgePercent, Clock3, Gift, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import './FeaturedOffers.css';

const offers = [
  {
    id: 1,
    type: 'Flat 20% off',
    title: 'Weekday dining',
    restaurant: 'Terra & Thyme',
    location: 'Koregaon Park, Pune',
    code: 'THYME20',
    icon: BadgePercent,
    description: 'Enjoy 20% off your weekday dining experience.',
  },
  {
    id: 2,
    type: 'Buffet at ₹499',
    title: 'Lunch buffet',
    restaurant: 'Mirch Masala House',
    location: 'Viman Nagar, Pune',
    code: 'MASALA499',
    icon: Clock3,
    description: 'A generous lunch buffet at an easy-on-the-pocket price.',
  },
  {
    id: 3,
    type: 'Free dessert',
    title: 'Dessert on us',
    restaurant: 'Sakura Sushi Bar',
    location: 'Kalyani Nagar, Pune',
    code: 'SAKURASWEET',
    icon: Gift,
    description: 'Book your table and enjoy a complimentary dessert.',
  },
];

export default function FeaturedOffers() {
  return (
    <section className="featured-offers">
      <div className="featured-offers__header">
        <div>
          <p className="featured-offers__eyebrow">
            Offers available, applied automatically at checkout.
          </p>

          <h2>Deals on the table.</h2>
        </div>

        <Link
          to="/restaurants"
          className="featured-offers__view-all"
        >
          Explore all offers
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="featured-offers__grid">
        {offers.map((offer) => {
          const Icon = offer.icon;

          return (
            <article
              className="offer-card"
              key={offer.id}
            >
              <div className="offer-card__top">
                <div className="offer-card__icon">
                  <Icon size={17} />
                </div>

                <span className="offer-card__type">
                  {offer.type}
                </span>
              </div>

              <div className="offer-card__content">
                <h3>{offer.title}</h3>

                <p className="offer-card__description">
                  {offer.description}
                </p>

                <div className="offer-card__restaurant">
                  <strong>{offer.restaurant}</strong>

                  <span>
                    <MapPin size={13} />
                    {offer.location}
                  </span>
                </div>
              </div>

              <div className="offer-card__footer">
                <span className="offer-card__code">
                  {offer.code}
                </span>

                <Link
                  to="/restaurants"
                  className="offer-card__button"
                >
                  Book a table
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}