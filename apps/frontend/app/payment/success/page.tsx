/**
 * Payment Success Page
 *
 * Displayed after successful Stripe Checkout payment
 * Verifies payment and displays confirmation
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentAPI } from '@/lib/api/payments';
import { translations } from '@/lib/i18n';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimizationId, setOptimizationId] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setError('ID da sessão não encontrado');
        setVerifying(false);
        return;
      }

      try {
        // Get session details to extract optimization_id from metadata
        const sessionDetails = await PaymentAPI.getSessionDetails(sessionId);

        const optId = sessionDetails.metadata.optimization_id;

        if (!optId) {
          setError('ID da otimização não encontrado');
          setVerifying(false);
          return;
        }

        // Verify payment and update optimization status
        const result = await PaymentAPI.verifyPayment({
          session_id: sessionId,
          optimization_id: optId,
        });

        if (result.success) {
          setOptimizationId(result.optimization_id);
        } else {
          setError('Falha na verificação do pagamento');
        }
      } catch (err: any) {
        setError(err?.detail || err?.message || translations.payment.errors.verificationFailed);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
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
              Aguarde enquanto confirmamos seu pagamento...
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
              <strong>ID da Otimização:</strong> {optimizationId}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Status:</strong> Processando
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={() => router.push(`/dashboard/optimizations/${optimizationId}`)}>
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
