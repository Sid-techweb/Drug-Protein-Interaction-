import { useQuery } from '@tanstack/react-query';
import { platformApi } from '../api/platformApi';

export const useTechStack = () => {
  return useQuery({
    queryKey: ['tech-stack-items'],
    queryFn: platformApi.getTechStackItems,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
};
