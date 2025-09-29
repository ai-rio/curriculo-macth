# Naming Conventions - Resume-Matcher

## Overview

This document establishes unified naming conventions across the Resume-Matcher monorepo, covering both frontend (Next.js/TypeScript) and backend (FastAPI/Python) codebases. Consistent naming improves code readability, maintainability, and developer experience.

## General Principles

1. **Clarity over Brevity**: Use descriptive names that clearly communicate purpose
2. **Consistency**: Apply the same conventions throughout the codebase
3. **Context-Appropriate**: Choose naming style based on language and context
4. **Domain Language**: Use business domain terminology (résumé, optimization, ATS)
5. **Avoid Abbreviations**: Except for well-known acronyms (API, ATS, AI, URL)

## Frontend (TypeScript/React)

### File Naming

#### React Components

```typescript
// PascalCase for React components
ResumeUploader.tsx;
OptimizationResults.tsx;
PaymentForm.tsx;
JobDescriptionInput.tsx;

// Co-located files use same base name
ResumeUploader.tsx;
ResumeUploader.test.tsx;
ResumeUploader.stories.tsx;
ResumeUploader.module.css; // If using CSS modules
```

#### Hooks

```typescript
// camelCase with 'use' prefix
useResumeAnalysis.ts;
usePaymentIntent.ts;
useOptimizationStatus.ts;
useJobMatching.ts;
```

#### Utilities and Helpers

```typescript
// camelCase for utility files
resumeParser.ts;
textExtractor.ts;
fileValidator.ts;
formatHelper.ts;
```

#### API Routes (Next.js App Router)

```typescript
// kebab-case for route segments
app / api / optimize / route.ts;
app / api / payment / confirm / route.ts;
app / api / resume / upload / route.ts;
app / api / user / profile / route.ts;
```

#### Pages (Next.js App Router)

```typescript
// kebab-case for route segments
app / page.tsx; // Home page
app / dashboard / page.tsx; // Dashboard page
app / optimize / page.tsx; // Optimization page
app / pricing / page.tsx; // Pricing page
app / auth / login / page.tsx; // Login page (route group)
app / auth / register / page.tsx; // Register page (route group)
```

### Variables and Constants

#### Variables

```typescript
// camelCase for variables
const resumeText = "...";
const jobDescription = "...";
const matchPercentage = 85.5;
const optimizationResult = { ... };
```

#### Constants

```typescript
// SCREAMING_SNAKE_CASE for true constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ['pdf', 'docx', 'txt'];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY;

// PascalCase for enum-like objects
const ResumeFormat = {
  PDF: 'pdf',
  DOCX: 'docx',
  TXT: 'txt',
} as const;

const OptimizationStatus = {
  Pending: 'pending',
  Processing: 'processing',
  Completed: 'completed',
  Failed: 'failed',
} as const;
```

#### Configuration Objects

```typescript
// camelCase for config objects
const optimizationConfig = {
  maxTokens: 2000,
  temperature: 0.7,
  model: 'anthropic/claude-3-sonnet',
};

const validationRules = {
  minResumeLength: 100,
  maxResumeLength: 10000,
  minJobDescLength: 50,
  maxJobDescLength: 5000,
};
```

### Functions and Methods

```typescript
// camelCase for functions
function analyzeResume(text: string): AnalysisResult {}
function calculateMatchPercentage(resume: string, job: string): number {}
function formatCurrency(amount: number): string {}

// Event handlers use 'handle' prefix
function handleFileUpload(file: File): void {}
function handlePaymentSuccess(paymentId: string): void {}
function handleOptimizationComplete(result: OptimizationResult): void {}

// Boolean functions use 'is', 'has', 'can', 'should' prefix
function isValidResume(text: string): boolean {}
function hasPaymentConfirmed(paymentId: string): boolean {}
function canOptimize(user: User): boolean {}
function shouldShowPremium(user: User): boolean {}

// Async functions (no special prefix needed)
async function fetchOptimization(id: string): Promise<Optimization> {}
async function uploadResume(file: File): Promise<UploadResult> {}
```

### TypeScript Types and Interfaces

