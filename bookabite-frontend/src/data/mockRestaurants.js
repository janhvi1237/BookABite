// Mock data shaped to match the agreed backend response for
// GET /api/restaurants?city=Pune — swap this import for a real
// fetch once that endpoint is live; component code shouldn't need to change.

export const mockRestaurants = [
  { id: 1, name: 'Terra & Thyme', cuisine: 'Modern European', area: 'Koregaon Park', rating: 4.6, priceForTwo: 1800, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', tablesLeftTonight: 3, amenities: ['Rooftop', 'Couple Friendly', 'Instant Booking'] },
  { id: 2, name: 'Mirch Masala House', cuisine: 'North Indian, Mughlai', area: 'FC Road', rating: 4.4, priceForTwo: 1200, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80', tablesLeftTonight: 7, amenities: ['Family Friendly', 'Buffet'] },
  { id: 3, name: 'The Brewing Pot', cuisine: 'Continental, Microbrewery', area: 'Kalyani Nagar', rating: 4.5, priceForTwo: 1600, image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&q=80', tablesLeftTonight: 2, amenities: ['Live Music', 'Outdoor Seating'] },
  { id: 4, name: 'Sakura Sushi Bar', cuisine: 'Japanese', area: 'Viman Nagar', rating: 4.7, priceForTwo: 2200, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80', tablesLeftTonight: 4, amenities: ['Instant Booking', 'Offers Available'] },
  { id: 5, name: 'Baba\u2019s Kitchen', cuisine: 'Maharashtrian, Thali', area: 'Deccan Gymkhana', rating: 4.3, priceForTwo: 700, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80', tablesLeftTonight: 9, amenities: ['Pure Veg', 'Family Friendly'] },
  { id: 6, name: 'Rooftop 41', cuisine: 'Pan-Asian, Bar', area: 'Baner', rating: 4.5, priceForTwo: 2000, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', tablesLeftTonight: 1, amenities: ['Rooftop', 'Date Night'] },
];

export const mockOffers = [
  { id: 'o1', title: 'Flat 20% off', subtitle: 'On weekday dinners at Terra & Thyme', code: 'THYME20', color: '#C4623D' },
  { id: 'o2', title: 'Buffet at ₹499', subtitle: 'Mirch Masala House, lunch only', code: 'MASALA499', color: '#6B8F5A' },
  { id: 'o3', title: 'Free dessert', subtitle: 'With any booking at Sakura Sushi Bar', code: 'SAKURASWEET', color: '#D9A441' },
];

export const moodTags = [
  { label: 'Date Night', emoji: '🕯️' },
  { label: 'Quick Bite', emoji: '⚡' },
  { label: 'Celebration', emoji: '🎉' },
  { label: 'Work Meeting', emoji: '💼' },
  { label: 'Rooftop', emoji: '🌇' },
  { label: 'Pure Veg', emoji: '🌿' },
];