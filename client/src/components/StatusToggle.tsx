import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useProgressSync } from '../hooks/useProgressSync';
import { notifyStatusChanged } from '../utils/progressEvents';

interface StatusToggleProps {
  value: string;
  onChange: (value: string) => void;
  projectId: number;
  fieldName?: string;
}

/**
 * Status toggle component that updates progress when status changes
 */
export function StatusToggle({ value, onChange, projectId, fieldName }: StatusToggleProps) {
  const { syncProgress } = useProgressSync(projectId);
  
  // Handle status change and sync progress
  const handleStatusChange = (newValue: string) => {
    onChange(newValue);
    
    // Notify about status change for real-time updates
    if (fieldName) {
      notifyStatusChanged(fieldName, newValue);
    }
    
    // Trigger progress sync immediately for confirmed status
    if (newValue === 'confirmed') {
      syncProgress();
    }
  };
  
  return (
    <Select value={value} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="confirmed" className="text-green-600 font-medium">Confirmed</SelectItem>
        <SelectItem value="not_confirmed" className="text-gray-500">Not Confirmed</SelectItem>
        <SelectItem value="might_change" className="text-amber-500">Might Change</SelectItem>
      </SelectContent>
    </Select>
  );
}