import { useQuery } from '@tanstack/react-query';
import { platformApi } from '../api/platformApi';

export const useWorkflowStages = () => {
  return useQuery({
    queryKey: ['workflow-stages'],
    queryFn: platformApi.getWorkflowStages,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
};
