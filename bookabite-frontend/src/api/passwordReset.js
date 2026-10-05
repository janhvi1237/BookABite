import { api } from './client';

export function requestPasswordReset(email) {
  return api.post('/api/auth/password/forgot', { email });
}

export function resetPassword(token, password) {
  return api.post('/api/auth/password/reset', { token, password });
}
