import React from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { StatusToggle } from './StatusToggle';

interface FormFieldProps {
  label: string;
  name: string;
  value: string | null | undefined;
  status: string;
  onChange: (name: string, value: string) => void;
  onStatusChange: (name: string, status: string) => void;
  projectId: number;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

/**
 * Form field component with integrated status toggle and progress sync
 */
export function FormField({
  label,
  name,
  value,
  status,
  onChange,
  onStatusChange,
  projectId,
  type = 'text',
  placeholder = '',
  required = false,
}: FormFieldProps) {
  // Handle value change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  };
  
  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(`${name}Status`, newStatus);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={name} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <StatusToggle 
          value={status || 'not_confirmed'} 
          onChange={handleStatusChange}
          projectId={projectId}
          fieldName={name} // Pass field name for event tracking
        />
      </div>
      <Input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
}