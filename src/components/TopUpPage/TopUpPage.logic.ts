import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, usersApi, type AdminUser } from '@services/api';
import { ROUTES } from '@utils/constants';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectUser, selectIsAuthenticated, setUser } from '@store/slices/authSlice';

export const useTopUpPageLogic = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Top-up states
  const [topUpUserQuery, setTopUpUserQuery] = useState<string>('');
  const [topUpSearchResults, setTopUpSearchResults] = useState<AdminUser[]>([]);
  const [topUpSelectedUser, setTopUpSelectedUser] = useState<AdminUser | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);
  const [topUpSuccess, setTopUpSuccess] = useState<string | null>(null);
  const [showTopUpDropdown, setShowTopUpDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Debounce timer ref
  const searchDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Debounced search function
  const performUserSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setTopUpSearchResults([]);
      setShowTopUpDropdown(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    try {
      const result = await usersApi.getUsers(undefined, query.trim(), 1, 10);
      setTopUpSearchResults(result.users);
      setShowTopUpDropdown(true);
    } catch (error: any) {
      console.error('Failed to search users for top-up:', error);
      setTopUpSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Top-up functions with debounce
  const handleTopUpUserSearch = (query: string) => {
    setTopUpUserQuery(query);
    
    // Clear previous timer
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    // If query is empty, clear results immediately
    if (!query.trim()) {
      setTopUpSearchResults([]);
      setShowTopUpDropdown(false);
      setSearchLoading(false);
      return;
    }

    // Set loading state immediately
    setSearchLoading(true);

    // Debounce the API call - wait 500ms after user stops typing
    searchDebounceTimerRef.current = setTimeout(() => {
      performUserSearch(query);
    }, 1000);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, []);

  const handleTopUpUserSelect = (user: AdminUser) => {
    setTopUpSelectedUser(user);
    setTopUpUserQuery(`${user.name || 'N/A'} (${user.email})`);
    setShowTopUpDropdown(false);
    setTopUpSearchResults([]);
  };

  const handleTopUpSubmit = async () => {
    if (!topUpSelectedUser) {
      setTopUpError('Please select a user');
      return;
    }

    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      setTopUpError('Please enter a valid amount greater than 0');
      return;
    }

    const userId = topUpSelectedUser.userId || topUpSelectedUser._id;
    if (!userId) {
      setTopUpError('Invalid user ID');
      return;
    }

    setTopUpLoading(true);
    setTopUpError(null);
    setTopUpSuccess(null);

    try {
      const response = await usersApi.topUpBalance(userId, amount, 'Top-up via Admin Panel');
      if (response.success) {
        setTopUpSuccess(`Successfully added ${amount} GC to ${topUpSelectedUser.name || topUpSelectedUser.email}'s account. New balance: ${response.data?.balanceGC ?? 'N/A'} GC`);
        setTopUpAmount('');
        setTopUpSelectedUser(null);
        setTopUpUserQuery('');
      } else {
        setTopUpError(response.message || 'Failed to top up balance');
      }
    } catch (error: any) {
      console.error('Failed to top up balance:', error);
      setTopUpError(error?.response?.data?.message || error?.message || 'Failed to top up balance');
    } finally {
      setTopUpLoading(false);
    }
  };

  return {
    user,
    sidebarOpen,
    toggleSidebar,
    // Top-up
    topUpUserQuery,
    topUpSearchResults,
    topUpSelectedUser,
    topUpAmount,
    topUpLoading,
    topUpError,
    topUpSuccess,
    showTopUpDropdown,
    searchLoading,
    handleTopUpUserSearch,
    handleTopUpUserSelect,
    handleTopUpSubmit,
    setTopUpAmount,
    setTopUpError,
    setTopUpSuccess,
    setShowTopUpDropdown,
  };
};

