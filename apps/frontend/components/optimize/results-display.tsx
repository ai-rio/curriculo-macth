'use client';

import { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  RefreshCw,
  Sparkles,
  Star,
  TrendingUp,
  Eye,
  EyeOff,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResultsDisplayProps {
  optimizationId: string;
  onDownload: () => void;
  onStartOver: () => void;
}

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

export default function ResultsDisplay({
  optimizationId,
  onDownload,
  onStartOver,
}: ResultsDisplayProps) {
  const [results, setResults] = useState<OptimizationResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOriginalContent, setShowOriginalContent] = useState(true);
  const [showOptimizedContent, setShowOptimizedContent] = useState(true);

  // Fetch results when component mounts
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/optimizations/${optimizationId}/results`);
        if (!response.ok) {
          throw new Error(`Failed to fetch results: ${response.statusText}`);
        }
        const data: OptimizationResults = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [optimizationId]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading your optimized resume...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !results) {
    return (
      <Alert className="max-w-2xl mx-auto border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error || 'Failed to load optimization results'}
        </AlertDescription>
      </Alert>
    );
  }

  const scoreImprovement = results.ats_score.optimized - results.ats_score.original;
  const keywordImprovement = results.keyword_match.optimized - results.keyword_match.original;
  const readabilityImprovement =
    results.readability_score.optimized - results.readability_score.original;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="w-full max-w-4xl mx-auto border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-800">Optimization Complete!</h2>
              <p className="text-green-700">
                Your resume has been optimized and is ready for download
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ATS Score</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${getScoreColor(results.ats_score.optimized)}`}
                  >
                    {results.ats_score.optimized}%
                  </span>
                  {scoreImprovement > 0 && (
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">+{scoreImprovement}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Keyword Match</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${getScoreColor(results.keyword_match.optimized)}`}
                  >
                    {results.keyword_match.optimized}%
                  </span>
                  {keywordImprovement > 0 && (
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">+{keywordImprovement}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Readability</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${getScoreColor(results.readability_score.optimized)}`}
                  >
                    {results.readability_score.optimized}%
                  </span>
                  {readabilityImprovement > 0 && (
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">+{readabilityImprovement}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Star className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Comparison */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Resume Comparison</CardTitle>
          <CardDescription>
            Compare your original resume with the AI-optimized version
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
              <TabsTrigger value="improvements">Key Improvements</TabsTrigger>
              <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Original Resume */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Original Resume</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOriginalContent(!showOriginalContent)}
                      >
                        {showOriginalContent ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">ATS Score: {results.ats_score.original}%</Badge>
                      <Badge variant="outline">Keywords: {results.keyword_match.original}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showOriginalContent && (
                      <div className="space-y-4">
                        {results.original_resume.sections.map((section, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4">
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">
                              {section.header}
                            </h4>
                            <div className="text-sm text-gray-600 whitespace-pre-wrap">
                              {section.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Optimized Resume */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-green-700">Optimized Resume</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOptimizedContent(!showOptimizedContent)}
                      >
                        {showOptimizedContent ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        ATS Score: {results.ats_score.optimized}%
                      </Badge>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Keywords: {results.keyword_match.optimized}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showOptimizedContent && (
                      <div className="space-y-4">
                        {results.optimized_resume.sections.map((section, index) => (
                          <div key={index} className="border-l-2 border-green-300 pl-4">
                            <h4 className="font-semibold text-sm text-green-700 mb-2">
                              {section.header}
                            </h4>
                            <div className="text-sm text-gray-600 whitespace-pre-wrap">
                              {section.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="improvements" className="space-y-4">
              <div className="grid gap-3">
                {results.improvements.map((improvement, index) => (
                  <Card key={index} className={`border ${getImpactColor(improvement.impact)}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{improvement.category}</h4>
                            <Badge variant="outline" className="text-xs">
                              {improvement.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{improvement.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>ATS Compatibility</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {results.ats_score.original}% → {results.ats_score.optimized}%
                        </span>
                        <Badge variant="outline" className="text-green-700">
                          +{scoreImprovement}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Keyword Matching</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {results.keyword_match.original}% → {results.keyword_match.optimized}%
                        </span>
                        <Badge variant="outline" className="text-green-700">
                          +{keywordImprovement}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Readability Score</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {results.readability_score.original}% →{' '}
                          {results.readability_score.optimized}%
                        </span>
                        <Badge variant="outline" className="text-green-700">
                          +{readabilityImprovement}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Processing Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Processing Time</span>
                      <span className="text-sm font-medium">
                        {Math.round(results.processing_time / 60)} minutes
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Optimization ID</span>
                      <span className="text-sm font-mono text-muted-foreground">
                        {results.id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Completed At</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(results.created_at).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
        <Button onClick={onDownload} size="lg" className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download Optimized Resume (.docx)
        </Button>
        <Button
          variant="outline"
          onClick={onStartOver}
          size="lg"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          Optimize Another Resume
        </Button>
      </div>

      {/* Tips */}
      <Card className="w-full max-w-2xl mx-auto border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Pro Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Save the optimized resume with a new filename to preserve your original</li>
                <li>
                  • Review the keyword improvements to understand what recruiters are looking for
                </li>
                <li>
                  • Consider customizing the optimized resume further based on specific job
                  requirements
                </li>
                <li>
                  • Your optimized resume is designed to pass ATS systems and impress human
                  recruiters
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
