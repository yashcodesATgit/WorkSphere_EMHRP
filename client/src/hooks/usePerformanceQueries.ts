import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPerformanceReviews, getPerformanceReview, createPerformanceReview,
  updatePerformanceReview, deletePerformanceReview, completePerformanceReview,
  PerformanceListParams, PerformanceInput,
} from '../services/performanceService';

export const usePerformanceReviews = (params: PerformanceListParams) =>
  useQuery({
    queryKey: ['performance', params],
    queryFn: () => getPerformanceReviews(params),
    placeholderData: (prev) => prev,
  });

export const usePerformanceReview = (id: string) =>
  useQuery({
    queryKey: ['performance', id],
    queryFn: () => getPerformanceReview(id),
    enabled: !!id,
  });

/** Invalidates performance + all dashboard performance widgets */
const invalidatePerformance = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['performance'] });
  qc.invalidateQueries({ queryKey: ['dash-perf'] });      // Admin: completed reviews count
  qc.invalidateQueries({ queryKey: ['emp-dash-perf'] });  // Employee: latest review card
};

export const useCreatePerformanceReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PerformanceInput) => createPerformanceReview(data),
    onSuccess: () => invalidatePerformance(qc),
  });
};

export const useUpdatePerformanceReview = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PerformanceInput>) => updatePerformanceReview(id, data),
    onSuccess: () => invalidatePerformance(qc),
  });
};

export const useDeletePerformanceReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePerformanceReview(id),
    onSuccess: () => invalidatePerformance(qc),
  });
};

export const useCompletePerformanceReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completePerformanceReview(id),
    onSuccess: () => invalidatePerformance(qc),
  });
};
