import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectTheme, toggleTheme } from '@store/slices/themeSlice';
import './SettingsModal.scss';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  if (!isOpen) return null;

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h3 className="settings-modal-title">Settings</h3>
          <button className="settings-modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-modal-body">
          <div className="settings-option">
            <div className="settings-option-label">
              <span className="settings-option-icon">
                {theme === 'dark' ? '🌙' : '☀️'}
              </span>
              <div className="settings-option-text">
                <div className="settings-option-title">Theme</div>
                <div className="settings-option-description">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </div>
              </div>
            </div>
            <button
              className={`theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`}
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
            >
              <div className="theme-toggle-slider"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

