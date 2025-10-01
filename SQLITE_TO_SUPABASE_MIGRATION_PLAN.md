# SQLite to Supabase Migration Plan

## Summary

All SQLite model files have been successfully removed from the Resume-Matcher project. This document outlines the migration plan for converting all remaining components to use Supabase exclusively.

## ✅ Completed Tasks

### 1. SQLite Model Files Removed

- ✅ `/apps/backend/app/models/base.py` - Removed (SQLAlchemy DeclarativeBase)
- ✅ `/apps/backend/app/models/user.py` - Removed (User model)
- ✅ `/apps/backend/app/models/resume.py` - Removed (Resume, ProcessedResume models)
- ✅ `/apps/backend/app/models/job.py` - Removed (Job, ProcessedJob models)
- ✅ `/apps/backend/app/models/association.py` - Removed (job_resume_association table)
- ✅ `/apps/backend/app/models/__pycache__/` - Removed (Python cache)
- ✅ `/apps/backend/resume_matcher.db` - Identified (SQLite database file - needs removal)

### 2. Updated Model Module

- ✅ `/apps/backend/app/models/__init__.py` - Updated to placeholder file with migration notice

## 🔄 Critical Files Requiring Migration

### 1. Database Configuration Files

#### `/apps/backend/app/core/database.py`

**Current Issues:**

