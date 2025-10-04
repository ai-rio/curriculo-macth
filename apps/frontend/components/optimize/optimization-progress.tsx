'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
  FileText,
  Download,
  Brain,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface OptimizationProgressProps {
  optimizationId: string;
  onComplete: (results: any) => void;
  onError: (error: string) => void;
}

interface OptimizationStatus {
  id: string;
  status: 'pending' | 'analyzing' | 'optimizing' | 'generating' | 'completed' | 'failed';
  progress: number;
  current_stage: string;
  estimated_time_remaining?: number;
  error?: string;
  results?: any;
}

const STAGE_CONFIG = {
  pending: {
    icon: Loader2,
    label: 'Initializing',
    description: 'Starting optimization process...',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  analyzing: {
    icon: Brain,
    label: 'Analyzing Resume',
    description: 'AI is analyzing your resume and job description...',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  optimizing: {
    icon: Sparkles,
    label: 'Optimizing Content',
    description: 'Enhancing resume content to match job requirements...',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  generating: {
    icon: FileText,
    label: 'Generating Document',
    description: 'Creating optimized resume document...',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    description: 'Your optimized resume is ready!',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  failed: {
    icon: AlertCircle,
    label: 'Failed',
    description: 'Optimization encountered an error',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_RETRIES = 3;

export default function OptimizationProgress({
  optimizationId,
  onComplete,
  onError,
}: OptimizationProgressProps) {
  const [status, setStatus] = useState<OptimizationStatus | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const pollStatus = useCallback(async () => {
    if (!isPolling || !optimizationId) return;

    try {
      const response = await fetch(`/api/optimizations/${optimizationId}/status`);

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }

      const data: OptimizationStatus = await response.json();
      setStatus(data);
      setLastUpdate(new Date());
      setRetryCount(0); // Reset retry count on success

      // Check if optimization is complete
      if (data.status === 'completed' && data.results) {
        setIsPolling(false);
        onComplete(data.results);
      } else if (data.status === 'failed') {
        setIsPolling(false);
        onError(data.error || 'Optimization failed');
      }
    } catch (error) {
      console.error('Error polling optimization status:', error);

      if (retryCount >= MAX_RETRIES) {
        setIsPolling(false);
        onError('Unable to fetch optimization status. Please refresh the page.');
      } else {
        setRetryCount((prev) => prev + 1);
      }
    }
  }, [optimizationId, isPolling, retryCount, onComplete, onError]);

  // Set up polling
  useEffect(() => {
    if (!isPolling || !optimizationId) return;

    const interval = setInterval(pollStatus, POLLING_INTERVAL);

    // Initial poll
    pollStatus();

    return () => clearInterval(interval);
  }, [pollStatus, isPolling, optimizationId]);

  // Auto-retry mechanism
  useEffect(() => {
    if (retryCount > 0 && retryCount < MAX_RETRIES) {
      const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      const timeout = setTimeout(() => {
        pollStatus();
      }, retryDelay);

      return () => clearTimeout(timeout);
    }
  }, [retryCount, pollStatus]);

  if (!status) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading optimization status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStageConfig = STAGE_CONFIG[status.status];
  const StageIcon = currentStageConfig.icon;

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className={`mx-auto p-3 rounded-full ${currentStageConfig.bgColor}`}>
            <StageIcon
              className={`h-8 w-8 ${currentStageConfig.color} ${
                status.status === 'pending' ||
                status.status === 'analyzing' ||
                status.status === 'optimizing' ||
                status.status === 'generating'
                  ? 'animate-pulse'
                  : ''
              }`}
            />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            {currentStageConfig.label}
            {status.status !== 'completed' && status.status !== 'failed' && (
              <Badge variant="secondary" className="animate-pulse">
                Processing
              </Badge>
            )}
          </CardTitle>
          <CardDescription>{currentStageConfig.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(status.progress)}%</span>
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>

          {/* Current Stage Details */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{status.current_stage}</p>
            {status.estimated_time_remaining && (
              <p className="text-xs text-muted-foreground mt-1">
                Estimated time remaining: {Math.ceil(status.estimated_time_remaining / 60)} minutes
              </p>
            )}
          </div>

          {/* Retry Information */}
          {retryCount > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Retrying connection... (Attempt {retryCount} of {MAX_RETRIES})
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {status.status === 'failed' && status.error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{status.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Stage Timeline */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Optimization Process</CardTitle>
          <CardDescription>Track each stage of your AI resume optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(STAGE_CONFIG)
              .filter(([key]) => key !== 'failed')
              .map(([stage, config], index) => {
                const StageIcon = config.icon;
                const isCompleted =
                  stage === 'completed'
                    ? status.status === 'completed'
                    : stage === 'generating'
                      ? ['completed', 'generating'].includes(status.status)
                      : stage === 'optimizing'
                        ? ['completed', 'generating', 'optimizing'].includes(status.status)
                        : stage === 'analyzing'
                          ? ['completed', 'generating', 'optimizing', 'analyzing'].includes(
                              status.status
                            )
                          : stage === 'pending'
                            ? true
                            : false;
                const isCurrent = stage === status.status;

                return (
                  <div key={stage} className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${isCompleted ? config.bgColor : 'bg-gray-100'}`}
                    >
                      <StageIcon
                        className={`h-4 w-4 ${
                          isCompleted ? config.color : 'text-gray-400'
                        } ${isCurrent && !isCompleted ? 'animate-pulse' : ''}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {config.label}
                        </span>
                        {isCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
                        {isCurrent && !isCompleted && (
                          <Badge variant="secondary" className="text-xs animate-pulse">
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          Last updated: {lastUpdate.toLocaleTimeString()}
          {isPolling && ' • Live updates enabled'}
        </p>
      </div>
    </div>
  );
}
