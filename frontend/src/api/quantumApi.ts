import { apiClient } from './client';
import { QuantumJob, RankComparisonData, QUBOWeights } from '../types';

export const quantumApi = {
  optimizeCandidates: async (protein_id: string, weights?: QUBOWeights, prediction_ids?: string[]): Promise<QuantumJob> => {
    const response = await apiClient.post<QuantumJob>('/quantum/optimize', {
      protein_id,
      prediction_ids,
      weights
    });
    return response.data;
  },

  getJobs: async (): Promise<QuantumJob[]> => {
    const response = await apiClient.get<QuantumJob[]>('/quantum/jobs');
    return response.data;
  },

  getJobDetails: async (jobId: string): Promise<QuantumJob> => {
    const response = await apiClient.get<QuantumJob>(`/quantum/jobs/${jobId}`);
    return response.data;
  },

  getComparison: async (jobId: string): Promise<RankComparisonData> => {
    const response = await apiClient.get<RankComparisonData>(`/quantum/jobs/${jobId}/comparison`);
    return response.data;
  }
};
