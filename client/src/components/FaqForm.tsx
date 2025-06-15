import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { StatusToggle } from './StatusToggle';
import { notifyFormSubmitted } from '../utils/progressEvents';
import { AlertCircle, Plus, Trash } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface FaqFormProps {
  projectId: number;
}

export function FaqForm({ projectId }: FaqFormProps) {
  const queryClient = useQueryClient();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch existing FAQs
  const { data: project } = useQueryClient().getQueryData([`/api/projects/${projectId}`]) || {};
  
  React.useEffect(() => {
    if (project?.faqs) {
      setFaqs(project.faqs);
    }
  }, [project]);
  
  // Create FAQ mutation
  const createFaqMutation = useMutation({
    mutationFn: async (faqData: any) => {
      const response = await fetch(`/api/projects/${projectId}/faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create FAQ');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`/api/projects/${projectId}`]);
      queryClient.invalidateQueries([`/api/progress/${projectId}`]);
      notifyFormSubmitted();
    },
  });
  
  // Update FAQ mutation
  const updateFaqMutation = useMutation({
    mutationFn: async (faqData: any) => {
      const response = await fetch(`/api/faqs/${faqData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update FAQ');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`/api/projects/${projectId}`]);
      queryClient.invalidateQueries([`/api/progress/${projectId}`]);
      notifyFormSubmitted();
    },
  });
  
  // Delete FAQ mutation
  const deleteFaqMutation = useMutation({
    mutationFn: async (faqId: number) => {
      const response = await fetch(`/api/faqs/${faqId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete FAQ');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`/api/projects/${projectId}`]);
      queryClient.invalidateQueries([`/api/progress/${projectId}`]);
      notifyFormSubmitted();
    },
  });
  
  // Add new FAQ
  const addNewFaq = () => {
    if (faqs.length >= 5) {
      setError('Maximum 5 FAQ questions allowed');
      return;
    }
    
    const newFaq = {
      projectId,
      question: '',
      answer: '',
      order: faqs.length + 1,
      status: 'not_confirmed',
      isNew: true,
    };
    
    setFaqs([...faqs, newFaq]);
    setError(null);
  };
  
  // Update FAQ field
  const updateFaqField = (index: number, field: string, value: string) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index] = { ...updatedFaqs[index], [field]: value };
    setFaqs(updatedFaqs);
  };
  
  // Save FAQ
  const saveFaq = (faq: any, index: number) => {
    if (!faq.question || !faq.answer) {
      setError('Question and answer are required');
      return;
    }
    
    if (faq.isNew) {
      // Create new FAQ
      const { isNew, ...faqData } = faq;
      createFaqMutation.mutate(faqData);
    } else {
      // Update existing FAQ
      updateFaqMutation.mutate(faq);
    }
  };
  
  // Delete FAQ
  const deleteFaq = (faq: any, index: number) => {
    if (faq.id) {
      deleteFaqMutation.mutate(faq.id);
    } else {
      const updatedFaqs = faqs.filter((_, i) => i !== index);
      setFaqs(updatedFaqs);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>FAQs (Maximum 5)</CardTitle>
        <Button 
          onClick={addNewFaq} 
          disabled={faqs.length >= 5}
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add FAQ</span>
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {faqs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No FAQs yet. Click "Add FAQ" to create one.
          </div>
        ) : (
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={faq.id || `new-${index}`} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">FAQ #{index + 1}</h3>
                  <div className="flex items-center gap-2">
                    <StatusToggle
                      value={faq.status || 'not_confirmed'}
                      onChange={(value) => updateFaqField(index, 'status', value)}
                      projectId={projectId}
                      fieldName={`faq-${index}-status`}
                    />
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteFaq(faq, index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`question-${index}`}>Question</Label>
                    <Input
                      id={`question-${index}`}
                      value={faq.question || ''}
                      onChange={(e) => updateFaqField(index, 'question', e.target.value)}
                      placeholder="Enter question"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`answer-${index}`}>Answer</Label>
                    <Textarea
                      id={`answer-${index}`}
                      value={faq.answer || ''}
                      onChange={(e) => updateFaqField(index, 'answer', e.target.value)}
                      placeholder="Enter answer"
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => saveFaq(faq, index)}
                      disabled={!faq.question || !faq.answer}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}