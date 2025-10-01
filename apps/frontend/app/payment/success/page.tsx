/**
 * Payment Success Page
 *
 * Displayed after successful Stripe Checkout payment
 * Verifies payment and displays confirmation
 */

'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentAPI } from '@/lib/api/payments';
import { translations } from '@/lib/i18n';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [improvementId, setImprovementId] = useState<string | null>(null);
  const [processingStarted, setProcessingStarted] = useState(false);

  useEffect(() => {
    const verifyPaymentAndProcess = async () => {
      const paymentIntentId = searchParams.get('payment_intent_id');
      const resumeId = searchParams.get('resume_id');
      const jobId = searchParams.get('job_id');

      // Try to get IDs from session storage if not in URL params
      const storedResumeId = sessionStorage.getItem('pending_resume_id');
      const storedJobId = sessionStorage.getItem('pending_job_id');
      const storedPaymentIntentId = sessionStorage.getItem('pending_payment_intent_id');

      const finalResumeId = resumeId || storedResumeId;
      const finalJobId = jobId || storedJobId;
      const finalPaymentIntentId = paymentIntentId || storedPaymentIntentId;

      if (!finalPaymentIntentId || !finalResumeId || !finalJobId) {
        setError('Informações de pagamento não encontradas');
        setVerifying(false);
        return;
      }

      try {
        // Verify payment was successful
        const verificationResult = await PaymentAPI.verifyPayment({
          payment_intent_id: finalPaymentIntentId,
          resume_id: finalResumeId,
          job_id: finalJobId,
        });

        if (verificationResult.success) {
          // Payment verified, now process the resume improvement
          const improvementResult = await PaymentAPI.processImprovement({
            resume_id: finalResumeId,
            job_id: finalJobId,
            payment_intent_id: finalPaymentIntentId,
          });

          if (improvementResult.success) {
            setImprovementId(improvementResult.improvement_id);
            setProcessingStarted(true);
            // Clear session storage
            sessionStorage.removeItem('pending_resume_id');
            sessionStorage.removeItem('pending_job_id');
            sessionStorage.removeItem('pending_payment_intent_id');
          } else {
            setError('Falha ao iniciar o processamento da otimização');
          }
        } else {
          setError('Falha na verificação do pagamento');
        }
      } catch (err: any) {
        setError(err?.detail || err?.message || translations.payment.errors.verificationFailed);
      } finally {
        setVerifying(false);
      }
    };

    verifyPaymentAndProcess();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="container max-w-2xl mx-auto py-16">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle className="text-center">Verificando Pagamento</CardTitle>
            <CardDescription className="text-center">
              Aguarde enquanto confirmamos seu pagamento e iniciamos a otimização...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Erro na Verificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button onClick={() => router.push('/dashboard')}>Voltar ao Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">{translations.payment.success}</CardTitle>
          <CardDescription className="text-center">
            Seu currículo está sendo otimizado por nossa IA. Você receberá um e-mail quando estiver
            pronto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>ID da Otimização:</strong> {improvementId}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Status:</strong> {processingStarted ? 'Processando' : 'Aguardando'}
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={() => router.push(`/results/${improvementId}`)}>
              Ver Status da Otimização
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            O processamento geralmente leva de 2 a 5 minutos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
