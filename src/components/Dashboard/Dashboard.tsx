import { useDashboardLogic } from './Dashboard.logic';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const {
    user,
    sidebarOpen,
    healthData,
    healthLoading,
    healthError,
    handleLogout,
    toggleSidebar,
    checkHealth,
  } = useDashboardLogic();

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
          <button className="logout-button" onClick={handleLogout}>
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="header-actions">
            <button className="refresh-button" onClick={checkHealth} disabled={healthLoading}>
              {healthLoading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
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
    </div>
  );
};

export default Dashboard;

