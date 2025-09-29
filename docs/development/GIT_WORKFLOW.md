# Git Workflow Guide

This document describes the streamlined git workflow for Resume-Matcher, adapted from the creator-flow project.

## Quick Reference

### Basic Workflow Commands

```bash
# Check repository status
bun run git:status

# Save work in progress (WIP commit)
bun run git:wip "description of what you're working on"

# Commit changes (without pushing)
bun run git:save "your commit message"

# Commit and push changes
bun run git:done "your commit message"

# Push current branch
bun run git:push
```

### Branch Management

```bash
# Create new branch with smart type detection
bun run git:branch "payment-integration"
# Creates: feature/payment-integration

bun run git:branch "fix-resume-upload"
# Creates: fix/resume-upload

bun run git:branch "critical-security"
# Creates: hotfix/critical-security

# Create branch with explicit type
bun run git:branch "stripe" --type=refactor
# Creates: refactor/stripe

# Switch to existing branch (auto-saves uncommitted work)
bun run git:switch main
bun run git:switch feature/payment-integration

# Clean up merged branches
bun run git:cleanup

# Clean up specific branch
bun run git:cleanup feature/old-feature
```

### Pull Request Management

```bash
# Create pull request from current branch
bun run git:pr "PR Title" "Optional Description"

# Example
bun run git:pr "Add Stripe payment integration"
bun run git:pr "Fix resume upload bug" "Resolves issue with large file uploads"
```

### Repository Maintenance

```bash
# Run health check on repository
bun run git:health-check

# Create backup of entire repository
bun run git:backup
```

## Branch Type Detection

The `git:branch` command automatically detects the type of branch based on keywords:

| Type         | Keywords                                                | Example                                               |
| ------------ | ------------------------------------------------------- | ----------------------------------------------------- |
| **fix**      | fix, bug, issue, error, broken, resolve, repair         | `fix-resume-upload` → `fix/resume-upload`             |
| **hotfix**   | hotfix, critical, urgent, emergency, prod, production   | `critical-security` → `hotfix/critical-security`      |
| **docs**     | doc, docs, readme, guide, documentation, manual         | `api-docs-update` → `docs/api-docs-update`            |
| **test**     | test, spec, testing, coverage, e2e, unit                | `test-payment-flow` → `test/payment-flow`             |
| **refactor** | refactor, cleanup, restructure, reorganize, rewrite     | `refactor-auth` → `refactor/auth`                     |
| **perf**     | perf, performance, optimize, speed, fast, slow          | `optimize-api` → `perf/optimize-api`                  |
| **security** | security, auth, secure, vulnerability, exploit          | `security-headers` → `security/headers`               |
| **chore**    | chore, deps, dependency, config, setup, update, upgrade | `update-dependencies` → `chore/update-dependencies`   |
| **feature**  | _default fallback_                                      | `payment-integration` → `feature/payment-integration` |

## Workflow Examples

### Starting New Feature

```bash
# 1. Create and switch to new feature branch
bun run git:branch "stripe-payment-integration"

# 2. Make changes...

# 3. Save work in progress periodically
bun run git:wip "implemented payment form"
bun run git:wip "added webhook handler"

# 4. When feature is complete, commit and push
bun run git:done "feat: add Stripe payment integration"

# 5. Create pull request
bun run git:pr "Add Stripe payment integration" "Implements one-time payment flow with Stripe Checkout"
```

### Quick Bug Fix

```bash
# 1. Create fix branch
bun run git:branch "fix-resume-upload-bug"

# 2. Make the fix...

# 3. Commit and push
bun run git:done "fix: resolve issue with large file uploads"

# 4. Create PR
bun run git:pr "Fix resume upload bug"
```

### Working with Multiple Branches

```bash
# Save current work
bun run git:wip "working on payment flow"

# Switch to another branch (auto-saves if needed)
bun run git:switch feature/other-feature

# Work on that branch...

# Switch back
bun run git:switch feature/stripe-payment-integration
```

## Repository Maintenance

### Weekly Health Check

Run this weekly to ensure repository health:

```bash
bun run git:health-check
```

This checks:

- Repository integrity
- Uncommitted changes
- Remote connectivity
- Repository size and large files
- Backup status
- Branch synchronization

### Creating Backups

Create repository backups before major changes:

```bash
bun run git:backup
```

Backups are stored in `.git-backups/` (excluded from git).

### Cleaning Up Old Branches

After PRs are merged, clean up:

```bash
# Auto-cleanup all merged branches
bun run git:cleanup

# Or delete specific branch
bun run git:cleanup feature/old-feature
```

## Pre-commit Hook

The repository uses a pre-commit hook that runs:

- **lint-staged** - Automatically fixes linting issues in staged files
- **ESLint** - Checks TypeScript/JavaScript files in `apps/frontend/`

The hook will:

1. Run on every commit
2. Auto-fix linting issues when possible
3. Prevent commit if unfixable issues exist

## Integration with Monorepo

This git workflow is designed for Resume-Matcher's monorepo structure:

```
Resume-Matcher/
├── apps/
│   ├── frontend/  # Next.js 15 + Bun
│   └── backend/   # FastAPI + UV
├── scripts/       # Git workflow scripts
└── .husky/        # Git hooks
```

All commands work seamlessly across frontend and backend changes.

## Tips & Best Practices

1. **Use `git:wip` frequently** - Save progress often without worrying about perfect commit messages
2. **Let branch type detection work** - The system is smart about detecting the right branch type
3. **Run health checks weekly** - Catch issues early
4. **Create backups before major changes** - Better safe than sorry
5. **Clean up merged branches** - Keep your local repository tidy
6. **Use descriptive branch names** - They help with auto-detection and team communication

## Troubleshooting

### "You have uncommitted changes"

If you see this when trying to create a branch:

```bash
# Save your current work first
bun run git:wip "current work description"

# Then create the new branch
bun run git:branch "new-branch-name"
```

### PR Creation Fails

If `git:pr` fails to create a PR:

1. Check if GitHub CLI is installed: `gh --version`
2. If not installed: `https://cli.github.com/`
3. Authenticate: `gh auth login`

Or create PR manually using the URL shown in the error message.

### Pre-commit Hook Fails

If the pre-commit hook fails:

1. Check the error message for specific linting issues
2. Fix the issues manually
3. Try committing again

To bypass the hook (not recommended):

```bash
git commit --no-verify -m "message"
```

## Differences from creator-flow

This workflow is adapted from creator-flow with these changes:

1. **Monorepo Support** - Works with both frontend (Bun) and backend (UV)
2. **Simplified lint-staged** - Only checks frontend TypeScript/JavaScript files
3. **Repository Name** - Updated references from "creator-flow" to "Resume-Matcher"
4. **PR Templates** - Adapted for Resume-Matcher workflow (frontend + backend testing)
5. **Removed Unused Scripts** - Excluded scripts specific to creator-flow (git-mirror, git-recover, git-restore-backup)

## Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Git Branching Strategies](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