```typescript
// PascalCase for interfaces (prefer interfaces over types)
interface ResumeData {
  id: string;
  text: string;
  fileName: string;
  uploadedAt: Date;
}

interface OptimizationRequest {
  resumeText: string;
  jobDescription: string;
  paymentId: string;
}

// PascalCase for type aliases
type AnalysisResult = {
  matchPercentage: number;
  suggestions: string[];
  keywords: string[];
};

type OptimizationStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Props interfaces use 'Props' suffix
interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  maxSize: number;
  acceptedFormats: string[];
}

interface OptimizationResultsProps {
  result: OptimizationResult;
  onDownload: () => void;
}

// Generic type parameters use single uppercase letter or descriptive PascalCase
function processData<T>(data: T): T {}
function mapResults<TInput, TOutput>(items: TInput[], mapper: (item: TInput) => TOutput): TOutput[] {}
```

### React Components

```typescript
// PascalCase for component names
export function ResumeUploader({ onUpload, maxSize }: ResumeUploaderProps) {
  // Component implementation
}

// PascalCase for HOCs with 'with' prefix
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    // HOC implementation
  };
}

// camelCase for render functions
function renderUploadButton() {}
function renderErrorMessage() {}
```

### CSS/Tailwind Classes

```typescript
// Use descriptive class names with Tailwind
<div className="flex items-center justify-between">
<button className="btn-primary px-4 py-2 rounded-lg">

// Custom CSS classes use kebab-case (if using CSS modules)
.resume-uploader { }
.optimization-results { }
.payment-form { }
```

## Backend (Python/FastAPI)

### File Naming

```python
# snake_case for Python files
resume_analyzer.py
optimization_service.py
payment_handler.py
database_models.py
api_routes.py

# __init__.py for package initialization
__init__.py

# Test files with test_ prefix
test_resume_analyzer.py
test_optimization_service.py
test_payment_handler.py
```

### Directory Structure

```
apps/backend/
├── api/                    # API routes
│   ├── __init__.py
│   ├── v1/
│   │   ├── __init__.py
│   │   ├── optimize.py
│   │   ├── payment.py
│   │   └── user.py
├── services/              # Business logic
│   ├── __init__.py
│   ├── resume_service.py
│   ├── ai_service.py
│   └── payment_service.py
├── models/               # Database models
│   ├── __init__.py
│   ├── user.py
│   ├── optimization.py
│   └── payment.py
├── schemas/              # Pydantic schemas
│   ├── __init__.py
│   ├── optimization.py
│   └── payment.py
└── utils/                # Utility functions
    ├── __init__.py
    ├── text_processing.py
    └── validation.py
```

### Variables and Constants

```python
# snake_case for variables
resume_text = "..."
job_description = "..."
match_percentage = 85.5
optimization_result = {...}

# SCREAMING_SNAKE_CASE for constants
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
SUPPORTED_FORMATS = ['pdf', 'docx', 'txt']
API_BASE_URL = os.getenv("API_BASE_URL")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Configuration constants
DEFAULT_MODEL = "anthropic/claude-3-sonnet"
MAX_TOKENS = 2000
TEMPERATURE = 0.7
```

### Functions and Methods

```python
# snake_case for functions
def analyze_resume(text: str) -> AnalysisResult:
    pass

def calculate_match_percentage(resume: str, job: str) -> float:
    pass

def format_currency(amount: float) -> str:
    pass

# Boolean functions use 'is_', 'has_', 'can_', 'should_' prefix
def is_valid_resume(text: str) -> bool:
    pass

def has_payment_confirmed(payment_id: str) -> bool:
    pass

def can_optimize(user: User) -> bool:
    pass

# Async functions use same naming (async keyword makes it clear)
async def fetch_optimization(optimization_id: str) -> Optimization:
    pass

async def upload_resume(file: UploadFile) -> UploadResult:
    pass

# Private/internal functions use underscore prefix
def _extract_text_from_pdf(file_path: str) -> str:
    pass

def _calculate_internal_score(data: dict) -> float:
    pass
```

### Classes

```python
# PascalCase for class names
class ResumeAnalyzer:
    pass

class OptimizationService:
    pass

class PaymentHandler:
    pass

# Exception classes with 'Error' suffix
class ValidationError(Exception):
    pass

class PaymentError(Exception):
    pass

class AIServiceError(Exception):
    pass

# Pydantic models use PascalCase
class OptimizationRequest(BaseModel):
    resume_text: str
    job_description: str
    payment_id: str

class OptimizationResponse(BaseModel):
    optimization_id: str
    match_percentage: float
    optimized_text: str
```

