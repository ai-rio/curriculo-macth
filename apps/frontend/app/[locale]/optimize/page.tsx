'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PaymentFlow from '@/components/payment/payment-flow';
import ResumeUpload from '@/components/optimize/resume-upload';
import JobDescriptionForm, { JobDescriptionData } from '@/components/optimize/job-description-form';
import OptimizationProgress from '@/components/optimize/optimization-progress';
import ResultsDisplay from '@/components/optimize/results-display';
import { AlertCircle, CheckCircle, FileText, Rocket, Sparkles } from 'lucide-react';

interface ResumeData {
  id: string;
  name: string;
}

interface OptimizationRequest {
  resume: ResumeData;
  jobDescription: JobDescriptionData;
}

const OPTIMIZATION_TIER = {
  id: 'ai-optimization',
  name: 'AI Resume Optimization',
  price: 1999, // $19.99 in cents
  currency: 'USD',
  interval: 'lifetime' as const,
  description: 'One-time AI-powered resume optimization to match your target job description',
  features: [
    'AI-powered resume optimization',
    'ATS-friendly formatting',
    'Keyword optimization',
    'Professional enhancement',
    'Side-by-side comparison',
    'Download optimized .docx file',
    'Results in 2-3 minutes',
  ],
  isFree: false,
};

type WorkflowStep = 'upload' | 'job-details' | 'payment' | 'processing' | 'results';

export default function OptimizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resume_id');

  const [currentStep, setCurrentStep] = useState<WorkflowStep>(resumeId ? 'job-details' : 'upload');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescriptionData | null>(null);
  const [optimizationId, setOptimizationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResumeUploaded = useCallback((data: ResumeData) => {
    setResumeData(data);
    setCurrentStep('job-details');
    setError(null);
  }, []);

  const handleJobDescriptionSubmit = useCallback((data: JobDescriptionData) => {
    setJobDescription(data);
    setCurrentStep('payment');
    setError(null);
  }, []);

  const handlePaymentSuccess = useCallback(async () => {
    if (!resumeData || !jobDescription) {
      setError('Missing resume or job description data');
      return;
    }

    try {
      setCurrentStep('processing');

      // Create optimization request
      const response = await fetch('/api/optimizations/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_id: resumeData.id,
          job_description: jobDescription.description,
          job_title: jobDescription.jobTitle,
          company: jobDescription.company,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start optimization');
      }

      const data = await response.json();
      setOptimizationId(data.optimization_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start optimization');
      setCurrentStep('payment');
    }
  }, [resumeData, jobDescription]);

  const handlePaymentCancel = useCallback(() => {
    setCurrentStep('job-details');
  }, []);

  const handlePaymentError = useCallback((error: Error) => {
    setError(error.message);
    setCurrentStep('job-details');
  }, []);

  const handleOptimizationComplete = useCallback((results: any) => {
    setCurrentStep('results');
  }, []);

  const handleDownloadOptimized = useCallback(async () => {
    if (!optimizationId) return;

    try {
      const response = await fetch(`/api/optimizations/${optimizationId}/download`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized-resume-${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  }, [optimizationId]);

  const handleStartOver = useCallback(() => {
    setCurrentStep('upload');
    setResumeData(null);
    setJobDescription(null);
    setOptimizationId(null);
    setError(null);
    router.push('/optimize');
  }, [router]);

  const getStepNumber = (step: WorkflowStep): number => {
    const steps: WorkflowStep[] = ['upload', 'job-details', 'payment', 'processing', 'results'];
    return steps.indexOf(step) + 1;
  };

  const isStepCompleted = (step: WorkflowStep): boolean => {
    const steps: WorkflowStep[] = ['upload', 'job-details', 'payment', 'processing', 'results'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    return stepIndex < currentIndex;
  };

  const isStepActive = (step: WorkflowStep): boolean => {
    return currentStep === step;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Resume Optimization</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your resume to perfectly match your target job description with AI-powered
            optimization
          </p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8 max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {[
                { step: 'upload' as WorkflowStep, label: 'Upload Resume', icon: FileText },
                { step: 'job-details' as WorkflowStep, label: 'Job Details', icon: FileText },
                { step: 'payment' as WorkflowStep, label: 'Payment', icon: Sparkles },
                { step: 'processing' as WorkflowStep, label: 'Processing', icon: Rocket },
                { step: 'results' as WorkflowStep, label: 'Results', icon: CheckCircle },
              ].map(({ step, label, icon: Icon }) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                        isStepCompleted(step)
                          ? 'bg-green-500 border-green-500 text-white'
                          : isStepActive(step)
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isStepActive(step)
                          ? 'text-blue-600'
                          : isStepCompleted(step)
                            ? 'text-green-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {step !== 'results' && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors ${
                        isStepCompleted(step) ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 max-w-2xl mx-auto border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Upload Step */}
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5" />
                    Upload Your Resume
                  </CardTitle>
                  <CardDescription>
                    Upload your current resume in PDF or DOCX format to begin the optimization
                    process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-2xl mx-auto">
                    <ResumeUpload
                      onUploadSuccess={(resumeId, fileName) => {
                        handleResumeUploaded({ id: resumeId, name: fileName });
                      }}
                      onUploadError={(error) => setError(error)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-4">
                {OPTIMIZATION_TIER.features.slice(0, 3).map((feature, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">{feature}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Job Details Step */}
          {currentStep === 'job-details' && (
            <div className="space-y-6">
              <JobDescriptionForm
                onJobDescriptionSubmit={handleJobDescriptionSubmit}
                isDisabled={false}
              />

              {/* Resume Summary */}
              {resumeData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Uploaded Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">{resumeData.name}</span>
                      <Badge variant="secondary">Ready for optimization</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <div className="space-y-6">
              <PaymentFlow
                tier={OPTIMIZATION_TIER}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
                onError={handlePaymentError}
              />

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Resume:</span>
                    <span className="font-medium">{resumeData?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Position:</span>
                    <span className="font-medium">
                      {jobDescription?.jobTitle} at {jobDescription?.company}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${(OPTIMIZATION_TIER.price / 100).toFixed(2)} USD</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Processing Step */}
          {currentStep === 'processing' && optimizationId && (
            <OptimizationProgress
              optimizationId={optimizationId}
              onComplete={handleOptimizationComplete}
              onError={(error) => setError(error)}
            />
          )}

          {/* Results Step */}
          {currentStep === 'results' && optimizationId && (
            <ResultsDisplay
              optimizationId={optimizationId}
              onDownload={handleDownloadOptimized}
              onStartOver={handleStartOver}
            />
          )}
        </div>
      </div>
    </div>
  );
}
