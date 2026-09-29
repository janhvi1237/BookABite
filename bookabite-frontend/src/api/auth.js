import { api } from './client';

export async function loginUser(email, password) {
  return api.post('/api/auth/login', {
    email: email.trim(),
    password,
  });
}

export async function registerUser({ fullName, email, password, phone = '', role = 'customer' }) {
  return api.post('/api/auth/register', {
    full_name: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    phone: phone ? phone.trim() : null,
    role,
  });
}

export async function fetchCurrentUser(userId) {
  return api.get(`/api/auth/me?user_id=${userId}`);
}

export async function updateUserProfile(userId, profileData) {
  return api.put('/api/auth/profile', {
    user_id: userId,
    ...profileData,
  });
}