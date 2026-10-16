import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { validationApi, ScientistValidationPayload } from '../api/validationApi';

export const useProteinValidations = (proteinId?: string) => {
  return useQuery({
    queryKey: ['protein-validations', proteinId],
    queryFn: () => (proteinId ? validationApi.getProteinValidations(proteinId) : Promise.resolve([])),
    enabled: !!proteinId,
    staleTime: 1 * 60 * 1000,
  });
};

export const useSubmitValidation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ScientistValidationPayload) => validationApi.submitValidation(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['protein-validations', variables.protein_id] });
      queryClient.invalidateQueries({ queryKey: ['prediction-history'] });
    },
  });
};
