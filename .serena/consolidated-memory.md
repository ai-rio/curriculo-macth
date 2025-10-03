# Resume Matcher - Consolidated Memory

## Project Overview

Resume Matcher is an AI-powered platform that reverse-engineers hiring algorithms to help users optimize resumes for ATS compatibility. It's built as a "VS Code for making resumes" that helps users get past automated screening.

**Key Features:**

- Local AI processing via Ollama (no resume uploads required)
- ATS compatibility analysis with detailed scoring
- Keyword optimization and content gap identification
- Guided improvement suggestions

## Architecture & Tech Stack

### Monorepo Structure

```
Resume-Matcher/
├── apps/
│   ├── frontend/     # Next.js 15 + React 19 + TypeScript
│   └── backend/      # FastAPI + Python 3.12+
├── docs/             # Documentation
├── assets/           # Images and media
└── setup scripts    # Cross-platform automation
```

### Frontend Stack

- **Framework**: Next.js 15 with app router
- **UI**: React 19, Radix UI components, Lucide icons
- **Styling**: Tailwind CSS v4 with class-variance-authority
- **Animation**: Motion library, tw-animate-css
- **Package Manager**: Bun (replaces npm)
- **Code Quality**: TypeScript, ESLint, Prettier

### Backend Stack

- **Framework**: FastAPI with Uvicorn
- **Database**: SQLite with SQLAlchemy ORM (async)
- **AI/LLM**: Ollama with gemma3:4b model, OpenAI support
- **Package Manager**: uv (replaces pip/poetry)
- **Data Processing**: Pydantic, markitdown, beautifulsoup4
- **File Processing**: pdfminer.six, python-multipart

## Development Standards

### Package Management

**Frontend (Bun):**

```bash
cd apps/frontend
bun install          # Install dependencies
bun add <package>     # Add package
bun run dev          # Development server
bun run lint         # ESLint via bunx
bun run format       # Prettier via bunx
```

**Backend (uv):**

```bash
cd apps/backend
uv sync              # Install/sync dependencies
uv add <package>     # Add package
uv run <command>     # Run in virtual environment
```

### Code Style Configuration

**Prettier:**

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**ESLint:** Extends `next/core-web-vitals` and `next/typescript` with Prettier integration

### Git Workflow (MANDATORY)

**NEVER use direct git commands.** Always use project scripts:

```bash
bun run git:save "type(scope): description"  # Proper commit with checks
bun run git:push                            # Push to remote
bun run git:status                          # Check status
bun run git:wip                             # Work in progress
```

**Conventional Commit Format:**

```
type(scope): description
feat(blog): add blog search functionality
fix(auth): resolve login issue
docs(readme): update installation guide
```

**Pre-commit checks run automatically:**

- Type checking: `bun run type-check:frontend`
- Linting: `bun run lint:frontend`
- Testing: `bun run test:frontend`

## Key Implementation Details

### AI Integration

- **Local Processing**: Ollama with gemma3:4b model
- **Optional**: OpenAI provider support
- **Structured Prompts**: Consistent AI response formatting
- **Agent System**: Modular provider implementations

### Database

- **Development**: SQLite with aiosqlite
- **ORM**: SQLAlchemy with async support
- **URL**: `sqlite+aiosqlite:///./app.db`

### Environment Configuration

- Root `.env` file (from `.env.example`)
- Backend `.env` file (from `apps/backend/.env.sample`)
- Uses python-dotenv for loading

## Blog System (COMPLETED)

**Status**: Fully implemented and ready for Brazilian market launch (October 2, 2024)

**Key Features:**

- Complete MDX blog system with bilingual content (70% Portuguese, 30% English)
- Advanced search & filtering with BlogSearch component
- Premium content gating for Pro users
- Social media integration (Brazilian platforms)
- Analytics dashboard for content performance
- Complete SEO infrastructure with structured data (JSON-LD)
- Multilingual sitemaps with Portuguese-canonical URLs

**Content Inventory:** 10 articles total (7 Portuguese, 3 English) focused on ATS optimization, interview prep, and career advice for Brazilian market.

## Development Commands

### Setup

```bash
# Linux/macOS
chmod +x setup.sh && ./setup.sh

# Windows
.\setup.ps1

# With immediate dev start
./setup.sh --start-dev  # Linux/macOS
.\setup.ps1 -StartDev   # Windows
```

### Development

```bash
bun run dev              # Start both services
bun run dev:frontend     # Next.js only
bun run dev:backend      # FastAPI only
```

### Build & Production

```bash
bun run build            # Build both
bun run start            # Start production
```

## Quality Standards

### Critical Principles

- **Avoid documentation bloating** - Keep documentation concise and value-focused
- **Code quality first** - lint → format → commit workflow
- **Use git workflow scripts** - Never direct git commands
- **Test before committing** - Verify functionality

### Task Completion Checklist

**Frontend:**

1. Run `bun run lint` and `bun run format`
2. Verify `bun run build:frontend` succeeds
3. Test with `bun run dev:frontend`

**Backend:**

1. Run `uv sync` for dependencies
2. Test FastAPI server starts correctly
3. Note: Python linting tools not yet configured (consider ruff, black, mypy)

**Full System:**

1. Test `bun run dev` for integration
2. Verify Ollama is running with `ollama serve`
3. Check `ollama list` for gemma3:4b model

## Prerequisites

- **Bun**: Node.js package manager
- **uv**: Python package manager
- **Python 3.12+**
- **Ollama**: Local AI model serving
- **gemma3:4b**: AI model for resume analysis

## Future Improvements Needed

- Add backend linting tools (ruff, black, mypy)
- Implement automated testing framework
- Add pre-commit hooks for code quality
- Consider Python type checking
- Update setup scripts to validate tool installations
