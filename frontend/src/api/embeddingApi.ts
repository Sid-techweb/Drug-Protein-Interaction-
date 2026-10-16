import { apiClient } from './client';
import { EmbeddingJob } from '../types';

export const embeddingApi = {
  queueJob: async (proteinId: string): Promise<EmbeddingJob> => {
    const response = await apiClient.post<EmbeddingJob>(`/embedding/queue/${proteinId}`);
    return response.data;
  },

  getStatus: async (jobId: string): Promise<EmbeddingJob> => {
    const response = await apiClient.get<EmbeddingJob>(`/embedding/status/${jobId}`);
    return response.data;
  }
};
