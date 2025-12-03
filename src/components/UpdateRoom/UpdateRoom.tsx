import React, { useState, useEffect } from 'react';
import { type Tournament, type UpdateRoomRequest } from '@services/api';
import './UpdateRoom.scss';

interface UpdateRoomProps {
  isOpen: boolean;
  tournament: Tournament | null;
  onClose: () => void;
  onUpdate: (data: UpdateRoomRequest) => Promise<void>;
  isUpdating: boolean;
}

const UpdateRoom: React.FC<UpdateRoomProps> = ({
  isOpen,
  tournament,
  onClose,
  onUpdate,
  isUpdating,
}) => {
  const [formData, setFormData] = useState<UpdateRoomRequest>({
    roomId: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tournament) {
      setFormData({
        roomId: tournament.room?.roomId || '',
        password: tournament.room?.password || '',
      });
      setError(null);
    }
  }, [tournament]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.roomId || !formData.password) {
      setError('Please fill all required fields');
      return;
    }

    try {
      await onUpdate(formData);
    } catch (err: any) {
      setError(err?.message || 'Failed to update room information');
    }
  };

  if (!isOpen || !tournament) return null;

  return (
    <div className="update-room-modal-overlay" onClick={onClose}>
      <div className="update-room-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="update-room-modal-header">
          <h3 className="update-room-modal-title">Update Room Information</h3>
          <button
            className="update-room-modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={isUpdating}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form className="update-room-form" onSubmit={handleSubmit}>
          <div className="update-room-modal-body">
            <div className="form-group">
              <label className="form-label">Room ID</label>
              <input
                type="text"
                className="form-input"
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                placeholder="Enter room ID"
                disabled={isUpdating}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="text"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter room password"
                disabled={isUpdating}
                required
              />
            </div>

            {error && (
              <div className="form-error-message">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="update-room-modal-footer">
            <button
              type="button"
              className="form-button form-button-secondary"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="form-button form-button-primary"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateRoom;

