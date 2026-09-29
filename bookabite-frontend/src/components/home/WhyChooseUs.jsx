import {
  Check,
  CreditCard,
  QrCode,
  Sparkles,
} from 'lucide-react';
import './WhyChooseUs.css';

const benefits = [
  {
    id: 1,
    icon: Check,
    title: 'Instant confirmation',
    description: 'Real tables, real-time — no “we’ll call you back.”',
  },
  {
    id: 2,
    icon: QrCode,
    title: 'QR check-in',
    description: 'Show up, scan, sit down.',
  },
  {
    id: 3,
    icon: Sparkles,
    title: 'Mood-based search',
    description: 'Find a vibe, not just a cuisine.',
  },
  {
    id: 4,
    icon: CreditCard,
    title: 'Secure payments',
    description: 'Razorpay-backed, every time.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="why-choose">
      <div className="why-choose__header">
        <p className="why-choose__eyebrow">
          WHY BOOKABITE
        </p>

        <h2>
          Why Choose <span>BookABite</span>
        </h2>

        <p className="why-choose__subtitle">
          Built to feel less like a form, more like a table
          someone's already holding for you.
        </p>
      </div>

      <div className="why-choose__grid">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <article
              className="why-choose__card"
              key={benefit.id}
            >
              <div className="why-choose__icon">
                <Icon size={17} />
              </div>

              <div className="why-choose__content">
                <h3>{benefit.title}</h3>

                <p>{benefit.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}