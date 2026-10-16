import { useQuery } from '@tanstack/react-query';
import { explainabilityApi } from '../api/explainabilityApi';

export const useExplainability = (predictionId?: string) => {
  return useQuery({
    queryKey: ['explainability', predictionId],
    queryFn: () => (predictionId ? explainabilityApi.getHeatmap(predictionId) : Promise.reject('No Prediction ID')),
    enabled: !!predictionId,
  });
};
