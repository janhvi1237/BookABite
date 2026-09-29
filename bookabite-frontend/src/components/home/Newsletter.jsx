import { useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import './Newsletter.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) return;

    setSubmitted(true);
    setEmail('');
  }

  return (
    <section className="newsletter">
      <div className="newsletter__inner">
        <div className="newsletter__icon">
          <Mail size={20} />
        </div>

        <p className="newsletter__eyebrow">
          STAY IN THE LOOP
        </p>

        <h2>Good tables, straight to your inbox.</h2>

        <p className="newsletter__subtitle">
          Get restaurant discoveries, special offers and dining inspiration
          from Pune.
        </p>

        {!submitted ? (
          <form
            className="newsletter__form"
            onSubmit={handleSubmit}
          >
            <div className="newsletter__input-wrap">
              <Mail size={16} />

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                required
              />
            </div>

            <button type="submit">
              Subscribe
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <div className="newsletter__success">
            <strong>You're on the list.</strong>
            <span>
              We'll keep you posted about great places to eat.
            </span>
          </div>
        )}

        <p className="newsletter__note">
          No spam. Just good food and better tables.
        </p>
      </div>
    </section>
  );
}