import { useQuery } from '@tanstack/react-query';
import { platformApi } from '../api/platformApi';

export const usePlatformCapabilities = () => {
  return useQuery({
    queryKey: ['platform-capabilities'],
    queryFn: platformApi.getCapabilities,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
};
