import { useProfileLogic } from './Profile.logic';
import BackButton from '@components/common/BackButton';
import ThemeToggle from '@components/common/ThemeToggle';
import './Profile.scss';

const Profile: React.FC = () => {
  const { user } = useProfileLogic();

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="header-left">
          <BackButton />
          <h1>Profile</h1>
        </div>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </header>

      <div className="profile-content">
        <div className="profile-card">
          <h2 className="card-title">User Information</h2>
          {user ? (
            <div className="profile-details">
              <div className="profile-item">
                <span className="profile-label">Name:</span>
                <span className="profile-value">{user.name || 'N/A'}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Email:</span>
                <span className="profile-value">{user.email}</span>
              </div>
              {user.role && (
                <div className="profile-item">
                  <span className="profile-label">Role:</span>
                  <span className="profile-value">{user.role}</span>
                </div>
              )}
              {user.isEmailVerified !== undefined && (
                <div className="profile-item">
                  <span className="profile-label">Email Verified:</span>
                  <span className={`profile-value ${user.isEmailVerified ? 'verified' : 'not-verified'}`}>
                    {user.isEmailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="loading">Loading profile...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

