import { useState, useCallback } from 'react';
import { useProgressSync } from './useProgressSync';
import { notifyFormSubmitted } from '../utils/progressEvents';

/**
 * Custom hook for form state management with integrated progress synchronization
 */
export function useFormWithProgress<T extends Record<string, any>>(
  initialValues: T,
  projectId: number,
  onSubmit?: (values: T) => Promise<void>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { syncProgress } = useProgressSync(projectId);

  // Handle field change
  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle status field change with progress sync
  const handleStatusChange = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Sync progress when status changes to "confirmed"
    if (value === 'confirmed') {
      syncProgress();
    }
  }, [syncProgress]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        // Sync progress after successful submission
        syncProgress();
        // Notify about form submission for real-time updates
        notifyFormSubmitted();
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, onSubmit, syncProgress]);

  return {
    values,
    setValues,
    handleChange,
    handleStatusChange,
    handleSubmit,
    isSubmitting
  };
}