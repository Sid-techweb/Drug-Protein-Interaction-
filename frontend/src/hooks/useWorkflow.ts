import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../api/workflowApi';

export const useWorkflowRuns = () => {
  return useQuery({
    queryKey: ['workflow-runs'],
    queryFn: workflowApi.getRuns,
    staleTime: 1 * 60 * 1000,
  });
};

export const useWorkflowRunDetails = (runId?: string) => {
  return useQuery({
    queryKey: ['workflow-run', runId],
    queryFn: () => (runId ? workflowApi.getRunDetails(runId) : Promise.reject('No Run ID')),
    enabled: !!runId,
  });
};

export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, protein_id, target_query, max_compounds }: { name: string; protein_id: string; target_query?: string; max_compounds?: number }) =>
      workflowApi.executeWorkflow(name, protein_id, target_query, max_compounds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-runs'] });
      queryClient.invalidateQueries({ queryKey: ['user-datasets'] });
      queryClient.invalidateQueries({ queryKey: ['prediction-history'] });
      queryClient.invalidateQueries({ queryKey: ['quantum-jobs'] });
    },
  });
};
