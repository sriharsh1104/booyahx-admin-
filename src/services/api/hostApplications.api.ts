import apiClient from './client';

export interface HostApplication {
  _id: string;
  id?: string; // For backward compatibility
  tournamentId: string;
  userId: string;
  user?: {
    name?: string;
    email?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface HostApplicationsListResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    applications: HostApplication[];
    total?: number;
  };
}

export interface ApproveRejectResponse {
  status: number;
  success: boolean;
  message: string;
  data?: HostApplication;
}

export interface HostAssignment {
  tournamentId: string;
  tournamentDate: string;
  tournamentStartTime: string;
  tournamentGame?: string;
  tournamentMode?: string;
  tournamentSubMode?: string;
}

export interface HostWithAssignments {
  hostId: string;
  name?: string;
  email?: string;
  assignedLobbies: HostAssignment[];
  totalLobbies: number;
  hasTimeConflict?: boolean;
  timeConflictDetails?: HostAssignment[] | null;
}

export interface HostsListResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    tournament?: {
      tournamentId: string;
      date: string;
      startTime: string;
      game: string;
      mode: string;
      subMode: string;
    };
    hosts: HostWithAssignments[];
    total?: number;
  };
}

export interface AssignHostRequest {
  tournamentId: string;
  hostId: string;
}

export interface AssignHostResponse {
  status: number;
  success: boolean;
  message: string;
  data?: {
    tournament?: unknown;
    warnings?: string[];
    conflicts?: HostAssignment[];
  };
}

export const hostApplicationsApi = {
  /**
   * Get host applications for a tournament (Admin only)
   * @param tournamentId - Tournament ID to get applications for
   */
  getHostApplications: async (tournamentId: string): Promise<HostApplication[]> => {
    const response = await apiClient.get<HostApplicationsListResponse>(
      `/api/admin/host-applications`,
      {
        params: { tournamentId },
      }
    );
    
    if (response.data?.data?.applications && Array.isArray(response.data.data.applications)) {
      return response.data.data.applications.map((app) => ({
        ...app,
        id: app._id || app.id,
      }));
    }
    
    return [];
  },

  /**
   * Approve host application (Admin only)
   * @param applicationId - Application ID to approve
   */
  approveApplication: async (applicationId: string): Promise<ApproveRejectResponse> => {
    const response = await apiClient.post<ApproveRejectResponse>(
      `/api/admin/host-applications/${applicationId}/approve`
    );
    return response.data;
  },

  /**
   * Reject host application (Admin only)
   * @param applicationId - Application ID to reject
   */
  rejectApplication: async (applicationId: string): Promise<ApproveRejectResponse> => {
    const response = await apiClient.post<ApproveRejectResponse>(
      `/api/admin/host-applications/${applicationId}/reject`
    );
    return response.data;
  },

  /**
   * Get all hosts with their assignments for a tournament (Admin only)
   * @param tournamentId - Tournament ID to get hosts for
   */
  getAllHostsWithAssignments: async (tournamentId: string): Promise<HostWithAssignments[]> => {
    const response = await apiClient.get<HostsListResponse>(
      `/api/admin/tournaments/${tournamentId}/hosts`
    );
    
    if (response.data?.data?.hosts && Array.isArray(response.data.data.hosts)) {
      // Map the response to ensure consistent structure
      return response.data.data.hosts.map(host => ({
        ...host,
        assignedLobbies: Array.isArray(host.assignedLobbies) ? host.assignedLobbies : [],
        totalLobbies: host.totalLobbies || 0,
        hasTimeConflict: host.hasTimeConflict || false,
        timeConflictDetails: host.timeConflictDetails || null,
      }));
    }
    
    return [];
  },

  /**
   * Assign host to tournament directly (Admin only)
   * @param data - Assignment data (tournamentId and hostId)
   */
  assignHost: async (data: AssignHostRequest): Promise<AssignHostResponse> => {
    const response = await apiClient.post<AssignHostResponse>(
      `/api/admin/assign-host`,
      data
    );
    return response.data;
  },
};

