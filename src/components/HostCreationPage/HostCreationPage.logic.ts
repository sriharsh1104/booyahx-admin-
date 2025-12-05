import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, hostApplicationsApi, usersApi, type Host, type HostStatistics, type AdminUser } from '@services/api';
import { ROUTES } from '@utils/constants';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectUser, selectIsAuthenticated, setUser } from '@store/slices/authSlice';

export const useHostCreationPageLogic = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Host creation form states
  const [hostEmail, setHostEmail] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');
  const [hostPassword, setHostPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  
  // Hosts list states
  const [hosts, setHosts] = useState<Host[]>([]);
  const [hostsLoading, setHostsLoading] = useState(false);
  const [hostsError, setHostsError] = useState<string | null>(null);
  
  // Selected host for modal
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [hostStatistics, setHostStatistics] = useState<HostStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);

  useEffect(() => {
    // Check authentication from Redux
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    // Load user data if not already in Redux
    const loadUser = async () => {
      if (user) {
        return;
      }

      try {
        const userData = await authApi.getProfile();
        dispatch(setUser(userData));
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };

    loadUser();
    loadHosts(); // Load hosts when page loads
  }, [navigate, isAuthenticated, user, dispatch]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const loadHosts = async () => {
    setHostsLoading(true);
    setHostsError(null);
    try {
      // Try to get hosts from dedicated endpoint
      const hostsList = await hostApplicationsApi.getAllHosts();
      setHosts(hostsList);
    } catch (error: any) {
      // Fallback: try to get hosts from users API with role filter
      try {
        console.warn('Failed to load hosts from dedicated endpoint, trying users API:', error);
        const result = await usersApi.getUsers('host');
        // Map AdminUser to Host format
        const hostsList: Host[] = result.users.map((user: AdminUser) => ({
          _id: user._id,
          hostId: user.userId || user._id,
          email: user.email,
          name: user.name || 'N/A',
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }));
        setHosts(hostsList);
      } catch (fallbackError: any) {
        console.error('Failed to load hosts:', fallbackError);
        setHostsError(fallbackError?.message || 'Failed to load hosts');
      }
    } finally {
      setHostsLoading(false);
    }
  };

  const handleCreateHost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hostEmail.trim() || !hostName.trim() || !hostPassword.trim()) {
      setCreateError('Please fill in all fields');
      return;
    }

    if (hostPassword.length < 6) {
      setCreateError('Password must be at least 6 characters long');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const response = await hostApplicationsApi.createHost({
        email: hostEmail.trim(),
        name: hostName.trim(),
        password: hostPassword,
      });

      if (response.success) {
        setCreateSuccess(`Host account created successfully for ${hostName.trim()}`);
        setHostEmail('');
        setHostName('');
        setHostPassword('');
        // Reload hosts list
        await loadHosts();
      } else {
        setCreateError(response.message || 'Failed to create host account');
      }
    } catch (error: any) {
      console.error('Failed to create host:', error);
      setCreateError(error?.response?.data?.message || error?.message || 'Failed to create host account');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleHostClick = async (host: Host) => {
    setSelectedHost(host);
    setShowHostModal(true);
    setStatsLoading(true);
    
    try {
      const hostId = host.hostId || host._id;
      if (hostId) {
        const stats = await hostApplicationsApi.getHostStatistics({ hostId });
        // Find the host statistics for this specific host
        const hostStat = stats.hosts?.find(h => h.hostId === hostId);
        if (hostStat) {
          setHostStatistics(hostStat);
        } else {
          setHostStatistics(null);
        }
      }
    } catch (error: any) {
      console.error('Failed to load host statistics:', error);
      setHostStatistics(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowHostModal(false);
    setSelectedHost(null);
    setHostStatistics(null);
  };

  // Auto-dismiss success/error messages
  useEffect(() => {
    if (createSuccess) {
      const timer = setTimeout(() => {
        setCreateSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [createSuccess]);

  useEffect(() => {
    if (createError) {
      const timer = setTimeout(() => {
        setCreateError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [createError]);

  return {
    user,
    sidebarOpen,
    toggleSidebar,
    // Host creation form
    hostEmail,
    hostName,
    hostPassword,
    showPassword,
    createLoading,
    createError,
    createSuccess,
    setHostEmail,
    setHostName,
    setHostPassword,
    toggleShowPassword,
    handleCreateHost,
    // Hosts list
    hosts,
    hostsLoading,
    hostsError,
    loadHosts,
    // Host modal
    selectedHost,
    hostStatistics,
    statsLoading,
    showHostModal,
    handleHostClick,
    handleCloseModal,
  };
};

