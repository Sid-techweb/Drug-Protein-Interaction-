import { apiClient } from './client';
import { DrugDataset, DatasetAnalytics } from '../types';

export const datasetApi = {
  getUserDatasets: async (): Promise<DrugDataset[]> => {
    const response = await apiClient.get<DrugDataset[]>('/dataset');
    return response.data;
  },

  importChEMBL: async (name: string, query: string, max_compounds?: number): Promise<DrugDataset> => {
    const response = await apiClient.post<DrugDataset>('/dataset/chembl-import', {
      name,
      query,
      max_compounds: max_compounds || 50
    });
    return response.data;
  },

  uploadFile: async (file: File): Promise<DrugDataset> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<DrugDataset>('/dataset/upload-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getAnalytics: async (): Promise<DatasetAnalytics> => {
    const response = await apiClient.get<DatasetAnalytics>('/dataset/analytics');
    return response.data;
  }
};
