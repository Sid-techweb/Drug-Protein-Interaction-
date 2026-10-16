import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { embeddingApi } from '../api/embeddingApi';

export const useEmbeddingStatus = (jobId?: string) => {
  return useQuery({
    queryKey: ['embedding-status', jobId],
    queryFn: () => (jobId ? embeddingApi.getStatus(jobId) : Promise.reject('No Job ID')),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'COMPLETED' || status === 'FAILED') return false;
      return 2000; // Poll every 2 seconds while PENDING/PROCESSING
    },
  });
};

export const useQueueEmbedding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proteinId: string) => embeddingApi.queueJob(proteinId),
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: ['embedding-status', job.id] });
    },
  });
};
