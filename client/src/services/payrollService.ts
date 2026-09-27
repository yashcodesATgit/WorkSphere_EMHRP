import api from '../lib/axios';

export type PayrollStatus = 'PENDING' | 'PROCESSED' | 'PAID';

export interface PayrollEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

export interface PayrollRecord {
  _id: string;
  employee: PayrollEmployee;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  status: PayrollStatus;
  paidOn: string | null;
  remarks: string;
  createdAt: string;
}

export interface PayrollInput {
  employee: string;
  month: number;
  year: number;
  basicSalary?: number;
  allowances?: number;
  deductions?: number;
  workingDays?: number;
  presentDays?: number;
  leaveDays?: number;
  remarks?: string;
}

export interface PayrollListParams {
  employee?: string;
  month?: number | string;
  year?: number | string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PayrollListResponse {
  data: PayrollRecord[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const getPayrolls = async (params: PayrollListParams): Promise<PayrollListResponse> => {
  const res = await api.get('/payroll', { params });
  return { data: res.data.data, pagination: res.data.pagination };
};

export const getPayroll = async (id: string): Promise<PayrollRecord> => {
  const res = await api.get(`/payroll/${id}`);
  return res.data.data;
};

export const createPayroll = async (data: PayrollInput): Promise<PayrollRecord> => {
  const res = await api.post('/payroll', data);
  return res.data.data;
};

export const updatePayroll = async (id: string, data: Partial<PayrollInput>): Promise<PayrollRecord> => {
  const res = await api.patch(`/payroll/${id}`, data);
  return res.data.data;
};

export const deletePayroll = async (id: string): Promise<void> => {
  await api.delete(`/payroll/${id}`);
};

export const updatePayrollStatus = async (id: string, status: PayrollStatus): Promise<PayrollRecord> => {
  const res = await api.patch(`/payroll/${id}/status`, { status });
  return res.data.data;
};
