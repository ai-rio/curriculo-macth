## 📌 Project Overview

- **Name:** AI Résumé Optimization SaaS
- **Goal:** Help Brazilian professionals improve résumés for ATS and recruiters by aligning them with job descriptions.
- **Architecture:** Monorepo with `apps/frontend` (Next.js 15+, Bun) and `apps/backend` (FastAPI, UV).
- **Hosting:** Vercel (frontend + serverless backend).
- **Services:** Supabase (Auth, DB, Storage), Stripe (Payments), OpenRouter (AI models).
- **Primary Workflow:** Upload résumé → Paste job description → Pay via Stripe → AI optimization → Download `.docx`.

---

## 🛠️ Common Commands

### Frontend

- `bun run dev` → Run Next.js frontend locally.
- `bun run build` → Build frontend for production.
- `bun run lint` → Run ESLint checks.
- `bun run test` → Run Jest + React Testing Library tests.

### Backend

- `cd apps/backend && uv venv && uv sync` → Setup Python environment.
- `uv run pytest` → Run backend tests.
- `uv run fastapi dev` → Run FastAPI locally.

### Monorepo

- `bun install` → Install all dependencies.
- `bun run dev` → Run frontend + backend concurrently.

---

## 🎨 Code Style Guidelines

### Frontend (Next.js / TypeScript)

- Use **ES modules** (`import/export`), not CommonJS.
- Prefer **functional components** with hooks.
- Centralize API calls in `lib/api.ts`.
- Use **shared-types** package for type safety across frontend/backend.
- Follow **WCAG 2.1 AA** accessibility standards.

### Backend (FastAPI / Python)

- Follow **Repository Pattern** for DB access.
- Use **pydantic models** for request/response validation.
- Return errors in **standardized JSON format**.
- Keep business logic in `services/`, not in route handlers.

---

## 🔄 Development Workflow

1. **Explore & Plan**: Ask Claude to read relevant files before coding.
2. **Test-Driven Development**: Write failing tests first, then implement.
3. **Iterate**: Use Claude to refine code until tests pass.
4. **Commit & PR**: Claude can help generate commit messages and PRs.

---

## ✅ Testing

- **Frontend:** Jest + React Testing Library.
- **Backend:** Pytest.
- **Strategy:** Unit + Integration tests for MVP.
- **CI/CD:** GitHub Actions (run tests on PRs).

---

## 🔐 Security & Compliance

- Use **Supabase Auth** for JWT validation.
- Store sensitive data in `.env` (never commit).
- Enforce **LGPD compliance** (Brazilian data privacy law).
- Use **HttpOnly cookies** and strict CORS.

---

## 💳 Payments

- Stripe Checkout for one-time payments.
- Store `stripe_payment_id` in `optimizations` table.
- Backend listens for `payment_success` webhook before triggering AI job.

---

## 📂 Repository Etiquette

- Branch naming: `feature/*`, `fix/*`, `chore/*`.
- Always run `bun run lint` + `pytest` before committing.
- Use **conventional commits** (`feat:`, `fix:`, `chore:`).
- PRs must include description + screenshots (if UI).

---

## 🧪 Example Workflows with Claude

- **Codebase Q&A:** “Claude, explain how résumé uploads are handled.”
- **GitHub Ops:** “Claude, open a PR for the new payment flow.”
- **Debugging:** “Claude, run pytest and fix failing tests.”
- **Refactoring:** “Claude, refactor `services/ai.py` to improve readability.”

---

## ⚡ Allowed Tools

- **Always allow:**
  - File edits
  - `git commit`
  - `pytest`, `bun run test`
  - `gh` (GitHub CLI)
- **Conditionally allow:**
  - `stripe` CLI (sandbox only)
  - `supabase` CLI

---

## 📌 Notes for Claude

- Always **confirm plan before coding**.
- Never modify tests unless explicitly asked.
- Optimize for **clarity and maintainability**, not just speed.
- When in doubt, ask before making assumptions.
- Mandatory git workflow and type check methodology at the start and end of implementations.

---

## 📚 Documentation & Standards

### Code Standards

All code must follow the standards in `docs/standards/`:

- **[Documentation Standards](docs/standards/DOCUMENTATION_STANDARDS.md)** - How to document code and features
- **[Naming Conventions](docs/standards/NAMING_CONVENTIONS.md)** - Naming rules for TypeScript and Python
- **[Code Organization](docs/standards/CODE_ORGANIZATION.md)** - File structure and organization patterns

### AI Agents

Use specialized AI agents for complex tasks (see `.claude/agents/`):

- **orchestrator-agent** - Coordinates multiple agents for complex features
- **frontend-specialist** - Next.js, React, TypeScript, Tailwind CSS
- **backend-specialist** - FastAPI, Python, Repository Pattern
- **database-specialist** - Supabase, PostgreSQL, RLS policies
- **ai-integration-specialist** - OpenRouter API, prompt engineering
- **payment-specialist** - Stripe integration, webhooks
- **test-writer-agent** - Jest, React Testing Library, Pytest
- **code-reviewer-agent** - Code review, security, LGPD compliance

**Learn more**: See `.claude/README.md` for agent usage guide.