### Database Models (SQLAlchemy/Supabase)

```python
# PascalCase for model classes
class User(Base):
    __tablename__ = "users"  # snake_case for table names

    id = Column(UUID, primary_key=True)
    email = Column(String)
    created_at = Column(DateTime)

class Optimization(Base):
    __tablename__ = "optimizations"  # snake_case for table names

    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"))
    resume_text = Column(Text)
    job_description = Column(Text)
    match_percentage = Column(Float)
    created_at = Column(DateTime)
```

### Enums

```python
from enum import Enum

# PascalCase for enum class, SCREAMING_SNAKE_CASE for values
class OptimizationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ResumeFormat(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    TXT = "txt"
```

### Type Hints

```python
from typing import Optional, List, Dict, Union, Any

# Use descriptive type hints
def process_resume(
    resume_text: str,
    job_description: str,
    options: Optional[Dict[str, Any]] = None
) -> OptimizationResult:
    pass

# Use generics when appropriate
from typing import TypeVar, Generic

T = TypeVar('T')

class Repository(Generic[T]):
    def get_by_id(self, id: str) -> Optional[T]:
        pass

    def list_all(self) -> List[T]:
        pass
```

## API Endpoints

### REST API Routes

```
# Use kebab-case for URL paths
POST   /api/v1/optimize
GET    /api/v1/optimize/{id}
POST   /api/v1/resume/upload
GET    /api/v1/resume/{id}
POST   /api/v1/payment/create-intent
POST   /api/v1/payment/confirm
GET    /api/v1/user/profile
PUT    /api/v1/user/profile
```

### Query Parameters

```
# Use snake_case for query parameters
GET /api/v1/optimizations?user_id=xxx&status=completed&sort_by=created_at
GET /api/v1/resume?file_format=pdf&min_length=100
```

## Database Schema

### Table Names

```sql
-- snake_case for table names (plural)
CREATE TABLE users (...);
CREATE TABLE optimizations (...);
CREATE TABLE payments (...);
CREATE TABLE resume_uploads (...);
```

### Column Names

```sql
-- snake_case for column names
CREATE TABLE optimizations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    resume_text TEXT NOT NULL,
    job_description TEXT NOT NULL,
    match_percentage DECIMAL(5, 2),
    optimized_text TEXT,
    payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes and Constraints

```sql
-- snake_case with descriptive prefixes
CREATE INDEX idx_optimizations_user_id ON optimizations(user_id);
CREATE INDEX idx_optimizations_created_at ON optimizations(created_at);
CREATE UNIQUE INDEX uniq_payments_stripe_id ON payments(stripe_payment_id);

-- Foreign key constraints
ALTER TABLE optimizations
ADD CONSTRAINT fk_optimizations_user
FOREIGN KEY (user_id) REFERENCES users(id);
```

## Environment Variables

```bash
# SCREAMING_SNAKE_CASE for environment variables
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
OPENROUTER_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Git Branch Naming

```bash
# Format: <type>/<description>
feature/resume-upload-component
feature/ai-optimization-service
fix/payment-webhook-handling
fix/resume-parser-encoding
chore/update-dependencies
docs/api-documentation
test/optimization-service-tests
refactor/extract-ai-service
```

## Git Commit Messages

```bash
# Format: <type>(<scope>): <description>
feat(frontend): add résumé upload component
feat(backend): implement AI optimization service
fix(payment): handle webhook timeout errors
fix(parser): support UTF-8 encoded résumés
test(backend): add unit tests for resume analyzer
docs(api): update optimization endpoint documentation
chore(deps): update next to 15.1.0
refactor(backend): extract AI service to separate module
```

## Domain-Specific Terms

### Preferred Terminology

Use these terms consistently across the codebase:

| Use This                        | Not This                      |
| ------------------------------- | ----------------------------- |
| résumé                          | resume, cv, curriculum vitae  |
| job description                 | job posting, job ad, position |
| optimization                    | enhancement, improvement      |
| match percentage                | score, rating, match score    |
| ATS (Applicant Tracking System) | tracking system, ats system   |
| AI model                        | model, llm, ai                |
| Brazilian professionals         | users, brazilians             |
| LGPD compliance                 | privacy, data protection      |

