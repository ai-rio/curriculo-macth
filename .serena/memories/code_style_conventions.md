# Resume Matcher - Code Style & Conventions

## Frontend (Next.js/TypeScript)

### Package Manager: Bun

- Use `bun` instead of `npm` for all Node.js package management
- Scripts use `bunx` for running tools like ESLint and Prettier

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### ESLint Rules

- Extends `next/core-web-vitals` and `next/typescript`
- Prettier integration with `prettier/prettier: error`
- Format on save should be enabled in editor
- Run with `bunx eslint` or `bun run lint`

### File Structure

```
apps/frontend/
├── app/           # Next.js app router
├── components/    # React components
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries
└── public/        # Static assets
```

### Dependencies

- **UI**: Radix UI components, Lucide React icons
- **Styling**: Tailwind CSS v4, class-variance-authority, clsx, tailwind-merge
- **Animation**: Motion library, tw-animate-css
- **Development**: TypeScript, ESLint, Prettier

## Backend (FastAPI/Python)

### Package Manager: uv

- Use `uv` instead of pip/poetry for Python package management
- `uv sync` to install/sync dependencies
- `uv run` to execute commands in virtual environment
- `uv add/remove` for package management

### Python Requirements

- Python 3.12+ required
- FastAPI for REST API framework
- All dependencies managed via pyproject.toml

### Project Structure

```
apps/backend/
├── app/
│   ├── api/           # API routes and middleware
│   ├── agent/         # AI agent implementations
│   ├── core/          # Core configuration and database
│   ├── models/        # SQLAlchemy database models
│   ├── schemas/       # Pydantic schemas (JSON + validation)
│   ├── services/      # Business logic services
│   └── prompt/        # AI prompt templates
└── pyproject.toml     # Python project configuration
```

### Key Libraries

- **Web Framework**: FastAPI, Uvicorn
- **Database**: SQLAlchemy, aiosqlite
- **AI/LLM**: Ollama, OpenAI (optional)
- **Data Processing**: pydantic, markitdown, beautifulsoup4
- **File Processing**: pdfminer.six, python-multipart

## General Conventions

### Environment Configuration

- Root `.env` file (copied from `.env.example`)
- Backend-specific `.env` file (copied from `apps/backend/.env.sample`)
- Uses python-dotenv for environment variable loading

### Development Workflow

1. Use bun for frontend package management
2. Use uv for backend Python package management
3. Run format on save (frontend)
4. Use build automation scripts for task execution
5. Leverage concurrently for running multiple services
6. Follow monorepo structure with clear separation

### Database

- SQLite for local development
- SQLAlchemy ORM with async support (aiosqlite)
- Database URL: `sqlite+aiosqlite:///./app.db`
