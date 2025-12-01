import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, CancelTokenSource } from 'axios';
import type { ApiError } from '../types/api.types';
import { store } from '../../store/store';
import { selectAccessToken, logout } from '../../store/slices/authSlice';
import { startLoading, stopLoading } from '../../store/slices/loadingSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Request deduplication - prevent duplicate requests
const pendingRequests = new Map<string, CancelTokenSource>();

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token, deduplicate requests, and show loading
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = selectAccessToken(state);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Request deduplication - cancel duplicate requests within 100ms
    const requestKey = `${config.method?.toUpperCase()}_${config.url}`;
    const existingRequest = pendingRequests.get(requestKey);

    if (existingRequest) {
      // Cancel the previous request
      existingRequest.cancel('Duplicate request cancelled');
    } else {
      // Start loading only for new requests (not duplicates)
      store.dispatch(startLoading());
    }

    // Create cancel token for this request
    const cancelTokenSource = axios.CancelToken.source();
    config.cancelToken = cancelTokenSource.token;
    pendingRequests.set(requestKey, cancelTokenSource);

    // Clean up after request completes (with delay to handle rapid duplicates)
    setTimeout(() => {
      pendingRequests.delete(requestKey);
    }, 100);

    return config;
  },
  (error) => {
    // Stop loading on request error
    store.dispatch(stopLoading());
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors, clean up pending requests, and stop loading
apiClient.interceptors.response.use(
  (response) => {
    // Clean up pending request
    const requestKey = `${response.config.method?.toUpperCase()}_${response.config.url}`;
    pendingRequests.delete(requestKey);
    // Stop loading on successful response
    store.dispatch(stopLoading());
    return response;
  },
  (error: AxiosError) => {
    // Clean up pending request
    if (error.config) {
      const requestKey = `${error.config.method?.toUpperCase()}_${error.config.url}`;
      pendingRequests.delete(requestKey);
    }

    // Ignore cancelled requests (deduplication) - don't stop loading for cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Stop loading on error (except cancelled requests)
    store.dispatch(stopLoading());

    const apiError: ApiError = {
      message: error.message || 'An error occurred',
      status: error.response?.status,
    };

    if (error.response?.data) {
      const data = error.response.data as { message?: string; errors?: Record<string, string[]> };
      if (data.message) {
        apiError.message = data.message;
      }
      if (data.errors) {
        apiError.errors = data.errors;
      }
    }

    // Handle 401 Unauthorized - Clear token via Redux and redirect to login
    if (error.response?.status === 401) {
      store.dispatch(logout());
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;

