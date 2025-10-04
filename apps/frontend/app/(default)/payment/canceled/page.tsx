'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentCanceledPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get session ID from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    setSessionId(urlParams.get('session_id'));
  }, []);

  const handleTryAgain = () => {
    router.push('/optimize');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-red-50 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto p-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-yellow-800">Payment Canceled</CardTitle>
            <CardDescription className="text-yellow-700">
              Your payment has been canceled. No charges were made to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cancellation Notice */}
            <div className="rounded-lg bg-white p-4 border border-yellow-200">
              <h3 className="font-semibold text-gray-900 mb-2">What Happened?</h3>
              <p className="text-sm text-gray-600">
                The payment process was interrupted or canceled. This could happen if:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc">
                <li>You closed the payment window</li>
                <li>Your browser navigated away from the payment page</li>
                <li>You clicked the "Cancel" button during payment</li>
                <li>There was a temporary issue with the payment processor</li>
              </ul>
            </div>

            {/* Reassurance */}
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">No Worries!</h3>
              <p className="text-sm text-blue-800">
                Your payment information is secure and no charges were made. You can try again
                whenever you're ready.
              </p>
            </div>

            {/* Session Info (if available) */}
            {sessionId && (
              <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Session Details</h3>
                <div className="text-sm text-gray-600">
                  <p>
                    Session ID: <span className="font-mono">{sessionId.slice(0, 8)}...</span>
                  </p>
                  <p className="mt-1">Status: Canceled</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleTryAgain}
                size="lg"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Try Payment Again
              </Button>
              <Button
                variant="outline"
                onClick={handleGoHome}
                size="lg"
                className="flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Go Home
              </Button>
            </div>

            {/* Support Info */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>
                If you experienced any technical issues or have questions about payment, please
                contact our support team at support@resumematcher.com
              </p>
              <p className="mt-1">We're here to help you get your resume optimized!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
