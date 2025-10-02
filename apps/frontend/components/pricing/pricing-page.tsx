'use client';

import { CheckCircle, Crown, TrendingUp, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PricingComparison, PricingFAQ } from '@/components/ui/pricing-card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Pricing tiers adapted from our backend service
const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out resume optimization',
    price: 0,
    currency: 'USD',
    interval: 'lifetime' as const,
    features: [
      '1 optimization per month',
      'Basic ATS compatibility score',
      'Local AI processing',
      'Email support',
      'Download results in .txt format',
    ],
    icon: CheckCircle,
    ctaText: 'Get Started Free',
    isFree: true,
  },
  {
    id: 'pro_lifetime',
    name: 'Pro Lifetime',
    description: 'One-time payment for unlimited access',
    price: 2900, // $29.00 in cents
    currency: 'USD',
    interval: 'lifetime' as const,
    features: [
      'Unlimited resume optimizations',
      'Advanced AI models (Claude-3 Sonnet)',
      'Professional resume templates',
      'Export to .docx format',
      'Resume history and analytics',
      'Priority email support',
      'No recurring fees',
    ],
    popular: true,
    icon: Crown,
    ctaText: 'Buy Lifetime Access',
    isFree: false,
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    description: 'Flexible monthly subscription',
    price: 499, // $4.99 in cents
    currency: 'USD',
    interval: 'month' as const,
    features: [
      'Unlimited resume optimizations',
      'Advanced AI models (Claude-3 Sonnet)',
      'Professional resume templates',
      'Export to .docx format',
      'Resume history and analytics',
      'Priority email support',
      'Cancel anytime',
    ],
    icon: TrendingUp,
    ctaText: 'Start Monthly Plan',
    isFree: false,
  },
];

// Stats for social proof
const STATS = [
  { label: 'Resumes Optimized', value: '10,000+', icon: Zap },
  { label: 'Success Rate', value: '87%', icon: CheckCircle },
  { label: 'Happy Users', value: '2,500+', icon: Users },
];

export default function PricingPage() {
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Check if user is authenticated and get current plan
  useEffect(() => {
    // This would check user authentication status
    // For now, we'll simulate it
    const checkAuthStatus = async () => {
      try {
        // TODO: Replace with actual auth check
        // const { data: user } = await supabase.auth.getUser()
        // setCurrentPlanId(user?.user_metadata?.subscription_tier || 'free')
        // setUserEmail(user?.email || null)
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuthStatus();
  }, []);

  const handleUpgrade = async (tier: any) => {
    setIsLoading(true);

    try {
      if (tier.isFree) {
        // Redirect to signup for free plan
        window.location.href = '/auth/signup?plan=free';
      } else {
        // Handle paid plan upgrade
        // TODO: Integrate with your payment service
        console.log('Upgrading to:', tier);

        // For development, show an alert
        alert(`This would redirect to Stripe checkout for ${tier.name}`);

        // In production:
        // const { sessionId, url } = await createCheckoutSession({
        //   tier: tier.id,
        //   userId: user.id,
        //   customerEmail: user.email
        // })
        // window.location.href = url
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            🚀 Special Launch Offer
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Optimize Your Resume,
            <br />
            <span className="text-primary">Land Your Dream Job</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop getting rejected by ATS systems. Our AI-powered tool helps you create the perfect
            resume that passes automated screening and gets you interviews.
          </p>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {STATS.map((stat, index) => (
              <div key={index} className="flex items-center justify-center gap-2">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => handleUpgrade(PRICING_TIERS[0])}
            >
              Start Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
              onClick={() => handleUpgrade(PRICING_TIERS[1])}
            >
              Buy Lifetime ($29)
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more power
            </p>
          </div>

          <PricingComparison
            tiers={PRICING_TIERS}
            currentPlanId={currentPlanId || undefined}
            onUpgrade={handleUpgrade}
            isLoading={isLoading}
          />

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Secure payment via Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Resume-Matcher?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by recruiters, for job seekers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  <CardTitle>AI-Powered</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced AI models analyze your resume against job descriptions and provide
                  specific, actionable improvements.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <CardTitle>ATS Optimized</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Beat applicant tracking systems with optimized formatting and keyword placement
                  that gets you past automated screening.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <CardTitle>Real Results</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  87% success rate with users landing interviews within 2 weeks of using our
                  optimized resumes.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <PricingFAQ />
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of job seekers who have optimized their resumes with Resume-Matcher
          </p>
          <Button
            size="lg"
            className="text-lg px-8"
            onClick={() => handleUpgrade(PRICING_TIERS[0])}
          >
            Get Started Free
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 1 free optimization per month
          </p>
        </div>
      </section>
    </div>
  );
}
