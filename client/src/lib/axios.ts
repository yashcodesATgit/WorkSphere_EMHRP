import axios from 'axios';

const TOKEN_KEY = 'ws_token';

export type UserRole = 'ADMIN' | 'HR' | 'EMPLOYEE';

export const tokenStorage = {
  get: (): string | null => {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  },

  getSource: (): 'sessionStorage' | 'localStorage' | null => {
    if (sessionStorage.getItem(TOKEN_KEY)) return 'sessionStorage';
    if (localStorage.getItem(TOKEN_KEY)) return 'localStorage';
    return null;
  },

  set: (token: string, role?: UserRole) => {
    if (role === 'ADMIN' || role === 'HR') {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    } else if (role === 'EMPLOYEE') {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      // Fallback
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  },

  remove: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token to every request if one exists
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid/expired, clear it and redirect to login
    if (error.response?.status === 401) {
      tokenStorage.remove();
      // Use replace so the user can't "back" into the broken session
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
