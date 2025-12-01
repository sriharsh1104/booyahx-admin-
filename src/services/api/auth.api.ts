import apiClient from './client';
import type { LoginRequest, AuthResponse } from '../types/api.types';

export const authApi = {
  /**
   * Login admin user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  /**
   * Logout user
   */
  logout: (): void => {
    localStorage.removeItem('auth_token');
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

