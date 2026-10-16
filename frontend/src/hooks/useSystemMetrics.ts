import { useQuery } from '@tanstack/react-query';
import { platformApi } from '../api/platformApi';

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: platformApi.getSystemMetrics,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
