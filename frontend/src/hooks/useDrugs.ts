import { useQuery } from '@tanstack/react-query';
import { drugApi, SearchDrugsParams } from '../api/drugApi';

export const useSearchDrugs = (params: SearchDrugsParams) => {
  return useQuery({
    queryKey: ['drugs', params],
    queryFn: () => drugApi.searchDrugs(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useDrugDetails = (drugId?: string) => {
  return useQuery({
    queryKey: ['drug-details', drugId],
    queryFn: () => (drugId ? drugApi.getDrugDetails(drugId) : Promise.reject('No Drug ID')),
    enabled: !!drugId,
  });
};
