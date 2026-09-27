import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLeaves, getLeave, applyLeave, updateLeave,
  cancelLeave, updateLeaveStatus,
  LeaveListParams, LeaveInput,
} from '../services/leaveService';

export const useLeaves = (params: LeaveListParams) =>
  useQuery({
    queryKey: ['leaves', params],
    queryFn: () => getLeaves(params),
    placeholderData: (prev) => prev,
  });

export const useLeave = (id: string) =>
  useQuery({
    queryKey: ['leaves', id],
    queryFn: () => getLeave(id),
    enabled: !!id,
  });

/** Invalidates leaves + all dashboard leave widgets */
const invalidateLeaves = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['leaves'] });
  qc.invalidateQueries({ queryKey: ['dash-leaves'] });        // Admin: pending leave count
  qc.invalidateQueries({ queryKey: ['dash-recent-leaves'] }); // Admin: recent leave list
  qc.invalidateQueries({ queryKey: ['emp-dash-leaves'] });    // Employee: total leaves
  qc.invalidateQueries({ queryKey: ['emp-dash-pending-leaves'] }); // Employee: pending count
};

export const useApplyLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LeaveInput) => applyLeave(data),
    onSuccess: () => invalidateLeaves(qc),
  });
};

export const useUpdateLeave = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<LeaveInput>) => updateLeave(id, data),
    onSuccess: () => invalidateLeaves(qc),
  });
};

export const useCancelLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelLeave(id),
    onSuccess: () => invalidateLeaves(qc),
  });
};

export const useUpdateLeaveStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: 'APPROVED' | 'REJECTED'; remarks?: string }) =>
      updateLeaveStatus(id, status, remarks),
    onSuccess: () => invalidateLeaves(qc),
  });
};
