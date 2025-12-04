import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, usersApi, hostApplicationsApi, type AdminUser, type HostStatistics } from '@services/api';
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageLimit] = useState<number>(10);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'host' | 'user'>('all');
  const [userQuery, setUserQuery] = useState<string>('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isBlocking, setIsBlocking] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const isManualSearchRef = useRef(false);
  
  // Host Statistics states
  const [activeTab, setActiveTab] = useState<'users' | 'hostStats'>('users');
  const [hostStatistics, setHostStatistics] = useState<HostStatistics[]>([]);
  const [hostStatsLoading, setHostStatsLoading] = useState(false);
  const [hostStatsError, setHostStatsError] = useState<string | null>(null);
  const [hostStatsFilters, setHostStatsFilters] = useState<{
    date?: string;
    fromDate?: string;
    toDate?: string;
    hostId?: string;
  }>({});
  const [totalHosts, setTotalHosts] = useState<number>(0);
  const [totalLobbies, setTotalLobbies] = useState<number>(0);

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
    if (isManualSearchRef.current) {
      // Skip automatic load if we're doing a manual search
      isManualSearchRef.current = false;
      return;
    }

    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        // If filter is 'all', don't pass role parameter (searches entire DB)
        // If filter is specific role, pass role parameter (searches only that role)
        const role = roleFilter === 'all' ? undefined : roleFilter;
        // Don't pass query here - only load users by role
        const result = await usersApi.getUsers(role, undefined, currentPage, pageLimit);
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
  }, [isAuthenticated, roleFilter, currentPage, pageLimit]);

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
    setCurrentPage(1); // Reset to first page when filter changes
    setSelectedUserIds(new Set()); // Clear selection when filter changes
  };

  const handleQueryUsers = async () => {
    if (!isAuthenticated) return;

    isManualSearchRef.current = true; // Prevent useEffect from running
    setCurrentPage(1); // Reset to first page when searching
    setUsersLoading(true);
    setUsersError(null);
    try {
      // If filter is 'all', don't pass role parameter (searches entire DB)
      // If filter is specific role, pass role parameter (searches only that role)
      const role = roleFilter === 'all' ? undefined : roleFilter;
      const query = userQuery.trim() || undefined;
      const result = await usersApi.getUsers(role, query, 1, pageLimit); // Use page 1 for new search
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
      const result = await usersApi.getUsers(role, query, currentPage, pageLimit);
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
      const result = await usersApi.getUsers(role, query, currentPage, pageLimit);
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
      const result = await usersApi.getUsers(role, query, currentPage, pageLimit);
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
      const result = await usersApi.getUsers(role, query, currentPage, pageLimit);
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

  const handleCopyEmail = async (email: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    try {
      await navigator.clipboard.writeText(email);
      // You could add a toast notification here if needed
      console.log('Email copied:', email);
    } catch (error) {
      console.error('Failed to copy email:', error);
      setUsersError('Failed to copy email');
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      setSelectedUserIds(new Set()); // Clear selection when page changes
      
      // If there's a search query, reload with query; otherwise useEffect will handle it
      if (userQuery.trim()) {
        isManualSearchRef.current = true;
        setUsersLoading(true);
        setUsersError(null);
        try {
          const role = roleFilter === 'all' ? undefined : roleFilter;
          const query = userQuery.trim() || undefined;
          const result = await usersApi.getUsers(role, query, newPage, pageLimit);
          setUsers(result.users);
          if (result.pagination) {
            setPagination({
              page: result.pagination.page,
              total: result.pagination.total,
              totalPages: result.pagination.totalPages,
            });
          }
        } catch (error: any) {
          if (error?.message?.includes('cancelled') || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
            return;
          }
          console.error('Failed to load users:', error);
          setUsersError(error?.message || 'Failed to load users');
        } finally {
          setUsersLoading(false);
        }
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Host Statistics functions
  const loadHostStatistics = useCallback(async (filters?: typeof hostStatsFilters) => {
    if (!isAuthenticated) return;
    
    const filtersToUse = filters !== undefined ? filters : hostStatsFilters;
    
    setHostStatsLoading(true);
    setHostStatsError(null);
    try {
      const result = await hostApplicationsApi.getHostStatistics(filtersToUse);
      setHostStatistics(result.hosts || []);
      setTotalHosts(result.totalHosts || 0);
      setTotalLobbies(result.totalLobbies || 0);
    } catch (error: any) {
      console.error('Failed to load host statistics:', error);
      setHostStatsError(error?.message || 'Failed to load host statistics');
    } finally {
      setHostStatsLoading(false);
    }
  }, [isAuthenticated, hostStatsFilters]);

  // Only load statistics when tab is first opened, not on filter changes
  useEffect(() => {
    if (activeTab === 'hostStats' && isAuthenticated) {
      // Load with empty filters initially
      loadHostStatistics({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthenticated]); // Only load when tab changes, not when filters change

  const handleHostStatsFilterChange = (filterType: 'date' | 'fromDate' | 'toDate' | 'hostId', value: string) => {
    setHostStatsFilters((prev) => ({
      ...prev,
      [filterType]: value || undefined,
    }));
  };

  const handleClearHostStatsFilters = () => {
    setHostStatsFilters({});
    // Optionally reload with cleared filters
    // loadHostStatistics();
  };

  const handleSearchHostStats = () => {
    loadHostStatistics();
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
    handleCopyEmail,
    currentPage,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    // Host Statistics
    activeTab,
    setActiveTab,
    hostStatistics,
    hostStatsLoading,
    hostStatsError,
    hostStatsFilters,
    totalHosts,
    totalLobbies,
    handleHostStatsFilterChange,
    handleClearHostStatsFilters,
    handleSearchHostStats,
    loadHostStatistics,
  };
};

