import { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useUserHistoryPageLogic } from './UserHistoryPage.logic';
import ThemeToggle from '@components/common/ThemeToggle';
import { ROUTES } from '@utils/constants';
import './UserHistoryPage.scss';

const UserHistoryPage: React.FC = () => {
  const location = useLocation();
  const {
    user,
    sidebarOpen,
    toggleSidebar,
    emailQuery,
    searchResults,
    selectedUser,
    showDropdown,
    searchLoading,
    transactions,
    transactionsLoading,
    transactionsError,
    totalTransactions,
    handleEmailSearch,
    handleUserSelect,
    handleSearchByEmail,
    setShowDropdown,
  } = useUserHistoryPageLogic();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowDropdown]);

  return (
    <div className={`user-history-page-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className={`user-history-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
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
      <main className="user-history-main">
        <header className="user-history-header">
          <h1>User Transaction History</h1>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </header>

        <div className="user-history-content">
          {/* Search Section */}
          <div className="user-history-card">
            <h2 className="card-title">Search User by Email</h2>
            <div className="search-section" ref={dropdownRef}>
              <div className="search-input-group">
                <input
                  type="email"
                  className="search-input"
                  placeholder="Enter user email..."
                  value={emailQuery}
                  onChange={(e) => handleEmailSearch(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchByEmail();
                    }
                  }}
                  disabled={searchLoading}
                />
                <button
                  className="search-button"
                  onClick={handleSearchByEmail}
                  disabled={searchLoading || !emailQuery.trim()}
                >
                  {searchLoading ? 'Searching...' : '🔍 Search'}
                </button>
              </div>
              {showDropdown && searchResults.length > 0 && (
                <div className="user-search-dropdown">
                  {searchResults.map((user) => {
                    const userId = user.userId || user._id || '';
                    return (
                      <div
                        key={userId}
                        className="user-search-item"
                        onClick={() => handleUserSelect(user)}
                      >
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

            {/* Selected User Info */}
            {selectedUser && (
              <div className="selected-user-info">
                <h3>User Information</h3>
                <div className="user-details">
                  <div className="user-detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedUser.name || 'N/A'}</span>
                  </div>
                  <div className="user-detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedUser.email}</span>
                  </div>
                  <div className="user-detail-item">
                    <span className="detail-label">Balance GC:</span>
                    <span className="detail-value">{selectedUser.balanceGC ?? 0}</span>
                  </div>
                  <div className="user-detail-item">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">{selectedUser.role || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transactions Section */}
          <div className="user-history-card">
            <h2 className="card-title">
              Transaction History
              {totalTransactions > 0 && (
                <span className="transaction-count">({totalTransactions} transactions)</span>
              )}
            </h2>

            {transactionsError && (
              <div className="error-message">
                <p>{transactionsError}</p>
              </div>
            )}

            {transactionsLoading ? (
              <div className="loading-message">
                <p>Loading transactions...</p>
              </div>
            ) : selectedUser && transactions.length > 0 ? (
              <div className="transactions-list">
                <div className="transactions-header">
                  <div className="transaction-col">Date & Time</div>
                  <div className="transaction-col">Amount (GC)</div>
                  <div className="transaction-col">Status</div>
                  <div className="transaction-col">Description</div>
                </div>
                {transactions.map((transaction) => (
                  <div key={transaction._id || `${transaction.userId}-${transaction.createdAt}`} className="transaction-item">
                    <div className="transaction-col">
                      {transaction.createdAt
                        ? new Date(transaction.createdAt).toLocaleString('en-IN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </div>
                    <div className="transaction-col amount-col">
                      <span className={`amount ${transaction.status === 'success' ? 'success' : 'fail'}`}>
                        {transaction.status === 'success' ? '+' : ''}{transaction.amountGC} GC
                      </span>
                    </div>
                    <div className="transaction-col">
                      <span className={`status-badge ${transaction.status === 'success' ? 'success' : 'fail'}`}>
                        {transaction.status === 'success' ? '✓ Success' : '✗ Failed'}
                      </span>
                    </div>
                    <div className="transaction-col description-col">
                      {transaction.description || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedUser && transactions.length === 0 && !transactionsLoading ? (
              <div className="empty-message">
                <p>No transactions found for this user.</p>
              </div>
            ) : !selectedUser ? (
              <div className="empty-message">
                <p>Please search for a user by email to view their transaction history.</p>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserHistoryPage;

