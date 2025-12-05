import { useLocation, Link } from 'react-router-dom';
import { useGenerateLobbyPageLogic } from './GenerateLobbyPage.logic';
import ThemeToggle from '@components/common/ThemeToggle';
import GenerateLobby from '@components/GenerateLobby/GenerateLobby';
import EditTournament from '@components/EditTournament/EditTournament';
import ConfirmationModal from '@components/common/ConfirmationModal';
import HostApplications from '@components/HostApplications/HostApplications';
import UpdateRoom from '@components/UpdateRoom/UpdateRoom';
import { ROUTES } from '@utils/constants';
import './GenerateLobbyPage.scss';

const GenerateLobbyPage: React.FC = () => {
  const location = useLocation();
  const {
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
    tournaments,
    tournamentsLoading,
    tournamentsError,
    refreshTournaments,
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
    tournamentForApplications,
    tournamentForApplicationsData,
    handleViewHostApplications,
    handleCloseHostApplications,
    handleApplicationProcessed,
    updatingRoomTournament,
    showUpdateRoomModal,
    handleUpdateRoom,
    handleCloseUpdateRoom,
    handleSubmitRoomUpdate,
    isUpdatingRoom,
  } = useGenerateLobbyPageLogic();

  return (
    <div className={`generate-lobby-page-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className={`generate-lobby-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">BX</h2>
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to={ROUTES.DASHBOARD} 
            className={`nav-item ${location.pathname === ROUTES.DASHBOARD ? 'active' : ''}`}
            onClick={(e) => {
              if (location.pathname === ROUTES.DASHBOARD) {
                e.preventDefault();
              }
            }}
          >
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span className="nav-text">Dashboard</span>}
          </Link>
          <Link 
            to={ROUTES.GENERATE_LOBBY} 
            className={`nav-item ${location.pathname === ROUTES.GENERATE_LOBBY ? 'active' : ''}`}
            onClick={(e) => {
              if (location.pathname === ROUTES.GENERATE_LOBBY) {
                e.preventDefault();
              }
            }}
          >
            <span className="nav-icon">🎮</span>
            {sidebarOpen && <span className="nav-text">Generate Lobby</span>}
          </Link>
          <Link 
            to={ROUTES.TOP_UP} 
            className={`nav-item ${location.pathname === ROUTES.TOP_UP ? 'active' : ''}`}
            onClick={(e) => {
              if (location.pathname === ROUTES.TOP_UP) {
                e.preventDefault();
              }
            }}
          >
            <span className="nav-icon">💰</span>
            {sidebarOpen && <span className="nav-text">Top Up</span>}
          </Link>
          <Link 
            to={ROUTES.HOST_CREATION} 
            className={`nav-item ${location.pathname === ROUTES.HOST_CREATION ? 'active' : ''}`}
            onClick={(e) => {
              if (location.pathname === ROUTES.HOST_CREATION) {
                e.preventDefault();
              }
            }}
          >
            <span className="nav-icon">👤</span>
            {sidebarOpen && <span className="nav-text">Host Creation</span>}
          </Link>
          <Link 
            to={ROUTES.USER_HISTORY} 
            className={`nav-item ${location.pathname === ROUTES.USER_HISTORY ? 'active' : ''}`}
            onClick={(e) => {
              if (location.pathname === ROUTES.USER_HISTORY) {
                e.preventDefault();
              }
            }}
          >
            <span className="nav-icon">📜</span>
            {sidebarOpen && <span className="nav-text">User History</span>}
          </Link>
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && user && (
            <div className="user-info">
              <div className="user-email">{user.email}</div>
              {user.name && <div className="user-name">{user.name}</div>}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="generate-lobby-main">
        <header className="generate-lobby-page-header">
          <div className="header-left">
            <h1>Generate Lobby</h1>
          </div>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </header>

      <div className="generate-lobby-page-content">
        <div className="generate-lobby-page-card">
          <h2 className="card-title">Generate  Lobby</h2>
          <p className="card-description">
            Create and configure lobbies for the next day. Select date, time slots, game mode, sub modes, and region.
          </p>
          <button
            className="generate-lobby-button"
            onClick={() => setShowGenerateLobbyModal(true)}
            aria-label="Open Generate Lobby Modal"
          >
            <span className="button-icon">🎮</span>
            <span>Generate Lobby</span>
          </button>
        </div>

        {/* Tournaments List */}
        <div className="tournaments-list-card">
          <div className="tournaments-header">
            <h2 className="card-title">
              {tournamentStatus === 'upcoming' ? "Today's Tournaments" : 
               tournamentStatus === 'live' ? "Live Tournaments" : 
               "Completed Tournaments"}
            </h2>
            <div className="tournament-status-tabs">
              <button
                className={`status-tab ${tournamentStatus === 'upcoming' ? 'active' : ''}`}
                onClick={() => setTournamentStatus('upcoming')}
                disabled={tournamentsLoading}
              >
                Upcoming
              </button>
              <button
                className={`status-tab ${tournamentStatus === 'live' ? 'active' : ''}`}
                onClick={() => setTournamentStatus('live')}
                disabled={tournamentsLoading}
              >
                Live
              </button>
              <button
                className={`status-tab ${tournamentStatus === 'completed' ? 'active' : ''}`}
                onClick={() => setTournamentStatus('completed')}
                disabled={tournamentsLoading}
              >
                Completed
              </button>
            </div>
          </div>
          
          {/* Filters Section */}
          <div className="tournaments-filters">
            <div className="filter-group">
              <label className="filter-label">Sub Mode:</label>
              <div className="submode-filter-tabs">
                <button
                  className={`submode-tab ${subModeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSubModeFilter('all')}
                  disabled={tournamentsLoading}
                >
                  All
                </button>
                <button
                  className={`submode-tab ${subModeFilter === 'solo' ? 'active' : ''}`}
                  onClick={() => setSubModeFilter('solo')}
                  disabled={tournamentsLoading}
                >
                  Solo
                </button>
                <button
                  className={`submode-tab ${subModeFilter === 'duo' ? 'active' : ''}`}
                  onClick={() => setSubModeFilter('duo')}
                  disabled={tournamentsLoading}
                >
                  Duo
                </button>
                <button
                  className={`submode-tab ${subModeFilter === 'squad' ? 'active' : ''}`}
                  onClick={() => setSubModeFilter('squad')}
                  disabled={tournamentsLoading}
                >
                  Squad
                </button>
              </div>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Date:</label>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  className="date-filter-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={tournamentsLoading}
                  min={new Date().toISOString().split('T')[0]}
                />
                {selectedDate && (
                  <button
                    className="clear-date-button"
                    onClick={() => setSelectedDate('')}
                    disabled={tournamentsLoading}
                    title="Clear date filter"
                    aria-label="Clear date filter"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
          {tournamentsLoading ? (
            <div className="tournaments-loading">
              <p>Loading tournaments...</p>
            </div>
          ) : tournamentsError ? (
            <div className="tournaments-error">
              <p>{tournamentsError}</p>
            </div>
          ) : tournaments.length > 0 ? (
            <div className="tournaments-list">
              {tournaments.map((tournament) => (
                <div key={tournament._id || tournament.id} className="tournament-card">
                  <div className="tournament-header">
                    <div className="tournament-game-mode">
                      <span className="tournament-game">{tournament.game}</span>
                      <span className="tournament-mode">{tournament.mode} - {tournament.subMode}</span>
                    </div>
                    <span className={`tournament-status tournament-status-${tournament.status}`}>
                      {tournament.status}
                    </span>
                  </div>
                  <div className="tournament-details">
                    <div className="tournament-detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">
                        {tournament.date ? new Date(tournament.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }) : 'N/A'}
                      </span>
                    </div>
                    <div className="tournament-detail-item">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{tournament.startTime || 'N/A'}</span>
                    </div>
                    <div className="tournament-detail-item">
                      <span className="detail-label">Entry Fee:</span>
                      <span className="detail-value">₹{tournament.entryFee}</span>
                    </div>
                    <div className="tournament-detail-item">
                      <span className="detail-label">Prize Pool:</span>
                      <span className="detail-value prize-pool">₹{tournament.prizePool}</span>
                    </div>
                    {/* Show Teams for Squad/Duo, Players for Solo */}
                    {(tournament.subMode?.toLowerCase() === 'squad' || tournament.subMode?.toLowerCase() === 'duo') && tournament.maxTeams !== undefined ? (
                      <div className="tournament-detail-item">
                        <span className="detail-label">Teams:</span>
                        <span className="detail-value">
                          {tournament.joinedTeams !== undefined ? tournament.joinedTeams : 0}/{tournament.maxTeams}
                          {tournament.availableTeams !== undefined && (
                            <span className="available-slots"> ({tournament.availableTeams} available)</span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="tournament-detail-item">
                        <span className="detail-label">Players:</span>
                        <span className="detail-value">
                          {tournament.joinedCount !== undefined 
                            ? tournament.joinedCount 
                            : tournament.participants.length}/{tournament.maxPlayers}
                          {tournament.availableSlots !== undefined && (
                            <span className="available-slots"> ({tournament.availableSlots} available)</span>
                          )}
                        </span>
                      </div>
                    )}
                    {tournament.region && (
                      <div className="tournament-detail-item">
                        <span className="detail-label">Region:</span>
                        <span className="detail-value">{tournament.region}</span>
                      </div>
                    )}
                  </div>
                  {tournament.room && tournament.room.roomId && (
                    <div className="tournament-room">
                      <div className="room-info">
                        <span className="room-label">Room ID:</span>
                        <span className="room-value">{tournament.room.roomId}</span>
                      </div>
                      {tournament.room.password && (
                        <div className="room-info">
                          <span className="room-label">Password:</span>
                          <span className="room-value">{tournament.room.password}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="tournament-actions">
                    {!tournament.hostId ? (
                      <button
                        className="tournament-action-button tournament-applications-button"
                        onClick={() => handleViewHostApplications(tournament._id || tournament.id || '')}
                        disabled={tournamentsLoading || isUpdating || isDeleting}
                        title="View Host Applications"
                      >
                        <span className="action-icon">👥</span>
                        <span>View Applications</span>
                      </button>
                    ) : (
                      <button
                        className="tournament-action-button tournament-edit-host-button"
                        onClick={() => handleViewHostApplications(tournament._id || tournament.id || '')}
                        disabled={tournamentsLoading || isUpdating || isDeleting}
                        title="Edit/Change Host"
                      >
                        <span className="action-icon">✏️</span>
                        <span>Edit Host</span>
                      </button>
                    )}
                    {tournament.room && tournament.room.roomId && (
                      <button
                        className="tournament-action-button tournament-update-room-button"
                        onClick={() => handleUpdateRoom(tournament)}
                        disabled={tournamentsLoading || isUpdating || isDeleting}
                        title="Update Room ID/Password"
                      >
                        <span className="action-icon">🔑</span>
                        <span>Update Room</span>
                      </button>
                    )}
                    <button
                      className="tournament-action-button tournament-edit-button"
                      onClick={() => handleEditTournament(tournament)}
                      disabled={tournamentsLoading || isUpdating || isDeleting}
                      title="Edit Tournament"
                    >
                      <span className="action-icon">✏️</span>
                      <span>Edit</span>
                    </button>
                    <button
                      className="tournament-action-button tournament-delete-button"
                      onClick={() => openDeleteModal(tournament._id || tournament.id || '')}
                      disabled={tournamentsLoading || isUpdating || isDeleting}
                      title="Delete Tournament"
                    >
                      <span className="action-icon">🗑️</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tournaments-empty">
              <p>
                {tournamentStatus === 'upcoming' ? "No upcoming tournaments found for today." :
                 tournamentStatus === 'live' ? "No live tournaments found." :
                 "No completed tournaments found."}
              </p>
            </div>
          )}
        </div>
      </div>
      </main>

      {/* Generate Lobby Modal */}
      <GenerateLobby
        isOpen={showGenerateLobbyModal}
        onClose={() => setShowGenerateLobbyModal(false)}
        onSuccess={refreshTournaments}
      />

      {/* Edit Tournament Modal */}
      <EditTournament
        isOpen={showEditModal}
        tournament={editingTournament}
        onClose={() => {
          setShowEditModal(false);
          setEditingTournament(null);
        }}
        onUpdate={handleUpdateTournament}
        isUpdating={isUpdating}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && tournamentToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Tournament"
          message="Are you sure you want to delete this tournament? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteTournament}
          onCancel={() => {
            setShowDeleteModal(false);
            setTournamentToDelete(null);
          }}
        />
      )}

      {/* Host Applications Modal */}
      {showHostApplicationsModal && tournamentForApplications && tournamentForApplicationsData && (
        <HostApplications
          isOpen={showHostApplicationsModal}
          tournamentId={tournamentForApplications}
          tournament={tournamentForApplicationsData}
          onClose={handleCloseHostApplications}
          onApplicationProcessed={handleApplicationProcessed}
        />
      )}

      {/* Update Room Modal */}
      {showUpdateRoomModal && updatingRoomTournament && (
        <UpdateRoom
          isOpen={showUpdateRoomModal}
          tournament={updatingRoomTournament}
          onClose={handleCloseUpdateRoom}
          onUpdate={handleSubmitRoomUpdate}
          isUpdating={isUpdatingRoom}
        />
      )}
    </div>
  );
};

export default GenerateLobbyPage;

