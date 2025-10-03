# Resume-Matcher Development Prioritization

## Codebase Audit & Implementation Roadmap

**Document Version:** 1.0
**Last Updated:** October 3, 2025
**Status:** 🔴 **Critical Gap Analysis - MVP Not Launch-Ready**

---

## 📊 Executive Summary

**Current Progress:** Infrastructure 85% complete, but **critical user-facing features are 25% complete**

**Key Finding:** Backend services are largely implemented, but **frontend integration is severely incomplete**. Authentication exists as UI-only (no backend wiring), and the core optimization flow is non-functional end-to-end.

**Time to MVP:** **2 weeks** (Weeks 9-10) for MUST HAVE features, **4 weeks total** (Weeks 9-12) for launch-ready product.

---

## ✅ Completed Features (85% Infrastructure)

### **Phase 1: Internationalization** ✅ **100% COMPLETE**

- ✅ next-intl (v4.3.6) configured with locale-based routing
- ✅ 18 translation files covering all pages (9× Portuguese, 9× English)
  - `common.json`, `auth.json`, `dashboard.json`, `pricing.json`, `blog.json`, `errors.json`, `hero.json`, `navigation.json`, `resume.json`
- ✅ Language switcher component ([src/components/ui/language-switcher.tsx](../apps/frontend/src/components/ui/language-switcher.tsx))
- ✅ Locale-based routes: `/pt-br/*`, `/en/*`

**Status:** ✅ **Production-ready** - No blockers

---

### **Phase 2: Blog System** ✅ **100% COMPLETE**

- ✅ 10 MDX blog posts (5 Portuguese, 5 English)
  - Topics: ATS optimization, interview guides, professional networking, job market trends
- ✅ Blog components migrated:
  - `BlogGrid`, `BlogPostHeader`, `BlogSearch`, `PremiumGate`, `BlogAnalytics`
- ✅ CLI automation tools:
  - `create-blog-post.js` - Generate bilingual posts
  - `generate-blog-sitemap.js` - SEO sitemap generation
- ✅ Analytics page for tracking post performance ([app/[locale]/blog/analytics/page.tsx](../apps/frontend/app/[locale]/blog/analytics/page.tsx))

**Status:** ✅ **Production-ready** - SEO and content marketing enabled

---

### **Database Schema** ✅ **100% COMPLETE**

- ✅ 4 migrations deployed:
  1. `20250929000000_initial_schema.sql` - Profiles, optimizations, RLS policies
  2. `20250930000000_stripe_webhook_events.sql` - Payment webhook tracking
  3. `20251001000000_legacy_compat_tables.sql` - Backward compatibility
  4. `20251001000001_quotekit_features_migration.sql` - SaaS features (subscriptions, usage_tracking, payment_history)
- ✅ RLS policies enforcing user data isolation
- ✅ LGPD compliance fields (consent tracking, data retention policies)
- ✅ Indexes for performance optimization

**Tables:**

- `profiles` - User data with subscription status
- `optimizations` - Resume optimization records with payment tracking
- `subscriptions` - Stripe subscription lifecycle management
- `usage_tracking` - Monthly freemium limits per user
- `payment_history` - Transaction records for analytics
- `stripe_products` & `stripe_prices` - Pricing tier metadata
- `stripe_webhook_events` - Idempotent webhook processing

**Status:** ✅ **Production-ready** - Schema supports full SaaS feature set

---

### **Backend API** ✅ **75% COMPLETE**

#### ✅ **Implemented Services:**

