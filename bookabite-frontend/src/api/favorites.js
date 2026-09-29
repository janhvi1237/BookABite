import { api } from './client';
import { mapRestaurant } from './restaurants';

export async function fetchFavorites(userId) {
  const data = await api.get(`/api/favorites?user_id=${userId}`);
  return Array.isArray(data) ? data.map(mapRestaurant) : [];
}

export async function toggleFavorite(userId, restaurantId) {
  return api.post('/api/favorites', {
    user_id: userId,
    restaurant_id: restaurantId,
  });
}

export async function checkFavorite(userId, restaurantId) {
  return api.get(`/api/favorites/check?user_id=${userId}&restaurant_id=${restaurantId}`);
}
