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
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'host' | 'user'>('all');
  const [userQuery, setUserQuery] = useState<string>('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isBlocking, setIsBlocking] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

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

  // Load users list based on role filter (without query - query only on button click)
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        // If filter is 'all', don't pass role parameter (searches entire DB)
        // If filter is specific role, pass role parameter (searches only that role)
        const role = roleFilter === 'all' ? undefined : roleFilter;
        // Don't pass query here - only load users by role
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
        // Ignore axios cancel errors (request deduplication)
        if (error?.message?.includes('cancelled') || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
          return; // Silently ignore cancelled requests
        }
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
    setSelectedUserIds(new Set()); // Clear selection when filter changes
  };

  const handleQueryUsers = async () => {
    if (!isAuthenticated) return;

    setUsersLoading(true);
    setUsersError(null);
    try {
      // If filter is 'all', don't pass role parameter (searches entire DB)
      // If filter is specific role, pass role parameter (searches only that role)
      const role = roleFilter === 'all' ? undefined : roleFilter;
      const query = userQuery.trim() || undefined;
      const result = await usersApi.getUsers(role, query);
      setUsers(result.users);
      if (result.pagination) {
        setPagination({
          page: result.pagination.page,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        });
      }
    } catch (error: any) {
      // Ignore axios cancel errors (request deduplication)
      if (error?.message?.includes('cancelled') || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return; // Silently ignore cancelled requests
      }
      console.error('Failed to search users:', error);
      // Show specific error message if format is wrong
      if (error?.message?.includes('Invalid API response format')) {
        setUsersError(`API Format Error: ${error.message}. Please check the API response structure.`);
      } else {
        setUsersError(error?.message || 'Failed to search users');
      }
    } finally {
      setUsersLoading(false);
    }
  };

  const handleQueryChange = (query: string) => {
    setUserQuery(query);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    // Exclude admin users from selection
    const allUserIds = users
      .filter((u) => u.role?.toLowerCase() !== 'admin')
      .map((u) => u.userId || u._id)
      .filter((id): id is string => Boolean(id));

    if (selectedUserIds.size === allUserIds.length && allUserIds.length > 0) {
      // Deselect all
      setSelectedUserIds(new Set());
    } else {
      // Select all (excluding admins)
      setSelectedUserIds(new Set(allUserIds));
    }
  };

  const handleBlockUsers = async () => {
    if (selectedUserIds.size === 0) return;

    setIsBlocking(true);
    try {
      // Filter out admin users from the list to block
      const userIds = Array.from(selectedUserIds).filter((id) => {
        const user = users.find((u) => (u.userId || u._id) === id);
        return user && user.role?.toLowerCase() !== 'admin';
      });

      if (userIds.length === 0) {
        setUsersError('Cannot block admin users');
        setIsBlocking(false);
        return;
      }

      await usersApi.blockUsers(userIds);
      // Clear selection and reload users
      setSelectedUserIds(new Set());
      // Reload users list with current filters
      const role = roleFilter === 'all' ? undefined : roleFilter;
      const query = userQuery.trim() || undefined;
      const result = await usersApi.getUsers(role, query);
      setUsers(result.users);
      if (result.pagination) {
        setPagination({
          page: result.pagination.page,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        });
      }
    } catch (error: any) {
      console.error('Failed to block users:', error);
      setUsersError(error?.message || 'Failed to block users');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockUsers = async () => {
    if (selectedUserIds.size === 0) return;

    setIsUnblocking(true);
    try {
      const userIds = Array.from(selectedUserIds);
      await usersApi.unblockUsers(userIds);
      // Clear selection and reload users
      setSelectedUserIds(new Set());
      // Reload users list with current filters
      const role = roleFilter === 'all' ? undefined : roleFilter;
      const query = userQuery.trim() || undefined;
      const result = await usersApi.getUsers(role, query);
      setUsers(result.users);
      if (result.pagination) {
        setPagination({
          page: result.pagination.page,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        });
      }
    } catch (error: any) {
      console.error('Failed to unblock users:', error);
      setUsersError(error?.message || 'Failed to unblock users');
    } finally {
      setIsUnblocking(false);
    }
  };

  const handleBlockSingleUser = async (userId: string) => {
    // Prevent blocking admin users
    const user = users.find((u) => (u.userId || u._id) === userId);
    if (user && user.role?.toLowerCase() === 'admin') {
      setUsersError('Cannot block admin users');
      return;
    }

    setProcessingUserId(userId);
    try {
      await usersApi.blockUsers([userId]);
      // Reload users list with current filters
      const role = roleFilter === 'all' ? undefined : roleFilter;
      const query = userQuery.trim() || undefined;
      const result = await usersApi.getUsers(role, query);
      setUsers(result.users);
      if (result.pagination) {
        setPagination({
          page: result.pagination.page,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        });
      }
    } catch (error: any) {
      console.error('Failed to block user:', error);
      setUsersError(error?.message || 'Failed to block user');
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleUnblockSingleUser = async (userId: string) => {
    setProcessingUserId(userId);
    try {
      await usersApi.unblockUsers([userId]);
      // Reload users list with current filters
      const role = roleFilter === 'all' ? undefined : roleFilter;
      const query = userQuery.trim() || undefined;
      const result = await usersApi.getUsers(role, query);
      setUsers(result.users);
      if (result.pagination) {
        setPagination({
          page: result.pagination.page,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        });
      }
    } catch (error: any) {
      console.error('Failed to unblock user:', error);
      setUsersError(error?.message || 'Failed to unblock user');
    } finally {
      setProcessingUserId(null);
    }
  };

  const isAllSelected = users.length > 0 && selectedUserIds.size === users.length;

  const handleUserCardClick = (user: AdminUser | null) => {
    setSelectedUser(user);
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
    users: users,
    usersLoading,
    usersError,
    pagination,
    roleFilter,
    handleRoleFilterChange,
    userQuery,
    handleQueryChange,
    handleQueryUsers,
    selectedUserIds,
    handleUserSelect,
    handleSelectAll,
    isAllSelected,
    handleBlockUsers,
    handleUnblockUsers,
    handleBlockSingleUser,
    handleUnblockSingleUser,
    isBlocking,
    isUnblocking,
    processingUserId,
    selectedUser,
    handleUserCardClick,
  };
};

