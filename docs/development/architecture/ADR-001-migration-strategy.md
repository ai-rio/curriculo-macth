# ADR-001: Migration Strategy from QuoteKit and Creator-Flow

## Status

**Accepted** - 2025-09-29

## Context

Resume-Matcher is being developed as an AI-powered résumé optimization SaaS for the Brazilian market. Rather than building all features from scratch, we have the opportunity to leverage mature implementations from two existing production projects:

1. **QuoteKit** - A production SaaS with 6+ months of refinement featuring complete Stripe integration, Supabase setup, MDX blog, analytics, and comprehensive testing.
2. **Creator-Flow** - A similar stack with internationalization (i18n) support and modern UI patterns.

Both projects use nearly identical tech stacks (Next.js 15+, TypeScript, Supabase, Stripe, PostHog) and share the same tooling (Bun, testing frameworks).

### Problem Statement

We need to decide:

1. **Whether** to migrate existing implementations vs building from scratch
2. **What** to migrate (features, patterns, code)
3. **How** to migrate (wholesale copy, selective adaptation, or reference-only)
4. **When** to migrate (sequence and dependencies)

### Key Constraints

- **Time to Market**: MVP target is 3 months from start
- **Code Quality**: Must maintain high standards, not accumulate technical debt
- **LGPD Compliance**: Brazilian data privacy law requires careful data handling
- **Team Size**: Small team, need to maximize efficiency
- **Learning Curve**: Team already familiar with QuoteKit/Creator-Flow codebases

## Decision

We will adopt a **phased selective migration strategy** that:

1. **Migrates proven implementations** from QuoteKit and Creator-Flow
2. **Adapts** patterns to Resume-Matcher's specific requirements
3. **References** source projects for inspiration but rewrites where necessary
4. **Prioritizes** features by business value (payment, auth, core features first)
5. **Maintains** source projects as reference throughout development

### Migration Approach

#### What to Migrate (Priority Order)

**Phase 1: Foundation** ✅ (~80% complete)

- Tooling, linting, git workflows, base infrastructure

**Phase 2: Supabase Integration** 🎯 NEXT

- Database schema, RLS policies, auth flows, file storage
- **Rationale**: Critical dependency for all features

**Phase 3: Stripe Integration**

- Payment flows, webhook handling, verification service
- **Rationale**: Required for monetization (MVP blocker)

**Phase 4: Core Features**

- Résumé upload, AI optimization, results delivery
- **Rationale**: Core value proposition

**Phase 5: Enhanced Features**

- Blog, analytics, email system
- **Rationale**: Marketing and user engagement

**Phase 6: Testing & Polish**

- Test infrastructure, E2E tests, security audit
- **Rationale**: Production readiness

#### How to Migrate

We will use **three migration modes** based on feature complexity:

1. **Direct Migration** (Low Adaptation Needed)
   - Example: Git workflow scripts, ESLint config, CI/CD workflows
   - Approach: Copy with minimal changes
   - Benefit: Fastest, proven patterns

2. **Adapted Migration** (Moderate Changes Required)
   - Example: Supabase setup, Stripe integration, auth flows
   - Approach: Copy structure, adapt to Resume-Matcher schema/requirements
   - Benefit: Leverage proven patterns while customizing

3. **Reference-Only** (High Customization Needed)
   - Example: AI optimization service (unique to Resume-Matcher)
   - Approach: Study source patterns, write fresh implementation
   - Benefit: Avoid over-engineering, keep code focused

#### Quality Gates

Each phase must pass:

- ✅ **Functionality**: All features work as specified
- ✅ **Tests**: Unit, integration, and E2E tests pass
- ✅ **Type Safety**: No TypeScript/Python type errors
- ✅ **Linting**: No ESLint/Ruff violations
- ✅ **Security**: No known vulnerabilities
- ✅ **Documentation**: Code and feature documentation complete

## Consequences

### Positive

✅ **Faster Time to Market**

- Avoid reinventing the wheel for common patterns (auth, payments, email)
- Reduce development time by 40-60% compared to building from scratch

✅ **Higher Code Quality**

- Leverage battle-tested implementations with real-world usage
- Avoid common pitfalls (e.g., Stripe webhook idempotency, RLS policy gaps)

✅ **Reduced Risk**

- Migration phases have clear success criteria and rollback points
- Each phase delivers tangible, testable value

