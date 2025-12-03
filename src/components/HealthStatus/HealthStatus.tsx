import { useHealthStatusLogic } from './HealthStatus.logic';
import BackButton from '@components/common/BackButton';
import ThemeToggle from '@components/common/ThemeToggle';
import './HealthStatus.scss';

const HealthStatus: React.FC = () => {
  const {
    healthData,
    healthLoading,
    healthError,
    checkHealth,
  } = useHealthStatusLogic();

  return (
    <div className="health-status-container">
      <header className="health-status-header">
        <div className="header-left">
          <BackButton />
          <h1>Health Status</h1>
        </div>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </header>

      <div className="health-status-content">
        <div className="health-status-card">
          <h2 className="card-title">API Health Status</h2>
          {healthLoading && <div className="loading">Loading health status...</div>}
          {healthError && (
            <div className="error">
              <strong>Error:</strong> {healthError.message}
            </div>
          )}
          {healthData && (
            <div className="health-status-details">
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
          <div className="health-status-actions">
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
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStatus;

