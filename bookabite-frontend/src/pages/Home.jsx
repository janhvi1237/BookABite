import LovableHero from '../components/home/LovableHero';
import Categories from '../components/home/Categories';
import PopularRestaurants from '../components/home/PopularRestaurants';
import FeaturedOffers from '../components/home/FeaturedOffers';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Testimonials from '../components/home/Testimonials';
import Newsletter from '../components/home/Newsletter';

export default function Home() {
  return (
    <>
      <LovableHero />
      <Categories />
      <PopularRestaurants />
      <FeaturedOffers />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </>
  );
}