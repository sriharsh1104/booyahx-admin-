import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, usersApi, type AdminUser } from '@services/api';
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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ page: number; total: number; totalPages: number } | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'host' | 'user'>('admin');
  const [userQuery, setUserQuery] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);

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

  // Load users list based on role filter
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        // If filter is 'all', don't pass role parameter
        const role = roleFilter === 'all' ? undefined : roleFilter;
        const result = await usersApi.getUsers(role);
        setUsers(result.users);
        if (result.pagination) {
          setPagination({
            page: result.pagination.page,
            total: result.pagination.total,
            totalPages: result.pagination.totalPages,
          });
        }
      } catch (error: any) {
        console.error('Failed to load users:', error);
        // Show specific error message if format is wrong
        if (error?.message?.includes('Invalid API response format')) {
          setUsersError(`API Format Error: ${error.message}. Please check the API response structure.`);
        } else {
          setUsersError(error?.message || 'Failed to load users');
        }
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, [isAuthenticated, roleFilter]);

  // Filter users based on query
  useEffect(() => {
    if (!userQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = userQuery.toLowerCase().trim();
    const filtered = users.filter((user) => {
      const email = user.email?.toLowerCase() || '';
      const name = user.name?.toLowerCase() || '';
      return email.includes(query) || name.includes(query);
    });
    setFilteredUsers(filtered);
  }, [users, userQuery]);

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

  const handleRoleFilterChange = (filter: 'all' | 'admin' | 'host' | 'user') => {
    setRoleFilter(filter);
  };

  const handleQueryUsers = () => {
    // Query is handled by the useEffect that filters users
    // This function can be used to trigger search or reset
  };

  const handleQueryChange = (query: string) => {
    setUserQuery(query);
  };

  const displayUsers = userQuery.trim() ? filteredUsers : users;

  return {
    user,
    sidebarOpen,
    toggleSidebar,
    showLogoutModal,
    setShowLogoutModal,
    handleLogoutConfirm,
    showSettingsModal,
    setShowSettingsModal,
    users: displayUsers,
    usersLoading,
    usersError,
    pagination,
    roleFilter,
    handleRoleFilterChange,
    userQuery,
    handleQueryChange,
    handleQueryUsers,
  };
};

