import { api } from './client';

export function fetchStatisticsReport({ startDate, endDate, restaurantId = '' }) {
  const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
  if (restaurantId) params.set('restaurant_id', restaurantId);
  return api.get(`/api/reports?${params.toString()}`);
}
