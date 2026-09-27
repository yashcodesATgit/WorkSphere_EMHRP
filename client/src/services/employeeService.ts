import api from '../lib/axios';

export interface Department {
  _id: string;
  name: string;
}

export interface Employee {
  _id: string;
  employeeId: string;
  user?: string | null;       // linked User account id (null if no login created yet)
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  department: Department | null;
  designation: string;
  joiningDate: string;
  employmentStatus: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  salary: number;
  isActive: boolean;
  createdAt: string;
}

export interface EmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentStatus?: string;
  salary?: number;
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: 'active' | 'inactive' | '';
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface EmployeeListResponse {
  employees: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const getEmployees = async (params: EmployeeListParams): Promise<EmployeeListResponse> => {
  const res = await api.get('/employees', { params });
  return { employees: res.data.employees, pagination: res.data.pagination };
};

export const getEmployee = async (id: string): Promise<Employee> => {
  const res = await api.get(`/employees/${id}`);
  return res.data.employee;
};

export const createEmployee = async (data: EmployeeInput): Promise<Employee> => {
  const res = await api.post('/employees', data);
  return res.data.employee;
};

export const updateEmployee = async (id: string, data: Partial<EmployeeInput>): Promise<Employee> => {
  const res = await api.patch(`/employees/${id}`, data);
  return res.data.employee;
};

export const toggleEmployeeStatus = async (id: string): Promise<Employee> => {
  const res = await api.patch(`/employees/${id}/status`);
  return res.data.employee;
};
