import { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTopUpPageLogic } from './TopUpPage.logic';
import ThemeToggle from '@components/common/ThemeToggle';
import { ROUTES } from '@utils/constants';
import './TopUpPage.scss';

const TopUpPage: React.FC = () => {
  const location = useLocation();
  const {
    user,
    sidebarOpen,
    toggleSidebar,
    topUpUserQuery,
    topUpSearchResults,
    topUpSelectedUser,
    topUpSelectedUsers,
    topUpMode,
    topUpAmount,
    topUpDescription,
    topUpLoading,
    topUpError,
    topUpSuccess,
    showTopUpDropdown,
    searchLoading,
    handleTopUpUserSearch,
    handleTopUpUserSelect,
    handleTopUpUserToggle,
    handleRemoveSelectedUser,
    handleClearAllSelected,
    isUserSelected,
    handleTopUpSubmit,
    setTopUpAmount,
    setTopUpDescription,
    setTopUpMode,
    setTopUpSelectedUser,
    setTopUpSelectedUsers,
    setTopUpUserQuery,
    setTopUpError,
    setTopUpSuccess,
    setShowTopUpDropdown,
  } = useTopUpPageLogic();

  const topUpDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (topUpDropdownRef.current && !topUpDropdownRef.current.contains(event.target as Node)) {
        setShowTopUpDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowTopUpDropdown]);

  // Auto-dismiss success/error messages after 5 seconds
  useEffect(() => {
    if (topUpSuccess) {
      const timer = setTimeout(() => {
        setTopUpSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [topUpSuccess, setTopUpSuccess]);

  useEffect(() => {
    if (topUpError) {
      const timer = setTimeout(() => {
        setTopUpError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [topUpError, setTopUpError]);

  return (
    <div className={`top-up-page-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className={`top-up-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
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
      <main className="top-up-main">
        <header className="top-up-header">
          <h1>Top Up Balance</h1>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </header>

        <div className="top-up-content">
          {/* Top Up Balance Card */}
          <div className="top-up-card">
            <h2 className="card-title">Top Up User Balance</h2>
            <div className="top-up-section">
              <div className="top-up-form">
                {/* Mode Toggle */}
                <div className="form-group">
                  <label className="form-label">Top Up Mode</label>
                  <div className="mode-toggle">
                    <button
                      type="button"
                      className={`mode-toggle-btn ${topUpMode === 'single' ? 'active' : ''}`}
                      onClick={() => {
                        setTopUpMode('single');
                        setTopUpSelectedUsers([]);
                        setTopUpSelectedUser(null);
                        setTopUpUserQuery('');
                      }}
                      disabled={topUpLoading}
                    >
                      Single User
                    </button>
                    <button
                      type="button"
                      className={`mode-toggle-btn ${topUpMode === 'bulk' ? 'active' : ''}`}
                      onClick={() => {
                        setTopUpMode('bulk');
                        setTopUpSelectedUser(null);
                        setTopUpUserQuery('');
                      }}
                      disabled={topUpLoading}
                    >
                      Multiple Users
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {topUpMode === 'single' ? 'Select User' : 'Search & Select Users'}
                  </label>
                  <div className="user-search-container" ref={topUpDropdownRef}>
                    <input
                      type="text"
                      className="user-search-input"
                      placeholder="Type user name or email to search..."
                      value={topUpUserQuery}
                      onChange={(e) => handleTopUpUserSearch(e.target.value)}
                      onFocus={() => {
                        if (topUpSearchResults.length > 0) {
                          setShowTopUpDropdown(true);
                        }
                      }}
                      disabled={topUpLoading}
                    />
                    {searchLoading && (
                      <div className="search-loading-indicator">Searching...</div>
                    )}
                    {showTopUpDropdown && topUpSearchResults.length > 0 && (
                      <div className="user-search-dropdown">
                        {topUpSearchResults.map((user) => {
                          const userId = user.userId || user._id || '';
                          return (
                            <div
                              key={userId}
                              className={`user-search-item ${topUpMode === 'bulk' ? 'with-checkbox' : ''}`}
                              onClick={() => {
                                if (topUpMode === 'bulk') {
                                  handleTopUpUserToggle(user);
                                } else {
                                  handleTopUpUserSelect(user);
                                }
                              }}
                            >
                              {topUpMode === 'bulk' && (
                                <input
                                  type="checkbox"
                                  checked={isUserSelected(user)}
                                  onChange={() => handleTopUpUserToggle(user)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="user-checkbox"
                                />
                              )}
                              <div className="user-search-info">
                                <div className="user-search-name">{user.name || 'N/A'}</div>
                                <div className="user-search-email">{user.email}</div>
                                {user.balanceGC !== undefined && (
                                  <div className="user-search-balance">
                                    Balance: {user.balanceGC} GC
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {topUpMode === 'single' && topUpSelectedUser && (
                    <div className="selected-user-info">
                      <span className="selected-user-label">Selected:</span>
                      <span className="selected-user-name">{topUpSelectedUser.name || 'N/A'}</span>
                      <span className="selected-user-email">({topUpSelectedUser.email})</span>
                      {topUpSelectedUser.balanceGC !== undefined && (
                        <span className="selected-user-balance">
                          Current Balance: {topUpSelectedUser.balanceGC} GC
                        </span>
                      )}
                    </div>
                  )}
                  {topUpMode === 'bulk' && topUpSelectedUsers.length > 0 && (
                    <div className="selected-users-list">
                      <div className="selected-users-header">
                        <span className="selected-users-count">
                          {topUpSelectedUsers.length} user(s) selected
                        </span>
                        <button
                          type="button"
                          className="clear-all-btn"
                          onClick={handleClearAllSelected}
                          disabled={topUpLoading}
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="selected-users-items">
                        {topUpSelectedUsers.map((user) => {
                          const userId = user.userId || user._id || '';
                          return (
                            <div key={userId} className="selected-user-chip">
                              <span className="chip-name">{user.name || 'N/A'}</span>
                              <span className="chip-email">({user.email})</span>
                              {user.balanceGC !== undefined && (
                                <span className="chip-balance">{user.balanceGC} GC</span>
                              )}
                              <button
                                type="button"
                                className="chip-remove"
                                onClick={() => handleRemoveSelectedUser(userId)}
                                disabled={topUpLoading}
                                aria-label="Remove user"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (GC)</label>
                  <input
                    type="number"
                    className="amount-input"
                    placeholder="Enter amount to add"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    disabled={topUpLoading || (topUpMode === 'single' && !topUpSelectedUser) || (topUpMode === 'bulk' && topUpSelectedUsers.length === 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <input
                    type="text"
                    className="description-input"
                    placeholder="Enter description for this top-up"
                    value={topUpDescription}
                    onChange={(e) => setTopUpDescription(e.target.value)}
                    disabled={topUpLoading}
                  />
                </div>
                {topUpError && (
                  <div className="top-up-error">
                    {topUpError}
                  </div>
                )}
                {topUpSuccess && (
                  <div className="top-up-success">
                    {topUpSuccess}
                  </div>
                )}
                <button
                  className="top-up-button"
                  onClick={handleTopUpSubmit}
                  disabled={
                    topUpLoading ||
                    !topUpAmount ||
                    parseFloat(topUpAmount) <= 0 ||
                    (topUpMode === 'single' && !topUpSelectedUser) ||
                    (topUpMode === 'bulk' && topUpSelectedUsers.length === 0)
                  }
                >
                  {topUpLoading
                    ? 'Processing...'
                    : topUpMode === 'bulk'
                    ? `Top Up ${topUpSelectedUsers.length} User(s)`
                    : 'Top Up Balance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopUpPage;