- Line 16: `from ..models.base import Base` (model doesn't exist)
- Line 128: `async def init_models(Base: Base)` (references deleted Base)
- SQLite-specific configuration (lines 33-49, 27, 74)
- SQLite engine creation and session management

**Required Changes:**

- Remove SQLAlchemy engine creation
- Replace with Supabase client session management
- Remove SQLite pragmas and configuration
- Update database connection handling

#### `/apps/backend/app/core/config.py`

**Current Issues:**

- Lines 17-18: `SYNC_DATABASE_URL`, `ASYNC_DATABASE_URL` (SQLite-specific)
- Missing Supabase configuration validation

**Required Changes:**

- Remove SQLite URL configurations
- Add Supabase-specific settings validation
- Update database configuration defaults

#### `/apps/backend/app/base.py`

**Current Issues:**

- Line 19: `from .models import Base` (model doesn't exist)
- Line 25: `await conn.run_sync(Base.metadata.create_all)` (SQLAlchemy metadata)

**Required Changes:**

- Remove Base metadata creation
- Update application lifecycle for Supabase

### 2. Service Layer Files

#### `/apps/backend/app/services/resume_service.py`

**Current Issues:**

- Line 13: `from app.models import ProcessedResume, Resume` (models don't exist)
- Line 114: `resume = Resume(...)` (SQLAlchemy model instantiation)
- Line 135: `processed_resume = ProcessedResume(...)` (SQLAlchemy model)
- Lines 219-226: SQLAlchemy queries using `select(Resume)`
- Lines 226-228: SQLAlchemy queries using `select(ProcessedResume)`

**Required Changes:**

- Replace model imports with Supabase client calls
- Convert SQLAlchemy queries to Supabase RPC/SQL queries
- Update data storage to use Supabase tables
- Modify session handling for Supabase

#### `/apps/backend/app/services/job_service.py`

**Current Issues:**

- Line 11: `from app.models import Job, ProcessedJob, Resume` (models don't exist)
- Line 38: `job = Job(...)` (SQLAlchemy model)
- Line 57: `query = select(Resume)` (SQLAlchemy query)
- Line 70: `processed_job = ProcessedJob(...)` (SQLAlchemy model)
- Lines 142-149: SQLAlchemy queries

**Required Changes:**

- Replace model imports with Supabase operations
- Convert SQLAlchemy queries to Supabase table operations
- Update job creation and retrieval logic

#### `/apps/backend/app/services/score_improvement_service.py`

**Current Issues:**

- Line 14: `from app.models import Job, ProcessedJob, ProcessedResume, Resume` (models don't exist)
- Multiple SQLAlchemy queries throughout the file

**Required Changes:**

- Replace all model imports with Supabase client calls
- Convert all SQLAlchemy operations to Supabase operations

### 3. API Router Files

#### `/apps/backend/app/api/router/v1/resume.py`

**Current Dependencies:**

- Uses `ResumeService` which depends on SQLAlchemy models
- Imports `get_db_session` from core (needs Supabase equivalent)

#### `/apps/backend/app/api/router/v1/job.py`

**Current Dependencies:**

- Uses `JobService` which depends on SQLAlchemy models
- Imports `get_db_session` from core (needs Supabase equivalent)

### 4. Core Module Files

#### `/apps/backend/app/core/__init__.py`

**Current Issues:**

- Line 2: Imports database functions that need Supabase equivalents
- Exports `init_models` function that needs updating

## 📋 Migration Tasks Priority

### Phase 1: Infrastructure Setup (HIGH PRIORITY)

1. **Update Database Configuration**
   - `/apps/backend/app/core/database.py` - Replace SQLAlchemy with Supabase client
   - `/apps/backend/app/core/config.py` - Remove SQLite URLs, add Supabase validation
   - `/apps/backend/app/base.py` - Remove Base metadata operations

2. **Create Supabase Client Module**
   - Replace `get_db_session` with Supabase client session management
   - Update database connection handling throughout app

### Phase 2: Service Layer Migration (HIGH PRIORITY)

1. **Resume Service Migration**
   - `/apps/backend/app/services/resume_service.py` - Convert to Supabase operations
   - Replace all SQLAlchemy queries with Supabase RPC/SQL calls
   - Update model instantiation to use Supabase insert operations

2. **Job Service Migration**
   - `/apps/backend/app/services/job_service.py` - Convert to Supabase operations
   - Replace all SQLAlchemy queries with Supabase table operations

3. **Score Improvement Service Migration**
   - `/apps/backend/app/services/score_improvement_service.py` - Convert to Supabase operations

### Phase 3: API Layer Updates (MEDIUM PRIORITY)

1. **Update API Dependencies**
   - Verify all API routes work with new service implementations
   - Update error handling for Supabase-specific errors

### Phase 4: Testing and Validation (MEDIUM PRIORITY)

1. **Remove SQLite Database File**
   - `/apps/backend/resume_matcher.db` - Delete after successful migration

2. **Update Dependencies**
   - Remove SQLAlchemy dependencies from pyproject.toml if no longer needed
   - Add Supabase Python client if not already present

## 🔧 Technical Implementation Notes

### Supabase Client Integration

- Replace `AsyncSession` with Supabase client operations
- Use Supabase's Python client for database operations
- Implement proper error handling for Supabase exceptions

### Data Model Mapping

| SQLAlchemy Model         | Supabase Table      | Notes                         |
| ------------------------ | ------------------- | ----------------------------- |
| `User`                   | `users`             | Use Supabase Auth users table |
| `Resume`                 | `resumes`           | Direct table mapping          |
| `ProcessedResume`        | `processed_resumes` | Direct table mapping          |
| `Job`                    | `jobs`              | Direct table mapping          |
| `ProcessedJob`           | `processed_jobs`    | Direct table mapping          |
| `job_resume_association` | `job_resume`        | Direct table mapping          |

### Query Conversion Examples

```python
# Before (SQLAlchemy)
query = select(Resume).where(Resume.resume_id == resume_id)
result = await db.execute(query)
resume = result.scalars().first()

# After (Supabase)
response = supabase.table('resumes').select('*').eq('resume_id', resume_id).execute()
resume = response.data[0] if response.data else None
```

## 🚨 Critical Migration Steps

1. **Database Session Management**: All files using `get_db_session` need to be updated to use Supabase client
2. **Model Operations**: Replace all SQLAlchemy model CRUD operations with Supabase table operations
3. **Error Handling**: Update exception handling to work with Supabase error responses
4. **Transaction Management**: Replace SQLAlchemy transactions with Supabase transaction patterns

## 📦 Dependencies Review

After migration, review and update:

- `pyproject.toml` - Remove SQLAlchemy dependencies if unused
- Add/update Supabase Python client dependency
- Update any development/test dependencies

## ✅ Success Criteria

1. All SQLAlchemy model imports are removed
2. All database operations use Supabase client
3. API endpoints return expected responses
4. Error handling works with Supabase exceptions
5. No SQLite database files remain
6. All services can perform CRUD operations via Supabase

---

**Next Steps:** Begin with Phase 1 by updating the database configuration files to remove SQLAlchemy dependencies and implement Supabase client management.
