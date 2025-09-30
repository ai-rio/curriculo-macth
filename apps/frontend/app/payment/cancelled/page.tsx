/**
 * Payment Cancelled Page
 *
 * Displayed when user cancels Stripe Checkout
 */

'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { translations } from '@/lib/i18n';

export default function PaymentCancelledPage() {
  const router = useRouter();

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <XCircle className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-center text-2xl">{translations.payment.cancelled}</CardTitle>
          <CardDescription className="text-center">
            Você cancelou o processo de pagamento. Nenhuma cobrança foi realizada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Se você encontrou algum problema ou tem dúvidas sobre o pagamento, entre em contato
              conosco.
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={() => router.push('/dashboard')}>Voltar ao Dashboard</Button>
            <Button variant="outline" onClick={() => router.push('/pricing')}>
              Ver Preços
            </Button>
            <Button variant="ghost" onClick={() => router.push('/contact')}>
              Falar com Suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
