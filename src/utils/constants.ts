export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.gaminghuballday.buzz';
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'booyahx-admin';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  HEALTH: '/health',
  PROFILE: '/profile',
  GENERATE_LOBBY: '/generate-lobby',
  TOP_UP: '/top-up',
  HOST_CREATION: '/host-creation',
  USER_HISTORY: '/user-history',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
} as const;

