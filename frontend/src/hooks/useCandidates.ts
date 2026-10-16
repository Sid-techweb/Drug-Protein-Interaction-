import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateApi } from '../api/candidateApi';

export const useCandidateQueue = () => {
  return useQuery({
    queryKey: ['candidate-queue'],
    queryFn: candidateApi.getQueue,
    staleTime: 1 * 60 * 1000,
  });
};

export const useAddToCandidateQueue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ drug_ids, protein_id }: { drug_ids: string[]; protein_id?: string }) =>
      candidateApi.addToQueue(drug_ids, protein_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-queue'] });
    },
  });
};

export const useRemoveFromCandidateQueue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (candidateId: string) => candidateApi.removeFromQueue(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-queue'] });
    },
  });
};

export const useClearCandidateQueue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const queue = await candidateApi.getQueue();
      if (queue && queue.length > 0) {
        await Promise.all(queue.map((item) => candidateApi.removeFromQueue(item.id)));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-queue'] });
    },
  });
};
