import { Quote, Star } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
  {
    id: 1,
    name: 'Aarav Mehta',
    role: 'Weekend diner',
    rating: 5,
    text: 'Booking a table was surprisingly simple. I found a great place in Pune and had my confirmation within seconds.',
  },
  {
    id: 2,
    name: 'Riya Shah',
    role: 'Food explorer',
    rating: 5,
    text: 'I love being able to discover restaurants by the kind of evening I want. The whole experience feels effortless.',
  },
  {
    id: 3,
    name: 'Kabir Joshi',
    role: 'Regular diner',
    rating: 5,
    text: 'No more calling restaurants to check availability. Pick a time, book the table and you are done.',
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="testimonials__header">
        <p className="testimonials__eyebrow">
          REAL PEOPLE. REAL TABLES.
        </p>

        <h2>What Pune's saying.</h2>

        <p className="testimonials__subtitle">
          Good food tastes even better when the table is already waiting.
        </p>
      </div>

      <div className="testimonials__grid">
        {testimonials.map((testimonial) => (
          <article
            className="testimonial-card"
            key={testimonial.id}
          >
            <div className="testimonial-card__top">
              <div className="testimonial-card__quote">
                <Quote size={17} />
              </div>

              <div className="testimonial-card__stars">
                {Array.from({ length: testimonial.rating }).map(
                  (_, index) => (
                    <Star
                      key={index}
                      size={12}
                      fill="currentColor"
                    />
                  )
                )}
              </div>
            </div>

            <p className="testimonial-card__text">
              “{testimonial.text}”
            </p>

            <div className="testimonial-card__author">
              <div className="testimonial-card__avatar">
                {testimonial.name.charAt(0)}
              </div>

              <div>
                <h3>{testimonial.name}</h3>
                <p>{testimonial.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}