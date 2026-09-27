import api from '../lib/axios';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';

export interface AttendanceEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

export interface AttendanceRecord {
  _id: string;
  employee: AttendanceEmployee;
  date: string;
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  workingHours: number;
  remarks: string;
  createdAt: string;
}

export interface AttendanceListParams {
  employee?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface AttendanceListResponse {
  data: AttendanceRecord[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface AttendanceInput {
  employee: string;
  date: string;
  status?: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
}

export const getAttendance = async (params: AttendanceListParams): Promise<AttendanceListResponse> => {
  const res = await api.get('/attendance', { params });
  return { data: res.data.data, pagination: res.data.pagination };
};

export const getAttendanceById = async (id: string): Promise<AttendanceRecord> => {
  const res = await api.get(`/attendance/${id}`);
  return res.data.data;
};

export const createAttendance = async (data: AttendanceInput): Promise<AttendanceRecord> => {
  const res = await api.post('/attendance', data);
  return res.data.data;
};

export const updateAttendance = async (id: string, data: Partial<AttendanceInput>): Promise<AttendanceRecord> => {
  const res = await api.patch(`/attendance/${id}`, data);
  return res.data.data;
};

export const deleteAttendance = async (id: string): Promise<void> => {
  await api.delete(`/attendance/${id}`);
};

export const checkIn = async (): Promise<AttendanceRecord> => {
  const res = await api.post('/attendance/check-in');
  return res.data.data;
};

export const checkOut = async (): Promise<AttendanceRecord> => {
  const res = await api.post('/attendance/check-out');
  return res.data.data;
};
