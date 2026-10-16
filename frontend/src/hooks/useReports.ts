import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';

export const useUserReports = () => {
  return useQuery({
    queryKey: ['user-reports'],
    queryFn: reportApi.getReports,
    staleTime: 2 * 60 * 1000,
  });
};

export const useReportDetails = (reportId?: string) => {
  return useQuery({
    queryKey: ['report-details', reportId],
    queryFn: () => (reportId ? reportApi.getReportDetails(reportId) : Promise.reject('No Report ID')),
    enabled: !!reportId,
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, protein_id, workflow_run_id }: { title: string; protein_id: string; workflow_run_id?: string }) =>
      reportApi.generateReport(title, protein_id, workflow_run_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reports'] });
    },
  });
};
