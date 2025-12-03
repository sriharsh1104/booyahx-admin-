import React, { useState, useEffect } from 'react';
import { 
  hostApplicationsApi, 
  type HostApplication, 
  type HostWithAssignments,
  type HostAssignment,
  type Tournament 
} from '@services/api';
import ConfirmationModal from '@components/common/ConfirmationModal';
import './HostApplications.scss';

interface HostApplicationsProps {
  isOpen: boolean;
  tournamentId: string;
  tournament: Tournament;
  onClose: () => void;
  onApplicationProcessed: () => void;
}

// Utility function to check if two time slots conflict
const checkTimeConflict = (time1: string, date1: string, time2: string, date2: string): boolean => {
  // If dates are different, no conflict
  if (date1 !== date2) {
    return false;
  }

  // Parse time strings like "12:00 AM" or "3:00 PM"
  const parseTime = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return -1;
    
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes; // Convert to minutes for comparison
  };

  const time1Minutes = parseTime(time1);
  const time2Minutes = parseTime(time2);

  if (time1Minutes === -1 || time2Minutes === -1) {
    // If parsing fails, do exact string match
    return time1 === time2;
  }

  // Check if times are the same (exact match)
  return time1Minutes === time2Minutes;
};

const HostApplications: React.FC<HostApplicationsProps> = ({
  isOpen,
  tournamentId,
  tournament,
  onClose,
  onApplicationProcessed,
}) => {
  const [applications, setApplications] = useState<HostApplication[]>([]);
  const [allHosts, setAllHosts] = useState<HostWithAssignments[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [hostToAssign, setHostToAssign] = useState<HostWithAssignments | null>(null);
  const [viewMode, setViewMode] = useState<'applications' | 'all-hosts'>('applications');

  useEffect(() => {
    if (isOpen && tournamentId) {
      if (viewMode === 'applications') {
        loadApplications();
      } else {
        loadAllHosts();
      }
    }
  }, [isOpen, tournamentId, viewMode]);

  const loadApplications = async () => {
    try {
      const apps = await hostApplicationsApi.getHostApplications(tournamentId);
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (err: any) {
      if (err?.message?.includes('cancelled') || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.message === 'Duplicate request cancelled') {
        return;
      }
      console.error('Failed to load host applications:', err);
      setApplications([]); // Set empty array on error
    }
  };

  const loadAllHosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const hosts = await hostApplicationsApi.getAllHostsWithAssignments(tournamentId);
      // Process hosts - use backend conflict data if available, otherwise calculate
      const hostsWithConflicts = hosts.map(host => {
        // Safety check: ensure assignedLobbies is an array
        const assignedLobbies = Array.isArray(host.assignedLobbies) ? host.assignedLobbies : [];
        
        // Use backend conflict data if available, otherwise calculate conflicts
        const hasConflict = host.hasTimeConflict !== undefined 
          ? host.hasTimeConflict 
          : assignedLobbies.some(assignment => 
              assignment &&
              assignment.tournamentStartTime &&
              assignment.tournamentDate &&
              checkTimeConflict(
                tournament.startTime,
                tournament.date,
                assignment.tournamentStartTime,
                assignment.tournamentDate
              )
            );
        
        const conflictingAssignments = host.timeConflictDetails && Array.isArray(host.timeConflictDetails)
          ? host.timeConflictDetails
          : assignedLobbies.filter(assignment => 
              assignment &&
              assignment.tournamentStartTime &&
              assignment.tournamentDate &&
              checkTimeConflict(
                tournament.startTime,
                tournament.date,
                assignment.tournamentStartTime,
                assignment.tournamentDate
              )
            );
        
        return {
          ...host,
          assignedLobbies: assignedLobbies,
          totalLobbies: host.totalLobbies || assignedLobbies.length,
          hasTimeConflict: hasConflict,
          conflictingTournaments: conflictingAssignments,
        };
      });
      setAllHosts(hostsWithConflicts);
    } catch (err: any) {
      if (err?.message?.includes('cancelled') || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.message === 'Duplicate request cancelled') {
        return;
      }
      console.error('Failed to load hosts:', err);
      setError(err?.message || 'Failed to load hosts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      await hostApplicationsApi.approveApplication(applicationId);
      await loadApplications();
      await loadAllHosts();
      onApplicationProcessed();
    } catch (err: any) {
      if (err?.message?.includes('cancelled') || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.message === 'Duplicate request cancelled') {
        return;
      }
      console.error('Failed to approve application:', err);
      setError(err?.message || 'Failed to approve application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      await hostApplicationsApi.rejectApplication(applicationId);
      await loadApplications();
      await loadAllHosts();
      onApplicationProcessed();
    } catch (err: any) {
      if (err?.message?.includes('cancelled') || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.message === 'Duplicate request cancelled') {
        return;
      }
      console.error('Failed to reject application:', err);
      setError(err?.message || 'Failed to reject application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAssignHost = (host: HostWithAssignments) => {
    if (host.hasTimeConflict) {
      setHostToAssign(host);
      setShowConflictModal(true);
    } else {
      assignHostDirectly(host);
    }
  };

  const assignHostDirectly = async (host?: HostWithAssignments) => {
    // Use passed host or hostToAssign from state (for conflict modal)
    const hostToUse = host || hostToAssign;
    if (!hostToUse) return;

    setProcessingId(hostToUse.hostId);
    try {
      await hostApplicationsApi.assignHost({
        tournamentId,
        hostId: hostToUse.hostId,
      });
      await loadAllHosts();
      await loadApplications();
      onApplicationProcessed();
      setShowConflictModal(false);
      setHostToAssign(null);
    } catch (err: any) {
      if (err?.message?.includes('cancelled') || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.message === 'Duplicate request cancelled') {
        return;
      }
      console.error('Failed to assign host:', err);
      setError(err?.message || 'Failed to assign host');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="host-applications-modal-overlay" onClick={onClose}>
        <div className="host-applications-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="host-applications-modal-header">
            <h3 className="host-applications-modal-title">Assign Host to Tournament</h3>
            <button
              className="host-applications-modal-close"
              onClick={onClose}
              aria-label="Close"
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="host-applications-view-toggle">
            <button
              className={`view-toggle-button ${viewMode === 'applications' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('applications');
                if (applications.length === 0) {
                  loadApplications();
                }
              }}
              disabled={loading}
            >
              Applications ({applications.length})
            </button>
            <button
              className={`view-toggle-button ${viewMode === 'all-hosts' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('all-hosts');
                if (allHosts.length === 0) {
                  loadAllHosts();
                }
              }}
              disabled={loading}
            >
              All Hosts ({allHosts.length})
            </button>
          </div>

          <div className="host-applications-modal-body">
            {loading ? (
              <div className="host-applications-loading">
                <p>Loading...</p>
              </div>
            ) : error ? (
              <div className="host-applications-error">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            ) : viewMode === 'applications' ? (
              applications.length === 0 ? (
                <div className="host-applications-empty">
                  <p>No host applications found for this tournament.</p>
                </div>
              ) : (
                <div className="host-applications-list">
                  {applications.map((application) => (
                    <div key={application._id || application.id} className="host-application-card">
                      <div className="application-info">
                        <div className="application-user">
                          <span className="application-label">User:</span>
                          <span className="application-value">
                            {application.user?.name || application.user?.email || application.userId || 'N/A'}
                          </span>
                        </div>
                        {application.user?.email && (
                          <div className="application-email">
                            <span className="application-label">Email:</span>
                            <span className="application-value">{application.user.email}</span>
                          </div>
                        )}
                        <div className="application-status">
                          <span className="application-label">Status:</span>
                          <span className={`application-value status-badge status-${application.status}`}>
                            {application.status}
                          </span>
                        </div>
                        {application.createdAt && (
                          <div className="application-date">
                            <span className="application-label">Applied:</span>
                            <span className="application-value">
                              {new Date(application.createdAt).toLocaleString('en-IN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                      {application.status === 'pending' && (
                        <div className="application-actions">
                          <button
                            className="application-button application-button-approve"
                            onClick={() => handleApprove(application._id || application.id || '')}
                            disabled={processingId === (application._id || application.id)}
                          >
                            {processingId === (application._id || application.id) ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            className="application-button application-button-reject"
                            onClick={() => handleReject(application._id || application.id || '')}
                            disabled={processingId === (application._id || application.id)}
                          >
                            {processingId === (application._id || application.id) ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              allHosts.length === 0 ? (
                <div className="host-applications-empty">
                  <p>No hosts found.</p>
                </div>
              ) : (
                <div className="host-applications-list">
                  {allHosts.map((host) => (
                    <div 
                      key={host.hostId} 
                      className={`host-card ${host.hasTimeConflict ? 'host-card-conflict' : ''}`}
                    >
                      <div className="host-info">
                        <div className="host-user">
                          <span className="host-label">Host:</span>
                          <span className="host-value">
                            {host.name || host.email || host.hostId || 'N/A'}
                          </span>
                        </div>
                        {host.email && (
                          <div className="host-email">
                            <span className="host-label">Email:</span>
                            <span className="host-value">{host.email}</span>
                          </div>
                        )}
                        <div className="host-assignments-count">
                          <span className="host-label">Total Lobbies:</span>
                          <span className="host-value">{host.totalLobbies}</span>
                        </div>
                        {host.hasTimeConflict && (
                          <div className="host-conflict-warning">
                            <span className="warning-icon">⚠️</span>
                            <span className="warning-text">
                              Time conflict detected! This host already has a lobby at {tournament.startTime} on {formatDate(tournament.date)}
                            </span>
                          </div>
                        )}
                        {host.assignedLobbies.length > 0 && (
                          <div className="host-previous-assignments">
                            <span className="host-label">Previous Assignments:</span>
                            <div className="assignments-list">
                              {host.assignedLobbies.map((assignment, idx) => {
                                const isConflict = checkTimeConflict(
                                  tournament.startTime,
                                  tournament.date,
                                  assignment.tournamentStartTime,
                                  assignment.tournamentDate
                                );
                                return (
                                  <div 
                                    key={idx} 
                                    className={`assignment-item ${isConflict ? 'assignment-conflict' : ''}`}
                                  >
                                    <span className="assignment-details">
                                      {assignment.tournamentGame || 'N/A'} - {assignment.tournamentMode || 'N/A'} ({assignment.tournamentSubMode || 'N/A'})
                                    </span>
                                    <span className="assignment-time">
                                      {formatDate(assignment.tournamentDate)} at {assignment.tournamentStartTime}
                                    </span>
                                    {isConflict && (
                                      <span className="assignment-conflict-badge">⚠️ Conflict</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="host-actions">
                        <button
                          className={`host-button host-button-assign ${host.hasTimeConflict ? 'host-button-warning' : ''}`}
                          onClick={() => handleAssignHost(host)}
                          disabled={processingId === host.hostId}
                        >
                          {processingId === host.hostId ? 'Assigning...' : 'Assign Host'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          <div className="host-applications-modal-footer">
            <button
              type="button"
              className="host-applications-button host-applications-button-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Conflict Confirmation Modal */}
      {showConflictModal && hostToAssign && (
        <ConfirmationModal
          isOpen={showConflictModal}
          title="Time Conflict Warning"
          message={
            <div>
              <p>
                <strong>Warning:</strong> This host already has a lobby assignment at the same time!
              </p>
              <p>
                <strong>Tournament Time:</strong> {tournament.startTime} on {formatDate(tournament.date)}
              </p>
              {hostToAssign.timeConflictDetails && hostToAssign.timeConflictDetails.length > 0 && (
                <div>
                  <p><strong>Conflicting Assignments:</strong></p>
                  <ul>
                    {hostToAssign.timeConflictDetails.map((conflict: HostAssignment, idx: number) => (
                      <li key={idx}>
                        {conflict.tournamentGame || 'N/A'} - {conflict.tournamentMode || 'N/A'} ({conflict.tournamentSubMode || 'N/A'}) 
                        at {conflict.tournamentStartTime} on {formatDate(conflict.tournamentDate)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p>Are you sure you want to assign this host despite the time conflict?</p>
            </div>
          }
          confirmText="Yes, Assign Anyway"
          cancelText="Cancel"
          onConfirm={assignHostDirectly}
          onCancel={() => {
            setShowConflictModal(false);
            setHostToAssign(null);
          }}
        />
      )}
    </>
  );
};

export default HostApplications;
