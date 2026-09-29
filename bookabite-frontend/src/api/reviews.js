import { api } from './client';

export async function fetchRestaurantReviews(restaurantId) {
  return api.get(`/api/restaurants/${restaurantId}/reviews`);
}

export async function submitReview(restaurantId, reviewData) {
  return api.post(`/api/restaurants/${restaurantId}/reviews`, reviewData);
}
