import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proteinApi } from '../api/proteinApi';

export const useUserProteins = () => {
  return useQuery({
    queryKey: ['user-proteins'],
    queryFn: proteinApi.getUserProteins,
    staleTime: 2 * 60 * 1000,
  });
};

export const useProteinDetails = (proteinId?: string) => {
  return useQuery({
    queryKey: ['protein-details', proteinId],
    queryFn: () => (proteinId ? proteinApi.getProteinById(proteinId) : Promise.reject('No ID')),
    enabled: !!proteinId,
  });
};

export const usePasteProtein = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, sequence, organism }: { name: string; sequence: string; organism?: string }) =>
      proteinApi.pasteSequence(name, sequence, organism),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-proteins'] });
    },
  });
};

export const useUploadFASTA = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => proteinApi.uploadFASTA(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-proteins'] });
    },
  });
};

export const useSearchUniProt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (query: string) => proteinApi.searchUniProt(query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-proteins'] });
    },
  });
};
