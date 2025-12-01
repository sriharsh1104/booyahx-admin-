import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, healthApi } from '@services/api';
import { useApi } from '@hooks/useApi';
import type { HealthResponse, User } from '@services/types/api.types';
import { ROUTES } from '@utils/constants';

export const useDashboardLogic = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Health check API call
  const {
    data: healthData,
    loading: healthLoading,
    error: healthError,
    execute: checkHealth,
  } = useApi<HealthResponse>(healthApi.checkHealth);

  useEffect(() => {
    // Check authentication
    if (!authApi.isAuthenticated()) {
      navigate(ROUTES.LOGIN);
      return;
    }

    // Load user data
    const loadUser = async () => {
      try {
        const userData = await authApi.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // If profile fetch fails, try to get from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    };

    loadUser();
    checkHealth();
  }, [navigate, checkHealth]);

  const handleLogout = () => {
    authApi.logout();
    navigate(ROUTES.LOGIN);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return {
    user,
    sidebarOpen,
    healthData,
    healthLoading,
    healthError,
    handleLogout,
    toggleSidebar,
    checkHealth,
  };
};

