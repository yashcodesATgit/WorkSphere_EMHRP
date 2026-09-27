import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAttendance, getAttendanceById, createAttendance,
  updateAttendance, deleteAttendance, checkIn, checkOut,
  AttendanceListParams, AttendanceInput,
} from '../services/attendanceService';

export const useAttendance = (params: AttendanceListParams) =>
  useQuery({
    queryKey: ['attendance', params],
    queryFn: () => getAttendance(params),
    placeholderData: (prev) => prev,
  });

export const useAttendanceRecord = (id: string) =>
  useQuery({
    queryKey: ['attendance', id],
    queryFn: () => getAttendanceById(id),
    enabled: !!id,
  });

/** Invalidates all attendance-related caches including Dashboard-specific keys */
const invalidateAll = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['attendance'] });
  qc.invalidateQueries({ queryKey: ['dash-present'] });  // Admin dashboard today count
  qc.invalidateQueries({ queryKey: ['emp-dash-att'] });   // Employee dashboard today status
};

export const useCreateAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AttendanceInput) => createAttendance(data),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useUpdateAttendance = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AttendanceInput>) => updateAttendance(id, data),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useDeleteAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttendance(id),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useCheckIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: checkIn,
    onSuccess: () => invalidateAll(qc),
  });
};

export const useCheckOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: checkOut,
    onSuccess: () => invalidateAll(qc),
  });
};
