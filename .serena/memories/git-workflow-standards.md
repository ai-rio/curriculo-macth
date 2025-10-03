# Git Workflow Standards - Resume-Matcher SaaS

## 🔄 **MANDATORY: Use Git Workflow Scripts**

**NEVER use direct git commands for committing**. Always use the project's git workflow scripts:

### **Available Git Scripts:**

```bash
bun run git:status      # Check git status
bun run git:wip         # Save work in progress
bun run git:save "commit message"  # Save with proper commit message
bun run git:done        # Mark work as done
bun run git:push        # Push to remote
bun run git:branch      # Create/switch branches
bun run git:switch      # Switch branches
bun run git:pr          # Create pull request
bun run git:cleanup     # Clean up branches
bun run git:backup      # Backup changes
bun run git:health-check # Check git health
```

### **✅ Correct Workflow:**

1. Make changes to code
2. Use `bun run git:save "type(scope): description"` to commit
3. The script automatically handles:
   - Staging relevant files
   - Running linting and formatting
   - Type checking
   - Conventional commit format
   - Pre-commit hooks

### **❌ NEVER DO:**

```bash
# Don't use direct git commands
git add .
git commit -m "message"
git push
```

### **✅ ALWAYS DO:**

```bash
# Use the git workflow scripts
bun run git:save "feat(blog): add new blog component"
bun run git:push
```

### **Why This Matters:**

- Enforces consistent code quality
- Runs all necessary checks before commit
- Maintains conventional commit format
- Handles complex staging automatically
- Prevents commits with linting/type errors

## 📝 **Conventional Commit Format**

The git scripts enforce this format:

```
type(scope): description

feat(blog): add blog search functionality
fix(auth): resolve login issue
docs(readme): update installation guide
style(button): improve button styling
refactor(api): simplify user service
test(component): add unit tests for blog
chore(deps): update dependencies
```

## 🎯 **Before Any Commit:**

1. **Type check**: `bun run type-check:frontend`
2. **Lint**: `bun run lint:frontend`
3. **Test**: `bun run test:frontend`
4. **Use git script**: `bun run git:save "message"`

The git workflow scripts will automatically run these checks and fail if there are errors.

## ⚠️ **Common Issues & Solutions:**

- **TypeScript errors**: Fix type issues before using git:save
- **Linting errors**: Run `bun run lint:fix:frontend` first
- **Test failures**: Fix tests before committing
- **Script failures**: Check error output and fix underlying issues

This ensures consistent, high-quality commits across the entire team.
