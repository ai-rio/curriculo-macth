'use client';

import { Download, Loader2, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { common, results } from '@/lib/i18n';
import { createBrowserClient as createClient } from '@/lib/supabase/client';

interface OptimizationStatus {
  id: string;
  user_id: string;
  status: string;
  optimized_text: string | null;
  docx_storage_path: string | null;
  match_percentage: number | null;
  suggestions: string[] | null;
  keywords: string[] | null;
  error_message: string | null;
  created_at: string;
  processing_started_at: string | null;
  processing_completed_at: string | null;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const optimizationId = params.id as string;

  const [status, setStatus] = useState<OptimizationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Poll for optimization status
  useEffect(() => {
    if (!optimizationId) return;

    let pollInterval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const data = await api.get<OptimizationStatus>(`/api/v1/optimizations/${optimizationId}`);
        setStatus(data);
        setLoading(false);

        // Stop polling if completed or failed
        if (data.status === 'completed' || data.status === 'failed') {
          if (pollInterval) {
            clearInterval(pollInterval);
          }
        }
      } catch (err: any) {
        console.error('Error fetching optimization status:', err);
        setError(err.message || results.error);
        setLoading(false);
        if (pollInterval) {
          clearInterval(pollInterval);
        }
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 3 seconds
    pollInterval = setInterval(fetchStatus, 3000);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [optimizationId]);

  const handleDownload = async () => {
    if (!status?.docx_storage_path) return;

    setDownloading(true);

    try {
      const supabase = createClient();

      // Download file from Supabase Storage
      const { data, error } = await supabase.storage
        .from('optimized-resumes')
        .download(status.docx_storage_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `curriculo_otimizado_${optimizationId}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      setError('Erro ao baixar arquivo. Por favor, tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">{common.loading}</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="w-6 h-6 text-destructive" />
              <CardTitle className="text-destructive">{common.error}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/upload')} variant="outline">
              {common.back}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render processing state
  if (status && status.status !== 'completed' && status.status !== 'failed') {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle>{results.processing}</CardTitle>
            <CardDescription>{results.processingDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <div className="flex-1">
                <Progress value={undefined} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">Status: {status.status}</p>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Aguarde enquanto processamos:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Extração do texto do currículo</li>
                <li>✓ Análise de compatibilidade com a vaga</li>
                <li>
                  {status.status === 'processing' ? '⏳' : '○'} Otimização com Inteligência
                  Artificial
                </li>
                <li>○ Geração do arquivo final</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render failed state
  if (status && status.status === 'failed') {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="w-6 h-6 text-destructive" />
              <CardTitle className="text-destructive">Erro no Processamento</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{status.error_message || results.error}</p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/upload')} variant="outline">
                Tentar Novamente
              </Button>
              <Button onClick={() => router.push('/dashboard')} variant="ghost">
                Ir para Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render completed state
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Success Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold">{results.title}</h1>
        </div>
        <p className="text-muted-foreground">{results.subtitle}</p>
      </div>

      {/* Download Card */}
      <Card className="mb-6 border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Currículo Otimizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownload} disabled={downloading} size="lg" className="w-full">
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Baixando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {results.download}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Optimized Text Preview */}
      {status?.optimized_text && (
        <Card>
          <CardHeader>
            <CardTitle>{results.viewOptimized}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm font-sans bg-muted p-4 rounded-lg">
                {status.optimized_text}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <Button onClick={() => router.push('/upload')} variant="outline">
          Otimizar Outro Currículo
        </Button>
        <Button onClick={() => router.push('/dashboard')} variant="ghost">
          Ir para Dashboard
        </Button>
      </div>
    </div>
  );
}
