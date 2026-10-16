import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetApi } from '../api/datasetApi';

export const useDatasets = () => {
  return useQuery({
    queryKey: ['user-datasets'],
    queryFn: datasetApi.getUserDatasets,
    staleTime: 2 * 60 * 1000,
  });
};

export const useDatasetAnalytics = () => {
  return useQuery({
    queryKey: ['dataset-analytics'],
    queryFn: datasetApi.getAnalytics,
    staleTime: 2 * 60 * 1000,
  });
};

export const useImportChEMBL = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, query, max_compounds }: { name: string; query: string; max_compounds?: number }) =>
      datasetApi.importChEMBL(name, query, max_compounds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
    },
  });
};

export const useUploadDatasetFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => datasetApi.uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
    },
  });
};
