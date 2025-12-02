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

          {/* Users List Card */}
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
                  <span className="users-count-text">
                    {pagination ? (
                      <>Total: {pagination.total} users</>
                    ) : (
                      <>Total: {users.length} users</>
                    )}
                  </span>
                </div>
                <div className="users-cards-container">
                  {users.map((adminUser, index) => (
                    <div key={adminUser.userId || adminUser._id} className="user-card">
                      <div className="user-card-number">{index + 1}</div>
                      <div className="user-card-content">
                        <div className="user-name">
                          <span className="user-label">Name:</span>
                          <span className="user-value">{adminUser.name || 'N/A'}</span>
                        </div>
                        <div className="user-email">
                          <span className="user-label">Email:</span>
                          <span className="user-value">{adminUser.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="users-empty">
                <p>No users found.</p>
              </div>
            )}
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};

export default Dashboard;

