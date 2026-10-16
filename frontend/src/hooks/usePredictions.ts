import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { predictionApi } from '../api/predictionApi';

export const usePredictionHistory = (protein_id?: string) => {
  return useQuery({
    queryKey: ['prediction-history', protein_id],
    queryFn: () => predictionApi.getPredictionHistory(protein_id),
    staleTime: 2 * 60 * 1000,
  });
};

export const usePredictSingle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ protein_id, drug_id }: { protein_id: string; drug_id: string }) =>
      predictionApi.predictSingle(protein_id, drug_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prediction-history'] });
    },
  });
};

export const usePredictBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ protein_id, drug_ids }: { protein_id: string; drug_ids: string[] }) =>
      predictionApi.predictBatch(protein_id, drug_ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prediction-history'] });
    },
  });
};