✅ **Knowledge Transfer**

- Team already familiar with source codebases
- Easier onboarding for new team members (reference existing projects)

✅ **Maintainability**

- Consistent patterns across projects
- Shared debugging knowledge from source projects

### Negative

⚠️ **Over-Engineering Risk**

- QuoteKit has features Resume-Matcher doesn't need (e.g., complex quote management)
- **Mitigation**: Use "Reference-Only" mode for complex features, only migrate what's needed

⚠️ **Context Switching**

- Developers need to understand three codebases simultaneously
- **Mitigation**: Clear documentation of migration sources, dedicated focus blocks

⚠️ **Dependency Lock-In**

- Tightly couples Resume-Matcher to decisions made in source projects
- **Mitigation**: Adapt patterns during migration, don't blindly copy

⚠️ **Versioning Drift**

- Source projects may evolve independently
- **Mitigation**: Snapshot source projects at migration start, track divergence

⚠️ **License Compliance**

- Ensure source project licenses allow code reuse
- **Mitigation**: Verify licenses before migration (QuoteKit and Creator-Flow are owned by same entity)

### Trade-offs

| Aspect             | Build from Scratch  | Migrate from Sources         |
| ------------------ | ------------------- | ---------------------------- |
| **Time to MVP**    | 3-6 months          | 6-12 weeks ✅                |
| **Code Ownership** | 100% custom ✅      | Shared patterns              |
| **Learning Curve** | High (new patterns) | Low (familiar code) ✅       |
| **Technical Debt** | Low (clean start)   | Medium (some baggage)        |
| **Risk**           | High (unproven)     | Low (battle-tested) ✅       |
| **Flexibility**    | High ✅             | Medium (inherit constraints) |

**Decision**: Trade some flexibility for speed and reduced risk.

## Alternatives Considered

### Alternative 1: Build Everything from Scratch

**Pros:**

- Complete control over architecture
- No legacy patterns or technical debt
- Learning opportunity for team

**Cons:**

- 2-3x longer development time
- Higher risk of bugs in common patterns (auth, payments)
- Reinvent solved problems

**Rejected because:** Time to market is critical for MVP validation.

### Alternative 2: Wholesale Code Copy

**Pros:**

- Fastest approach
- Proven implementations

**Cons:**

- High technical debt (unused features, context bloat)
- Harder to maintain
- Over-engineered for Resume-Matcher's needs

**Rejected because:** Not aligned with lean MVP philosophy.

### Alternative 3: Fork QuoteKit and Adapt

**Pros:**

- Instant codebase
- Git history preserved

**Cons:**

- Massive refactoring required (quote management → résumé optimization)
- Harder to remove unused features
- Confusing for future maintainers

**Rejected because:** Cleaner to start fresh and selectively migrate.

## Implementation Notes

### Migration Workflow

For each feature migration:

1. **Identify** feature in source project (QuoteKit or Creator-Flow)
2. **Document** migration source in migration plan
3. **Adapt** code to Resume-Matcher context (rename, refactor)
4. **Test** thoroughly (unit, integration, E2E)
5. **Document** in Resume-Matcher codebase (JSDoc/docstrings)
6. **Review** with team before merging

### Code Attribution

When migrating code:

- Add comment: `// Adapted from QuoteKit: [file path]` or `# Adapted from Creator-Flow: [file path]`
- Preserve original author intent (don't mindlessly copy-paste)
- Refactor to Resume-Matcher conventions

### Tools and Automation

- **Diff Tools**: Use to compare implementations between projects
- **Code Search**: Use grep/ripgrep to find patterns across projects
- **Checklist**: Maintain migration checklist in `migration-plan.md`

## Related Decisions

- **ADR-002** (Future): Monorepo structure and tooling choices
- **ADR-003** (Future): Backend-as-a-Service (Supabase) vs self-hosted
- **ADR-004** (Future): AI provider selection (OpenRouter vs direct OpenAI/Anthropic)

## References

- [Migration Plan](../migration-plan.md)
- [PRD](../prd.md)
- [Architecture Document](../architecture.md)
- [QuoteKit Project](/home/carlos/projects/QuoteKit)
- [Creator-Flow Project](/home/carlos/projects/creator-flow)

---

**Decision Authors:** Development Team
**Reviewers:** Tech Lead, Product Owner
**Last Updated:** 2025-09-29
