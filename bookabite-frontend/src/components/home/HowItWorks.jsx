import React from 'react';
import { Search, CalendarCheck, Utensils, Heart } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discover',
    text: 'Find restaurants, cafés and dining experiences that match your mood.',
  },
  {
    number: '02',
    icon: CalendarCheck,
    title: 'Choose your table',
    text: 'Pick the date, time and number of guests that work for you.',
  },
  {
    number: '03',
    icon: Utensils,
    title: 'Book with ease',
    text: 'Reserve your table in just a few clicks without the hassle.',
  },
  {
    number: '04',
    icon: Heart,
    title: 'Enjoy & remember',
    text: 'Save your favourites and discover your next great meal.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="how-it-works__container">
        <div className="how-it-works__heading">
          <span className="how-it-works__eyebrow">
            SIMPLE BY DESIGN
          </span>

          <h2>
            From craving
            <span> to table.</span>
          </h2>

          <p>
            BookABite makes finding and reserving your next dining
            experience effortless.
          </p>
        </div>

        <div className="how-it-works__steps">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article className="how-it-works__step" key={step.number}>
                <div className="how-it-works__top">
                  <span className="how-it-works__number">
                    {step.number}
                  </span>

                  <div className="how-it-works__icon">
                    <Icon size={25} strokeWidth={1.7} />
                  </div>
                </div>

                <h3>{step.title}</h3>

                <p>{step.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}