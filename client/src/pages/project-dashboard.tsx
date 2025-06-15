import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProjectLayout } from '../components/ProjectLayout';
import { IdoMetricsForm } from '../components/IdoMetricsForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

/**
 * Project dashboard page with integrated progress tracking
 */
export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const numericProjectId = parseInt(projectId || '0');
  
  // Fetch project data
  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/projects/${numericProjectId}`],
    enabled: !!numericProjectId,
  });
  
  if (isLoading) {
    return <div>Loading project...</div>;
  }
  
  if (!project) {
    return <div>Project not found</div>;
  }
  
  return (
    <ProjectLayout projectId={numericProjectId}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        
        <Tabs defaultValue="ido-metrics">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="ido-metrics">IDO Metrics</TabsTrigger>
            <TabsTrigger value="platform-content">Platform Content</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="marketing">Marketing Assets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ido-metrics">
            <IdoMetricsForm projectId={numericProjectId} />
          </TabsContent>
          
          <TabsContent value="platform-content">
            <Card>
              <CardHeader>
                <CardTitle>Platform Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Platform content form will go here</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="faqs">
            <Card>
              <CardHeader>
                <CardTitle>FAQs</CardTitle>
              </CardHeader>
              <CardContent>
                <p>FAQ management will go here</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="marketing">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Marketing assets form will go here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProjectLayout>
  );
}