# Documentation Standards - Resume-Matcher

## Overview

This document defines the official documentation standards for Resume-Matcher (AI Résumé Optimization SaaS), ensuring consistent, maintainable, and discoverable documentation across both frontend (Next.js/TypeScript) and backend (FastAPI/Python) codebases.

## Documentation Architecture

### Project Structure

All documentation follows this structure:

```
docs/
├── standards/              # Documentation and code standards
│   ├── DOCUMENTATION_STANDARDS.md
│   ├── NAMING_CONVENTIONS.md
│   ├── CODE_ORGANIZATION.md
│   └── GIT_WORKFLOW.md
├── development/           # Development guides and ADRs
│   ├── architecture/      # Architecture decisions
│   ├── features/         # Feature documentation
│   └── guides/           # Setup and workflow guides
└── api/                  # API documentation
    ├── frontend/         # Frontend API documentation
    └── backend/          # Backend API documentation
```

### File Naming Convention

| Type                   | Format                          | Example                          |
| ---------------------- | ------------------------------- | -------------------------------- |
| Standards              | `UPPERCASE_WITH_UNDERSCORES.md` | `NAMING_CONVENTIONS.md`          |
| Architecture Decisions | `ADR-###-descriptive-name.md`   | `ADR-001-monorepo-structure.md`  |
| Feature Docs           | `feature-descriptive-name.md`   | `feature-resume-optimization.md` |
| API Docs               | `api-section-name.md`           | `api-authentication.md`          |

## Code Documentation

### TypeScript/JavaScript (Frontend)

#### Component Documentation

````typescript
/**
 * ResumeUploader Component
 *
 * Handles résumé file uploads with validation and preview.
 * Supports PDF, DOCX, and TXT formats up to 5MB.
 *
 * @component
 * @example
 * ```tsx
 * <ResumeUploader
 *   onUpload={(file) => handleFile(file)}
 *   maxSize={5 * 1024 * 1024}
 * />
 * ```
 */
export function ResumeUploader({ onUpload, maxSize }: ResumeUploaderProps) {
  // Implementation
}
````

#### Function Documentation

````typescript
/**
 * Analyzes résumé text and extracts key information
 *
 * @param resumeText - The raw text content of the résumé
 * @param jobDescription - The target job description
 * @returns Analysis result with match percentage and suggestions
 *
 * @throws {ValidationError} If resumeText is empty
 * @throws {APIError} If OpenRouter API fails
 *
 * @example
 * ```typescript
 * const result = await analyzeResume(
 *   resumeText,
 *   jobDescription
 * );
 * console.log(result.matchPercentage);
 * ```
 */
export async function analyzeResume(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
  // Implementation
}
````

#### Interface/Type Documentation

```typescript
/**
 * Configuration for résumé optimization
 */
interface OptimizationConfig {
  /** Target job description to optimize against */
  jobDescription: string;

  /** AI model to use for optimization (default: 'gpt-4') */
  model?: string;

  /** Maximum tokens for AI response (default: 2000) */
  maxTokens?: number;

  /** Whether to preserve original formatting (default: true) */
  preserveFormatting?: boolean;
}
```

### Python (Backend)

#### Class Documentation

```python
class ResumeAnalyzer:
    """
    Analyzes résumés using AI to match job descriptions.

    This service handles:
    - Text extraction from various formats (PDF, DOCX, TXT)
    - AI-powered analysis via OpenRouter
    - Match percentage calculation
    - Optimization suggestions generation

    Attributes:
        model_name: The OpenRouter model to use for analysis
        api_key: OpenRouter API key from environment

    Example:
        >>> analyzer = ResumeAnalyzer(model_name="anthropic/claude-3-sonnet")
        >>> result = await analyzer.analyze(resume_text, job_desc)
        >>> print(result.match_percentage)
        75.5
    """

    def __init__(self, model_name: str = "anthropic/claude-3-sonnet"):
        """
        Initialize the analyzer with specified model.

        Args:
            model_name: OpenRouter model identifier

        Raises:
            ValueError: If model_name is not supported
        """
        self.model_name = model_name
        self.api_key = os.getenv("OPENROUTER_API_KEY")
```

#### Function Documentation

