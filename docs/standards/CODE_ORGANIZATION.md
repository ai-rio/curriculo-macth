# Code Organization Standards - Resume-Matcher

## Overview

This document defines the code organization structure for the Resume-Matcher monorepo, ensuring consistency across frontend (Next.js/TypeScript) and backend (FastAPI/Python) applications.

## Monorepo Structure

```
Resume-Matcher/
├── apps/
│   ├── frontend/              # Next.js 15+ application
│   └── backend/               # FastAPI application
├── packages/                  # Shared packages (future)
│   └── shared-types/         # Shared TypeScript/Python types
├── docs/                     # Documentation
│   ├── standards/           # Code standards
│   ├── development/         # Development guides
│   └── api/                # API documentation
├── scripts/                 # Build and utility scripts
├── .claude/                 # Claude AI agent configurations
│   ├── agents/             # Specialist agents
│   └── README.md          # Agent documentation
├── supabase/               # Supabase configuration
│   ├── migrations/        # Database migrations
│   └── functions/         # Edge functions
├── .github/               # GitHub workflows and templates
├── .husky/                # Git hooks
├── package.json           # Root package.json
├── bun.lock              # Bun lockfile
└── README.md             # Project README
```

## Frontend Structure (Next.js)

### Directory Organization

```
apps/frontend/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                  # Route group for auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/             # Route group for dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── optimize/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                     # API routes
│   │   │   ├── optimize/
│   │   │   │   └── route.ts
│   │   │   ├── payment/
│   │   │   │   └── confirm/
│   │   │   │       └── route.ts
│   │   │   └── resume/
│   │   │       └── upload/
│   │   │           └── route.ts
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles
│   │   └── providers.tsx           # React providers
│   ├── components/                 # React components
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── resume/                # Resume-related components
│   │   │   ├── ResumeUploader.tsx
│   │   │   ├── ResumePreview.tsx
│   │   │   └── ResumeUploader.test.tsx
│   │   ├── optimization/          # Optimization components
│   │   │   ├── OptimizationForm.tsx
│   │   │   ├── OptimizationResults.tsx
│   │   │   └── MatchPercentage.tsx
│   │   ├── payment/               # Payment components
│   │   │   ├── PaymentForm.tsx
│   │   │   ├── PricingCard.tsx
│   │   │   └── CheckoutButton.tsx
│   │   └── layout/                # Layout components
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── Sidebar.tsx
│   │       └── NavigationMenu.tsx
│   ├── lib/                       # Utility libraries
│   │   ├── api/                  # API client
│   │   │   ├── client.ts
│   │   │   ├── optimize.ts
│   │   │   ├── payment.ts
│   │   │   └── resume.ts
│   │   ├── supabase/             # Supabase client
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   └── storage.ts
│   │   ├── utils/                # General utilities
│   │   │   ├── cn.ts
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   └── hooks/                # Custom React hooks
│   │       ├── useAuth.ts
│   │       ├── useOptimization.ts
│   │       └── usePayment.ts
│   ├── types/                     # TypeScript type definitions
│   │   ├── resume.ts
│   │   ├── optimization.ts
│   │   ├── payment.ts
│   │   └── api.ts
│   ├── config/                    # Configuration files
│   │   ├── site.ts              # Site metadata
│   │   ├── stripe.ts            # Stripe config
│   │   └── constants.ts         # App constants
│   └── middleware.ts             # Next.js middleware
├── public/                        # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── tests/                         # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local                    # Environment variables
├── .env.example                  # Environment template
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── jest.config.js               # Jest configuration
├── package.json
└── README.md
```

### Component Organization

#### Feature-Based Components

Group related components by feature:

```typescript
// apps/frontend/src/components/resume/ResumeUploader.tsx
export function ResumeUploader({ onUpload, maxSize }: ResumeUploaderProps) {
  // Component implementation
}

// apps/frontend/src/components/resume/ResumeUploader.test.tsx
describe('ResumeUploader', () => {
  it('should handle file upload', () => {
    // Test implementation
  });
});

// apps/frontend/src/components/resume/index.ts
export { ResumeUploader } from './ResumeUploader';
export { ResumePreview } from './ResumePreview';
export type { ResumeUploaderProps } from './ResumeUploader';
```

#### Shared UI Components

Use shadcn/ui pattern for shared components:

```typescript
// apps/frontend/src/components/ui/button.tsx
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ className, variant = 'default', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'btn',
        variant === 'default' && 'btn-primary',
        variant === 'outline' && 'btn-outline',
        size === 'sm' && 'btn-sm',
        className
      )}
      {...props}
    />
  );
}
```

