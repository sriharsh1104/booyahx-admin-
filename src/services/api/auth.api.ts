import apiClient from './client';
import type { LoginRequest, AuthResponse } from '../types/api.types';

export const authApi = {
  /**
   * Login admin user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/api/auth/login', data);
    
    // API returns { status, success, message, data: { accessToken, refreshToken, user } }
    const authData = response.data.data;
    
    // Store accessToken in localStorage
    if (authData.accessToken) {
      localStorage.setItem('auth_token', authData.accessToken);
    } else {
      throw new Error('Access token not received from server');
    }
    
    // Optionally store refreshToken if provided
    if (authData.refreshToken) {
      localStorage.setItem('refresh_token', authData.refreshToken);
    }
    
    return authData;
  },

  /**
   * Logout user
   * Note: If backend logout endpoint doesn't exist, logout will still work client-side
   */
  logout: async (): Promise<void> => {
    // Get refresh token before clearing localStorage
    const refreshToken = localStorage.getItem('refresh_token');
    
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
    } finally {
      // Clear tokens and user data from localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get<AuthResponse['user']>('/api/auth/profile');
    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};

