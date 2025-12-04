import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, usersApi, type AdminUser, type TopUpTransaction } from '@services/api';
import { ROUTES } from '@utils/constants';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectUser, selectIsAuthenticated, setUser } from '@store/slices/authSlice';

export const useUserHistoryPageLogic = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // User search states
  const [emailQuery, setEmailQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Transaction history states
  const [transactions, setTransactions] = useState<TopUpTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  
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
      setSearchResults([]);
      setShowDropdown(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    try {
      const result = await usersApi.getUsers(undefined, query.trim(), 1, 10);
      setSearchResults(result.users);
      setShowDropdown(true);
    } catch (error: any) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // User search with debounce
  const handleEmailSearch = (query: string) => {
    setEmailQuery(query);
    
    // Clear previous timer
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    // If query is empty, clear results immediately
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setSearchLoading(false);
      return;
    }

    // Set loading state immediately
    setSearchLoading(true);

    // Debounce the API call - wait 1000ms after user stops typing
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

  const handleUserSelect = (user: AdminUser) => {
    setSelectedUser(user);
    setEmailQuery(user.email);
    setShowDropdown(false);
    setSearchResults([]);
    // Load transactions for this user
    loadUserTransactions(user);
  };

  const loadUserTransactions = async (user: AdminUser) => {
    const userId = user.userId || user._id;
    if (!userId) {
      setTransactionsError('Invalid user ID');
      return;
    }

    setTransactionsLoading(true);
    setTransactionsError(null);
    try {
      const result = await usersApi.getTopUpTransactions({
        userId,
        limit: 100, // Get more transactions
      });
      setTransactions(result.transactions || []);
      setTotalTransactions(result.total || result.transactions?.length || 0);
    } catch (error: any) {
      console.error('Failed to load transactions:', error);
      setTransactionsError(error?.response?.data?.message || error?.message || 'Failed to load transactions');
      setTransactions([]);
      setTotalTransactions(0);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleSearchByEmail = async () => {
    if (!emailQuery.trim()) {
      setTransactionsError('Please enter an email address');
      return;
    }

    // First, search for the user by email
    setSearchLoading(true);
    setTransactionsError(null);
    try {
      const result = await usersApi.getUsers(undefined, emailQuery.trim(), 1, 1);
      if (result.users.length > 0) {
        const foundUser = result.users[0];
        setSelectedUser(foundUser);
        setEmailQuery(foundUser.email);
        setShowDropdown(false);
        // Load transactions for this user
        await loadUserTransactions(foundUser);
      } else {
        setTransactionsError('No user found with this email');
        setSelectedUser(null);
        setTransactions([]);
        setTotalTransactions(0);
      }
    } catch (error: any) {
      console.error('Failed to search user:', error);
      setTransactionsError(error?.response?.data?.message || error?.message || 'Failed to search user');
      setSelectedUser(null);
      setTransactions([]);
      setTotalTransactions(0);
    } finally {
      setSearchLoading(false);
    }
  };

  return {
    user,
    sidebarOpen,
    toggleSidebar,
    emailQuery,
    searchResults,
    selectedUser,
    showDropdown,
    searchLoading,
    transactions,
    transactionsLoading,
    transactionsError,
    totalTransactions,
    handleEmailSearch,
    handleUserSelect,
    handleSearchByEmail,
    setShowDropdown,
  };
};

