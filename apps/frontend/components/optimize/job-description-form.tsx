'use client';

import { AlertCircle, FileText, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface JobDescriptionFormProps {
  onJobDescriptionSubmit: (data: JobDescriptionData) => void;
  isDisabled?: boolean;
}

export interface JobDescriptionData {
  jobTitle: string;
  company: string;
  description: string;
}

const MIN_DESCRIPTION_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 5000;

export default function JobDescriptionForm({
  onJobDescriptionSubmit,
  isDisabled = false,
}: JobDescriptionFormProps) {
  const [formData, setFormData] = useState<JobDescriptionData>({
    jobTitle: '',
    company: '',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<JobDescriptionData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof JobDescriptionData, boolean>>>({});

  // Real-time validation
  useEffect(() => {
    const newErrors: Partial<JobDescriptionData> = {};

    if (touched.description) {
      if (formData.description.length < MIN_DESCRIPTION_LENGTH) {
        newErrors.description = `Job description must be at least ${MIN_DESCRIPTION_LENGTH} characters`;
      } else if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
        newErrors.description = `Job description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`;
      }
    }

    if (touched.jobTitle && !formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (touched.company && !formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    setErrors(newErrors);
  }, [formData, touched]);

  const handleInputChange = (field: keyof JobDescriptionData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (!touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const validateForm = (): boolean => {
    // Mark all fields as touched
    setTouched({
      jobTitle: true,
      company: true,
      description: true,
    });

    // Check if form is valid
    return (
      formData.jobTitle.trim().length > 0 &&
      formData.company.trim().length > 0 &&
      formData.description.length >= MIN_DESCRIPTION_LENGTH &&
      formData.description.length <= MAX_DESCRIPTION_LENGTH
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onJobDescriptionSubmit({
        jobTitle: formData.jobTitle.trim(),
        company: formData.company.trim(),
        description: formData.description.trim(),
      });
    }
  };

  const isValid =
    Object.keys(errors).length === 0 &&
    formData.jobTitle.trim().length > 0 &&
    formData.company.trim().length > 0 &&
    formData.description.length >= MIN_DESCRIPTION_LENGTH;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Job Description Details
        </CardTitle>
        <CardDescription>
          Provide information about the position you're applying for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <div className="relative">
              <Input
                id="jobTitle"
                type="text"
                placeholder="e.g., Senior Software Engineer"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, jobTitle: true }))}
                disabled={isDisabled}
                className={errors.jobTitle ? 'border-red-500' : ''}
              />
            </div>
            {errors.jobTitle && touched.jobTitle && (
              <Alert className="py-2 px-3 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 text-sm">
                  {errors.jobTitle}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">Company Name *</Label>
            <div className="relative">
              <Input
                id="company"
                type="text"
                placeholder="e.g., Tech Company Inc."
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, company: true }))}
                disabled={isDisabled}
                className={errors.company ? 'border-red-500' : ''}
              />
            </div>
            {errors.company && touched.company && (
              <Alert className="py-2 px-3 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 text-sm">
                  {errors.company}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <div className="relative">
              <Textarea
                id="description"
                placeholder="Paste the full job description here, including requirements, responsibilities, and qualifications..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
                disabled={isDisabled}
                rows={8}
                className={errors.description ? 'border-red-500 resize-none' : 'resize-none'}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                {formData.description.length} / {MAX_DESCRIPTION_LENGTH}
              </div>
            </div>

            {/* Character count indicator */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Minimum {MIN_DESCRIPTION_LENGTH} characters required
              </span>
              {formData.description.length > 0 && (
                <span
                  className={`text-xs ${
                    formData.description.length < MIN_DESCRIPTION_LENGTH
                      ? 'text-red-500'
                      : formData.description.length > MAX_DESCRIPTION_LENGTH
                        ? 'text-red-500'
                        : 'text-green-500'
                  }`}
                >
                  {formData.description.length < MIN_DESCRIPTION_LENGTH &&
                    `Need ${MIN_DESCRIPTION_LENGTH - formData.description.length} more characters`}
                  {formData.description.length >= MIN_DESCRIPTION_LENGTH &&
                    formData.description.length <= MAX_DESCRIPTION_LENGTH &&
                    '✓ Minimum requirement met'}
                  {formData.description.length > MAX_DESCRIPTION_LENGTH &&
                    `Exceeds by ${formData.description.length - MAX_DESCRIPTION_LENGTH} characters`}
                </span>
              )}
            </div>

            {errors.description && touched.description && (
              <Alert className="py-2 px-3 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 text-sm">
                  {errors.description}
                </AlertDescription>
              </Alert>
            )}

            {/* Helper text */}
            {formData.description.length === 0 && (
              <Alert className="py-2 px-3 bg-blue-50 border-blue-200">
                <FileText className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 text-sm">
                  Tip: Include all details from the job posting for better AI optimization results
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={!isValid || isDisabled}>
            Continue to Payment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
