import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook to fetch and manage project progress data
 * @param projectId The ID of the project to fetch progress for
 * @returns Object containing progress data, loading state, and error state
 */
export function useProjectProgress(projectId: number | undefined) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/progress/${projectId}`],
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract progress data from the response
  const progress = data?.progress || {
    overall: 0,
    idoMetrics: 0,
    platformContent: 0,
    faqs: 0,
    quizQuestions: 0,
    marketingAssets: 0
  };

  // Extract missing fields from the response
  const missingFields = data?.missingFields || {
    idoMetrics: [],
    platformContent: [],
    faqs: [],
    quizQuestions: [],
    marketingAssets: []
  };

  return {
    progress,
    missingFields,
    isLoading,
    error,
    refetch,
    lastUpdated: data?.lastUpdated
  };
}