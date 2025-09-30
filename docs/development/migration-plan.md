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

## Phase 2: Supabase Integration ✅ Complete

**Timeline:** Week 2
**Status:** ✅ Complete
**Date Completed:** 2025-09-29

### Tasks

- [x] **Supabase Project Setup**
  - [x] Link Supabase project (`supabase link`)
  - [x] Configure environment variables (`.env`)
  - [x] Set up Supabase client utilities
- [x] **Database Schema**
  - [x] Migrate `profiles` table from architecture.md
  - [x] Migrate `optimizations` table from architecture.md
  - [x] Create RLS policies (LGPD compliant)
  - [x] Add database indexes (11 indexes total)
- [x] **Authentication**
  - [x] Supabase Auth configured
  - [x] Session management utilities
  - [x] Protected routes middleware
  - [x] JWT token validation
- [x] **File Storage**
  - [x] Configure storage buckets (`resumes`, `optimized-resumes`)
  - [x] Set up RLS policies for storage
  - [x] Implement file type validation (PDF, DOCX)
  - [x] Configure file size limits (2MB uploads, 5MB outputs)

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

## Phase 2.5: Frontend Infrastructure Setup ✅ Complete

**Timeline:** 8-10 developer-days
**Status:** ✅ Complete
**Date Completed:** 2025-09-30

### Overview

Phase 2.5 establishes critical frontend infrastructure identified as gaps during alignment analysis. These components are required before implementing Stripe payment integration in Phase 3.

### Tasks

#### 1. Shared Types Package (2 days) ✅

- [x] Create `packages/shared-types/` directory structure
- [x] Define database models (Profile, Optimization)
- [x] Define API request/response types
- [x] Define error types and codes
- [x] Configure TypeScript path aliases (`@repo/shared-types`)
- [x] Export all types for frontend/backend consumption

**Example:**

```typescript
// packages/shared-types/src/models.ts
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  data_consent_given: boolean;
  created_at: string;
}

export interface Optimization {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  match_percentage: number | null;
  created_at: string;
}
```

#### 2. Supabase Client & Auth (2 days) ✅

- [x] Create Supabase client utilities (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- [x] Implement auth middleware for protected routes (`lib/supabase/middleware.ts`)
- [x] Add session management utilities (`lib/auth.ts`)
- [x] Create Supabase client factory functions
- [x] Add authentication helper functions

**Example:**

```typescript
// apps/frontend/src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// apps/frontend/src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Protect /dashboard routes
  const supabase = createServerClient(...);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

#### 3. API Client (1 day) ✅

- [x] Implement centralized API client with error handling
- [x] Add request/response error handling
- [x] Configure base URL and default headers
- [x] Add type-safe methods (GET, POST, PUT, DELETE, uploadFile)
- [x] Integrate with Supabase JWT tokens

**Example:**

```typescript
// apps/frontend/src/lib/api.ts
import { ApiError } from '@repo/shared-types';

class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail);
    }

    return response.json();
  }
}

export const api = new ApiClient();
```

#### 4. Internationalization (pt-BR) (1 day) ✅

- [x] Create i18n utilities and constants (`lib/i18n.ts`)
- [x] Add translation objects for all UI text (auth, upload, payment, errors, etc.)
- [x] Add date formatter (DD/MM/YYYY)
- [x] Add currency formatter (R$ 50,00)
- [x] Define formal "você" language guidelines

**Example:**

```typescript
// apps/frontend/src/lib/i18n.ts
export const translations = {
  upload: {
    title: 'Envie seu Currículo',
    dragDrop: 'Clique para selecionar ou arraste seu arquivo aqui',
    formats: 'PDF, DOCX ou TXT (máx. 5MB)',
  },
  payment: {
    button: 'Otimizar Currículo - R$ 50,00',
    processing: 'Processando pagamento...',
  },
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
```

#### 5. shadcn/ui Components (1 day) ✅

- [x] Install shadcn/ui CLI and configure `components.json`
- [x] Add required components: button, card, input, textarea, alert, dialog, progress
- [x] Customize theme colors (zinc base color)
- [x] Add Lucide React icon library
- [x] Test component rendering

**Commands:**

```bash
bunx shadcn-ui@latest init
bunx shadcn-ui@latest add button card input textarea alert dialog progress
```

#### 6. Testing Infrastructure (2 days) ✅

- [x] Configure Jest + React Testing Library
- [x] Add jest-axe for accessibility testing
- [x] Create Jest configuration (`jest.config.js`)
- [x] Add testing dependencies (@testing-library/react, @testing-library/jest-dom, jest-axe)
- [x] Write example component tests (Button component test)
- [x] Configure test coverage reporting

**Example:**

```typescript
// apps/frontend/src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../Button';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  it('should be accessible', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### 7. Environment Configuration (0.5 days) ✅

- [x] Create complete `.env.example` with all frontend variables
- [x] Document each variable's purpose
- [x] Add environment variables for Supabase, Stripe, API URL

**Example:**

```bash
# apps/frontend/.env.example
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Migration Sources

- **QuoteKit:**
  - `src/libs/supabase/` → Supabase client patterns
  - `src/libs/api.ts` → API client implementation
  - `packages/shared-types/` → Type definitions
  - `jest.config.js`, `jest.setup.js` → Testing setup
  - `.env.example` → Environment variable patterns

### Success Criteria

- [x] TypeScript compiles with no errors (`bun run type-check`)
- [x] All imports from `@repo/shared-types` resolve correctly
- [x] Supabase client initializes without errors
- [x] Protected routes redirect to login when unauthenticated (middleware implemented)
- [x] API client can call endpoints with proper error handling
- [x] shadcn/ui components render without styling issues
- [x] Jest tests pass with example component tests
- [x] Accessibility tests pass for base components (jest-axe)
- [x] Brazilian Portuguese formatting works correctly (currency, dates)
- [x] Environment variables load correctly in development
- [x] Pre-commit hooks pass on all new code

### Estimated Effort

**Total:** 8-10 developer-days

**Breakdown:**

- Shared Types: 2 days
- Supabase Auth: 2 days
- API Client: 1 day
- i18n: 1 day
- shadcn/ui: 1 day
- Testing: 2 days
- Environment: 0.5 days

---

## Phase 3: Stripe Payment Integration ✅ Complete

**Timeline:** Week 3
**Status:** ✅ Complete
**Date Completed:** 2025-09-30

### Tasks

- [x] **Stripe Setup**
  - [x] Configure Stripe API keys (production mode)
  - [x] Set up Stripe client utilities (backend + frontend)
  - [x] Create Stripe webhook endpoint
  - [x] Configure webhook signing secret
- [x] **Checkout Flow**
  - [x] Create checkout session endpoint
  - [x] Implement payment UI (Stripe Checkout)
  - [x] Handle payment success redirect
  - [x] Handle payment cancellation
- [x] **Webhook Handling**
  - [x] `checkout.session.completed` handler
  - [x] `payment_intent.succeeded` handler
  - [x] Update `optimizations` table on payment success
  - [x] Idempotency checking with `stripe_webhook_events` table
- [x] **Payment Verification Service**
  - [x] Backend service to verify payments
  - [x] Link payment to optimization job
  - [x] Handle payment failures gracefully

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

## Phase 4: Core Features (AI Optimization) 🎯 NEXT

**Timeline:** Weeks 4-5
**Status:** Not Started
**Priority:** NEXT - Ready to Begin

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
