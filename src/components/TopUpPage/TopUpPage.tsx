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
    topUpAmount,
    topUpLoading,
    topUpError,
    topUpSuccess,
    showTopUpDropdown,
    searchLoading,
    handleTopUpUserSearch,
    handleTopUpUserSelect,
    handleTopUpSubmit,
    setTopUpAmount,
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
                <div className="form-group">
                  <label className="form-label">Select User</label>
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
                              className="user-search-item"
                              onClick={() => handleTopUpUserSelect(user)}
                            >
                              <div className="user-search-name">{user.name || 'N/A'}</div>
                              <div className="user-search-email">{user.email}</div>
                              {user.balanceGC !== undefined && (
                                <div className="user-search-balance">
                                  Balance: {user.balanceGC} GC
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {topUpSelectedUser && (
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
                    disabled={topUpLoading || !topUpSelectedUser}
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
                  disabled={topUpLoading || !topUpSelectedUser || !topUpAmount || parseFloat(topUpAmount) <= 0}
                >
                  {topUpLoading ? 'Processing...' : 'Top Up Balance'}
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

