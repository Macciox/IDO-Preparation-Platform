import React from 'react';
import { Progress } from './progress';

interface ProgressIndicatorProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

/**
 * Progress indicator component that shows completion percentage
 */
export function ProgressIndicator({
  value,
  label,
  size = 'md',
  showPercentage = true,
  className = '',
}: ProgressIndicatorProps) {
  // Determine height based on size
  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }[size];
  
  // Determine text size based on size
  const textClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];
  
  // Determine color based on progress value
  const getColorClass = () => {
    if (value < 30) return 'bg-red-500';
    if (value < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className={`font-medium ${textClass}`}>{label}</span>
          {showPercentage && (
            <span className={`${textClass} text-gray-500`}>{value}%</span>
          )}
        </div>
      )}
      <Progress
        value={value}
        className={`${heightClass} rounded-full`}
        indicatorClassName={getColorClass()}
      />
      {!label && showPercentage && (
        <div className="mt-1 text-right">
          <span className={`${textClass} text-gray-500`}>{value}%</span>
        </div>
      )}
    </div>
  );
}