### API Layer Organization

```typescript
// apps/frontend/src/lib/api/client.ts
export const apiClient = {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Centralized API client
  },
};

// apps/frontend/src/lib/api/optimize.ts
import { apiClient } from './client';

export const optimizeApi = {
  async createOptimization(request: OptimizationRequest): Promise<OptimizationResult> {
    return apiClient.request('/api/v1/optimize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getOptimization(id: string): Promise<Optimization> {
    return apiClient.request(`/api/v1/optimize/${id}`);
  },
};

// Usage in components
import { optimizeApi } from '@/lib/api/optimize';

const result = await optimizeApi.createOptimization(request);
```

### Custom Hooks Organization

```typescript
// apps/frontend/src/lib/hooks/useOptimization.ts
import { useState, useCallback } from 'react';
import { optimizeApi } from '@/lib/api/optimize';

export function useOptimization() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const optimize = useCallback(async (request: OptimizationRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await optimizeApi.createOptimization(request);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { optimize, isLoading, error };
}
```

## Backend Structure (FastAPI)

### Directory Organization

```
apps/backend/
├── src/
│   ├── api/                          # API routes
│   │   ├── __init__.py
│   │   ├── v1/                      # API version 1
│   │   │   ├── __init__.py
│   │   │   ├── optimize.py         # Optimization endpoints
│   │   │   ├── payment.py          # Payment endpoints
│   │   │   ├── resume.py           # Resume endpoints
│   │   │   └── user.py             # User endpoints
│   │   └── dependencies.py         # Shared dependencies
│   ├── services/                    # Business logic
│   │   ├── __init__.py
│   │   ├── resume_service.py       # Resume processing
│   │   ├── ai_service.py           # AI optimization
│   │   ├── payment_service.py      # Payment handling
│   │   └── storage_service.py      # File storage
│   ├── repositories/                # Data access layer
│   │   ├── __init__.py
│   │   ├── base_repository.py
│   │   ├── optimization_repository.py
│   │   ├── payment_repository.py
│   │   └── user_repository.py
│   ├── models/                      # Database models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── optimization.py
│   │   └── payment.py
│   ├── schemas/                     # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── optimization.py         # Request/response schemas
│   │   ├── payment.py
│   │   └── common.py               # Shared schemas
│   ├── core/                        # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py               # App configuration
│   │   ├── database.py             # Database setup
│   │   ├── security.py             # Security utilities
│   │   └── logging.py              # Logging setup
│   ├── utils/                       # Utility functions
│   │   ├── __init__.py
│   │   ├── text_processing.py     # Text utilities
│   │   ├── file_processing.py     # File utilities
│   │   └── validation.py          # Validation helpers
│   ├── exceptions/                  # Custom exceptions
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── validation.py
│   │   └── service.py
│   └── main.py                     # FastAPI app entry point
├── tests/                           # Test files
│   ├── __init__.py
│   ├── unit/
│   │   ├── test_resume_service.py
│   │   ├── test_ai_service.py
│   │   └── test_payment_service.py
│   ├── integration/
│   │   ├── test_optimize_api.py
│   │   └── test_payment_api.py
│   └── conftest.py                # Pytest configuration
├── alembic/                        # Database migrations
│   ├── versions/
│   └── env.py
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── pyproject.toml                # Python dependencies (UV)
├── pytest.ini                    # Pytest configuration
└── README.md
```

### API Routes Organization

```python
# apps/backend/src/api/v1/optimize.py
from fastapi import APIRouter, Depends, HTTPException
from src.schemas.optimization import OptimizationRequest, OptimizationResponse
from src.services.resume_service import ResumeService
from src.api.dependencies import get_current_user, get_resume_service

router = APIRouter(prefix="/optimize", tags=["optimization"])

@router.post("/", response_model=OptimizationResponse)
async def create_optimization(
    request: OptimizationRequest,
    user = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
) -> OptimizationResponse:
    """
    Optimize résumé for specific job description.

    Requires valid payment confirmation before processing.
    """
    result = await resume_service.optimize_resume(
        resume_text=request.resume_text,
        job_description=request.job_description,
        user_id=user.id,
        payment_id=request.payment_id
    )
    return result
```

### Service Layer Organization

