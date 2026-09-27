import api from '../lib/axios';

export type PerformanceStatus = 'DRAFT' | 'COMPLETED';

export interface PerformanceEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

export interface PerformanceRecord {
  _id: string;
  employee: PerformanceEmployee;
  reviewer: { _id: string; name: string } | null;
  reviewPeriod: string;
  reviewDate: string;
  rating: number;
  goals: string;
  strengths: string;
  improvements: string;
  comments: string;
  status: PerformanceStatus;
  createdAt: string;
}

export interface PerformanceInput {
  employee: string;
  reviewPeriod: string;
  reviewDate: string;
  rating: number;
  goals?: string;
  strengths?: string;
  improvements?: string;
  comments?: string;
}

export interface PerformanceListParams {
  employee?: string;
  reviewPeriod?: string;
  status?: string;
  rating?: number | string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PerformanceListResponse {
  data: PerformanceRecord[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const getPerformanceReviews = async (params: PerformanceListParams): Promise<PerformanceListResponse> => {
  const res = await api.get('/performance', { params });
  return { data: res.data.data, pagination: res.data.pagination };
};

export const getPerformanceReview = async (id: string): Promise<PerformanceRecord> => {
  const res = await api.get(`/performance/${id}`);
  return res.data.data;
};

export const createPerformanceReview = async (data: PerformanceInput): Promise<PerformanceRecord> => {
  const res = await api.post('/performance', data);
  return res.data.data;
};

export const updatePerformanceReview = async (id: string, data: Partial<PerformanceInput>): Promise<PerformanceRecord> => {
  const res = await api.patch(`/performance/${id}`, data);
  return res.data.data;
};

export const deletePerformanceReview = async (id: string): Promise<void> => {
  await api.delete(`/performance/${id}`);
};

export const completePerformanceReview = async (id: string): Promise<PerformanceRecord> => {
  const res = await api.patch(`/performance/${id}/complete`);
  return res.data.data;
};
