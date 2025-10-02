'use client';

import { Check, Crown, Sparkles, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Pricing tier types adapted from QuoteKit
export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime';
  features: string[];
  popular?: boolean;
  icon?: React.ComponentType<any>;
  ctaText: string;
  stripePriceId?: string;
  isFree?: boolean;
  savings?: number;
}

interface PricingCardProps {
  tier: PricingTier;
  onUpgrade?: (tier: PricingTier) => void;
  isCurrentPlan?: boolean;
  isLoading?: boolean;
  className?: string;
}

// Icon components for different tiers
const FreeIcon = Star;
const ProLifetimeIcon = Crown;
const ProMonthlyIcon = Zap;

export function PricingCard({
  tier,
  onUpgrade,
  isCurrentPlan = false,
  isLoading = false,
  className,
}: PricingCardProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  // Determine the icon for this tier
  const IconComponent =
    tier.id === 'free' ? FreeIcon : tier.id === 'pro_lifetime' ? ProLifetimeIcon : ProMonthlyIcon;

  // Format price display
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const getIntervalLabel = () => {
    switch (tier.interval) {
      case 'month':
        return '/month';
      case 'year':
        return '/year';
      case 'lifetime':
        return 'one-time';
      default:
        return '';
    }
  };

  const getSavingsText = () => {
    if (tier.savings && tier.savings > 0) {
      return `Save ${formatPrice(tier.savings, tier.currency)} annually`;
    }
    return null;
  };

  const handleUpgrade = () => {
    if (onUpgrade && !isLoading) {
      onUpgrade(tier);
    }
  };

  return (
    <TooltipProvider>
      <Card
        className={cn(
          'relative w-full max-w-sm transition-all duration-300 hover:shadow-lg',
          tier.popular && 'ring-2 ring-primary ring-offset-2 scale-105',
          isCurrentPlan && 'ring-2 ring-green-500 ring-offset-2',
          className
        )}
      >
        {/* Popular badge */}
        {tier.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-medium rounded-full">
              Most Popular
            </Badge>
          </div>
        )}

        {/* Current plan badge */}
        {isCurrentPlan && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-green-500 text-white px-3 py-1 text-sm font-medium rounded-full">
              Current Plan
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-2">
            <IconComponent className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
          <CardDescription className="text-muted-foreground">{tier.description}</CardDescription>
        </CardHeader>

        <CardContent className="text-center pb-6">
          {/* Price Display */}
          <div className="mb-6">
            {!tier.isFree ? (
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{formatPrice(tier.price, tier.currency)}</span>
                <span className="text-lg text-muted-foreground">{getIntervalLabel()}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold">Free</span>
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
            )}

            {/* Savings indicator for annual plans */}
            {getSavingsText() && (
              <p className="text-sm text-green-600 mt-2 font-medium">{getSavingsText()}</p>
            )}
          </div>

          {/* Features List */}
          <div className="space-y-3">
            {tier.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-left leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>

        <Separator className="mb-6" />

        <CardFooter className="pt-0">
          <Button
            className={cn(
              'w-full h-12 font-semibold transition-all duration-200',
              tier.isFree
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                : tier.popular
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
            )}
            onClick={handleUpgrade}
            disabled={isLoading || isCurrentPlan}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : isCurrentPlan ? (
              'Current Plan'
            ) : tier.isFree ? (
              'Get Started'
            ) : (
              tier.ctaText
            )}
          </Button>

          {!tier.isFree && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Secure payment via Stripe
            </p>
          )}
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

// Pricing comparison component
interface PricingComparisonProps {
  tiers: PricingTier[];
  currentPlanId?: string;
  onUpgrade: (tier: PricingTier) => void;
  isLoading?: boolean;
  className?: string;
}

export function PricingComparison({
  tiers,
  currentPlanId,
  onUpgrade,
  isLoading = false,
  className,
}: PricingComparisonProps) {
  return (
    <div className={cn('grid gap-8 md:grid-cols-3 lg:gap-8', className)}>
      {tiers.map((tier) => (
        <PricingCard
          key={tier.id}
          tier={tier}
          isCurrentPlan={tier.id === currentPlanId}
          onUpgrade={onUpgrade}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

// FAQ component for pricing
interface PricingFAQProps {
  className?: string;
}

export function PricingFAQ({ className }: PricingFAQProps) {
  const faqs = [
    {
      question: 'Can I switch between plans?',
      answer:
        'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
    },
    {
      question: "What's included in the free plan?",
      answer:
        'The free plan includes 1 resume optimization per month with basic ATS scoring and local AI processing.',
    },
    {
      question: 'How does the lifetime deal work?',
      answer: 'Pay once ($29) and get unlimited resume optimization forever. No recurring fees.',
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your monthly subscription at any time. No questions asked.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, debit cards, and other payment methods through Stripe.',
    },
  ];

  return (
    <div className={cn('max-w-3xl mx-auto space-y-6', className)}>
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Frequently Asked Questions</h3>
        <p className="text-muted-foreground">Got questions? We&apos;re here to help.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-6">
            <h4 className="font-semibold mb-2">{faq.question}</h4>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Still have questions?{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
