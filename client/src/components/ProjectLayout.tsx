import React from 'react';
import { ProjectProgressPanel } from './project-progress-panel';
import { AutoProgressSync } from './AutoProgressSync';

interface ProjectLayoutProps {
  projectId: number;
  children: React.ReactNode;
}

/**
 * Layout component for project pages that includes progress tracking
 */
export function ProjectLayout({ projectId, children }: ProjectLayoutProps) {
  return (
    <div className="container mx-auto py-6">
      {/* Silent component that syncs progress automatically */}
      <AutoProgressSync projectId={projectId} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2">
          {children}
        </div>
        
        {/* Progress panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ProjectProgressPanel projectId={projectId} />
          </div>
        </div>
      </div>
    </div>
  );
}