```python
# apps/backend/src/services/resume_service.py
from typing import Optional
from src.repositories.optimization_repository import OptimizationRepository
from src.services.ai_service import AIService
from src.services.payment_service import PaymentService
from src.exceptions.service import OptimizationError, PaymentError

class ResumeService:
    """
    Service for résumé optimization operations.

    Coordinates AI optimization, payment verification, and data persistence.
    """

    def __init__(
        self,
        optimization_repo: OptimizationRepository,
        ai_service: AIService,
        payment_service: PaymentService
    ):
        self.optimization_repo = optimization_repo
        self.ai_service = ai_service
        self.payment_service = payment_service

    async def optimize_resume(
        self,
        resume_text: str,
        job_description: str,
        user_id: str,
        payment_id: str
    ) -> OptimizationResult:
        """
        Optimize résumé using AI.

        Args:
            resume_text: Original résumé text
            job_description: Target job description
            user_id: User identifier
            payment_id: Payment confirmation ID

        Returns:
            OptimizationResult with optimized text and metrics

        Raises:
            PaymentError: If payment is not confirmed
            OptimizationError: If optimization fails
        """
        # Verify payment
        if not await self.payment_service.verify_payment(payment_id):
            raise PaymentError("Payment not confirmed")

        # Perform optimization
        result = await self.ai_service.optimize(resume_text, job_description)

        # Save to database
        await self.optimization_repo.create(
            user_id=user_id,
            resume_text=resume_text,
            job_description=job_description,
            result=result,
            payment_id=payment_id
        )

        return result
```

### Repository Pattern

```python
# apps/backend/src/repositories/base_repository.py
from typing import Generic, TypeVar, Optional, List
from abc import ABC, abstractmethod

T = TypeVar('T')

class BaseRepository(Generic[T], ABC):
    """Base repository with common CRUD operations."""

    @abstractmethod
    async def get_by_id(self, id: str) -> Optional[T]:
        """Get entity by ID."""
        pass

    @abstractmethod
    async def create(self, entity: T) -> T:
        """Create new entity."""
        pass

    @abstractmethod
    async def update(self, id: str, entity: T) -> T:
        """Update existing entity."""
        pass

    @abstractmethod
    async def delete(self, id: str) -> bool:
        """Delete entity."""
        pass

    @abstractmethod
    async def list_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """List all entities with pagination."""
        pass

# apps/backend/src/repositories/optimization_repository.py
from typing import Optional, List
from src.repositories.base_repository import BaseRepository
from src.models.optimization import Optimization

class OptimizationRepository(BaseRepository[Optimization]):
    """Repository for optimization data access."""

    async def get_by_user_id(self, user_id: str) -> List[Optimization]:
        """Get all optimizations for a user."""
        # Implementation using Supabase client
        pass

    async def get_by_payment_id(self, payment_id: str) -> Optional[Optimization]:
        """Get optimization by payment ID."""
        # Implementation
        pass
```

### Dependency Injection

```python
# apps/backend/src/api/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.core.database import get_db
from src.services.resume_service import ResumeService
from src.repositories.optimization_repository import OptimizationRepository
from src.core.security import verify_jwt_token

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Dependency to get current authenticated user."""
    token = credentials.credentials
    user = await verify_jwt_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return user

async def get_resume_service(db = Depends(get_db)) -> ResumeService:
    """Dependency to get resume service instance."""
    optimization_repo = OptimizationRepository(db)
    ai_service = AIService()
    payment_service = PaymentService()
    return ResumeService(optimization_repo, ai_service, payment_service)
```

## Shared Packages

### Shared Types Package

```
packages/shared-types/
├── src/
│   ├── resume.ts              # TypeScript types
│   ├── optimization.ts
│   ├── payment.ts
│   └── index.ts
├── python/
│   ├── resume.py             # Python equivalents
│   ├── optimization.py
│   └── payment.py
├── package.json
└── README.md
```

## Testing Organization

### Frontend Tests

```typescript
// apps/frontend/tests/unit/components/ResumeUploader.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ResumeUploader } from '@/components/resume/ResumeUploader';

describe('ResumeUploader', () => {
  it('should render upload button', () => {
    render(<ResumeUploader onUpload={jest.fn()} maxSize={5242880} />);
    expect(screen.getByText('Upload Résumé')).toBeInTheDocument();
  });

  it('should handle file selection', async () => {
    const onUpload = jest.fn();
    render(<ResumeUploader onUpload={onUpload} maxSize={5242880} />);

    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Upload file');

    await fireEvent.change(input, { target: { files: [file] } });

    expect(onUpload).toHaveBeenCalledWith(file);
  });
});
```

### Backend Tests

