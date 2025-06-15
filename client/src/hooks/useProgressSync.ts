import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Hook to synchronize progress updates when form fields change
 */
export function useProgressSync(projectId: number) {
  const queryClient = useQueryClient();
  
  // Function to trigger progress recalculation
  const syncProgress = useCallback(() => {
    // Invalidate the progress query to force a refetch
    queryClient.invalidateQueries([`/api/progress/${projectId}`]);
    
    // Also invalidate the project data since it may have changed
    queryClient.invalidateQueries([`/api/projects/${projectId}`]);
  }, [projectId, queryClient]);
  
  return { syncProgress };
}