import React, { useEffect } from 'react';
import { useProjectProgress } from '../hooks/useProjectProgress';
import { ProgressIndicator } from './ui/progress-indicator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface ProjectProgressPanelProps {
  projectId: number;
}

/**
 * Panel component that displays project completion progress
 * with real-time updates
 */
export function ProjectProgressPanel({ projectId }: ProjectProgressPanelProps) {
  const { 
    progress, 
    missingFields, 
    isLoading, 
    refetch, 
    recalculateProgress 
  } = useProjectProgress(projectId);

  // Set up a listener for form submissions to update progress
  useEffect(() => {
    const handleFormSubmit = () => {
      // Delay the refetch to allow the server to process the update
      setTimeout(() => {
        refetch();
      }, 500);
    };

    // Listen for custom form submission events
    window.addEventListener('form-submitted', handleFormSubmit);
    
    return () => {
      window.removeEventListener('form-submitted', handleFormSubmit);
    };
  }, [refetch]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Completion Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Completion Progress</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => recalculateProgress()}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <ProgressIndicator 
            value={progress.overall} 
            label="Overall Progress" 
            size="lg" 
          />
        </div>

        <Tabs defaultValue="idoMetrics">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="idoMetrics">IDO Metrics</TabsTrigger>
            <TabsTrigger value="platformContent">Platform Content</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="quizQuestions">Quiz</TabsTrigger>
            <TabsTrigger value="marketingAssets">Marketing</TabsTrigger>
          </TabsList>

          <TabsContent value="idoMetrics">
            <SectionProgress 
              value={progress.idoMetrics} 
              missingFields={missingFields.idoMetrics} 
              label="IDO Metrics" 
            />
          </TabsContent>

          <TabsContent value="platformContent">
            <SectionProgress 
              value={progress.platformContent} 
              missingFields={missingFields.platformContent} 
              label="Platform Content" 
            />
          </TabsContent>

          <TabsContent value="faqs">
            <SectionProgress 
              value={progress.faqs} 
              missingFields={missingFields.faqs} 
              label="FAQs" 
            />
          </TabsContent>

          <TabsContent value="quizQuestions">
            <SectionProgress 
              value={progress.quizQuestions} 
              missingFields={missingFields.quizQuestions} 
              label="Quiz Questions" 
            />
          </TabsContent>

          <TabsContent value="marketingAssets">
            <SectionProgress 
              value={progress.marketingAssets} 
              missingFields={missingFields.marketingAssets} 
              label="Marketing Assets" 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface SectionProgressProps {
  value: number;
  missingFields: string[];
  label: string;
}

function SectionProgress({ value, missingFields, label }: SectionProgressProps) {
  return (
    <div className="space-y-4">
      <ProgressIndicator value={value} label={label} />
      
      {missingFields.length > 0 && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Information</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}