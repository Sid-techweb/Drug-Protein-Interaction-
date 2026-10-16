import { apiClient } from './client';
import { ModelMetadata } from '../types';

export const modelRegistryApi = {
  getActiveModel: async (): Promise<ModelMetadata> => {
    const response = await apiClient.get<ModelMetadata>('/model-registry/active');
    return response.data;
  },

  getAllModels: async (): Promise<ModelMetadata[]> => {
    const response = await apiClient.get<ModelMetadata[]>('/model-registry/all');
    return response.data;
  },

  trainNewModel: async (epochs?: number, batch_size?: number, learning_rate?: number): Promise<ModelMetadata> => {
    const response = await apiClient.post<ModelMetadata>('/model-registry/train', {
      epochs: epochs || 5,
      batch_size: batch_size || 16,
      learning_rate: learning_rate || 0.001
    });
    return response.data;
  }
};
