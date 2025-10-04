'use client';

import React from 'react';

import {
  CelebrationCallout,
  ChallengeCallout,
  ErrorCallout,
  InfoCallout,
  MotivationCallout,
  QuestCallout,
  RewardCallout,
  SuccessCallout,
  TipCallout,
  WarningCallout,
} from './callouts';
import { FAQAccordion } from './faq';
import { KeyTakeaways, TLDR } from './key-takeaways';
import TableOfContents from './table-of-contents';

/**
 * Test component to demonstrate all blog components
 * This should be used only for development/testing purposes
 */
export default function BlogComponentsTest() {
  const faqItems = [
    {
      id: 'faq-1',
      question: 'What is the Resume-Matcher platform?',
      answer:
        'Resume-Matcher is an AI-powered SaaS platform that helps Brazilian professionals optimize their résumés to better match job descriptions and improve their chances with ATS systems.',
    },
    {
      id: 'faq-2',
      question: 'How does the AI optimization work?',
      answer:
        'Our AI analyzes your résumé alongside the job description, identifies gaps and areas for improvement, and provides specific recommendations to better align your skills and experience with the position requirements.',
    },
    {
      id: 'faq-3',
      question: 'Is my data secure and private?',
      answer:
        'Yes, we take data privacy seriously. All data is encrypted and stored securely in compliance with LGPD (Brazilian data privacy law). We never share your personal information with third parties.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Blog Components Test</h1>

      {/* Callouts Test */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Callout Components</h2>

        <InfoCallout>
          This is an info callout. It provides general information and contextual details for the
          reader.
        </InfoCallout>

        <WarningCallout>
          This is a warning callout. Use it to alert readers about potential issues or important
          considerations.
        </WarningCallout>

        <SuccessCallout>
          This is a success callout. Perfect for highlighting positive outcomes or achievements.
        </SuccessCallout>

        <ErrorCallout>
          This is an error callout. Use it to indicate problems, errors, or critical issues that
          need attention.
        </ErrorCallout>

        <TipCallout>
          This is a tip callout. Great for providing pro tips, best practices, or helpful advice.
        </TipCallout>

        <CelebrationCallout>
          This is a celebration callout. Perfect for highlighting achievements, milestones, or
          success stories.
        </CelebrationCallout>

        <ChallengeCallout>
          This is a challenge callout. Use it to present challenges, obstacles, or areas that
          require effort to overcome.
        </ChallengeCallout>

        <MotivationCallout>
          This is a motivation callout. Perfect for inspirational content, encouragement, and
          motivation.
        </MotivationCallout>

        <QuestCallout>
          This is a quest callout. Use it to present learning journeys, step-by-step processes, or
          exploration paths.
        </QuestCallout>

        <RewardCallout>
          This is a reward callout. Perfect for highlighting benefits, rewards, or positive outcomes
          of taking action.
        </RewardCallout>
      </section>

      {/* Key Takeaways Test */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Key Takeaways Component</h2>

        <KeyTakeaways
          items={[
            'Callout components provide visual hierarchy and emphasis for important content',
            'Table of Contents component improves navigation for long-form content',
            'Key Takeaways help readers quickly understand the main points',
            'FAQ components address common questions and improve user experience',
            'All components are fully accessible and responsive',
          ]}
        />

        <TLDR>
          These components enhance the blog reading experience with better organization, visual
          appeal, and accessibility.
        </TLDR>
      </section>

      {/* FAQ Test */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">FAQ Component</h2>

        <FAQAccordion
          items={faqItems}
          title="Frequently Asked Questions"
          description="Find answers to common questions about the Resume-Matcher platform"
          allowMultipleOpen={true}
        />
      </section>

      {/* Sample Content for TOC */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Sample Headings for Table of Contents</h2>

        <div className="space-y-6">
          <h1 id="introduction" className="text-xl font-bold">
            Introduction
          </h1>
          <p>This is the introduction content where we welcome readers to the article.</p>

          <h2 id="getting-started" className="text-lg font-semibold">
            Getting Started
          </h2>
          <p>Learn how to get started with the Resume-Matcher platform and optimize your résumé.</p>

          <h3 id="creating-account" className="text-base font-medium">
            Creating an Account
          </h3>
          <p>Step-by-step guide to creating your account and setting up your profile.</p>

          <h3 id="uploading-resume" className="text-base font-medium">
            Uploading Your Résumé
          </h3>
          <p>How to upload and format your résumé for the best results.</p>

          <h2 id="ai-optimization" className="text-lg font-semibold">
            AI Optimization Features
          </h2>
          <p>Explore the powerful AI features that help optimize your résumé.</p>

          <h3 id="job-matching" className="text-base font-medium">
            Job Matching Algorithm
          </h3>
          <p>Understand how our algorithm matches your résumé to job descriptions.</p>

          <h3 id="improvement-suggestions" className="text-base font-medium">
            Improvement Suggestions
          </h3>
          <p>Get actionable suggestions to improve your résumé's effectiveness.</p>

          <h2 id="best-practices" className="text-lg font-semibold">
            Best Practices
          </h2>
          <p>Learn the best practices for résumé writing and optimization.</p>

          <h2 id="conclusion" className="text-lg font-semibold">
            Conclusion
          </h2>
          <p>Summarize what we've learned and next steps for your career journey.</p>
        </div>
      </section>

      {/* Table of Contents should appear after content */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Table of Contents Component</h2>

        <TableOfContents
          title="Article Navigation"
          subtitle="Jump to any section of this article"
          enableScrollTracking={true}
        />
      </section>
    </div>
  );
}
