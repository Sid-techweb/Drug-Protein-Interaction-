import { apiClient } from './client';
import { CandidateQueue } from '../types';

export const candidateApi = {
  addToQueue: async (drug_ids: string[], protein_id?: string): Promise<CandidateQueue[]> => {
    const response = await apiClient.post<CandidateQueue[]>('/candidate/queue', { drug_ids, protein_id });
    return response.data;
  },

  getQueue: async (): Promise<CandidateQueue[]> => {
    const response = await apiClient.get<CandidateQueue[]>('/candidate');
    return response.data;
  },

  removeFromQueue: async (candidateId: string): Promise<void> => {
    await apiClient.delete(`/candidate/${candidateId}`);
  }
};
