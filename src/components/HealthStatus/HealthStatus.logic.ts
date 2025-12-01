import { useEffect, useRef } from 'react';
import { healthApi } from '@services/api';
import { useApi } from '@hooks/useApi';
import type { HealthResponse } from '@services/types/api.types';

// Global flag to prevent duplicate calls across component mounts (handles StrictMode)
let globalHealthCallInProgress = false;

export const useHealthStatusLogic = () => {
  // Health check API call
  const {
    data: healthData,
    loading: healthLoading,
    error: healthError,
    execute: checkHealth,
  } = useApi<HealthResponse>(healthApi.checkHealth);

  // Use ref to prevent multiple calls on mount
  const hasCalledRef = useRef(false);

  useEffect(() => {
    // Only call once on mount, and only if no other call is in progress
    if (!hasCalledRef.current && !globalHealthCallInProgress) {
      hasCalledRef.current = true;
      globalHealthCallInProgress = true;
      
      checkHealth().finally(() => {
        // Reset global flag after a short delay to allow StrictMode double-mount
        setTimeout(() => {
          globalHealthCallInProgress = false;
        }, 100);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  return {
    healthData,
    healthLoading,
    healthError,
    checkHealth,
  };
};