```python
async def optimize_resume(
    resume_text: str,
    job_description: str,
    user_id: str,
    payment_id: str
) -> OptimizationResult:
    """
    Optimizes résumé for specific job description using AI.

    This is the main optimization pipeline that:
    1. Validates payment status
    2. Analyzes current résumé against job description
    3. Generates optimization suggestions
    4. Creates optimized version
    5. Stores result in database

    Args:
        resume_text: Original résumé text content
        job_description: Target job description
        user_id: UUID of the user requesting optimization
        payment_id: Stripe payment ID for this optimization

    Returns:
        OptimizationResult containing:
        - optimized_text: The optimized résumé text
        - match_percentage: Match score (0-100)
        - suggestions: List of specific improvements made
        - download_url: URL to download optimized .docx file

    Raises:
        PaymentError: If payment is not confirmed
        ValidationError: If input text is invalid
        AIServiceError: If OpenRouter API fails

    Example:
        >>> result = await optimize_resume(
        ...     resume_text="...",
        ...     job_description="...",
        ...     user_id="uuid-here",
        ...     payment_id="pi_xxx"
        ... )
        >>> print(result.match_percentage)
        85.2
    """
    # Implementation
```

#### Pydantic Model Documentation

```python
from pydantic import BaseModel, Field

class OptimizationRequest(BaseModel):
    """
    Request model for résumé optimization endpoint.

    All fields are validated according to business rules:
    - Resume text: 100-10000 characters
    - Job description: 50-5000 characters
    - Payment ID: Valid Stripe payment intent ID
    """

    resume_text: str = Field(
        ...,
        min_length=100,
        max_length=10000,
        description="Original résumé text to optimize"
    )

    job_description: str = Field(
        ...,
        min_length=50,
        max_length=5000,
        description="Target job description"
    )

    payment_id: str = Field(
        ...,
        regex=r"^pi_[a-zA-Z0-9]+$",
        description="Stripe payment intent ID"
    )

    class Config:
        schema_extra = {
            "example": {
                "resume_text": "John Doe\nSoftware Engineer...",
                "job_description": "We are looking for...",
                "payment_id": "pi_1234567890"
            }
        }
```

## README Standards

### Repository README Structure

````markdown
# Project Name

Brief one-line description

## Overview

Comprehensive project description (2-3 paragraphs)

## Features

- Feature 1
- Feature 2
- Feature 3

## Tech Stack

### Frontend

- Next.js 15+
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- FastAPI
- Python 3.11+
- Supabase
- OpenRouter

## Prerequisites

- Bun 1.0+
- Python 3.11+
- UV package manager
- Supabase account
- Stripe account (test mode)
- OpenRouter API key

## Getting Started

### Installation

```bash
# Step-by-step installation commands
```
````

### Configuration

```bash
# Environment setup
```

### Running Locally

```bash
# Development commands
```

## Project Structure

```
project/
├── apps/
│   ├── frontend/
│   └── backend/
├── docs/
└── README.md
```

## Testing

```bash
# Test commands
```

## Deployment

Brief deployment instructions

## Contributing

Link to CONTRIBUTING.md

## License

License information

````

### Feature Module README Structure

```markdown
# Feature Name

## Purpose

What this feature does and why it exists

## Architecture

Technical architecture overview with diagrams

## Components

### Frontend Components
- Component 1: Description
- Component 2: Description

### Backend Services
- Service 1: Description
- Service 2: Description

## API Endpoints

### POST /api/feature
Description and example

## Database Schema

Tables and relationships

## Testing

How to test this feature

## Configuration

Required environment variables

## Related Documentation

- [Main Docs](link)
- [API Docs](link)
````

## API Documentation

### REST API Documentation

Each API endpoint must be documented with:

````markdown
## POST /api/v1/optimize

Optimizes a résumé for a specific job description.

### Authentication

Requires valid JWT token from Supabase Auth.

```typescript
Authorization: Bearer<token>;
```
````

### Request Body

```typescript
{
  "resume_text": string,      // 100-10000 chars
  "job_description": string,  // 50-5000 chars
  "payment_id": string        // Stripe payment ID
}
```

### Response

**Success (200)**

```typescript
{
  "success": true,
  "data": {
    "optimization_id": string,
    "match_percentage": number,
    "optimized_text": string,
    "suggestions": string[],
    "download_url": string
  }
}
```

**Error (400)**

```typescript
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Resume text is too short"
  }
}
```

### Error Codes

| Code               | Description               |
| ------------------ | ------------------------- |
| `INVALID_INPUT`    | Request validation failed |
| `PAYMENT_REQUIRED` | Payment not confirmed     |
| `AI_SERVICE_ERROR` | OpenRouter API failed     |

### Example

```typescript
const response = await fetch('/api/v1/optimize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    resume_text: 'John Doe...',
    job_description: 'We are looking for...',
    payment_id: 'pi_1234567890',
  }),
});
```

````

## Diagram Standards

### Mermaid Diagrams

Use Mermaid for all technical diagrams:

#### System Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[User Interface]
        API[API Routes]
    end

    subgraph "Backend (FastAPI)"
        Resume[Resume Service]
        AI[AI Service]
        Payment[Payment Service]
    end

    subgraph "External Services"
        Supabase[(Supabase)]
        OpenRouter[OpenRouter API]
        Stripe[Stripe API]
    end

    UI --> API
    API --> Resume
    Resume --> AI
    Resume --> Payment
    AI --> OpenRouter
    Payment --> Stripe
    Resume --> Supabase
````

#### Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Stripe
    participant OpenRouter
    participant Supabase

    User->>Frontend: Upload résumé
    User->>Frontend: Paste job description
    Frontend->>Stripe: Initialize payment
    Stripe->>Frontend: Payment confirmation
    Frontend->>Backend: Send optimization request
    Backend->>Supabase: Verify payment
    Backend->>OpenRouter: Request AI optimization
    OpenRouter->>Backend: Optimized résumé
    Backend->>Supabase: Store result
    Backend->>Frontend: Return download URL
    Frontend->>User: Download .docx
```

