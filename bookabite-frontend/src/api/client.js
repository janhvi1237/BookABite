const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bookabite_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  // Login expired or invalid: clear the saved session and send the person to the right login page.
  if (res.status === 401 && token && !path.startsWith('/api/auth/login')) {
    localStorage.removeItem('bookabite_token');
    localStorage.removeItem('bookabite_user');
    const here = window.location.pathname;
    if (!here.includes('login')) {
      window.location.href = here.startsWith('/admin')
        ? '/admin/login'
        : here.startsWith('/owner')
          ? '/owner/login'
          : '/login';
    }
  }

  if (!res.ok) {
    const error = new Error(data?.error || data?.message || 'Request failed');
    error.status = res.status;
    error.details = data?.details || data?.errors;
    throw error;
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { method: 'GET', ...options }),
  post: (path, body, options) => request(path, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (path, body, options) => request(path, { method: 'PUT', body: JSON.stringify(body), ...options }),
  patch: (path, body, options) => request(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, ...options }),
  delete: (path, options) => request(path, { method: 'DELETE', ...options }),
};