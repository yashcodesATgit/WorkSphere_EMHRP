import api from '../lib/axios';

export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'UNPAID' | 'OTHER';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

export interface LeaveRecord {
  _id: string;
  employee: LeaveEmployee;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: { _id: string; name: string } | null;
  reviewedAt?: string | null;
  remarks: string;
  createdAt: string;
}

export interface LeaveListParams {
  employee?: string;
  status?: string;
  leaveType?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface LeaveListResponse {
  data: LeaveRecord[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface LeaveInput {
  employee?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export const getLeaves = async (params: LeaveListParams): Promise<LeaveListResponse> => {
  const res = await api.get('/leaves', { params });
  return { data: res.data.data, pagination: res.data.pagination };
};

export const getLeave = async (id: string): Promise<LeaveRecord> => {
  const res = await api.get(`/leaves/${id}`);
  return res.data.data;
};

export const applyLeave = async (data: LeaveInput): Promise<LeaveRecord> => {
  const res = await api.post('/leaves', data);
  return res.data.data;
};

export const updateLeave = async (id: string, data: Partial<LeaveInput>): Promise<LeaveRecord> => {
  const res = await api.patch(`/leaves/${id}`, data);
  return res.data.data;
};

export const cancelLeave = async (id: string): Promise<LeaveRecord> => {
  const res = await api.delete(`/leaves/${id}`);
  return res.data.data;
};

export const updateLeaveStatus = async (
  id: string,
  status: 'APPROVED' | 'REJECTED',
  remarks?: string
): Promise<LeaveRecord> => {
  const res = await api.patch(`/leaves/${id}/status`, { status, remarks });
  return res.data.data;
};
