import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useHostCreationPageLogic } from './HostCreationPage.logic';
import ThemeToggle from '@components/common/ThemeToggle';
import { ROUTES } from '@utils/constants';
import './HostCreationPage.scss';

const HostCreationPage: React.FC = () => {
  const location = useLocation();
  const {
    user,
    sidebarOpen,
    toggleSidebar,
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
    hosts,
    hostsLoading,
    hostsError,
    selectedHost,
    hostStatistics,
    statsLoading,
    showHostModal,
    handleHostClick,
    handleCloseModal,
  } = useHostCreationPageLogic();

  return (
    <div className={`host-creation-page-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className={`host-creation-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
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
      <main className="host-creation-main">
        <header className="host-creation-header">
          <h1>Host Creation</h1>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </header>

        <div className="host-creation-content">
          {/* Create Host Form Card */}
          <div className="host-creation-card">
            <h2 className="card-title">Create New Host Account</h2>
            <form className="host-creation-form" onSubmit={handleCreateHost}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="host@example.com"
                  value={hostEmail}
                  onChange={(e) => setHostEmail(e.target.value)}
                  disabled={createLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Host Name"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  disabled={createLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input password-input"
                    placeholder="password123"
                    value={hostPassword}
                    onChange={(e) => setHostPassword(e.target.value)}
                    disabled={createLoading}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={toggleShowPassword}
                    disabled={createLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {createError && (
                <div className="host-creation-error">
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div className="host-creation-success">
                  {createSuccess}
                </div>
              )}
              <button
                type="submit"
                className="host-creation-button"
                disabled={createLoading || !hostEmail.trim() || !hostName.trim() || !hostPassword.trim()}
              >
                {createLoading ? 'Creating...' : 'Create Host Account'}
              </button>
            </form>
          </div>

          {/* Hosts List Card */}
          <div className="host-creation-card">
            <h2 className="card-title">All Hosts</h2>
            {hostsLoading ? (
              <div className="hosts-loading">
                <p>Loading hosts...</p>
              </div>
            ) : hostsError ? (
              <div className="hosts-error">
                <p>{hostsError}</p>
              </div>
            ) : hosts.length > 0 ? (
              <div className="hosts-list">
                {hosts.map((host) => {
                  const hostId = host.hostId || host._id || '';
                  return (
                    <div
                      key={hostId}
                      className="host-item"
                      onClick={() => handleHostClick(host)}
                    >
                      <div className="host-item-content">
                        <div className="host-name">{host.name || 'N/A'}</div>
                        <div className="host-email">{host.email}</div>
                        {host.totalLobbies !== undefined && (
                          <div className="host-lobbies">
                            Total Lobbies: {host.totalLobbies}
                          </div>
                        )}
                      </div>
                      <div className="host-item-arrow">→</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="hosts-empty">
                <p>No hosts found.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Host Details Modal */}
      {showHostModal && selectedHost && (
        <div className="host-modal-overlay" onClick={handleCloseModal}>
          <div className="host-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="host-modal-header">
              <h3>Host Details</h3>
              <button
                className="host-modal-close"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="host-modal-body">
              <div className="host-detail-section">
                <div className="host-detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedHost.name || 'N/A'}</span>
                </div>
                <div className="host-detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedHost.email}</span>
                </div>
                <div className="host-detail-item">
                  <span className="detail-label">Host ID:</span>
                  <span className="detail-value">{selectedHost.hostId || selectedHost._id || 'N/A'}</span>
                </div>
                {selectedHost.createdAt && (
                  <div className="host-detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {new Date(selectedHost.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {statsLoading ? (
                <div className="host-stats-loading">
                  <p>Loading statistics...</p>
                </div>
              ) : hostStatistics ? (
                <div className="host-statistics-section">
                  <h4 className="statistics-title">Statistics</h4>
                  <div className="host-detail-item highlight">
                    <span className="detail-label">Total Lobbies Handled:</span>
                    <span className="detail-value highlight-value">{hostStatistics.totalLobbies}</span>
                  </div>
                  
                  {Object.keys(hostStatistics.timeSlotSummary || {}).length > 0 && (
                    <div className="host-timeslots-section">
                      <h5 className="timeslots-title">Time Slot Summary</h5>
                      <div className="timeslots-grid">
                        {Object.entries(hostStatistics.timeSlotSummary).map(([timeSlot, count]) => (
                          <div key={timeSlot} className="timeslot-item">
                            <span className="timeslot-time">{timeSlot}</span>
                            <span className="timeslot-count">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hostStatistics.dailyRecords && hostStatistics.dailyRecords.length > 0 && (
                    <div className="host-daily-section">
                      <h5 className="daily-title">Daily Records</h5>
                      <div className="daily-records-list">
                        {hostStatistics.dailyRecords.map((record, idx) => (
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
              ) : (
                <div className="host-stats-empty">
                  <p>No statistics available for this host.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostCreationPage;

