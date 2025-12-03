import apiClient from './client';
import type { HealthResponse } from '../types/api.types';

export const healthApi = {
  /**
   * Check API health status
   */
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },
};