### TypeScript/Frontend Terms

```typescript
// Prefer these names
(resumeText, resumeFile, resumeData);
(jobDescription, jobPosting);
(optimizationResult, optimizationRequest);
(matchPercentage, matchScore);
(uploadedResume, processedResume);
```

### Python/Backend Terms

```python
# Prefer these names
resume_text, resume_file, resume_data
job_description, job_posting
optimization_result, optimization_request
match_percentage, match_score
uploaded_resume, processed_resume
```

## Acronyms and Abbreviations

### Common Acronyms (OK to Use)

- **API** - Application Programming Interface
- **ATS** - Applicant Tracking System
- **AI** - Artificial Intelligence
- **UI** - User Interface
- **UX** - User Experience
- **URL** - Uniform Resource Locator
- **UUID** - Universally Unique Identifier
- **JWT** - JSON Web Token
- **LGPD** - Lei Geral de Proteção de Dados (Brazilian GDPR)

### Avoid These Abbreviations

- ❌ `res` → ✅ `result` or `response`
- ❌ `req` → ✅ `request`
- ❌ `doc` → ✅ `document` or `documentation`
- ❌ `desc` → ✅ `description`
- ❌ `opt` → ✅ `optimization` or `option`
- ❌ `pct` → ✅ `percentage`
- ❌ `proc` → ✅ `process`
- ❌ `val` → ✅ `value` or `validate`

## Examples

### Good Examples

```typescript
// Frontend
const resumeUploadResult = await uploadResume(file);
const optimizationRequest = {
  resumeText: extractedText,
  jobDescription: userInput,
  paymentId: stripePaymentId,
};

function calculateMatchPercentage(resume: string, job: string): number {
  // Implementation
}

interface OptimizationResult {
  matchPercentage: number;
  suggestions: string[];
  optimizedText: string;
}
```

```python
# Backend
async def optimize_resume(
    resume_text: str,
    job_description: str,
    payment_id: str
) -> OptimizationResult:
    # Implementation
    pass

class OptimizationService:
    def __init__(self, ai_model: str):
        self.ai_model = ai_model

    async def process_optimization(
        self,
        request: OptimizationRequest
    ) -> OptimizationResult:
        # Implementation
        pass
```

### Bad Examples (Don't Do This)

```typescript
// ❌ Inconsistent naming
const ResUploadRes = await uploadRes(f);
const optReq = {
  resTxt: txt,
  jobDesc: inp,
  pymtId: id,
};

// ❌ Unclear abbreviations
function calcMtchPct(r: string, j: string): number {}

// ❌ Inconsistent interface naming
interface OptRes {
  mtchPct: number;
  suggs: string[];
  optTxt: string;
}
```

```python
# ❌ Inconsistent naming
async def opt_res(
    res_txt: str,
    job_desc: str,
    pymt_id: str
) -> OptRes:
    pass

# ❌ Unclear class naming
class OptSvc:
    def __init__(self, mdl: str):
        self.mdl = mdl
```

## Naming Checklist

Before committing code, verify:

- [ ] File names follow language conventions (PascalCase for React, snake_case for Python)
- [ ] Variable names are descriptive and use camelCase (TS) or snake_case (Python)
- [ ] Constants use SCREAMING_SNAKE_CASE
- [ ] Functions use camelCase (TS) or snake_case (Python)
- [ ] Classes use PascalCase
- [ ] Boolean functions start with is/has/can/should
- [ ] Event handlers start with handle (TS only)
- [ ] Type/Interface names use PascalCase
- [ ] Database tables/columns use snake_case
- [ ] API endpoints use kebab-case
- [ ] No unclear abbreviations used
- [ ] Domain terminology is consistent
- [ ] Git branch/commit messages follow conventions

## Related Documentation

- [Documentation Standards](./DOCUMENTATION_STANDARDS.md)
- [Code Organization](./CODE_ORGANIZATION.md)
- [Git Workflow](./GIT_WORKFLOW.md)

---

_Follow these naming conventions consistently to maintain a professional, readable, and maintainable codebase._