```python
# apps/backend/tests/unit/test_resume_service.py
import pytest
from src.services.resume_service import ResumeService
from src.exceptions.service import PaymentError

@pytest.mark.asyncio
async def test_optimize_resume_success(
    resume_service: ResumeService,
    mock_payment_service,
    mock_ai_service
):
    """Test successful résumé optimization."""
    # Arrange
    mock_payment_service.verify_payment.return_value = True
    mock_ai_service.optimize.return_value = {
        "optimized_text": "Optimized résumé...",
        "match_percentage": 85.5
    }

    # Act
    result = await resume_service.optimize_resume(
        resume_text="Original résumé...",
        job_description="Job description...",
        user_id="user-123",
        payment_id="pi_123"
    )

    # Assert
    assert result.match_percentage == 85.5
    assert "Optimized" in result.optimized_text

@pytest.mark.asyncio
async def test_optimize_resume_payment_not_confirmed(resume_service: ResumeService):
    """Test optimization fails when payment is not confirmed."""
    with pytest.raises(PaymentError, match="Payment not confirmed"):
        await resume_service.optimize_resume(
            resume_text="Original résumé...",
            job_description="Job description...",
            user_id="user-123",
            payment_id="invalid"
        )
```

## Import Organization

### TypeScript Imports

```typescript
// Order: External → Internal → Relative → Types → Styles
import { useState, useEffect } from 'react'; // External
import { Button } from '@/components/ui/button'; // Internal (absolute)
import { ResumePreview } from './ResumePreview'; // Relative
import type { OptimizationResult } from '@/types'; // Types
import './styles.css'; // Styles

// Use absolute imports for internal modules
import { optimizeApi } from '@/lib/api/optimize';
import { useAuth } from '@/lib/hooks/useAuth';

// Group related imports
import { OptimizationStatus, type OptimizationRequest, type OptimizationResponse } from '@/types/optimization';
```

### Python Imports

```python
# Order: Standard → Third-party → Local
import os                                      # Standard library
import logging
from typing import Optional, List

from fastapi import APIRouter, Depends        # Third-party
from pydantic import BaseModel

from src.services.resume_service import ResumeService      # Local
from src.schemas.optimization import OptimizationRequest
from src.api.dependencies import get_current_user

# Use absolute imports from src/
from src.core.config import settings
from src.utils.validation import validate_resume_text
```

## File Size Guidelines

### Keep Files Focused and Manageable

- **Components**: Max 200-300 lines
- **Services**: Max 300-400 lines
- **Utilities**: Max 100-200 lines
- **API Routes**: Max 150-200 lines per router

If files exceed these limits, consider splitting:

```typescript
// Before: Large component file (400 lines)
// ResumeUploader.tsx (400 lines - too large!)

// After: Split into smaller files
ResumeUploader.tsx; // Main component (150 lines)
ResumeUploader.hooks.ts; // Custom hooks (100 lines)
ResumeUploader.utils.ts; // Helper functions (80 lines)
ResumeUploader.types.ts; // Type definitions (50 lines)
```

## Configuration Files Organization

### Environment Variables

```bash
# Keep separate files for different environments
.env.local              # Local development (gitignored)
.env.example           # Template with dummy values (committed)
.env.production        # Production (never committed)
.env.test             # Test environment (gitignored)
```

### Configuration Files

```
# Root level
package.json           # Workspace configuration
tsconfig.json         # Base TypeScript config
.gitignore
.prettierrc
.eslintrc.json

# Frontend
apps/frontend/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json        # Extends root config
├── jest.config.js
└── .env.local

# Backend
apps/backend/
├── pyproject.toml       # UV dependencies
├── pytest.ini
├── alembic.ini
└── .env
```

## Best Practices

### Do's

✅ Group related files by feature
✅ Keep components small and focused
✅ Use barrel exports (index.ts/py) for public APIs
✅ Separate business logic from UI components
✅ Use dependency injection for services
✅ Keep tests next to code they test
✅ Use absolute imports for internal modules
✅ Organize imports consistently
✅ Split large files into smaller, focused files
✅ Use TypeScript path aliases

### Don'ts

❌ Don't mix business logic with UI components
❌ Don't create circular dependencies
❌ Don't use default exports (prefer named exports)
❌ Don't create deeply nested directories (max 3-4 levels)
❌ Don't put all code in a single file
❌ Don't mix concerns in the same file
❌ Don't use relative imports for distant modules
❌ Don't duplicate code across files

## Related Documentation

- [Documentation Standards](./DOCUMENTATION_STANDARDS.md)
- [Naming Conventions](./NAMING_CONVENTIONS.md)
- [Git Workflow](./GIT_WORKFLOW.md)

---

_Follow these organization standards to maintain a clean, scalable, and maintainable codebase._
