import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ optimizationId: string }> }
) {
  try {
    const { optimizationId } = await params;

    if (!optimizationId) {
      return NextResponse.json({ error: 'Optimization ID is required' }, { status: 400 });
    }

    try {
      // Call backend API to download optimized resume
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/optimizations/${optimizationId}/download`,
        {
          method: 'GET',
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get the file blob from the response
      const blob = await response.blob();

      // Return the blob with appropriate headers
      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="optimized-resume-${optimizationId}.docx"`,
        },
      });
    } catch (apiError) {
      console.error('Backend API error:', apiError);

      // If backend is not available, return a mock file for development
      if (process.env.NODE_ENV === 'development') {
        // Create a simple DOCX file content (this is a mock - in production, you'd generate a real DOCX)
        const mockDocxContent = `
          Mock Optimized Resume Content
          ============================

          Optimization ID: ${optimizationId}

          This is a mock DOCX file for development purposes.
          In production, this would contain the actual optimized resume
          in proper DOCX format.

          Generated: ${new Date().toISOString()}
        `;

        // Create a blob with the content
        const blob = new Blob([mockDocxContent], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        return new NextResponse(blob, {
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="optimized-resume-${optimizationId}.docx"`,
          },
        });
      }

      throw apiError;
    }
  } catch (error) {
    console.error('Error downloading optimized resume:', error);

    return NextResponse.json({ error: 'Failed to download optimized resume' }, { status: 500 });
  }
}
