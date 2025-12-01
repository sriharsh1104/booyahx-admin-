import { useEffect, useRef } from 'react';
import { useDashboardLogic } from './Dashboard.logic';
import ConfirmationModal from '@components/common/ConfirmationModal';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const {
    user,
    sidebarOpen,
    healthData,
    healthLoading,
    healthError,
    toggleSidebar,
    checkHealth,
    showLogoutModal,
    setShowLogoutModal,
    handleLogoutConfirm,
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
          <h2 className="sidebar-logo">BooyahX Admin</h2>
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span className="nav-text">Dashboard</span>}
          </a>
          <a href="#health" className="nav-item">
            <span className="nav-icon">❤️</span>
            {sidebarOpen && <span className="nav-text">Health</span>}
          </a>
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
            <button 
              className="refresh-button" 
              onClick={checkHealth} 
              disabled={healthLoading}
              aria-label="Refresh"
              title="Refresh"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className={healthLoading ? 'spinning' : ''}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            </button>
            
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
                    setShowLogoutModal(true);
                    const dropdown = dropdownRef.current?.querySelector('.dropdown-menu');
                    dropdown?.classList.remove('open');
                  }}
                >
                  <span className="dropdown-icon">🚪</span>
                  <span>Logout</span>
                </button>
                {user && (
                  <div className="dropdown-item dropdown-item-info">
                    <span className="dropdown-icon">👤</span>
                    <div className="dropdown-item-text">
                      <div className="dropdown-item-name">{user.name || 'Admin'}</div>
                      <div className="dropdown-item-email">{user.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Health Status Card */}
          <div className="dashboard-card">
            <h2 className="card-title">API Health Status</h2>
            {healthLoading && <div className="loading">Loading health status...</div>}
            {healthError && (
              <div className="error">
                <strong>Error:</strong> {healthError.message}
              </div>
            )}
            {healthData && (
              <div className="health-status">
                <div className="status-item">
                  <span className="status-label">Status:</span>
                  <span className={`status-value ${healthData.status === 'ok' ? 'success' : 'error'}`}>
                    {healthData.status}
                  </span>
                </div>
                {healthData.timestamp && (
                  <div className="status-item">
                    <span className="status-label">Last Check:</span>
                    <span className="status-value">{new Date(healthData.timestamp).toLocaleString()}</span>
                  </div>
                )}
                {healthData.uptime !== undefined && (
                  <div className="status-item">
                    <span className="status-label">Uptime:</span>
                    <span className="status-value">{Math.floor(healthData.uptime / 60)} minutes</span>
                  </div>
                )}
              </div>
            )}
          </div>

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
        </div>
      </main>

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
    </div>
  );
};

export default Dashboard;

