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

<<<<<<< HEAD
=======
export interface DailyRecord {
  date: string;
  lobbies: number;
  tournaments?: Array<{
    tournamentId: string;
    date: string;
    startTime: string;
    game?: string;
    mode?: string;
    subMode?: string;
  }>;
}

export interface HostStatistics {
  hostId: string;
  name: string;
  email: string;
  totalLobbies: number;
  timeSlotSummary: Record<string, number>;
  dailyRecords: DailyRecord[];
}

export interface HostStatisticsResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    totalHosts: number;
    totalLobbies: number;
    filters: {
      date?: string;
      fromDate?: string;
      toDate?: string;
      hostId?: string;
    };
    hosts: HostStatistics[];
  };
}

export interface GetHostStatisticsParams {
  date?: string; // YYYY-MM-DD
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  hostId?: string;
}

export interface CreateHostRequest {
  email: string;
  name: string;
  password: string;
}

export interface CreateHostResponse {
  status: number;
  success: boolean;
  message: string;
  data?: {
    hostId?: string;
    email?: string;
    name?: string;
  };
}

export interface Host {
  _id?: string;
  hostId?: string;
  email: string;
  name: string;
  role?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  totalLobbies?: number;
}

export interface HostsListAllResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    hosts: Host[];
    total?: number;
  };
}

>>>>>>> e7c86d30f5ac6a092082c16d393c32a1b4ba4b64
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
<<<<<<< HEAD
=======

  /**
   * Get host statistics and daily records (Admin only)
   * @param params - Query parameters for filtering statistics
   */
  getHostStatistics: async (params?: GetHostStatisticsParams): Promise<HostStatisticsResponse['data']> => {
    const queryParams: Record<string, string> = {};
    
    if (params?.date) {
      queryParams.date = params.date;
    }
    if (params?.fromDate) {
      queryParams.fromDate = params.fromDate;
    }
    if (params?.toDate) {
      queryParams.toDate = params.toDate;
    }
    if (params?.hostId) {
      queryParams.hostId = params.hostId;
    }

    const response = await apiClient.get<HostStatisticsResponse>(
      '/api/admin/hosts/statistics',
      {
        params: queryParams,
      }
    );

    return response.data.data;
  },

  /**
   * Create a new host account (Admin only)
   * @param data - Host creation data (email, name, password)
   */
  createHost: async (data: CreateHostRequest): Promise<CreateHostResponse> => {
    const response = await apiClient.post<CreateHostResponse>(
      '/api/admin/hosts/create',
      data
    );
    return response.data;
  },

  /**
   * Get all hosts (Admin only)
   */
  getAllHosts: async (): Promise<Host[]> => {
    const response = await apiClient.get<HostsListAllResponse>(
      '/api/admin/hosts'
    );
    
    if (response.data?.data?.hosts && Array.isArray(response.data.data.hosts)) {
      return response.data.data.hosts.map(host => ({
        ...host,
        hostId: host._id || host.hostId,
      }));
    }
    
    return [];
  },
>>>>>>> e7c86d30f5ac6a092082c16d393c32a1b4ba4b64
};

