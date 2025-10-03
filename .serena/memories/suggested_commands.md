# Resume Matcher - Suggested Commands

## Setup Commands

```bash
# Initial project setup (Linux/macOS)
chmod +x setup.sh
./setup.sh

# Initial project setup (Windows)
.\setup.ps1

# Setup with immediate dev start
./setup.sh --start-dev  # Linux/macOS
.\setup.ps1 -StartDev   # Windows

# Make targets (Linux/macOS)
make setup      # Run setup script
make run-dev    # Start development server
make run-prod   # Build and start production
make help       # Show available targets
```

## Development Commands

```bash
# Start development server (both frontend and backend)
bun run dev

# Start individual services
bun run dev:frontend    # Next.js dev server
bun run dev:backend     # FastAPI with uvicorn

# Frontend-specific
cd apps/frontend
bun run dev        # Development server
bun run lint       # ESLint via bunx
bun run format     # Prettier formatting via bunx

# Backend-specific
cd apps/backend
uv run uvicorn app.main:app --reload --port 8000
```

## Build & Production Commands

```bash
# Build for production
bun run build

# Start production server
bun run start

# Individual builds
bun run build:frontend
bun run build:backend
```

## Package Management Commands

```bash
# Frontend dependencies (bun)
cd apps/frontend
bun install               # Install dependencies
bun add <package>         # Add new package
bun remove <package>      # Remove package

# Backend dependencies (uv)
cd apps/backend
uv sync                   # Install/sync dependencies
uv add <package>          # Add new package
uv remove <package>       # Remove package
uv run <command>          # Run command in virtual environment
```

## Quality Assurance Commands

```bash
# Linting
bun run lint               # Frontend linting
cd apps/frontend && bun run lint

# Formatting
cd apps/frontend && bun run format

# Note: Backend linting/formatting tools not specified in current setup
```

## Prerequisites Management

```bash
# Check Ollama is running
ollama serve

# Pull required AI model
ollama pull gemma3:4b

# Bun version check (replaces npm)
bun --version

# uv version check (Python package manager)
uv --version

# Python version check (should be 3.12+)
python3 --version
```

## Useful System Commands (Linux)

```bash
ls          # List files
cd          # Change directory
grep        # Search text
find        # Find files
git         # Version control
chmod       # Change permissions
curl        # Download files
make        # Build automation
```
