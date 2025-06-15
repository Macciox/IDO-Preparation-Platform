import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FORM_SUBMITTED_EVENT } from '../utils/progressEvents';

interface AutoProgressSyncProps {
  projectId: number;
}

/**
 * Component that automatically syncs progress when form fields change
 * This is a "silent" component that doesn't render anything visible
 */
export function AutoProgressSync({ projectId }: AutoProgressSyncProps) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Function to handle form submission events
    const handleFormSubmitted = () => {
      // Invalidate progress query to force a refetch
      queryClient.invalidateQueries([`/api/progress/${projectId}`]);
    };
    
    // Function to handle status change events
    const handleStatusChanged = (event: CustomEvent) => {
      const { newStatus } = event.detail;
      
      // Only trigger refetch for confirmed status
      if (newStatus === 'confirmed') {
        queryClient.invalidateQueries([`/api/progress/${projectId}`]);
      }
    };
    
    // Add event listeners
    window.addEventListener(FORM_SUBMITTED_EVENT, handleFormSubmitted);
    window.addEventListener('status-changed', handleStatusChanged as EventListener);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener(FORM_SUBMITTED_EVENT, handleFormSubmitted);
      window.removeEventListener('status-changed', handleStatusChanged as EventListener);
    };
  }, [projectId, queryClient]);
  
  // This component doesn't render anything
  return null;
}