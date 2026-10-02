import { api } from './client';

export const fetchAdminStats = () => api.get('/api/admin/stats');

export function fetchAdminUsers({ role = '', search = '', approval = '' } = {}) {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (approval) params.set('approval', approval);
  if (search) params.set('search', search);
  const qs = params.toString();
  return api.get(`/api/admin/users${qs ? `?${qs}` : ''}`);
}

export const setUserRole = (userId, role) =>
  api.put(`/api/admin/users/${userId}/role`, { role });

export const setOwnerApproval = (userId, approved) =>
  api.put(`/api/admin/users/${userId}/approval`, { approved });

export const fetchAdminRestaurants = () => api.get('/api/admin/restaurants');

export const setRestaurantStatus = (restaurantId, isActive) =>
  api.put(`/api/admin/restaurants/${restaurantId}/status`, { is_active: isActive });

export const assignRestaurantOwner = (restaurantId, ownerId) =>
  api.put(`/api/admin/restaurants/${restaurantId}/owner`, { owner_id: ownerId });

export const fetchAdminBookings = () => api.get('/api/admin/bookings');
