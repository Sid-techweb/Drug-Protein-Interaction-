import { apiClient } from './client';
import { Drug } from '../types';

export interface SearchDrugsParams {
  search?: string;
  dataset_id?: string;
  lipinski_only?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchDrugsResponse {
  items: Drug[];
  total: number;
  limit: number;
  offset: number;
}

export const drugApi = {
  searchDrugs: async (params: SearchDrugsParams): Promise<SearchDrugsResponse> => {
    const response = await apiClient.get<SearchDrugsResponse>('/drug', { params });
    return response.data;
  },

  getDrugDetails: async (drugId: string): Promise<Drug> => {
    const response = await apiClient.get<Drug>(`/drug/${drugId}`);
    return response.data;
  }
};
