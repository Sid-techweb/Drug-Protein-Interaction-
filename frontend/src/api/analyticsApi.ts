import { apiClient } from './client';
import { AnalyticsDashboardData } from '../types';

export const analyticsApi = {
  getDashboardData: async (): Promise<AnalyticsDashboardData> => {
    const response = await apiClient.get<AnalyticsDashboardData>('/analytics/dashboard');
    return response.data;
  }
};
