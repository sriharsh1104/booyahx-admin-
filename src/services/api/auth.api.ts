import apiClient from './client';
import type { LoginRequest, AuthResponse } from '../types/api.types';
import { store } from '../../store/store';
import { selectRefreshToken } from '../../store/slices/authSlice';

export const authApi = {
  /**
   * Login admin user
   * Note: Redux state will be updated by the component calling this
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/api/auth/login', data);
    
    // API returns { status, success, message, data: { accessToken, refreshToken, user } }
    const authData = response.data.data;
    
    if (!authData.accessToken) {
      throw new Error('Access token not received from server');
    }
    
    return authData;
  },

  /**
   * Logout user
   * Note: Redux state will be updated by the component calling this
   */
  logout: async (): Promise<void> => {
    // Get refresh token from Redux store
    const state = store.getState();
    const refreshToken:any = selectRefreshToken(state as any);
    
    try {
      // Send refresh token in request body if available
      if (refreshToken) {
        await apiClient.post('/api/auth/logout', { refreshToken });
      } else {
        await apiClient.post('/api/auth/logout');
      }
    } catch (error: any) {
      // Silently ignore 404 or route not found errors
      // Logout endpoint might not exist on backend, which is fine
      if (error?.response?.status !== 404) {
        console.warn('Logout API call failed:', error?.message || 'Unknown error');
      }
      // Continue with logout even if API call fails
    }
    // Note: Redux state will be cleared by the component
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get<AuthResponse['user']>('/api/auth/profile');
    return response.data;
  },
};

