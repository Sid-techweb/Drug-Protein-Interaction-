import { apiClient } from './client';
import { Protein } from '../types';

export const proteinApi = {
  pasteSequence: async (name: string, sequence: string, organism?: string): Promise<Protein> => {
    const response = await apiClient.post<Protein>('/protein/paste', {
      name,
      sequence,
      organism: organism || 'Homo sapiens'
    });
    return response.data;
  },

  uploadFASTA: async (file: File): Promise<Protein> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<Protein>('/protein/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  searchUniProt: async (query: string): Promise<Protein> => {
    const cleanQuery = (query || '').trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      throw new Error('Please enter a valid UniProt Accession ID (e.g., P00533) or Gene Symbol (e.g., EGFR).');
    }

    try {
      const response = await apiClient.post<Protein>('/protein/uniprot-search', { query: cleanQuery });
      return response.data;
    } catch (err: any) {
      const errorMsg =
        typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : err.response?.data?.message ||
            err.message ||
            'UniProt search failed. Please verify the UniProt Accession or Gene Symbol.';
      console.warn(`[UniProt API] Search query '${cleanQuery}' notice: ${errorMsg}`);
      throw new Error(errorMsg);
    }
  },

  getProteinById: async (proteinId: string): Promise<Protein> => {
    const response = await apiClient.get<Protein>(`/protein/${proteinId}`);
    return response.data;
  },

  getUserProteins: async (): Promise<Protein[]> => {
    const response = await apiClient.get<Protein[]>('/protein');
    return response.data;
  }
};
