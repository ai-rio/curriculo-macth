# Resume Matcher - Task Completion Checklist

## When Completing Tasks

### Frontend Tasks

1. **Code Quality Checks**

   ```bash
   cd apps/frontend
   bun run lint     # Run ESLint via bunx
   bun run format   # Run Prettier formatting via bunx
   ```

2. **Build Verification**

   ```bash
   bun run build:frontend  # Ensure build succeeds
   ```

3. **Development Testing**
   ```bash
   bun run dev:frontend    # Test in development mode
   ```

### Backend Tasks

1. **Dependency Management**

   ```bash
   cd apps/backend
   uv sync                 # Sync dependencies
   ```

2. **Code Verification**

   ```bash
   cd apps/backend
   # Note: Specific linting/formatting tools not configured yet
   # May need to add ruff, black, or mypy in future
   ```

3. **Service Testing**
   ```bash
   bun run dev:backend     # Test FastAPI server starts correctly
   ```

### Full System Tasks

1. **Complete Build Test**

   ```bash
   bun run build          # Build both frontend and backend
   ```

2. **Development Server Test**

   ```bash
   bun run dev           # Start both services concurrently
   ```

3. **Prerequisites Check**
   ```bash
   ollama serve          # Ensure Ollama is running
   ollama list           # Verify gemma3:4b model is available
   bun --version         # Verify bun is installed
   uv --version          # Verify uv is installed
   ```

### Package Management Verification

1. **Frontend Dependencies**

   ```bash
   cd apps/frontend
   bun install           # Should complete without errors
   ls node_modules/      # Verify dependencies installed
   ```

2. **Backend Dependencies**
   ```bash
   cd apps/backend
   uv sync               # Should complete without errors
   ls .venv/             # Verify virtual environment exists
   ```

### Important Notes

- **Bun replaces npm** for all Node.js package management
- **uv replaces pip/poetry** for Python package management
- **No Python formatting/linting tools are currently configured** in the backend
- Consider adding tools like `ruff`, `black`, `mypy`, or `isort` for Python code quality
- Frontend has comprehensive ESLint + Prettier setup via bun/bunx
- Always test both services together with `bun run dev` for integration verification
- Ensure Ollama service is running before testing AI-related features

### Environment Validation

1. Check `.env` files are properly configured
2. Verify database connectivity (SQLite files created)
3. Test API endpoints respond correctly
4. Verify frontend can communicate with backend API

### Future Improvements Needed

- Add backend linting tools (ruff, black, mypy)
- Add automated testing framework
- Add pre-commit hooks for code quality
- Consider adding type checking for Python code
- Update setup scripts to validate bun and uv installations
