/**
 * Utility functions for progress-related events
 */

// Custom event for form submissions
export const FORM_SUBMITTED_EVENT = 'form-submitted';

/**
 * Dispatch a form submitted event to trigger progress updates
 * @param formName Optional name of the form that was submitted
 */
export function notifyFormSubmitted(formName?: string) {
  const event = new CustomEvent(FORM_SUBMITTED_EVENT, {
    detail: { formName, timestamp: Date.now() }
  });
  
  window.dispatchEvent(event);
}

/**
 * Dispatch a field status changed event to trigger progress updates
 * @param fieldName Name of the field that changed
 * @param newStatus New status value
 */
export function notifyStatusChanged(fieldName: string, newStatus: string) {
  const event = new CustomEvent('status-changed', {
    detail: { fieldName, newStatus, timestamp: Date.now() }
  });
  
  window.dispatchEvent(event);
  
  // Also trigger form submitted event for immediate progress update
  if (newStatus === 'confirmed') {
    notifyFormSubmitted();
  }
}