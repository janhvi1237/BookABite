import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import Categories from '../components/home/Categories';
import PopularRestaurants from '../components/home/PopularRestaurants';
import FeaturedOffers from '../components/home/FeaturedOffers';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Testimonials from '../components/home/Testimonials';
import Newsletter from '../components/home/Newsletter';

export default function Home() {
  return (
    <>
      {/* Main homepage introduction */}
      <Hero />

      {/* Cinematic / liquid-glass contrast section */}
      <HowItWorks />

      {/* Restaurant discovery */}
      <Categories />
      <PopularRestaurants />

      {/* Remaining homepage content */}
      <FeaturedOffers />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </>
  );
}