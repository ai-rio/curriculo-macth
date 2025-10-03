# Resume Matcher - Project Overview

## Purpose

Resume Matcher is an AI-powered platform that reverse-engineers hiring algorithms to help users optimize their resumes for ATS (Application Tracking System) compatibility. The goal is to build a "VS Code for making resumes" that helps users get past automated screening and into human hands.

## Key Features

- **Works locally**: Uses open source AI models via Ollama, no need to upload resumes to servers
- **ATS Compatibility Analysis**: Detailed analysis of resume compatibility with ATS systems
- **Instant Match Score**: Upload resume & job description for quick match score and improvement areas
- **Keyword Optimizer**: Align resume with job keywords and identify content gaps
- **Guided Improvements**: Clear suggestions to make resumes stand out

## Architecture

The project uses a monorepo structure with separate frontend and backend applications:

```
Resume-Matcher/
├── apps/
│   ├── frontend/     # Next.js React application
│   └── backend/      # FastAPI Python application
├── docs/             # Documentation
├── assets/           # Images and media
└── setup scripts    # Cross-platform setup automation
```

## Tech Stack

- **Backend**: FastAPI (Python 3.12+)
- **Frontend**: Next.js 15+ with React 19
- **AI/LLM**: Ollama (local AI model serving) with gemma3:4b model
- **Styling**: Tailwind CSS v4
- **Database**: SQLite with SQLAlchemy
- **Package Management**: uv (Python), npm (Node.js)
- **Development**: TypeScript, ESLint, Prettier

## Development Status

- Active development with breaking changes on main branch
- Community-driven with Discord server for discussions
- Open source with Apache 2.0 license
- Part of Vercel OSS Program
