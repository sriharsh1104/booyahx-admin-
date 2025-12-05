import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentsApi, type Tournament, authApi, type UpdateTournamentRequest, type UpdateRoomRequest } from '@services/api';
import { ROUTES } from '@utils/constants';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectUser, selectIsAuthenticated, setUser } from '@store/slices/authSlice';

export const useGenerateLobbyPageLogic = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showGenerateLobbyModal, setShowGenerateLobbyModal] = useState(false);
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [tournamentStatus, setTournamentStatus] = useState<'upcoming' | 'live' | 'completed'>('upcoming');
  const [subModeFilter, setSubModeFilter] = useState<'all' | 'solo' | 'duo' | 'squad'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);
  const [tournamentsError, setTournamentsError] = useState<string | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHostApplicationsModal, setShowHostApplicationsModal] = useState(false);
  const [tournamentForApplications, setTournamentForApplications] = useState<string | null>(null);
  const [tournamentForApplicationsData, setTournamentForApplicationsData] = useState<Tournament | null>(null);
  const [updatingRoomTournament, setUpdatingRoomTournament] = useState<Tournament | null>(null);
  const [showUpdateRoomModal, setShowUpdateRoomModal] = useState(false);
  const [isUpdatingRoom, setIsUpdatingRoom] = useState(false);

  // Check authentication
  useEffect(() => {
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
  }, [navigate, isAuthenticated, user, dispatch]);

  // Set default date when tournamentStatus is 'upcoming' and selectedDate is empty
  useEffect(() => {
    if (tournamentStatus === 'upcoming' && !selectedDate) {
      setSelectedDate(getCurrentDate());
    }
  }, [tournamentStatus, selectedDate]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Load tournaments function - wrapped in useCallback to prevent infinite loops
  const loadTournaments = useCallback(async () => {
    setTournamentsLoading(true);
    setTournamentsError(null);
    try {
      const params: { status: 'upcoming' | 'live' | 'completed'; fromDate?: string } = {
        status: tournamentStatus,
      };
      
      // Add fromDate if selectedDate is set, otherwise use current date for upcoming
      if (selectedDate) {
        params.fromDate = selectedDate;
      } else if (tournamentStatus === 'upcoming') {
        params.fromDate = getCurrentDate();
      }
      
      const tournamentsList = await tournamentsApi.getTournaments(params);
      setTournaments(tournamentsList);
    } catch (error: any) {
      // Ignore axios cancel errors (request deduplication)
      if (error?.message?.includes('cancelled') || error?.name === 'CanceledError') {
        return; // Silently ignore cancelled requests
      }
      console.error('Failed to load tournaments:', error);
      setTournamentsError(error?.message || 'Failed to load tournaments');
    } finally {
      setTournamentsLoading(false);
    }
  }, [tournamentStatus, selectedDate]);

  // Filter tournaments by subMode (client-side filtering)
  useEffect(() => {
    let filtered = [...tournaments];
    
    // Filter by subMode
    if (subModeFilter !== 'all') {
      filtered = filtered.filter(t => t.subMode?.toLowerCase() === subModeFilter.toLowerCase());
    }
    
    setFilteredTournaments(filtered);
  }, [tournaments, subModeFilter]);

  // Load tournaments based on selected status
  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  // Handle edit tournament
  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setShowEditModal(true);
  };

  // Handle update tournament
  const handleUpdateTournament = async (data: UpdateTournamentRequest) => {
    if (!editingTournament) return;

    setIsUpdating(true);
    try {
      await tournamentsApi.updateTournament(editingTournament._id || editingTournament.id || '', data);
      setShowEditModal(false);
      setEditingTournament(null);
      // Refresh tournaments list
      await loadTournaments();
    } catch (error: any) {
      console.error('Failed to update tournament:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete tournament
  const handleDeleteTournament = async () => {
    if (!tournamentToDelete) return;

    setIsDeleting(true);
    try {
      await tournamentsApi.deleteTournament(tournamentToDelete);
      setShowDeleteModal(false);
      setTournamentToDelete(null);
      // Refresh tournaments list
      await loadTournaments();
    } catch (error: any) {
      console.error('Failed to delete tournament:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (tournamentId: string) => {
    setTournamentToDelete(tournamentId);
    setShowDeleteModal(true);
  };

  // Handle view host applications
  const handleViewHostApplications = (tournamentId: string) => {
    const tournament = tournaments.find(t => (t._id || t.id) === tournamentId);
    setTournamentForApplications(tournamentId);
    setTournamentForApplicationsData(tournament || null);
    setShowHostApplicationsModal(true);
  };

  // Handle close host applications modal
  const handleCloseHostApplications = () => {
    setShowHostApplicationsModal(false);
    setTournamentForApplications(null);
    setTournamentForApplicationsData(null);
  };

  // Handle application processed (after approve/reject)
  const handleApplicationProcessed = async () => {
    // Refresh tournaments to get updated host status
    await loadTournaments();
  };

  // Handle update room
  const handleUpdateRoom = (tournament: Tournament) => {
    setUpdatingRoomTournament(tournament);
    setShowUpdateRoomModal(true);
  };

  // Handle close update room modal
  const handleCloseUpdateRoom = () => {
    setShowUpdateRoomModal(false);
    setUpdatingRoomTournament(null);
  };

  // Handle submit room update
  const handleSubmitRoomUpdate = async (data: UpdateRoomRequest) => {
    if (!updatingRoomTournament) return;

    setIsUpdatingRoom(true);
    try {
      await tournamentsApi.updateRoom(updatingRoomTournament._id || updatingRoomTournament.id || '', data);
      setShowUpdateRoomModal(false);
      setUpdatingRoomTournament(null);
      // Refresh tournaments list
      await loadTournaments();
    } catch (error: any) {
      console.error('Failed to update room:', error);
      throw error;
    } finally {
      setIsUpdatingRoom(false);
    }
  };

  return {
    user,
    sidebarOpen,
    toggleSidebar,
    showGenerateLobbyModal,
    setShowGenerateLobbyModal,
    tournamentStatus,
    setTournamentStatus,
    subModeFilter,
    setSubModeFilter,
    selectedDate,
    setSelectedDate,
    tournaments: filteredTournaments,
    tournamentsLoading,
    tournamentsError,
    refreshTournaments: loadTournaments,
    editingTournament,
    showEditModal,
    setShowEditModal,
    setEditingTournament,
    handleEditTournament,
    handleUpdateTournament,
    isUpdating,
    showDeleteModal,
    setShowDeleteModal,
    tournamentToDelete,
    setTournamentToDelete,
    openDeleteModal,
    handleDeleteTournament,
    isDeleting,
    showHostApplicationsModal,
    setShowHostApplicationsModal,
    tournamentForApplications,
    tournamentForApplicationsData,
    handleViewHostApplications,
    handleCloseHostApplications,
    handleApplicationProcessed,
    updatingRoomTournament,
    showUpdateRoomModal,
    setShowUpdateRoomModal,
    handleUpdateRoom,
    handleCloseUpdateRoom,
    handleSubmitRoomUpdate,
    isUpdatingRoom,
  };
};

