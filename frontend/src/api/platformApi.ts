import { apiClient } from './client';
import { SystemMetric, PlatformCapability, WorkflowStage, TechStackItem } from '../types';

export const platformApi = {
  getSystemMetrics: async (): Promise<SystemMetric[]> => {
    const response = await apiClient.get<SystemMetric[]>('/system/metrics');
    return response.data;
  },

  getCapabilities: async (): Promise<PlatformCapability[]> => {
    const response = await apiClient.get<PlatformCapability[]>('/platform/capabilities');
    return response.data;
  },

  getWorkflowStages: async (): Promise<WorkflowStage[]> => {
    const response = await apiClient.get<WorkflowStage[]>('/platform/workflow');
    return response.data;
  },

  getTechStackItems: async (): Promise<TechStackItem[]> => {
    const response = await apiClient.get<TechStackItem[]>('/platform/tech-stack');
    return response.data;
  }
};
