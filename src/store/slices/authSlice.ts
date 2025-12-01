import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@services/types/api.types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// Load initial state from localStorage (for persistence)
const getInitialState = (): AuthState => {
  const accessToken = localStorage.getItem('auth_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const userStr = localStorage.getItem('user');
  
  return {
    accessToken,
    refreshToken,
    user: userStr ? JSON.parse(userStr) : null,
    isAuthenticated: !!accessToken,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string;
        user: User;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || null;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      
      // Persist to localStorage
      localStorage.setItem('auth_token', action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem('refresh_token', action.payload.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      localStorage.setItem('auth_token', action.payload);
    },
  },
});

export const { setCredentials, setUser, logout, updateToken } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

