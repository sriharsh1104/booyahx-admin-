import { useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDashboardLogic } from './Dashboard.logic';
import ConfirmationModal from '@components/common/ConfirmationModal';
import SettingsModal from '@components/common/SettingsModal';
import ThemeToggle from '@components/common/ThemeToggle';
import { ROUTES } from '@utils/constants';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    sidebarOpen,
    toggleSidebar,
    showLogoutModal,
    setShowLogoutModal,
    handleLogoutConfirm,
    showSettingsModal,
    setShowSettingsModal,
    users,
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
  } = useDashboardLogic();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const dropdown = dropdownRef.current.querySelector('.dropdown-menu');
        dropdown?.classList.remove('open');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
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
              // Prevent navigation if already on dashboard
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
              // Prevent navigation if already on generate lobby page
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
              // Prevent navigation if already on top up page
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
              // Prevent navigation if already on host creation page
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
              // Prevent navigation if already on user history page
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
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="header-actions">
            <ThemeToggle />
            <div className="settings-dropdown" ref={dropdownRef}>
              <button 
                className="settings-button"
                onClick={(e) => {
                  e.stopPropagation();
                  const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                  dropdown?.classList.toggle('open');
                }}
                aria-label="Settings"
                title="Settings"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                </svg>
              </button>
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    const dropdown = dropdownRef.current?.querySelector('.dropdown-menu');
                    dropdown?.classList.remove('open');
                    navigate(ROUTES.PROFILE);
                  }}
                >
                  <span className="dropdown-icon">👤</span>
                  <span>Profile</span>
                </button>
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    const dropdown = dropdownRef.current?.querySelector('.dropdown-menu');
                    dropdown?.classList.remove('open');
                    navigate(ROUTES.HEALTH);
                  }}
                >
                  <span className="dropdown-icon">❤️</span>
                  <span>Health Status</span>
                </button>
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    const dropdown = dropdownRef.current?.querySelector('.dropdown-menu');
                    dropdown?.classList.remove('open');
                    setShowSettingsModal(true);
                  }}
                >
                  <span className="dropdown-icon">⚙️</span>
                  <span>Settings</span>
                </button>
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    setShowLogoutModal(true);
                    const dropdown = dropdownRef.current?.querySelector('.dropdown-menu');
                    dropdown?.classList.remove('open');
                  }}
                >
                  <span className="dropdown-icon">🚪</span>
                  <span>Logout</span>
            </button>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Welcome Card */}
          <div className="dashboard-card">
            <h2 className="card-title">Welcome</h2>
            <p className="card-content">
              {user ? `Welcome back, ${user.name || user.email}!` : 'Welcome to BooyahX Admin Dashboard'}
            </p>
            <p className="card-content-secondary">
              Manage your application from this centralized dashboard.
            </p>
          </div>

          {/* Tabs */}
          <div className="dashboard-tabs">
            <button
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
            <button
              className={`tab-button ${activeTab === 'hostStats' ? 'active' : ''}`}
              onClick={() => setActiveTab('hostStats')}
            >
              Host Statistics
            </button>
          </div>

          {/* Users List Card */}
          {activeTab === 'users' && (
          <div className="dashboard-card">
            <div className="card-header-with-filters">
              <h2 className="card-title">Users</h2>
              <div className="role-filters">
                <button
                  className={`filter-button ${roleFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleRoleFilterChange('all')}
                  disabled={usersLoading}
                >
                  All
                </button>
                <button
                  className={`filter-button ${roleFilter === 'admin' ? 'active' : ''}`}
                  onClick={() => handleRoleFilterChange('admin')}
                  disabled={usersLoading}
                >
                  Admin
                </button>
                <button
                  className={`filter-button ${roleFilter === 'host' ? 'active' : ''}`}
                  onClick={() => handleRoleFilterChange('host')}
                  disabled={usersLoading}
                >
                  Host
                </button>
                <button
                  className={`filter-button ${roleFilter === 'user' ? 'active' : ''}`}
                  onClick={() => handleRoleFilterChange('user')}
                  disabled={usersLoading}
                >
                  User
                </button>
              </div>
            </div>
            <div className="user-query-section">
              <div className="query-input-group">
                <input
                  type="text"
                  className="query-input"
                  placeholder="Search users by name or email..."
                  value={userQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleQueryUsers();
                    }
                  }}
                  disabled={usersLoading}
                />
                <button
                  className="query-button"
                  onClick={handleQueryUsers}
                  disabled={usersLoading}
                >
                  🔍 Query
                </button>
              </div>
            </div>
            {usersLoading ? (
              <div className="users-loading">
                <p>Loading users...</p>
              </div>
            ) : usersError ? (
              <div className="users-error">
                <p>{usersError}</p>
              </div>
            ) : users.length > 0 ? (
              <div className="users-list">
                <div className="users-count-header">
                  <div className="users-count-left">
                    <span className="users-count-text">
                      {pagination ? (
                        <>Total: {pagination.total} users</>
                      ) : (
                        <>Total: {users.length} users</>
                      )}
                    </span>
                    {selectedUserIds.size > 0 && (
                      <span className="selected-count">
                        ({selectedUserIds.size} selected)
                      </span>
                    )}
                  </div>
                  <div className="users-actions">
                    <label className="select-all-checkbox">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        disabled={usersLoading}
                      />
                      <span>Select All</span>
                    </label>
                    {selectedUserIds.size > 0 && (
                      <div className="action-buttons">
                        <button
                          className="action-button block-button"
                          onClick={handleBlockUsers}
                          disabled={isBlocking || isUnblocking || usersLoading}
                        >
                          {isBlocking ? 'Blocking...' : 'Block'}
                        </button>
                        <button
                          className="action-button unblock-button"
                          onClick={handleUnblockUsers}
                          disabled={isBlocking || isUnblocking || usersLoading}
                        >
                          {isUnblocking ? 'Unblocking...' : 'Unblock'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="users-cards-container">
                  {users.map((adminUser, index) => {
                    const userId = adminUser.userId || adminUser._id || '';
                    const isSelected = Boolean(userId && selectedUserIds.has(userId));
                    return (
                      <div 
                        key={userId} 
                        className={`user-card ${isSelected ? 'selected' : ''} ${selectedUser?._id === adminUser._id ? 'active' : ''}`}
                        onClick={() => handleUserCardClick(adminUser)}
                      >
                        <div className="user-card-checkbox" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleUserSelect(userId)}
                            disabled={usersLoading || adminUser.role?.toLowerCase() === 'admin'}
                            title={adminUser.role?.toLowerCase() === 'admin' ? 'Admin users cannot be selected' : ''}
                          />
                        </div>
                        <div className="user-card-number">{index + 1}</div>
                        <div className="user-card-content">
                          <div className="user-name">
                            <span className="user-label">Name:</span>
                            <span className="user-value">{adminUser.name || 'N/A'}</span>
                          </div>
                          <div className="user-email">
                            <span className="user-label">Email:</span>
                            <span className="user-value">
                              {adminUser.email}
                              <button
                                type="button"
                                className="copy-email-btn"
                                onClick={(e) => handleCopyEmail(adminUser.email, e)}
                                title="Copy email"
                                aria-label="Copy email"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                              </button>
                            </span>
                          </div>
                          <div className="user-balance">
                            <span className="user-label">Balance GC:</span>
                            <span className="user-value balance-value">{adminUser.balanceGC ?? 0}</span>
                          </div>
                          <div className="user-status-row">
                            <div className="user-status">
                              <span className="user-label">Status:</span>
                              <span className={`user-value status-badge ${adminUser.isBlocked ? 'blocked' : 'active'}`}>
                                {adminUser.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </div>
                            <div className="user-action-buttons" onClick={(e) => e.stopPropagation()}>
                              {adminUser.role?.toLowerCase() === 'admin' ? (
                                <span className="admin-badge" title="Admin users cannot be blocked">
                                  Admin
                                </span>
                              ) : adminUser.isBlocked ? (
                                <button
                                  className="user-action-button unblock-button"
                                  onClick={() => handleUnblockSingleUser(userId)}
                                  disabled={processingUserId === userId || isBlocking || isUnblocking || usersLoading}
                                  title="Unblock user"
                                >
                                  {processingUserId === userId ? 'Unblocking...' : 'Unblock'}
                                </button>
                              ) : (
                                <button
                                  className="user-action-button block-button"
                                  onClick={() => handleBlockSingleUser(userId)}
                                  disabled={processingUserId === userId || isBlocking || isUnblocking || usersLoading}
                                  title="Block user"
                                >
                                  {processingUserId === userId ? 'Blocking...' : 'Block'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Pagination Controls */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      className="pagination-button"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1 || usersLoading}
                      aria-label="Previous page"
                    >
                      ← Previous
                    </button>
                    <div className="pagination-info">
                      <span className="pagination-text">
                        Page {currentPage} of {pagination.totalPages}
                      </span>
                      {pagination.total > 0 && (
                        <span className="pagination-total">
                          (Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, pagination.total)} of {pagination.total})
                        </span>
                      )}
                    </div>
                    <button
                      className="pagination-button"
                      onClick={handleNextPage}
                      disabled={currentPage >= pagination.totalPages || usersLoading}
                      aria-label="Next page"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="users-empty">
                <p>No users found.</p>
              </div>
            )}
          </div>
          )}

          {/* Host Statistics Card */}
          {activeTab === 'hostStats' && (
          <div className="dashboard-card">
            <div className="card-header-with-filters">
              <h2 className="card-title">Host Statistics</h2>
              <div className="host-stats-summary">
                <span className="stat-item">Total Hosts: {totalHosts}</span>
                <span className="stat-item">Total Lobbies: {totalLobbies}</span>
              </div>
            </div>
            
            {/* Filters */}
            <div className="host-stats-filters">
              <div className="filter-group">
                <label className="filter-label">Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  className="filter-input"
                  value={hostStatsFilters.date || ''}
                  onChange={(e) => handleHostStatsFilterChange('date', e.target.value)}
                  disabled={hostStatsLoading}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">From Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  className="filter-input"
                  value={hostStatsFilters.fromDate || ''}
                  onChange={(e) => handleHostStatsFilterChange('fromDate', e.target.value)}
                  disabled={hostStatsLoading}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">To Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  className="filter-input"
                  value={hostStatsFilters.toDate || ''}
                  onChange={(e) => handleHostStatsFilterChange('toDate', e.target.value)}
                  disabled={hostStatsLoading}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">Host ID</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Enter host ID"
                  value={hostStatsFilters.hostId || ''}
                  onChange={(e) => handleHostStatsFilterChange('hostId', e.target.value)}
                  disabled={hostStatsLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchHostStats();
                    }
                  }}
                />
              </div>
              <div className="filter-actions">
                <button
                  className="search-filters-button"
                  onClick={handleSearchHostStats}
                  disabled={hostStatsLoading}
                >
                  {hostStatsLoading ? 'Searching...' : '🔍 Search'}
                </button>
                <button
                  className="clear-filters-button"
                  onClick={handleClearHostStatsFilters}
                  disabled={hostStatsLoading}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {hostStatsLoading ? (
              <div className="host-stats-loading">
                <p>Loading host statistics...</p>
              </div>
            ) : hostStatsError ? (
              <div className="host-stats-error">
                <p>{hostStatsError}</p>
              </div>
            ) : hostStatistics.length > 0 ? (
              <div className="host-stats-list">
                {hostStatistics.map((host) => (
                  <div key={host.hostId} className="host-stat-card">
                    <div className="host-stat-header">
                      <div className="host-stat-info">
                        <h3 className="host-stat-name">{host.name}</h3>
                        <p className="host-stat-email">{host.email}</p>
                        <p className="host-stat-id">ID: {host.hostId}</p>
                      </div>
                      <div className="host-stat-total">
                        <span className="total-label">Total Lobbies</span>
                        <span className="total-value">{host.totalLobbies}</span>
                      </div>
                    </div>
                    
                    {Object.keys(host.timeSlotSummary || {}).length > 0 && (
                      <div className="host-stat-timeslots">
                        <h4 className="timeslot-title">Time Slot Summary</h4>
                        <div className="timeslot-grid">
                          {Object.entries(host.timeSlotSummary).map(([timeSlot, count]) => (
                            <div key={timeSlot} className="timeslot-item">
                              <span className="timeslot-time">{timeSlot}</span>
                              <span className="timeslot-count">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {host.dailyRecords && host.dailyRecords.length > 0 && (
                      <div className="host-stat-daily">
                        <h4 className="daily-title">Daily Records</h4>
                        <div className="daily-records-list">
                          {host.dailyRecords.map((record, idx) => (
                            <div key={idx} className="daily-record-item">
                              <span className="daily-date">{record.date}</span>
                              <span className="daily-lobbies">{record.lobbies} lobbies</span>
                              {record.tournaments && record.tournaments.length > 0 && (
                                <div className="daily-tournaments">
                                  {record.tournaments.map((tournament, tIdx) => (
                                    <div key={tIdx} className="tournament-item">
                                      <span>{tournament.game || 'N/A'}</span>
                                      <span>{tournament.startTime}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="host-stats-empty">
                <p>No host statistics found.</p>
              </div>
            )}
          </div>
          )}
        </div>
      </main>

      {/* User Details Sidebar */}
      {selectedUser && (
        <aside className="user-details-sidebar">
          <div className="user-details-header">
            <h3>User Details</h3>
            <button
              className="close-details-button"
              onClick={() => handleUserCardClick(null)}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="user-details-content">
            <div className="user-detail-section">
              <div className="user-detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedUser.name || 'N/A'}</span>
              </div>
              <div className="user-detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">
                  {selectedUser.email}
                  <button
                    type="button"
                    className="copy-email-btn"
                    onClick={(e) => handleCopyEmail(selectedUser.email, e)}
                    title="Copy email"
                    aria-label="Copy email"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </span>
              </div>
              <div className="user-detail-item">
                <span className="detail-label">Role:</span>
                <span className="detail-value">{selectedUser.role || 'N/A'}</span>
              </div>
              <div className="user-detail-item">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status-badge ${selectedUser.isBlocked ? 'blocked' : 'active'}`}>
                  {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <div className="user-detail-item highlight">
                <span className="detail-label">Balance GC:</span>
                <span className="detail-value balance-highlight">{selectedUser.balanceGC ?? 0}</span>
              </div>
              {selectedUser.createdAt && (
                <div className="user-detail-item">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

    </div>
  );
};

export default Dashboard;

