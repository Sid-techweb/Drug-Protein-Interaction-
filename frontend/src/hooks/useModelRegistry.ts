import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelRegistryApi } from '../api/modelRegistryApi';

export const useActiveModel = () => {
  return useQuery({
    queryKey: ['active-model'],
    queryFn: modelRegistryApi.getActiveModel,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllModels = () => {
  return useQuery({
    queryKey: ['all-models'],
    queryFn: modelRegistryApi.getAllModels,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTrainNewModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ epochs, batch_size, learning_rate }: { epochs?: number; batch_size?: number; learning_rate?: number }) =>
      modelRegistryApi.trainNewModel(epochs, batch_size, learning_rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-model'] });
      queryClient.invalidateQueries({ queryKey: ['all-models'] });
    },
  });
};
