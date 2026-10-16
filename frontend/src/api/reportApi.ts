import { apiClient } from './client';
import { ScientificReport } from '../types';

export const reportApi = {
  generateReport: async (title: string, protein_id: string, workflow_run_id?: string): Promise<ScientificReport> => {
    const response = await apiClient.post<ScientificReport>('/report/generate', {
      title,
      protein_id,
      workflow_run_id
    });
    return response.data;
  },

  getReports: async (): Promise<ScientificReport[]> => {
    const response = await apiClient.get<ScientificReport[]>('/report/list');
    return response.data;
  },

  getReportDetails: async (reportId: string): Promise<ScientificReport> => {
    const response = await apiClient.get<ScientificReport>(`/report/${reportId}`);
    return response.data;
  }
};
