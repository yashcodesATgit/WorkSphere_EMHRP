import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  EmployeeListParams,
  EmployeeInput,
} from '../services/employeeService';

export const useEmployees = (params: EmployeeListParams, enabled = true) =>
  useQuery({
    queryKey: ['employees', params],
    queryFn: () => getEmployees(params),
    placeholderData: (prev) => prev,
    enabled,
  });

export const useEmployee = (id: string) =>
  useQuery({
    queryKey: ['employees', id],
    queryFn: () => getEmployee(id),
    enabled: !!id,
  });

export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeInput) => createEmployee(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['departments'] }); // dept headcount changes
      qc.invalidateQueries({ queryKey: ['dash-emp'] });    // Admin dashboard total count
      qc.invalidateQueries({ queryKey: ['dash-dept'] });
    },
  });
};

export const useUpdateEmployee = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmployeeInput>) => updateEmployee(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      // Downstream modules embed employee name — refresh them too
      qc.invalidateQueries({ queryKey: ['attendance'] });
      qc.invalidateQueries({ queryKey: ['leaves'] });
      qc.invalidateQueries({ queryKey: ['payroll'] });
      qc.invalidateQueries({ queryKey: ['performance'] });
    },
  });
};

export const useToggleEmployeeStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleEmployeeStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['departments'] }); // active count changes
      qc.invalidateQueries({ queryKey: ['dash-emp'] });    // Admin dashboard total count
      qc.invalidateQueries({ queryKey: ['dash-dept'] });
    },
  });
};
