import { apiClient } from './client';
import { DTIPrediction } from '../types';

export const predictionApi = {
  predictSingle: async (protein_id: string, drug_id: string): Promise<DTIPrediction> => {
    const response = await apiClient.post<DTIPrediction>('/prediction/dti', { protein_id, drug_id });
    return response.data;
  },

  predictBatch: async (protein_id: string, drug_ids: string[]): Promise<DTIPrediction[]> => {
    const response = await apiClient.post<DTIPrediction[]>('/prediction/batch', { protein_id, drug_ids });
    return response.data;
  },

  getPredictionHistory: async (protein_id?: string): Promise<DTIPrediction[]> => {
    const url = protein_id ? `/prediction/history?protein_id=${protein_id}` : '/prediction/history';
    const response = await apiClient.get<DTIPrediction[]>(url);
    return response.data;
  }
};
