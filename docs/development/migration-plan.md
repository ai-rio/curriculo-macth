# Migration Plan: QuoteKit & Creator-Flow → Resume-Matcher

## Overview

This document outlines the phased approach to migrating mature implementations from QuoteKit and creator-flow projects into Resume-Matcher to accelerate MVP development.

**Migration Date Started:** 2025-09-29
**Target Completion:** 8 weeks from start
**Status:** In Progress

---

## Source Projects Analysis

### QuoteKit (Primary Source)

- **Tech Stack:** Next.js 15+, TypeScript, Supabase, Stripe, PostHog, React Email
- **Maturity:** Production-ready SaaS with 6+ months of refinement
- **Key Features:**
  - Complete Stripe integration (checkout, webhooks, subscription management)
  - MDX blog system with SEO optimization
  - Comprehensive Supabase setup (auth, DB, storage, edge functions)
  - PostHog + Vercel Analytics
  - React Email templates + Resend integration
  - Extensive test coverage (Jest, Playwright)
  - Git workflow automation scripts

### Creator-Flow (Secondary Source)

- **Tech Stack:** Next.js 15+, TypeScript, Supabase, Stripe, i18n (Tolgee)
- **Key Features:**
  - Internationalization (pt-BR, es, en)
  - Modern UI patterns with Framer Motion
  - Git workflow scripts similar to QuoteKit
  - Stripe integration patterns

---

## Phase 1: Foundation & Tooling ✅ (~80% Complete)

**Timeline:** Week 1
**Status:** Mostly Complete

### Completed ✅

- [x] Monorepo structure (apps/frontend, apps/backend)
- [x] Bun package manager setup
- [x] UV Python environment setup
- [x] ESLint + Prettier configuration
- [x] Husky git hooks
- [x] Git workflow scripts (git:status, git:wip, git:save, etc.)
- [x] Type checking scripts (frontend + backend)
- [x] Basic dev/build/start scripts

### Remaining Tasks 🔄

- [ ] **CI/CD Workflows** - Create `.github/workflows/`
  - [ ] Lint & Type Check workflow
  - [ ] Test workflow (frontend + backend)
  - [ ] Build verification workflow
  - [ ] Deploy preview workflow (Vercel)
- [ ] **Shared Types Package** - Create `packages/shared-types/`
  - [ ] Set up package structure
  - [ ] Migrate common types from QuoteKit
  - [ ] Configure TypeScript path aliases
- [ ] **Enhanced Testing Setup**
  - [ ] Jest configuration (migrate from QuoteKit)
  - [ ] Playwright configuration
  - [ ] Pytest configuration (backend)

### Migration Sources

- **QuoteKit:**
  - `.github/workflows/*` → CI/CD patterns
  - `jest.config.js`, `jest.setup.js`
  - `playwright.config.ts`
  - Git scripts (already done ✅)

---

## Phase 2: Supabase Integration 🎯 NEXT

**Timeline:** Week 2
**Status:** Not Started

### Tasks

- [ ] **Supabase Project Setup**
  - [ ] Link Supabase project (`supabase link`)
  - [ ] Configure environment variables (`.env.example`)
  - [ ] Set up Supabase client utilities
- [ ] **Database Schema**
  - [ ] Migrate `profiles` table from architecture.md
  - [ ] Migrate `optimizations` table from architecture.md
  - [ ] Create RLS policies (LGPD compliant)
  - [ ] Add database indexes
- [ ] **Authentication**
  - [ ] Sign up flow
  - [ ] Login flow
  - [ ] Password reset flow
  - [ ] Session management
  - [ ] Protected routes middleware
- [ ] **File Storage**
  - [ ] Configure storage bucket for résumés
  - [ ] Set up RLS policies for storage
  - [ ] Create upload utilities
  - [ ] Implement file type validation (PDF, DOCX)
- [ ] **Edge Functions** (Optional for MVP)
  - [ ] Evaluate need vs serverless functions

### Migration Sources

- **QuoteKit:**
  - `supabase/migrations/*.sql` → Database patterns
  - `supabase/config.toml`
  - `src/libs/supabase/` → Client setup, auth utilities
  - Supabase RLS policies
- **Architecture.md:**
  - Database schema (Section 9)
  - File storage requirements

### Success Criteria

