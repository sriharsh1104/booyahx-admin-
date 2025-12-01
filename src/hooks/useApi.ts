import { useState, useEffect, useCallback } from 'react';
import type { ApiError } from '@services/types/api.types';
import { getErrorMessage } from '@utils/helpers';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...args: unknown[]) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for API calls with loading and error states
 */
export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const { immediate = false, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: unknown[]) => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(...args);
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        const apiError: ApiError = {
          message: getErrorMessage(err),
          status: (err as ApiError)?.status,
          errors: (err as ApiError)?.errors,
        };
        setError(apiError);
        onError?.(apiError);
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, reset };
}

