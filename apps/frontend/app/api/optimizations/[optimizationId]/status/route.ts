import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

interface OptimizationStatus {
  id: string;
  status: 'pending' | 'analyzing' | 'optimizing' | 'generating' | 'completed' | 'failed';
  progress: number;
  current_stage: string;
  estimated_time_remaining?: number;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ optimizationId: string }> }
) {
  const { optimizationId } = await params;
  try {
    if (!optimizationId) {
      return NextResponse.json({ error: 'Optimization ID is required' }, { status: 400 });
    }

    try {
      // Call backend API to get optimization status
      const response = await api.get<OptimizationStatus>(
        `/api/v1/optimizations/${optimizationId}/status`
      );

      return NextResponse.json(response);
    } catch (apiError) {
      console.error('Backend API error:', apiError);

      // If backend is not available, return mock status for development
      if (process.env.NODE_ENV === 'development') {
        // Simulate progress based on optimization ID
        const idHash = optimizationId.split('_').pop() || '';
        const timeBasedProgress = Math.min(
          Math.floor((Date.now() % 120000) / 1200), // 0-100 over 2 minutes
          100
        );

        let status: OptimizationStatus['status'] = 'pending';
        let currentStage = 'Initializing optimization process...';
        let estimated_time_remaining = 180;

        if (timeBasedProgress < 20) {
          status = 'analyzing';
          currentStage = 'AI is analyzing your resume and job description...';
          estimated_time_remaining = 160;
        } else if (timeBasedProgress < 50) {
          status = 'optimizing';
          currentStage = 'Enhancing resume content to match job requirements...';
          estimated_time_remaining = 90;
        } else if (timeBasedProgress < 80) {
          status = 'generating';
          currentStage = 'Creating optimized resume document...';
          estimated_time_remaining = 40;
        } else if (timeBasedProgress >= 100) {
          status = 'completed';
          currentStage = 'Optimization completed successfully!';
          estimated_time_remaining = 0;
        }

        // Check for mock failure (based on ID for testing error handling)
        if (idHash.includes('fail')) {
          status = 'failed';
          currentStage = 'Optimization failed';
          return NextResponse.json({
            id: optimizationId,
            status,
            progress: 0,
            current_stage: currentStage,
            error: 'Mock optimization failure for testing purposes',
          } satisfies OptimizationStatus);
        }

        return NextResponse.json({
          id: optimizationId,
          status,
          progress: timeBasedProgress,
          current_stage: currentStage,
          estimated_time_remaining,
        } satisfies OptimizationStatus);
      }

      throw apiError;
    }
  } catch (error) {
    console.error('Error fetching optimization status:', error);

    return NextResponse.json({ error: 'Failed to fetch optimization status' }, { status: 500 });
  }
}