## Commit Message Standards

Follow Conventional Commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(frontend): add résumé upload component

- Implement drag-and-drop upload
- Add file validation (PDF, DOCX, TXT)
- Add progress indicator
- Add error handling

Closes #123

feat(backend): implement AI optimization service

- Integrate OpenRouter API
- Add match percentage calculation
- Implement optimization suggestions
- Add rate limiting

fix(payment): handle Stripe webhook errors correctly

- Add retry logic for failed webhooks
- Improve error logging
- Add monitoring alerts

test(backend): add unit tests for resume analyzer

- Test text extraction
- Test AI service integration
- Test error handling
```

## Architecture Decision Records (ADRs)

### ADR Template

```markdown
# ADR-###: Decision Title

## Status

[Proposed | Accepted | Deprecated | Superseded]

## Context

Describe the problem and context that led to this decision.

## Decision

The decision that was made and why.

## Consequences

### Positive

- Benefit 1
- Benefit 2

### Negative

- Trade-off 1
- Trade-off 2

## Alternatives Considered

### Alternative 1

Description and why it was rejected.

### Alternative 2

Description and why it was rejected.

## Implementation Notes

Technical details for implementing this decision.

## Related Decisions

- ADR-###: Related Decision
```

## Quality Gates

### Documentation Review Checklist

- [ ] **Follows Standards**: Uses proper structure and naming
- [ ] **Technical Accuracy**: Information is correct and up-to-date
- [ ] **Completeness**: All required sections are present
- [ ] **Clarity**: Content is clear and understandable
- [ ] **Code Examples**: Includes relevant, working examples
- [ ] **Diagrams**: Includes technical diagrams where appropriate
- [ ] **Links**: All internal links work correctly
- [ ] **Language**: Uses consistent terminology
- [ ] **Grammar**: Free of spelling and grammar errors

### Code Documentation Checklist

- [ ] **All public APIs documented**: Functions, classes, interfaces
- [ ] **Parameters documented**: Description and types
- [ ] **Return values documented**: Type and description
- [ ] **Errors documented**: What errors can be thrown
- [ ] **Examples provided**: Realistic usage examples
- [ ] **Edge cases noted**: Unusual behaviors or limitations

## Best Practices

### Do's

✅ Write documentation as you code
✅ Update documentation when code changes
✅ Use consistent terminology
✅ Provide practical examples
✅ Include diagrams for complex concepts
✅ Link to related documentation
✅ Keep documentation close to code (JSDoc, docstrings)
✅ Use TypeScript/Python type hints
✅ Document "why" not just "what"
✅ Review documentation in PRs

### Don'ts

❌ Don't write documentation after project completion
❌ Don't use vague or ambiguous language
❌ Don't duplicate documentation
❌ Don't document obvious code
❌ Don't skip examples
❌ Don't use outdated screenshots or code
❌ Don't assume prior knowledge
❌ Don't forget to update documentation
❌ Don't use inconsistent terminology

## Tools

### Documentation Generation

- **TypeScript**: Use TSDoc comments
- **Python**: Use docstrings with type hints
- **API**: Use OpenAPI/Swagger for REST APIs
- **Diagrams**: Use Mermaid for all diagrams

### Linting

```bash
# Frontend - Check TypeScript documentation
bun run lint:docs

# Backend - Check Python docstrings
uv run pydocstyle apps/backend/

# Markdown - Check markdown files
bun run markdownlint docs/
```

## Related Documentation

- [Naming Conventions](./NAMING_CONVENTIONS.md)
- [Code Organization](./CODE_ORGANIZATION.md)
- [Git Workflow](./GIT_WORKFLOW.md)
- [Main README](../../README.md)

---

_This document is the foundation for all Resume-Matcher documentation and ensures consistency across the entire monorepo._
