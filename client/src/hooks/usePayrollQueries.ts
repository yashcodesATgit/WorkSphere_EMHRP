import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPayrolls, getPayroll, createPayroll, updatePayroll,
  deletePayroll, updatePayrollStatus,
  PayrollListParams, PayrollInput, PayrollStatus,
} from '../services/payrollService';

export const usePayrolls = (params: PayrollListParams) =>
  useQuery({
    queryKey: ['payroll', params],
    queryFn: () => getPayrolls(params),
    placeholderData: (prev) => prev,
  });

export const usePayroll = (id: string) =>
  useQuery({
    queryKey: ['payroll', id],
    queryFn: () => getPayroll(id),
    enabled: !!id,
  });

/** Invalidates payroll + all dashboard payroll widgets */
const invalidatePayroll = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['payroll'] });
  qc.invalidateQueries({ queryKey: ['dash-payroll'] });    // Admin: pending payroll count
  qc.invalidateQueries({ queryKey: ['emp-dash-payroll'] }); // Employee: latest payroll card
};

export const useCreatePayroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PayrollInput) => createPayroll(data),
    onSuccess: () => invalidatePayroll(qc),
  });
};

export const useUpdatePayroll = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PayrollInput>) => updatePayroll(id, data),
    onSuccess: () => invalidatePayroll(qc),
  });
};

export const useDeletePayroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePayroll(id),
    onSuccess: () => invalidatePayroll(qc),
  });
};

export const useUpdatePayrollStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PayrollStatus }) => updatePayrollStatus(id, status),
    onSuccess: () => invalidatePayroll(qc),
  });
};
