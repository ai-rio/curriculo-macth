import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';

interface StartOptimizationRequest {
  resume_id: string;
  job_description: string;
  job_title: string;
  company: string;
}

interface StartOptimizationResponse {
  optimization_id: string;
  status: string;
  estimated_time: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: StartOptimizationRequest = await request.json();
    const { resume_id, job_description, job_title, company } = body;

    // Validate required fields
    if (!resume_id || !job_description || !job_title || !company) {
      return NextResponse.json(
        { error: 'Missing required fields: resume_id, job_description, job_title, company' },
        { status: 400 }
      );
    }

    // Validate job description length
    if (job_description.length < 50 || job_description.length > 5000) {
      return NextResponse.json(
        { error: 'Job description must be between 50 and 5000 characters' },
        { status: 400 }
      );
    }

    // Get user session (if authentication is implemented)
    const supabase = createBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    try {
      // Call backend API to start optimization
      const response = await api.post<{
        optimization_id: string;
        status: string;
        estimated_time: number;
      }>('/api/v1/optimizations/start', {
        resume_id,
        job_description,
        job_title,
        company,
        user_id: session?.user?.id, // Optional: include user ID if authenticated
      });

      return NextResponse.json({
        optimization_id: response.optimization_id,
        status: response.status,
        estimated_time: response.estimated_time,
      } satisfies StartOptimizationResponse);
    } catch (apiError) {
      console.error('Backend API error:', apiError);

      // If backend is not available, return a mock response for development
      if (process.env.NODE_ENV === 'development') {
        const mockOptimizationId = `mock_opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return NextResponse.json({
          optimization_id: mockOptimizationId,
          status: 'pending',
          estimated_time: 180, // 3 minutes
        } satisfies StartOptimizationResponse);
      }

      throw apiError;
    }
  } catch (error) {
    console.error('Error starting optimization:', error);

    return NextResponse.json({ error: 'Failed to start optimization' }, { status: 500 });
  }
}
