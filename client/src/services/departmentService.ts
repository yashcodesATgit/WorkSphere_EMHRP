import api from '../lib/axios';

export interface Department {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  employeeCount?: number;
  createdAt: string;
}

export interface DepartmentInput {
  name: string;
  description?: string;
}

export const getDepartments = async (): Promise<Department[]> => {
  const res = await api.get('/departments');
  return res.data.departments;
};

export const getDepartment = async (id: string): Promise<Department> => {
  const res = await api.get(`/departments/${id}`);
  return res.data.department;
};

export const createDepartment = async (data: DepartmentInput): Promise<Department> => {
  const res = await api.post('/departments', data);
  return res.data.department;
};

export const updateDepartment = async (id: string, data: DepartmentInput): Promise<Department> => {
  const res = await api.patch(`/departments/${id}`, data);
  return res.data.department;
};

export const toggleDepartmentStatus = async (id: string): Promise<Department> => {
  const res = await api.patch(`/departments/${id}/status`);
  return res.data.department;
};
