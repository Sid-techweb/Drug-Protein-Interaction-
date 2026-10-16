import { apiClient } from './client';
import { WorkflowRun } from '../types';

export const workflowApi = {
  executeWorkflow: async (name: string, protein_id: string, target_query?: string, max_compounds?: number): Promise<WorkflowRun> => {
    const response = await apiClient.post<WorkflowRun>('/workflow/execute', {
      name,
      protein_id,
      target_query: target_query || 'P00533',
      max_compounds: max_compounds || 30
    });
    return response.data;
  },

  getRuns: async (): Promise<WorkflowRun[]> => {
    const response = await apiClient.get<WorkflowRun[]>('/workflow/runs');
    return response.data;
  },

  getRunDetails: async (runId: string): Promise<WorkflowRun> => {
    const response = await apiClient.get<WorkflowRun>(`/workflow/runs/${runId}`);
    return response.data;
  }
};