- **Authentication Infrastructure:**
  - Supabase client configured ([app/core/supabase_client.py](../apps/backend/app/core/supabase_client.py))
  - Session middleware enabled ([app/base.py:42](../apps/backend/app/base.py#L42))

- **Payment Processing:**
  - Stripe client configured ([app/core/stripe_client.py](../apps/backend/app/core/stripe_client.py))
  - Checkout session creation endpoint ([app/api/router/v1/payments.py:70](../apps/backend/app/api/router/v1/payments.py#L70))
  - Payment verification service ([app/services/payment_verification.py](../apps/backend/app/services/payment_verification.py))
  - Webhook handler for `checkout.session.completed` ([app/api/router/v1/webhooks.py](../apps/backend/app/api/router/v1/webhooks.py))

- **Resume Processing:**
  - File upload endpoint ([app/api/router/v1/resume.py:37](../apps/backend/app/api/router/v1/resume.py#L37))
  - PDF/DOCX → Markdown conversion ([app/services/text_extraction.py](../apps/backend/app/services/text_extraction.py))
  - Resume storage service ([app/services/resume_service.py](../apps/backend/app/services/resume_service.py))
  - DOCX generation for download ([app/services/docx_generation.py](../apps/backend/app/services/docx_generation.py))

- **AI Optimization:**
  - OpenRouter integration ([app/agent/providers/openrouter.py](../apps/backend/app/agent/providers/openrouter.py))
  - Structured prompt engineering ([app/prompt/resume_improvement.py](../apps/backend/app/prompt/resume_improvement.py))
  - Paid optimization service ([app/services/paid_resume_improvement_service.py](../apps/backend/app/services/paid_resume_improvement_service.py))
  - Job keyword extraction ([app/services/job_service.py](../apps/backend/app/services/job_service.py))

#### ❌ **Missing Backend:**

- ❌ Usage tracking enforcement middleware (database table exists but not used in API routes)
- ❌ Freemium limit checks before optimization
- ❌ User profile creation endpoint (auth callback)
- ❌ Optimization history API for dashboard

**Status:** ⚠️ **Backend mostly ready, missing integration hooks**

---

## 🔴 Critical Gaps (Blocking MVP Launch)

### **M1: User Authentication** ❌ **20% COMPLETE**

**What Exists:**

- ✅ Login/Signup UI pages with forms ([app/[locale]/login/page.tsx](../apps/frontend/app/[locale]/login/page.tsx))
- ✅ AuthContext with Supabase listener ([contexts/AuthContext.tsx](../apps/frontend/contexts/AuthContext.tsx))
- ✅ Translation files for auth flows

**Critical Missing:**

- 🔴 **Login form has NO submit handler** - Form doesn't call Supabase Auth API
- 🔴 **Signup form not wired to backend** - No account creation flow
- 🔴 **No profile creation after signup** - Users created in `auth.users` but not in `public.profiles`
- 🔴 **No protected routes** - Dashboard accessible without authentication
- 🔴 **No password reset flow** - Can't recover accounts
- 🔴 **No session persistence** - Page refresh logs users out

**Blockers:**

- Can't test any user flows without working authentication
- Can't enforce freemium limits without identifying users
- Can't process payments without authenticated sessions

**Estimated Fix Time:** ⏱️ **2-3 days**

**Implementation Tasks:**

1. Wire login form to `supabase.auth.signInWithPassword()`
2. Implement signup flow with profile creation trigger
3. Add password reset UI + email templates
4. Create protected route middleware
5. Test session persistence across page reloads

---

### **M2: Freemium Feature Gating** ❌ **0% COMPLETE**

**What Exists:**

- ✅ Database table `usage_tracking` with monthly limits
- ✅ `is_pro` column in profiles table

**Critical Missing:**

- 🔴 **No usage tracking middleware** - Optimizations don't increment counters
- 🔴 **No limit checks** - Free users can bypass restrictions
- 🔴 **No UI for usage meter** - Users can't see "1/1 optimizations used"
- 🔴 **No upgrade prompts** - No call-to-action when limit reached
- 🔴 **Dashboard shows placeholder data** - Not connected to real usage stats

**Blockers:**

- Business model not functional - free users can abuse service
- No revenue driver - users never see upgrade prompts
- Can't test conversion funnel

**Estimated Fix Time:** ⏱️ **2 days**

**Implementation Tasks:**

1. Add usage tracking middleware to optimization endpoints
2. Implement monthly limit check before AI processing
3. Build usage meter UI component (CircularProgress with "1/1")
4. Add upgrade modal when limit exceeded
5. Test free user → 1 optimization → paywall → upgrade

---

### **M3: Payment Integration** ⚠️ **60% COMPLETE**

**What Exists:**

- ✅ Backend checkout endpoint working
- ✅ Stripe webhook handler implemented
- ✅ Database schema for payments

**Critical Missing:**

- 🔴 **Pricing page not wired to checkout** - "Upgrade" buttons don't trigger API
- 🔴 **Payment success page doesn't update user status** - Pro upgrade doesn't persist
- 🔴 **No confirmation UI after payment** - User doesn't know payment succeeded
- ⚠️ **Webhook reliability untested** - Edge cases (failed payments, refunds) not handled

**Blockers:**

- Can't monetize without functional payment flow
- Users can't upgrade to Pro tier
- Revenue tracking incomplete

**Estimated Fix Time:** ⏱️ **2-3 days**

**Implementation Tasks:**

1. Wire pricing page "Upgrade" buttons to `/api/payments/checkout`
2. Implement payment success callback to update `profiles.is_pro`
3. Add payment confirmation page with receipt display
4. Test webhook idempotency and error scenarios
5. Add Stripe test mode verification

---

### **M4: Resume Optimization Core** ⚠️ **40% COMPLETE**

**What Exists:**

- ✅ Backend endpoints fully implemented
- ✅ AI optimization service working
- ✅ File processing (PDF/DOCX) functional
- ✅ Upload components exist ([components/upload/ResumeUpload.tsx](../apps/frontend/components/upload/ResumeUpload.tsx))

**Critical Missing:**

- 🔴 **Upload components not connected to API** - File upload doesn't call backend
- 🔴 **No optimization request flow** - Can't combine resume + job description → AI
- 🔴 **Results page non-functional** - Can't display optimized resume
- 🔴 **No download button** - Can't export `.docx` file
- 🔴 **No loading states** - User sees blank screen during processing
- 🔴 **No error handling** - Failed optimizations show no feedback

**Blockers:**

- Core product feature doesn't work end-to-end
- Can't demo product to users
- Can't validate AI quality

**Estimated Fix Time:** ⏱️ **3-4 days**

**Implementation Tasks:**

1. Connect `ResumeUpload` component to `/api/resumes/upload`
2. Build job description input form
3. Implement optimization request flow (resume + job → payment check → AI)
4. Create results display page with diff viewer
5. Add download button calling `/api/resumes/{id}/download`
6. Implement loading spinners and error toasts
7. Test free vs paid optimization paths

---

### **S1: User Dashboard** ❌ **5% COMPLETE**

**What Exists:**

- ✅ Placeholder page ([app/[locale]/dashboard/page.tsx](../apps/frontend/app/[locale]/dashboard/page.tsx))
- ✅ Translation files

**Critical Missing:**

- 🔴 **No optimization history display** - Can't see past work
- 🔴 **No usage statistics** - Free users can't track monthly limits
- 🔴 **No account settings** - Can't update email/password
- 🔴 **No API integration** - All data is hardcoded placeholders

**Blockers:**

- No user value after signup
- Can't manage account or billing
- Can't access previous optimizations

**Estimated Fix Time:** ⏱️ **2-3 days**

**Implementation Tasks:**

1. Build optimization history component (table with status, date, actions)
2. Add usage meter display for free users
3. Implement account settings form (email, password, delete account)
4. Connect to backend APIs (`/api/optimizations`, `/api/usage`)
5. Add loading/empty states

---

## 🎯 Prioritized Roadmap

### **WEEK 9: Core SaaS Functionality** 🔴 **URGENT**

**Goal:** Make authentication, freemium, and core product functional

#### **Day 1-2: Authentication System** ⏱️ **2 days**

**Owner:** Frontend Specialist + Backend Specialist

**Tasks:**

1. [ ] Wire login form to Supabase Auth
   - Update [app/[locale]/login/page.tsx](../apps/frontend/app/[locale]/login/page.tsx) with `signInWithPassword()` handler
   - Add error handling for invalid credentials
   - Redirect to dashboard on success

2. [ ] Implement signup flow
   - Update [app/[locale]/signup/page.tsx](../apps/frontend/app/[locale]/signup/page.tsx) with `signUp()` handler
   - Create database trigger to auto-create profile record
   - Add email verification step

3. [ ] Add password reset
   - Create reset password page
   - Implement Supabase email link flow
   - Add reset confirmation UI

4. [ ] Implement protected routes
   - Create middleware to check `auth.uid()`
   - Redirect unauthenticated users to login
   - Test with dashboard, pricing, upload pages

5. [ ] Test session persistence
   - Verify refresh tokens work across page reloads
   - Test logout functionality
   - Validate token expiration handling

**Acceptance Criteria:**

- ✅ User can create account and receives profile record
- ✅ User can log in and access dashboard
- ✅ User can reset password via email
- ✅ Protected routes redirect to login when unauthenticated
- ✅ Session persists across browser refresh

---

#### **Day 3-5: Resume Optimization Flow** ⏱️ **3 days**

**Owner:** Frontend Specialist + AI Integration Specialist

**Tasks:**

1. [ ] Connect upload components to backend
   - Update [components/upload/ResumeUpload.tsx](../apps/frontend/components/upload/ResumeUpload.tsx) to call `/api/resumes/upload`
   - Add progress bar for upload
   - Store `resume_id` in component state

2. [ ] Build job description input
   - Create job description textarea component
   - Add character counter (min 100 chars)
   - Validate job posting format

3. [ ] Implement optimization request flow
   - Create optimization service in [lib/api.ts](../apps/frontend/lib/api.ts)
   - Check freemium limit before submission
   - If free user at limit → show payment modal
   - If allowed → call `/api/optimizations/create`

4. [ ] Create results display page
   - Build [app/results/[id]/page.tsx](../apps/frontend/app/results/[id]/page.tsx)
   - Display original vs optimized resume side-by-side
   - Highlight added keywords
   - Show ATS compatibility score (if available)

5. [ ] Add download functionality
   - Add "Download .docx" button
   - Call `/api/resumes/{id}/download`
   - Trigger browser download

6. [ ] Implement loading/error states
   - Add skeleton loaders during processing
   - Show error toasts for failed optimizations
   - Add retry button for transient failures

**Acceptance Criteria:**

- ✅ User can upload PDF/DOCX resume
- ✅ User can paste job description
- ✅ Free user sees paywall after 1 optimization
- ✅ Pro user can process unlimited optimizations
- ✅ Results display with side-by-side comparison
- ✅ User can download optimized resume as .docx

---

#### **Day 6-7: Freemium Enforcement** ⏱️ **2 days**

**Owner:** Backend Specialist + Frontend Specialist

**Tasks:**

1. [ ] Add usage tracking middleware
   - Create middleware in [app/api/middleware.py](../apps/backend/app/api/middleware.py)
   - Increment `usage_tracking.free_optimizations_used` after optimization
   - Use `UPSERT` for monthly records

2. [ ] Implement limit checks
   - Query `usage_tracking` before optimization
   - Block if `free_optimizations_used >= 1` and `profiles.is_pro = false`
   - Return 403 with upgrade prompt

3. [ ] Build usage meter UI
   - Create `UsageMeter` component (CircularProgress)
   - Fetch current usage from `/api/usage/current`
   - Display "1/1 optimizations used this month"

4. [ ] Add upgrade prompts
   - Create `UpgradeModal` component
   - Trigger when free limit reached
   - Link to pricing page with pre-selected plan

5. [ ] Test free user journey
   - Create test account → 1 optimization → upgrade prompt → payment → unlimited

**Acceptance Criteria:**

- ✅ Free users limited to 1 optimization per month
- ✅ Usage meter shows current/total usage
- ✅ Upgrade modal appears when limit reached
- ✅ Pro users have no limits
- ✅ Usage resets monthly

---

### **WEEK 10: Payment & Dashboard** 🟡 **HIGH PRIORITY**

**Goal:** Complete revenue flow and user account management

#### **Day 8-10: Payment Integration** ⏱️ **2-3 days**

**Owner:** Payment Specialist + Frontend Specialist

**Tasks:**

1. [ ] Wire pricing page to Stripe
   - Update [app/[locale]/pricing/page.tsx](../apps/frontend/app/[locale]/pricing/page.tsx)
   - Add `handleUpgrade()` function calling `/api/payments/checkout`
   - Pass `user_id`, `user_email`, `success_url`, `cancel_url`

2. [ ] Implement payment success callback
   - Update [app/payment/success/page.tsx](../apps/frontend/app/payment/success/page.tsx)
   - Verify session ID with `/api/payments/verify`
   - Update `profiles.is_pro = true` on success
   - Show confirmation with receipt

3. [ ] Update payment cancelled page
   - Update [app/payment/cancelled/page.tsx](../apps/frontend/app/payment/cancelled/page.tsx)
   - Show "Try again" button linking to pricing

4. [ ] Test webhook reliability
   - Use Stripe CLI to trigger test events
   - Verify idempotency (duplicate events don't double-charge)
   - Test failure scenarios (card declined, expired)

5. [ ] Add Stripe test mode verification
   - Ensure all test card numbers work
   - Verify test mode badge in UI
   - Document test credentials in README

**Acceptance Criteria:**

- ✅ User can click "Upgrade to Pro" and reach Stripe checkout
- ✅ Successful payment updates user to Pro status
- ✅ User sees confirmation page after payment
- ✅ Webhook handles duplicate events gracefully
- ✅ Test mode fully functional with test cards

---

#### **Day 11-12: User Dashboard** ⏱️ **2 days**

**Owner:** Frontend Specialist + Backend Specialist

**Tasks:**

1. [ ] Build optimization history component
   - Create `OptimizationHistory` component
   - Fetch from `/api/optimizations?user_id={uid}`
   - Display table with columns: Date, Job Title, Status, Actions
   - Add "View Results" button linking to `/results/{id}`

2. [ ] Add usage statistics
   - Create `UsageStats` component
   - Show monthly usage meter for free users
   - Show "Unlimited" badge for pro users
   - Display upgrade CTA if free

3. [ ] Implement account settings
   - Create `AccountSettings` component
   - Add form to update email (requires re-authentication)
   - Add password change form
   - Add "Delete Account" button with confirmation modal

4. [ ] Connect to backend APIs
   - Create optimization history endpoint in backend
   - Create usage stats endpoint
   - Update account settings endpoint

5. [ ] Add loading/empty states
   - Show skeleton loaders during fetch
   - Display "No optimizations yet" when empty
   - Add "Create first optimization" CTA

**Acceptance Criteria:**

- ✅ Dashboard displays optimization history
- ✅ Usage statistics show current month progress
- ✅ User can update email and password
- ✅ User can delete account (with confirmation)
- ✅ Empty state encourages first optimization

---

### **WEEK 11-12: Growth Features** 🟢 **NICE TO HAVE**

**Goal:** Polish and launch prep

#### **Week 11: Templates & Enhanced AI**

**Owner:** AI Integration Specialist + Frontend Specialist

**Features:**

- [ ] Professional resume templates (5 templates)
- [ ] Multiple AI model options (GPT-4, Claude, etc.)
- [ ] ATS scoring display with breakdown
- [ ] Keyword gap analysis visualization

**Value:** Differentiates Pro tier, improves conversion

---

#### **Week 12: Polish & Launch**

**Owner:** Full Team

**Features:**

- [ ] Email notifications (usage reminders, completion alerts)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] SEO improvements for blog (meta tags, structured data)
- [ ] Brazilian market marketing prep (landing page copy, testimonials)

**Value:** Launch-ready product with growth foundation

---

## 📈 Success Metrics

### **Current Status (Week 8)**

| Feature Category                         | Progress | Status |
| ---------------------------------------- | -------- | ------ |
| Infrastructure (Database, API setup)     | 85%      | ✅     |
| Internationalization (i18n, locales)     | 100%     | ✅     |
| Blog System (content, SEO)               | 100%     | ✅     |
| Authentication (login, signup)           | 20%      | 🔴     |
| Freemium Enforcement (limits, gating)    | 0%       | 🔴     |
| Payment Integration (Stripe flow)        | 60%      | ⚠️     |
| Optimization Flow (upload, AI, download) | 40%      | ⚠️     |
| User Dashboard (history, settings)       | 5%       | 🔴     |
| **Overall MVP Completion**               | **51%**  | 🔴     |

### **Target Status (End of Week 10)**

| Feature Category           | Target Progress |
| -------------------------- | --------------- |
| Authentication             | 100% ✅         |
| Freemium Enforcement       | 100% ✅         |
| Payment Integration        | 100% ✅         |
| Optimization Flow          | 100% ✅         |
| User Dashboard             | 100% ✅         |
| **Overall MVP Completion** | **100%** ✅     |

---

## 🚨 Critical Blockers Summary

**Blocker 1: Authentication Broken** 🔴
**Impact:** Cannot test any user flows. All features require authentication.
**Resolution:** Day 1-2 of Week 9

**Blocker 2: Optimization Flow Incomplete** 🔴
**Impact:** Core product doesn't work end-to-end. Can't demo to users.
**Resolution:** Day 3-5 of Week 9

**Blocker 3: Freemium Not Enforced** 🔴
**Impact:** Business model non-functional. No revenue driver.
**Resolution:** Day 6-7 of Week 9

**Blocker 4: Dashboard Placeholder** 🔴
**Impact:** No user value after signup. Can't manage account.
**Resolution:** Day 11-12 of Week 10

---

## 💡 Recommendations

### **Immediate Actions (Next 24 Hours)**

1. **Prioritize Authentication** - Assign frontend specialist to wire up login/signup forms
2. **Backend Integration Testing** - Verify all API endpoints work with Postman/curl
3. **Create Test Users** - Set up test accounts in Supabase for QA

### **Week 9 Strategy**

- **Focus:** Get core user flows working (auth → upload → optimize → download)
- **Ignore:** Templates, analytics, email notifications (defer to Week 11-12)
- **Daily Standups:** Block 30min to review blockers and adjust priorities

### **Launch Criteria (Week 12)**

- [ ] 10+ test users complete full optimization flow without errors
- [ ] Stripe test mode verified with all card types
- [ ] Performance: Page load < 2s, optimization processing < 30s
- [ ] Security audit: RLS policies tested, no API key leaks
- [ ] Legal compliance: Privacy policy, terms of service, LGPD consent

---

## 📚 Related Documentation

- [PRD (Product Requirements)](./prd.md) - Feature specifications
- [Architecture Overview](./architecture.md) - System design
- [Git Workflow](./GIT_WORKFLOW.md) - Branching and commit conventions
- [Supabase Setup](./supabase-setup.md) - Database configuration
- [Integration Plan](./integration-plan.md) - Third-party services

---

## 🔄 Changelog

| Date       | Version | Changes                                           |
| ---------- | ------- | ------------------------------------------------- |
| 2025-10-03 | 1.0     | Initial audit and prioritization document created |
