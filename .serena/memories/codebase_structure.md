# Resume Matcher - Codebase Structure

## Project Layout

```
Resume-Matcher/
├── apps/
│   ├── frontend/           # Next.js React application
│   │   ├── app/           # Next.js 15 app router
│   │   ├── components/    # Reusable React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and libraries
│   │   ├── public/        # Static assets
│   │   ├── package.json   # Frontend dependencies
│   │   ├── next.config.ts # Next.js configuration
│   │   ├── tailwind.config.js
│   │   ├── eslint.config.mjs
│   │   └── .prettierrc
│   └── backend/           # FastAPI Python application
│       ├── app/
│       │   ├── api/       # API routes and middleware
│       │   │   └── router/
│       │   │       ├── health.py
│       │   │       └── v1/
│       │   │           ├── job.py
│       │   │           └── resume.py
│       │   ├── agent/     # AI agent implementations
│       │   │   ├── providers/  # LLM provider implementations
│       │   │   │   ├── base.py
│       │   │   │   ├── ollama.py
│       │   │   │   ├── openai.py
│       │   │   │   └── llama_index.py
│       │   │   └── strategies/ # AI strategy patterns
│       │   │       ├── base.py
│       │   │       └── wrapper.py
│       │   ├── core/      # Core configuration
│       │   │   ├── config.py
│       │   │   ├── database.py
│       │   │   └── exceptions.py
│       │   ├── models/    # SQLAlchemy database models
│       │   │   ├── base.py
│       │   │   ├── user.py
│       │   │   ├── job.py
│       │   │   ├── resume.py
│       │   │   └── association.py
│       │   ├── schemas/   # Data validation schemas
│       │   │   ├── json/      # JSON schema definitions
│       │   │   └── pydantic/  # Pydantic validation models
│       │   ├── services/  # Business logic services
│       │   │   ├── job_service.py
│       │   │   ├── resume_service.py
│       │   │   └── score_improvement_service.py
│       │   ├── prompt/    # AI prompt templates
│       │   │   ├── base.py
│       │   │   ├── structured_job.py
│       │   │   ├── structured_resume.py
│       │   │   └── resume_improvement.py
│       │   └── main.py    # FastAPI application entry point
│       ├── pyproject.toml # Python dependencies and config
│       └── .env.sample    # Environment variables template
├── docs/                  # Documentation
├── assets/               # Images and media files
├── .github/              # GitHub workflows and templates
├── Makefile              # Build automation (Linux/macOS)
├── setup.sh              # Setup script (Linux/macOS)
├── setup.ps1             # Setup script (Windows)
├── package.json          # Root package.json for npm scripts
└── README.md             # Project documentation
```

## Key Components

### Frontend Architecture

- **Next.js 15** with app router
- **React 19** components
- **Tailwind CSS v4** for styling
- **TypeScript** for type safety
- **Radix UI** for accessible components
- **Motion** library for animations

### Backend Architecture

- **FastAPI** REST API framework
- **SQLAlchemy** ORM with SQLite database
- **Pydantic** for data validation
- **Agent-based AI system** with multiple LLM providers
- **Service layer** for business logic separation
- **Modular prompt system** for AI interactions

### AI Integration

- **Ollama** for local AI model serving
- **gemma3:4b** model for resume analysis
- **OpenAI** provider support (optional)
- **LlamaIndex** integration
- **Structured prompts** for consistent AI responses

### Development Tools

- **uv** for Python package management
- **npm** for Node.js package management
- **concurrently** for running multiple services
- **ESLint + Prettier** for code formatting
- **Cross-platform setup scripts**
