'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Crown,
  Zap,
  Calendar,
  CreditCard as CreditCardIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Types adapted from our backend service
interface SubscriptionData {
  profile: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    is_pro: boolean;
    subscription_status: 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';
    subscription_tier: 'free' | 'lifetime' | 'monthly';
    subscription_expires_at: string | null;
  };
  subscription?: {
    id: string;
    stripe_subscription_id: string | null;
    stripe_customer_id: string | null;
    status:
      | 'trialing'
      | 'active'
      | 'canceled'
      | 'incomplete'
      | 'incomplete_expired'
      | 'past_due'
      | 'unpaid'
      | 'paused';
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    created_at: string;
    updated_at: string;
    canceled_at: string | null;
    trial_start: string | null;
    trial_end: string | null;
  };
  usage: {
    free_optimizations_used: number;
    paid_optimizations_used: number;
  };
  tier: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'month' | 'year' | 'lifetime';
    features: string[];
    isFree: boolean;
  };
  remainingOptimizations: number;
  isPro: boolean;
}

interface UsageAnalytics {
  totalOptimizations: number;
  freeOptimizations: number;
  paidOptimizations: number;
  lastOptimizationAt: string | null;
  currentMonthUsage: number;
  thisMonthFree: number;
  thisMonthPaid: number;
}

export default function SubscriptionManager() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [usageAnalytics, setUsageAnalytics] = useState<UsageAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showBilling, setShowBilling] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/subscription')
      // const data = await response.json()

      // Mock data for development
      const mockData: SubscriptionData = {
        profile: {
          user_id: 'user_123',
          full_name: 'John Doe',
          avatar_url: null,
          is_pro: true,
          subscription_status: 'active',
          subscription_tier: 'lifetime',
          subscription_expires_at: null,
        },
        usage: {
          free_optimizations_used: 1,
          paid_optimizations_used: 15,
        },
        tier: {
          id: 'pro_lifetime',
          name: 'Pro Lifetime',
          description: 'Unlimited resume optimization',
          price: 2900,
          currency: 'USD',
          interval: 'lifetime',
          features: ['Unlimited optimizations', 'Advanced AI', 'Templates'],
          isFree: false,
        },
        remainingOptimizations: -1, // Unlimited for pro users
        isPro: true,
      };

      setSubscriptionData(mockData);

      // Mock usage analytics
      const mockAnalytics: UsageAnalytics = {
        totalOptimizations: 16,
        freeOptimizations: 1,
        paidOptimizations: 15,
        lastOptimizationAt: '2024-01-15T10:30:00Z',
        currentMonthUsage: 5,
        thisMonthFree: 0,
        thisMonthPaid: 5,
      };

      setUsageAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (tier: 'lifetime' | 'monthly') => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual upgrade API call
      console.log('Upgrading to:', tier);
      alert(
        `This would upgrade you to ${tier === 'lifetime' ? 'Pro Lifetime' : 'Pro Monthly'} plan`
      );
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setIsCancelling(true);
      // TODO: Replace with actual cancel API call
      console.log('Cancelling subscription');
      alert('This would cancel your subscription');
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Cancel failed:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSubscriptionStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="p-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load subscription information. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Your Subscription</CardTitle>
              <CardDescription>Manage your Resume-Matcher subscription and usage</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {subscriptionData.isPro ? (
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="h-4 w-4 mr-1" />
                  Pro
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Users className="h-4 w-4 mr-1" />
                  Free
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Details */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{subscriptionData.tier.name}</h3>
              <p className="text-sm text-muted-foreground">{subscriptionData.tier.description}</p>
            </div>
            <div className="text-right">
              {!subscriptionData.tier.isFree && (
                <div className="text-2xl font-bold">
                  ${(subscriptionData.tier.price / 100).toFixed(2)}
                  <span className="text-sm text-muted-foreground">
                    {subscriptionData.tier.interval === 'lifetime' ? 'one-time' : '/month'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Usage Statistics */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Monthly Usage</span>
                <span className="text-sm text-muted-foreground">
                  {usageAnalytics?.thisMonthFree || 0} free / {usageAnalytics?.thisMonthPaid || 0}{' '}
                  paid
                </span>
              </div>
              <Progress value={usageAnalytics?.thisMonthPaid || 0} max={1} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {subscriptionData.isPro
                  ? 'Unlimited optimizations with Pro plan'
                  : `1 free optimization per month (${subscriptionData.remainingOptimizations} remaining)`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {usageAnalytics?.totalOptimizations || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Optimizations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {usageAnalytics?.lastOptimizationAt
                    ? new Date(usageAnalytics.lastOptimizationAt).toLocaleDateString()
                    : 'Never'}
                </div>
                <div className="text-xs text-muted-foreground">Last Optimization</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{subscriptionData.tier.features.length}</div>
                <div className="text-xs text-muted-foreground">Features Included</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!subscriptionData.isPro && (
              <Button
                className="flex-1"
                onClick={() => handleUpgrade('lifetime')}
                disabled={isLoading}
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}

            <Sheet open={showBilling} onOpenChange={setShowBilling}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Billing History
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Billing History</SheetTitle>
                </SheetHeader>
                <div className="p-6">
                  <p className="text-muted-foreground">
                    Billing history and payment receipts will be shown here.
                  </p>
                </div>
              </SheetContent>
            </Sheet>

            {subscriptionData.isPro && (
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="text-red-600 hover:text-red-700"
              >
                {isCancelling ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    Canceling...
                  </div>
                ) : (
                  'Cancel Plan'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features Included */}
      <Card>
        <CardHeader>
          <CardTitle>Features Included</CardTitle>
          <CardDescription>Everything you get with your current plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscriptionData.tier.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan Options */}
      {!subscriptionData.isPro && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Options</CardTitle>
            <CardDescription>
              Unlock unlimited resume optimization and advanced features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-2 border-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Pro Lifetime</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-primary mb-2">
                    $29
                    <span className="text-sm text-muted-foreground ml-1">one-time</span>
                  </div>
                  <ul className="text-sm space-y-2 mb-4">
                    <li>• Unlimited optimizations</li>
                    <li>• Advanced AI models</li>
                    <li>• Professional templates</li>
                    <li>• Priority support</li>
                  </ul>
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade('lifetime')}
                    disabled={isLoading}
                  >
                    Get Lifetime Access
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-muted">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Pro Monthly</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold mb-2">
                    $4.99
                    <span className="text-sm text-muted-foreground ml-1">/month</span>
                  </div>
                  <ul className="text-sm space-y-2 mb-4">
                    <li>• Unlimited optimizations</li>
                    <li>• Advanced AI models</li>
                    <li>• Professional templates</li>
                    <li>• Cancel anytime</li>
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleUpgrade('monthly')}
                    disabled={isLoading}
                  >
                    Start Monthly Plan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
