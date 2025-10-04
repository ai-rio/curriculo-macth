import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

interface OptimizationResults {
  id: string;
  original_resume: {
    content: string;
    sections: {
      header: string;
      content: string;
    }[];
  };
  optimized_resume: {
    content: string;
    sections: {
      header: string;
      content: string;
    }[];
  };
  improvements: {
    category: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  ats_score: {
    original: number;
    optimized: number;
  };
  keyword_match: {
    original: number;
    optimized: number;
  };
  readability_score: {
    original: number;
    optimized: number;
  };
  processing_time: number;
  created_at: string;
}

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
      // Call backend API to get optimization results
      const response = await api.get<OptimizationResults>(
        `/api/v1/optimizations/${optimizationId}/results`
      );

      return NextResponse.json(response);
    } catch (apiError) {
      console.error('Backend API error:', apiError);

      // If backend is not available, return mock results for development
      if (process.env.NODE_ENV === 'development') {
        const mockResults: OptimizationResults = {
          id: optimizationId,
          original_resume: {
            content:
              'John Doe\nSoftware Engineer\n\nSummary\nExperienced software engineer with 5 years of experience in web development.\n\nExperience\nSenior Developer - Tech Corp (2020-Present)\n• Built web applications\n• Worked with JavaScript\n\nEducation\nBS Computer Science - State University (2018)',
            sections: [
              {
                header: 'Summary',
                content:
                  'Experienced software engineer with 5 years of experience in web development.',
              },
              {
                header: 'Experience',
                content:
                  'Senior Developer - Tech Corp (2020-Present)\n• Built web applications\n• Worked with JavaScript',
              },
              {
                header: 'Education',
                content: 'BS Computer Science - State University (2018)',
              },
            ],
          },
          optimized_resume: {
            content:
              "John Doe\nSenior Software Engineer | Full-Stack Developer\n\nProfessional Summary\nResults-driven Senior Software Engineer with 5+ years of experience designing, developing, and deploying scalable web applications. Proficient in modern JavaScript frameworks, cloud technologies, and agile methodologies. Proven track record of delivering high-quality solutions that improve business performance and user experience.\n\nProfessional Experience\nSenior Software Engineer - Tech Corporation (2020-Present)\n• Architected and developed full-stack web applications using React, Node.js, and TypeScript\n• Led implementation of microservices architecture resulting in 40% improvement in system performance\n• Collaborated with cross-functional teams to deliver 15+ major features ahead of schedule\n• Mentored junior developers and conducted code reviews to ensure best practices\n• Optimized database queries and implemented caching strategies, reducing load times by 60%\n\nEducation\nBachelor of Science in Computer Science\nState University | Graduated 2018\n• GPA: 3.8/4.0\n• Dean's List: 6 semesters\n\nTechnical Skills\n• Languages: JavaScript, TypeScript, Python, Java\n• Frameworks: React, Node.js, Express, Django\n• Databases: PostgreSQL, MongoDB, Redis\n• Cloud: AWS, Docker, Kubernetes\n• Tools: Git, CI/CD, Agile, JIRA",
            sections: [
              {
                header: 'Professional Summary',
                content:
                  'Results-driven Senior Software Engineer with 5+ years of experience designing, developing, and deploying scalable web applications. Proficient in modern JavaScript frameworks, cloud technologies, and agile methodologies. Proven track record of delivering high-quality solutions that improve business performance and user experience.',
              },
              {
                header: 'Professional Experience',
                content:
                  'Senior Software Engineer - Tech Corporation (2020-Present)\n• Architected and developed full-stack web applications using React, Node.js, and TypeScript\n• Led implementation of microservices architecture resulting in 40% improvement in system performance\n• Collaborated with cross-functional teams to deliver 15+ major features ahead of schedule\n• Mentored junior developers and conducted code reviews to ensure best practices\n• Optimized database queries and implemented caching strategies, reducing load times by 60%',
              },
              {
                header: 'Education',
                content:
                  "Bachelor of Science in Computer Science\nState University | Graduated 2018\n• GPA: 3.8/4.0\n• Dean's List: 6 semesters",
              },
              {
                header: 'Technical Skills',
                content:
                  '• Languages: JavaScript, TypeScript, Python, Java\n• Frameworks: React, Node.js, Express, Django\n• Databases: PostgreSQL, MongoDB, Redis\n• Cloud: AWS, Docker, Kubernetes\n• Tools: Git, CI/CD, Agile, JIRA',
              },
            ],
          },
          improvements: [
            {
              category: 'Keyword Optimization',
              description:
                "Added industry-specific keywords like 'microservices', 'scalable applications', and 'cross-functional teams' to improve ATS matching",
              impact: 'high',
            },
            {
              category: 'Quantifiable Achievements',
              description:
                'Enhanced experience descriptions with specific metrics and results (40% improvement, 60% reduction)',
              impact: 'high',
            },
            {
              category: 'Professional Formatting',
              description: 'Improved structure with clear sections and better visual hierarchy',
              impact: 'medium',
            },
            {
              category: 'Skills Section',
              description: 'Added comprehensive technical skills section organized by category',
              impact: 'medium',
            },
            {
              category: 'Action Verbs',
              description:
                'Replaced passive language with strong action verbs (architected, led, optimized)',
              impact: 'low',
            },
          ],
          ats_score: {
            original: 65,
            optimized: 92,
          },
          keyword_match: {
            original: 58,
            optimized: 89,
          },
          readability_score: {
            original: 72,
            optimized: 85,
          },
          processing_time: 145,
          created_at: new Date().toISOString(),
        };

        return NextResponse.json(mockResults);
      }

      throw apiError;
    }
  } catch (error) {
    console.error('Error fetching optimization results:', error);

    return NextResponse.json({ error: 'Failed to fetch optimization results' }, { status: 500 });
  }
}
