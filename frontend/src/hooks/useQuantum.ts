import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quantumApi } from '../api/quantumApi';
import { QUBOWeights } from '../types';

export const useQuantumJobs = () => {
  return useQuery({
    queryKey: ['quantum-jobs'],
    queryFn: quantumApi.getJobs,
    staleTime: 2 * 60 * 1000,
  });
};

export const useQuantumJobDetails = (jobId?: string) => {
  return useQuery({
    queryKey: ['quantum-job', jobId],
    queryFn: () => (jobId ? quantumApi.getJobDetails(jobId) : Promise.reject('No Job ID')),
    enabled: !!jobId,
  });
};

export const useQuantumComparison = (jobId?: string) => {
  return useQuery({
    queryKey: ['quantum-comparison', jobId],
    queryFn: () => (jobId ? quantumApi.getComparison(jobId) : Promise.reject('No Job ID')),
    enabled: !!jobId,
  });
};

export const useOptimizeCandidates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ protein_id, weights, prediction_ids }: { protein_id: string; weights?: QUBOWeights; prediction_ids?: string[] }) =>
      quantumApi.optimizeCandidates(protein_id, weights, prediction_ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantum-jobs'] });
    },
  });
};