- ✅ User can sign up with email/password
- ✅ User can log in and maintain session
- ✅ User can reset password via email
- ✅ User can upload résumé file (PDF/DOCX)
- ✅ Files are securely stored with proper RLS
- ✅ All database operations are type-safe

---

## Phase 3: Stripe Payment Integration

**Timeline:** Week 3
**Status:** Not Started

### Tasks

- [ ] **Stripe Setup**
  - [ ] Configure Stripe API keys (test mode)
  - [ ] Set up Stripe client utilities
  - [ ] Create Stripe webhook endpoint
  - [ ] Configure webhook signing secret
- [ ] **Checkout Flow**
  - [ ] Create checkout session endpoint
  - [ ] Implement payment UI (Stripe Checkout)
  - [ ] Handle payment success redirect
  - [ ] Handle payment cancellation
- [ ] **Webhook Handling**
  - [ ] `checkout.session.completed` handler
  - [ ] `payment_intent.succeeded` handler
  - [ ] Update `optimizations` table on payment success
  - [ ] Trigger AI processing after payment
- [ ] **Payment Verification Service**
  - [ ] Backend service to verify payments
  - [ ] Link payment to optimization job
  - [ ] Handle payment failures gracefully

### Migration Sources

- **QuoteKit:**
  - `src/libs/stripe/stripe-admin.ts` → Stripe utilities
  - `src/app/api/webhooks/route.ts` → Webhook handling patterns
  - Checkout flow components
- **Creator-Flow:**
  - `src/libs/stripe/config.ts` → Configuration patterns

### Success Criteria

- ✅ User can initiate checkout after résumé upload
- ✅ Payment is processed via Stripe Checkout
- ✅ Webhook updates optimization status
- ✅ AI processing starts only after confirmed payment
- ✅ Payment errors are handled gracefully

---

## Phase 4: Core Features (AI Optimization)

**Timeline:** Weeks 4-5
**Status:** Not Started

### Tasks

- [ ] **Résumé Upload Component**
  - [ ] File upload UI with drag-and-drop
  - [ ] File validation (type, size: 2MB)
  - [ ] Progress indicator
  - [ ] Error handling
- [ ] **Job Description Input**
  - [ ] Text area component
  - [ ] Character count (50-5000 chars)
  - [ ] Input validation
- [ ] **AI Optimization Service (Backend)**
  - [ ] OpenRouter API integration
  - [ ] Prompt engineering for résumé optimization
  - [ ] Text extraction (PDF/DOCX → plain text)
  - [ ] DOCX generation from optimized text
  - [ ] Storage of optimized résumé
- [ ] **Results Page**
  - [ ] Polling mechanism for job status
  - [ ] Display optimized résumé text
  - [ ] Download button for .docx file
  - [ ] Error state handling
- [ ] **Backend API Endpoints**
  - [ ] `POST /api/optimizations` - Create optimization job
  - [ ] `GET /api/optimizations/:id` - Get job status/result
  - [ ] JWT validation middleware

### Migration Sources

- **Architecture.md:**
  - Core workflow (Section 8)
  - API specification (Section 5)
- **QuoteKit:**
  - File upload patterns
  - API route handlers
  - Loading states

### Success Criteria

- ✅ End-to-end workflow: Upload → Pay → AI → Download
- ✅ User receives optimized résumé in .docx format
- ✅ All error scenarios are handled gracefully
- ✅ Processing status is visible to user

---

## Phase 5: Enhanced Features

**Timeline:** Week 6
**Status:** Not Started

### Tasks

- [ ] **MDX Blog System**
  - [ ] Migrate blog directory structure
  - [ ] Set up MDX processing (next-mdx-remote)
  - [ ] Create blog post components
  - [ ] Implement blog listing page
  - [ ] Add SEO metadata
  - [ ] Create sample posts (e.g., "How to optimize your résumé")
- [ ] **Analytics**
  - [ ] PostHog setup (client + server)
  - [ ] Track key events (signup, payment, download)
  - [ ] Vercel Analytics integration
  - [ ] Privacy-compliant tracking (LGPD)
- [ ] **Email System**
  - [ ] React Email templates
  - [ ] Resend integration
  - [ ] Welcome email
  - [ ] Payment confirmation email
  - [ ] Password reset email
  - [ ] Optimization complete email
