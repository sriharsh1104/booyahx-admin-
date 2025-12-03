import React, { useState, useEffect } from 'react';
import { type Tournament, type UpdateTournamentRequest } from '@services/api';
import './EditTournament.scss';

interface EditTournamentProps {
  isOpen: boolean;
  tournament: Tournament | null;
  onClose: () => void;
  onUpdate: (data: UpdateTournamentRequest) => Promise<void>;
  isUpdating: boolean;
}

const EditTournament: React.FC<EditTournamentProps> = ({
  isOpen,
  tournament,
  onClose,
  onUpdate,
  isUpdating,
}) => {
  const [formData, setFormData] = useState<UpdateTournamentRequest>({
    date: '',
    startTime: '',
    entryFee: 0,
    maxPlayers: 48,
    region: 'Asia',
  });
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when tournament changes
  useEffect(() => {
    if (tournament) {
      // Convert ISO date to YYYY-MM-DD format
      const dateStr = tournament.date ? new Date(tournament.date).toISOString().split('T')[0] : '';
      setFormData({
        date: dateStr,
        startTime: tournament.startTime || '',
        entryFee: tournament.entryFee || 0,
        maxPlayers: tournament.maxPlayers || 48,
        region: tournament.region || 'Asia',
      });
      setError(null);
    }
  }, [tournament]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.date || !formData.startTime || !formData.entryFee || !formData.maxPlayers || !formData.region) {
      setError('Please fill all required fields');
      return;
    }

    try {
      await onUpdate(formData);
    } catch (err: any) {
      setError(err?.message || 'Failed to update tournament');
    }
  };

  const regions = ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];

  if (!isOpen || !tournament) return null;

  return (
    <div className="edit-tournament-modal-overlay" onClick={onClose}>
      <div className="edit-tournament-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-tournament-modal-header">
          <h3 className="edit-tournament-modal-title">Edit Tournament</h3>
          <button
            className="edit-tournament-modal-close"
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

        <form className="edit-tournament-form" onSubmit={handleSubmit}>
          <div className="edit-tournament-modal-body">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={isUpdating}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="text"
                className="form-input"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                placeholder="e.g., 6:00 PM"
                disabled={isUpdating}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Entry Fee (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.entryFee}
                onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                min="0"
                disabled={isUpdating}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Players</label>
              <input
                type="number"
                className="form-input"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: Number(e.target.value) })}
                min="1"
                disabled={isUpdating}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Region</label>
              <select
                className="form-select"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                disabled={isUpdating}
                required
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="form-error-message">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="edit-tournament-modal-footer">
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
              {isUpdating ? 'Updating...' : 'Update Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTournament;

