import { api } from './client';

export function mapRestaurant(r) {
  if (!r) return null;
  return {
    id: r.restaurant_id,
    ownerId: r.owner_id,
    name: r.name,
    description: r.description || '',
    address: r.address,
    area: r.area || 'Pune',
    city: r.city || 'Pune',
    cuisine: r.cuisine_type || 'Multi-Cuisine',
    foodType: r.food_type || 'Veg & Non-Veg',
    rating: Number(r.rating || 0),
    totalReviews: r.total_reviews || 0,
    priceForTwo: r.avg_budget_for_two ? Number(r.avg_budget_for_two) : 1200,
    openingTime: r.opening_time || '11:00 AM',
    closingTime: r.closing_time || '11:00 PM',
    image: r.cover_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    images: Array.isArray(r.images) && r.images.length > 0 ? r.images : [r.cover_image],
    isInstantBooking: Boolean(r.is_instant_booking),
    amenities: Array.isArray(r.amenities) ? r.amenities : [],
    reviewsList: Array.isArray(r.reviews_list) ? r.reviews_list : [],
  };
}

export async function fetchRestaurants(filters = {}) {
  const query = new URLSearchParams();
  if (filters.city) query.append('city', filters.city);
  if (filters.cuisine) query.append('cuisine', filters.cuisine);
  if (filters.search) query.append('search', filters.search);
  if (filters.foodType) query.append('food_type', filters.foodType);
  if (filters.minRating) query.append('min_rating', filters.minRating);
  if (filters.maxPrice) query.append('max_price', filters.maxPrice);
  if (filters.amenity) query.append('amenity', filters.amenity);
  if (filters.sortBy) query.append('sort_by', filters.sortBy);

  const qs = query.toString();
  const data = await api.get(`/api/restaurants${qs ? `?${qs}` : ''}`);
  return Array.isArray(data) ? data.map(mapRestaurant) : [];
}

export async function fetchRestaurantById(id) {
  const data = await api.get(`/api/restaurants/${id}`);
  return mapRestaurant(data);
}

export async function fetchOwnerRestaurants(ownerId) {
  const data = await api.get(`/api/restaurants/owner?owner_id=${ownerId}`);
  return Array.isArray(data) ? data.map(mapRestaurant) : [];
}

export async function createRestaurant(restaurantData) {
  const data = await api.post('/api/restaurants', restaurantData);
  return mapRestaurant(data.restaurant);
}

export async function updateRestaurant(id, restaurantData) {
  const data = await api.put(`/api/restaurants/${id}`, restaurantData);
  return mapRestaurant(data.restaurant);
}

export async function deleteRestaurant(id) {
  return api.delete(`/api/restaurants/${id}`);
}