- [ ] **Admin Features** (Optional)
  - [ ] Admin dashboard
  - [ ] View all optimizations
  - [ ] User management

### Migration Sources

- **QuoteKit:**
  - `src/app/blog/` → Blog structure
  - `content/` → Blog content examples
  - `scripts/blog-*.ts` → Blog automation scripts
  - `src/libs/posthog/` → Analytics setup
  - `src/features/emails/` → Email templates
  - `src/libs/resend/` → Email sending utilities

### Success Criteria

- ✅ Blog is functional with SEO optimization
- ✅ Key user events are tracked
- ✅ Users receive automated emails
- ✅ Admin can view system metrics (if implemented)

---

## Phase 6: Testing & Polish

**Timeline:** Weeks 7-8
**Status:** Not Started

### Tasks

- [ ] **Unit Tests**
  - [ ] Frontend: React components (Jest + RTL)
  - [ ] Backend: Services, utilities (Pytest)
  - [ ] Target: 80%+ coverage for critical paths
- [ ] **Integration Tests**
  - [ ] API endpoint tests
  - [ ] Database interaction tests
  - [ ] Stripe webhook tests (mocked)
  - [ ] OpenRouter API tests (mocked)
- [ ] **E2E Tests (Playwright)**
  - [ ] Complete user journey: Signup → Upload → Pay → Download
  - [ ] Error scenarios (failed payment, invalid file)
  - [ ] Password reset flow
  - [ ] Responsive design tests
- [ ] **Performance Optimization**
  - [ ] Frontend bundle analysis
  - [ ] Image optimization
  - [ ] Database query optimization
  - [ ] API response time improvements
- [ ] **Security & Compliance**
  - [ ] Security audit (XSS, CSRF, SQL injection)
  - [ ] LGPD compliance review
  - [ ] Penetration testing (optional)
  - [ ] Secrets rotation

### Migration Sources

- **QuoteKit:**
  - `tests/` → E2E test patterns
  - `src/**/__tests__/` → Unit test examples
  - `scripts/security-audit-simple.sh`

### Success Criteria

- ✅ 80%+ test coverage on critical paths
- ✅ All E2E scenarios pass
- ✅ Performance metrics meet targets (Lighthouse > 90)
- ✅ Security vulnerabilities addressed
- ✅ LGPD compliance verified

---

## Risk Mitigation

### High-Risk Areas

1. **Stripe Webhooks** - Ensure idempotency, handle retries
2. **AI Service Costs** - Monitor OpenRouter usage, set rate limits
3. **File Storage** - Implement proper cleanup, storage limits
4. **LGPD Compliance** - Legal review of data handling

### Rollback Strategy

- Each phase has clear success criteria
- Use feature flags for gradual rollout
- Maintain separate staging environment
- Keep source projects intact until full migration

---

## Dependencies & Prerequisites

### External Services

- [ ] Supabase project created
- [ ] Stripe account (test mode)
- [ ] OpenRouter API key
- [ ] Resend account (email)
- [ ] PostHog account (analytics)
- [ ] Vercel project created

### Local Development

- [x] Bun installed
- [x] UV installed
- [ ] Docker (for local Supabase)
- [ ] Stripe CLI (for webhook testing)

---

## Success Metrics

### Phase Completion

- Each phase must meet 100% of success criteria before proceeding
- All tests must pass before merging to main

### MVP Launch Criteria

- ✅ All core features functional (Phases 1-4)
- ✅ Test coverage > 80% on critical paths
- ✅ Security audit complete
- ✅ LGPD compliance verified
- ✅ Performance: Lighthouse score > 90
- ✅ Documentation complete

---

## Next Steps

**Immediate Actions:**

1. Complete remaining Phase 1 tasks (CI/CD, shared types)
2. Set up Supabase project (Phase 2)
3. Create ADR-001 for migration strategy
4. Schedule weekly progress reviews

---

## References

- [PRD](./prd.md)
- [Architecture Document](./architecture.md)
- [Documentation Standards](../standards/DOCUMENTATION_STANDARDS.md)
- [QuoteKit Project](/home/carlos/projects/QuoteKit)
- [Creator-Flow Project](/home/carlos/projects/creator-flow)

---

**Document Status:** Living Document
**Last Updated:** 2025-09-29
**Next Review:** After Phase 2 completion
