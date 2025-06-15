import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FormField } from './FormField';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useFormWithProgress } from '../hooks/useFormWithProgress';
import { useProjectProgress } from '../hooks/useProjectProgress';
import { ProgressIndicator } from './ui/progress-indicator';

interface IdoMetricsFormProps {
  projectId: number;
}

export function IdoMetricsForm({ projectId }: IdoMetricsFormProps) {
  const queryClient = useQueryClient();
  
  // Fetch current IDO metrics data
  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
  });
  
  // Fetch progress data
  const { progress } = useProjectProgress(projectId);
  
  // Initialize form with progress sync
  const { values, setValues, handleChange, handleStatusChange, handleSubmit, isSubmitting } = 
    useFormWithProgress(project?.idoMetrics || {}, projectId);
  
  // Update form values when project data changes
  useEffect(() => {
    if (project?.idoMetrics) {
      setValues(project.idoMetrics);
    }
  }, [project, setValues]);
  
  // Mutation for saving IDO metrics
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/projects/${projectId}/ido-metrics`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save IDO metrics');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch project data
      queryClient.invalidateQueries([`/api/projects/${projectId}`]);
      // Invalidate and refetch progress data
      queryClient.invalidateQueries([`/api/progress/${projectId}`]);
    },
  });
  
  // Handle form submission
  const onSubmit = async () => {
    await mutation.mutateAsync(values);
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>IDO Metrics</CardTitle>
          <ProgressIndicator value={progress.idoMetrics} size="sm" className="w-32" />
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <h3 className="text-lg font-medium col-span-2">Important Dates</h3>
              
              <FormField
                label="Whitelisting Date"
                name="whitelistingDate"
                value={values.whitelistingDate}
                status={values.whitelistingDateStatus}
                onChange={handleChange}
                onStatusChange={handleStatusChange}
                projectId={projectId}
                type="date"
              />
              
              <FormField
                label="Placing IDO Date"
                name="placingIdoDate"
                value={values.placingIdoDate}
                status={values.placingIdoDateStatus}
                onChange={handleChange}
                onStatusChange={handleStatusChange}
                projectId={projectId}
                type="date"
              />
              
              <FormField
                label="Claiming Date"
                name="claimingDate"
                value={values.claimingDate}
                status={values.claimingDateStatus}
                onChange={handleChange}
                onStatusChange={handleStatusChange}
                projectId={projectId}
                type="date"
              />
              
              <FormField
                label="Initial DEX Listing Date"
                name="initialDexListingDate"
                value={values.initialDexListingDate}
                status={values.initialDexListingDateStatus}
                onChange={handleChange}
                onStatusChange={handleStatusChange}
                projectId={projectId}
                type="date"
              />
              
              {/* Add more fields as needed */}
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}