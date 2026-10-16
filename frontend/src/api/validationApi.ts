import { apiClient } from './client';

export interface ScientistValidationPayload {
  protein_id: string;
  drug_id: string;
  decision: 'APPROVED' | 'REJECTED' | 'NEEDS_FURTHER_VALIDATION';
  experimental_notes: string;
  experimental_method: 'IN_VITRO' | 'IN_VIVO' | 'LITERATURE' | 'CLINICAL' | 'OTHER';
  confidence: number;
  scientist_name: string;
  institution?: string;
}

export interface ScientistValidationRecord {
  id: string;
  protein_id: string;
  drug_id: string;
  decision: 'APPROVED' | 'REJECTED' | 'NEEDS_FURTHER_VALIDATION';
  experimental_notes: string;
  experimental_method: 'IN_VITRO' | 'IN_VIVO' | 'LITERATURE' | 'CLINICAL' | 'OTHER';
  confidence: number;
  scientist_name: string;
  institution?: string;
  validated_at: string;
  created_at: string;
}

export const validationApi = {
  submitValidation: async (payload: ScientistValidationPayload): Promise<ScientistValidationRecord> => {
    const res = await apiClient.post<ScientistValidationRecord>('/validation', payload);
    return res.data;
  },

  getProteinValidations: async (proteinId: string): Promise<ScientistValidationRecord[]> => {
    const res = await apiClient.get<ScientistValidationRecord[]>(`/validation/protein/${proteinId}`);
    return res.data;
  },

  getPairValidation: async (proteinId: string, drugId: string): Promise<ScientistValidationRecord | null> => {
    try {
      const res = await apiClient.get<ScientistValidationRecord>(`/validation/${proteinId}/${drugId}`);
      return res.data;
    } catch {
      return null;
    }
  },
};
