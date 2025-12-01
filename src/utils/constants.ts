export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.gaminghuballday.buzz';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  HEALTH: '/health',
  PROFILE: '/profile',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
} as const;

