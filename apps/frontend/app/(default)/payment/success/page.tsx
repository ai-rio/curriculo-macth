'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<{
    sessionId?: string;
    tier?: string;
    amount?: string;
  } | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const tier = searchParams.get('tier');

    if (sessionId || tier) {
      setPaymentInfo({
        sessionId: sessionId || undefined,
        tier: tier || undefined,
        amount: tier === 'free' ? 'Free' : '$19.99',
      });
    }

    // Simulate payment verification
    setTimeout(() => {
      setIsVerifying(false);
    }, 2000);
  }, [searchParams]);

  const handleStartOptimization = () => {
    router.push('/optimize');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-green-600" />
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">Verifying Payment</h2>
                <p className="text-muted-foreground">
                  Please wait while we confirm your payment...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto p-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
            <CardDescription className="text-green-700">
              Your payment has been processed successfully. You can now start optimizing your
              resume.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Details */}
            {paymentInfo && (
              <div className="rounded-lg bg-white p-4 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">AI Resume Optimization</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-medium">{paymentInfo.amount}</span>
                  </div>
                  {paymentInfo.sessionId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-mono text-xs">
                        {paymentInfo.sessionId.slice(0, 8)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload your current resume (PDF or DOCX)</li>
                <li>• Provide the job description you're targeting</li>
                <li>• Our AI will optimize your resume in 2-3 minutes</li>
                <li>• Download your optimized, ATS-friendly resume</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleStartOptimization}
                size="lg"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Start Resume Optimization
              </Button>
              <Button variant="outline" onClick={handleGoHome} size="lg">
                Go Home
              </Button>
            </div>

            {/* Support Info */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>A confirmation email has been sent to your registered email address.</p>
              <p className="mt-1">
                Need help? Contact our support team at support@resumematcher.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
