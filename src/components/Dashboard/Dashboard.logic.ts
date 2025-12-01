import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@services/api';
import { ROUTES } from '@utils/constants';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectUser, selectIsAuthenticated, setUser, logout } from '@store/slices/authSlice';

export const useDashboardLogic = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    // Check authentication from Redux
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    // Load user data if not already in Redux
    const loadUser = async () => {
      if (user) {
        // User already in Redux, no need to fetch
        return;
      }

      try {
        const userData = await authApi.getProfile();
        dispatch(setUser(userData));
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // User data will remain from Redux state (loaded from localStorage on init)
      }
    };

    loadUser();
  }, [navigate, isAuthenticated, user, dispatch]);

  const handleLogoutConfirm = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear Redux state (this also clears localStorage)
      dispatch(logout());
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return {
    user,
    sidebarOpen,
    toggleSidebar,
    showLogoutModal,
    setShowLogoutModal,
    handleLogoutConfirm,
    showSettingsModal,
    setShowSettingsModal,
  };
};

