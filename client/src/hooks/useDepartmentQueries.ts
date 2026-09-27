import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  toggleDepartmentStatus,
  DepartmentInput,
} from '../services/departmentService';

export const useDepartments = () =>
  useQuery({ queryKey: ['departments'], queryFn: getDepartments });

export const useDepartment = (id: string) =>
  useQuery({ queryKey: ['departments', id], queryFn: () => getDepartment(id), enabled: !!id });

export const useCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentInput) => createDepartment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      qc.invalidateQueries({ queryKey: ['employees'] }); // employees show dept name
      qc.invalidateQueries({ queryKey: ['dash-dept'] }); // Admin dashboard dept count
    },
  });
};

export const useUpdateDepartment = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentInput) => updateDepartment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      qc.invalidateQueries({ queryKey: ['employees'] }); // employees show dept name
      qc.invalidateQueries({ queryKey: ['dash-dept'] }); // Admin dashboard dept count
    },
  });
};

export const useToggleDepartmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleDepartmentStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      qc.invalidateQueries({ queryKey: ['employees'] }); // employees show dept name
      qc.invalidateQueries({ queryKey: ['dash-dept'] }); // Admin dashboard dept count
    },
  });
};
