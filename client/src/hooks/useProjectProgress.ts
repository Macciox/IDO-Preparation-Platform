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
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale to ensure fresh data
    cacheTime: 5000, // Short cache time
    refetchInterval: 3000, // Poll every 3 seconds for updates
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

  // Force a progress recalculation
  const recalculateProgress = async () => {
    if (!projectId) return;
    
    try {
      const response = await fetch(`/api/progress/${projectId}/recalculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Failed to recalculate progress:', error);
    }
  };

  return {
    progress,
    missingFields,
    isLoading,
    error,
    refetch,
    recalculateProgress,
    lastUpdated: data?.lastUpdated
  };
}