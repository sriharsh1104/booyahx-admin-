import apiClient from './client';

export interface AdminUser {
  _id?: string;
  userId?: string;
  email: string;
  name?: string;
  role?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  authProvider?: string;
  isBlocked?: boolean;
  roomIds?: string[];
  balanceGC?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersListResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    users: AdminUser[];
    pagination: PaginationInfo;
  };
}

export interface BlockUnblockRequest {
  userIds: string[];
}

export interface BlockUnblockResponse {
  status: number;
  success: boolean;
  message: string;
  data?: {
    blocked?: string[];
    unblocked?: string[];
  };
}

export interface TopUpRequest {
  userId: string;
  amountGC: number;
  description?: string;
}

export interface TopUpResponse {
  status: number;
  success: boolean;
  message: string;
  data?: {
    balanceGC: number;
  };
}

export interface BulkTopUpRequest {
  userIds: string[];
  amountGC: number;
  description?: string;
}

export interface BulkTopUpResponse {
  status: number;
  success: boolean;
  message: string;
  data?: {
    successCount?: number;
    failedCount?: number;
    results?: Array<{
      userId: string;
      success: boolean;
      balanceGC?: number;
      error?: string;
    }>;
  };
}

export const usersApi = {
  /**
   * Get admin users with optional role filter and search query
   * @param role - Filter by role (e.g., 'admin')
   * @param query - Search query for name or email
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   */
  getUsers: async (role?: string, query?: string, page?: number, limit?: number): Promise<{ users: AdminUser[]; pagination?: PaginationInfo }> => {
    try {
      const params: Record<string, string> = {};
      if (role) {
        params.role = role;
      }
      if (query && query.trim()) {
        params.query = query.trim();
      }
      if (page) {
        params.page = page.toString();
      }
      if (limit) {
        params.limit = limit.toString();
      }
      const response = await apiClient.get<UsersListResponse>('/api/admin/users', { params });
      
      // Expected format: { status, success, message, data: { users: [...], pagination: {...} } }
      if (response.data?.data?.users && Array.isArray(response.data.data.users)) {
        // Map _id to userId for consistency
        const mappedUsers = response.data.data.users.map(user => ({
          ...user,
          userId: user._id || user.userId,
        }));
        
        return {
          users: mappedUsers,
          pagination: response.data.data.pagination,
        };
      }
      
      // If format is wrong, throw error
      throw new Error('Invalid API response format. Expected: { data: { users: [...], pagination: {...} } }');
    } catch (error: any) {
      // If it's our custom error, throw it
      if (error.message && error.message.includes('Invalid API response format')) {
        throw error;
      }
      
      // Otherwise, rethrow the original error
      throw error;
    }
  },

  /**
   * Block multiple users (Admin only)
   * @param userIds - Array of user IDs to block
   */
  blockUsers: async (userIds: string[]): Promise<BlockUnblockResponse> => {
    const response = await apiClient.post<BlockUnblockResponse>('/api/admin/users/block', {
      userIds,
    });
    return response.data;
  },

  /**
   * Unblock multiple users (Admin only)
   * @param userIds - Array of user IDs to unblock
   */
  unblockUsers: async (userIds: string[]): Promise<BlockUnblockResponse> => {
    const response = await apiClient.post<BlockUnblockResponse>('/api/admin/users/unblock', {
      userIds,
    });
    return response.data;
  },

  /**
   * Top up user balance (Admin only)
   * @param userId - User ID to top up
   * @param amountGC - Amount to add to balance
   * @param description - Optional description for the top-up
   */
  topUpBalance: async (userId: string, amountGC: number, description?: string): Promise<TopUpResponse> => {
    const response = await apiClient.post<TopUpResponse>('/api/wallet/add-balance', {
      userId,
      amountGC,
      description: description || 'Top-up via Admin Panel',
    });
    return response.data;
  },

  /**
   * Bulk top up user balance (Admin only)
   * @param userIds - Array of user IDs to top up
   * @param amountGC - Amount to add to balance for each user
   * @param description - Optional description for the top-up
   */
  topUpBalanceBulk: async (userIds: string[], amountGC: number, description?: string): Promise<BulkTopUpResponse> => {
    const response = await apiClient.post<BulkTopUpResponse>('/api/wallet/add-balance-bulk', {
      userIds,
      amountGC,
      description: description || 'Bulk top-up via Admin Panel',
    });
    return response.data;
  },
};

