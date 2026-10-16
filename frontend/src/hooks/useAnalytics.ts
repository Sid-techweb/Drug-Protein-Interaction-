import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export const useAnalyticsDashboard = () => {
  return useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: analyticsApi.getDashboardData,
    staleTime: 2 * 60 * 1000,
  });
};
