import { apiClient } from './client';
import { ExplainabilityData } from '../types';

export const explainabilityApi = {
  getHeatmap: async (predictionId: string): Promise<ExplainabilityData> => {
    const response = await apiClient.get<ExplainabilityData>(`/explainability/heatmap/${predictionId}`);
    return response.data;
  }
};
