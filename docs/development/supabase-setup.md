# Supabase Setup Guide

## Overview

This guide covers the complete Supabase setup for Resume-Matcher, including database schema, authentication, storage, and local development.

**Last Updated:** 2025-09-29
**Phase:** Phase 2 - Supabase Integration
**Status:** Complete

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Schema](#database-schema)
4. [Storage Configuration](#storage-configuration)
5. [Local Development](#local-development)
6. [Running Migrations](#running-migrations)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [x] Node.js 18+ installed
- [x] Bun package manager installed
- [x] Supabase CLI installed (`npm install -g supabase`)
- [x] Docker Desktop running (for local Supabase)
- [x] A Supabase account (https://supabase.com)

---

## Initial Setup

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - **Name:** Resume-Matcher
   - **Database Password:** [Generate strong password]
   - **Region:** São Paulo (sa-east-1) for Brazilian users
4. Wait for project to be provisioned (~2 minutes)

### 2. Get Project Credentials

From your Supabase dashboard:

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **Project API Key (anon/public)** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **Project API Key (service_role)** (`SUPABASE_SERVICE_ROLE_KEY`)

### 3. Link Local Project

```bash
# Navigate to project root
cd /home/carlos/projects/Resume-Matcher

# Initialize Supabase (if not done)
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF
```

**Find your project ref:**

- Dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Or in Settings → General → Reference ID

### 4. Configure Environment Variables

```bash
# Copy example environment file
cp .env .env.local

# Edit .env.local with your credentials
nano .env.local
```

Update these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

---

## Database Schema

### Tables

#### 1. `profiles`

Extends Supabase auth.users with additional user information.

**Columns:**

- `id` (UUID, PK) - References auth.users(id)
- `full_name` (TEXT)
- `email` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `deleted_at` (TIMESTAMPTZ) - Soft delete
- `data_retention_date` (TIMESTAMPTZ) - LGPD compliance
- `consent_marketing` (BOOLEAN)
- `consent_data_processing` (BOOLEAN)

**RLS Policies:**

- Users can view own profile
- Users can update own profile
- Users can insert own profile

#### 2. `optimizations`

Stores résumé optimization records.

**Columns:**

- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `input_resume_filename` (TEXT)
- `input_resume_storage_path` (TEXT)
- `input_job_description` (TEXT)
- `output_optimized_resume` (TEXT)
- `storage_path_docx` (TEXT)
- `status` (optimization_status ENUM)
- `stripe_payment_id` (TEXT)
- `stripe_payment_status` (TEXT)
- `processing_started_at` (TIMESTAMPTZ)
- `processing_completed_at` (TIMESTAMPTZ)
- `error_message` (TEXT)
- `ai_model_used` (TEXT)
- `ai_tokens_used` (INTEGER)
- `ai_processing_time_ms` (INTEGER)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `deleted_at` (TIMESTAMPTZ)

**Status Values:**

- `pending_payment` - Waiting for payment
- `payment_processing` - Payment being processed
- `processing` - AI optimization in progress
- `completed` - Successfully completed
- `failed` - Processing failed
- `cancelled` - User cancelled

**RLS Policies:**

- Users can view own optimizations
- Users can insert own optimizations
- Users can update own optimizations
- Users can soft delete own optimizations

### Views

#### `optimization_analytics`

Aggregated statistics per user.

**Columns:**

- `user_id`
- `total_optimizations`
- `completed_count`
- `failed_count`
- `processing_count`
- `total_tokens_used`
- `avg_processing_time_ms`
- `last_optimization_date`
- `first_optimization_date`

### Functions

1. **`handle_new_user()`** - Auto-creates profile on signup
2. **`update_updated_at_column()`** - Auto-updates timestamps
3. **`soft_delete_optimization()`** - Implements soft delete
4. **`cleanup_expired_data()`** - LGPD data cleanup

### Indexes

- `idx_profiles_email` - Fast email lookups
- `idx_optimizations_user_id` - Fast user queries
- `idx_optimizations_stripe_payment_id` - Payment lookups
- `idx_optimizations_status` - Status filtering
- `idx_optimizations_job_description_search` - Full-text search

---

## Storage Configuration

### Buckets

#### 1. `resumes`

Stores user-uploaded résumé files (PDF/DOCX).

**Configuration:**

- **Public:** No (private)
- **Max File Size:** 2 MB
- **Allowed MIME Types:**
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**RLS Policies:**

- Users can upload to own folder
- Users can view own files
- Users can update own files
- Users can delete own files

**Path Structure:**

```
resumes/
  └── {user_id}/
      └── {filename}
```

#### 2. `optimized-resumes`

Stores AI-optimized résumé outputs.

**Configuration:**

- **Public:** No (private)
- **Max File Size:** 5 MB
- **Allowed MIME Types:**
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**RLS Policies:**

- Users can view own files
- Service role can insert files

**Path Structure:**

```
optimized-resumes/
  └── {user_id}/
      └── {optimization_id}.docx
```

---

## Local Development

### Start Local Supabase

```bash
# Start all Supabase services
supabase start

# Output will show:
# - API URL: http://localhost:54321
# - Studio URL: http://localhost:54323
# - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# - Anon key: eyJ...
# - Service role key: eyJ...
```

### Access Supabase Studio

Open http://localhost:54323 in your browser.

**Default Credentials:**

- Studio runs without authentication locally
- View tables, run queries, test RLS policies

### Stop Local Supabase

```bash
# Stop services
supabase stop

# Reset database (WARNING: Deletes all data)
supabase db reset
```

---

## Running Migrations

### Apply Migrations to Remote

```bash
# Push local migrations to remote database
supabase db push

# Or apply specific migration
supabase db push --include-all
```

### Generate New Migration

```bash
# Create new empty migration
supabase migration new your_migration_name

# Or generate from diff (after local changes)
supabase db diff -f your_migration_name
```

### Rollback Migration

```bash
# Manual rollback: Run the rollback SQL file
supabase db execute -f supabase/migrations/20250929000001_rollback_initial_schema.sql

# Or reset to specific migration
supabase db reset --version 20250929000000
```

---

## Testing

### Test RLS Policies

```sql
-- Test as authenticated user
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'user-uuid-here';

-- Try to access own data (should succeed)
SELECT * FROM public.profiles WHERE id = 'user-uuid-here';

-- Try to access other user's data (should fail)
SELECT * FROM public.profiles WHERE id = 'other-user-uuid';
```

### Test Storage Policies

```javascript
// Test file upload
const { data, error } = await supabase.storage.from('resumes').upload(`${userId}/test.pdf`, file);

// Should succeed for own files
// Should fail for other users' folders
```

### Test Functions

```sql
-- Test LGPD cleanup (dry run)
SELECT public.cleanup_expired_data();

-- Check soft delete
DELETE FROM public.optimizations WHERE id = 'some-uuid';
-- Should set deleted_at instead of deleting
```

---

## Generate TypeScript Types

```bash
# Generate types from remote schema
npm run generate:types

# Or run script directly
./scripts/generate-supabase-types.sh

# Output: apps/frontend/types/database.types.ts
```

**Usage in Code:**

```typescript
import { Database, Optimization, Profile } from '@/types/database.types';

const optimization: Optimization = {
  id: '...',
  user_id: '...',
  // ... fully typed
};
```

---

## Troubleshooting

### Issue: Supabase CLI not found

**Solution:**

```bash
npm install -g supabase
# Or
brew install supabase/tap/supabase
```

### Issue: Docker not running

**Solution:**

```bash
# Start Docker Desktop
# Then run:
supabase start
```

### Issue: Migration fails on push

**Solution:**

```bash
# Check diff first
supabase db diff

# Reset local and re-apply
supabase db reset
supabase db push
```

### Issue: RLS policy denies access

**Solution:**

1. Check policy with: `\dp tablename` in psql
2. Test policy: `EXPLAIN ANALYZE SELECT ...`
3. Verify auth.uid() matches user_id
4. Check JWT claims in request

### Issue: Storage upload fails

**Solution:**

1. Verify bucket exists: Check Studio → Storage
2. Check file size limits in config.toml
3. Verify MIME type is allowed
4. Test RLS policy: Try with service role key

### Issue: Types out of sync

**Solution:**

```bash
# Regenerate types
npm run generate:types

# Compare with schema
supabase db diff
```

---

## LGPD Compliance

### Data Retention

- Users have `data_retention_date` (default: 5 years)
- Automatic cleanup via `cleanup_expired_data()` function
- Should be scheduled via cron or edge function

### Soft Deletes

- All deletions are soft (set `deleted_at`)
- Data is hidden from queries via RLS
- Hard delete after 90 days via cleanup

### User Rights

- Right to access: `SELECT * FROM profiles WHERE id = auth.uid()`
- Right to delete: Soft delete via trigger
- Right to export: Generate via API endpoint (future)

---

## Next Steps

1. ✅ Complete database setup
2. ⏭️ Implement authentication flows (Phase 2)
3. ⏭️ Set up Stripe integration (Phase 3)
4. ⏭️ Build frontend components (Phase 4)

---

## References

- [Supabase Documentation](https://supabase.com/docs)
- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)
- [Migration Plan](./migration-plan.md)
- [Architecture Document](./architecture.md)

---

**Document Status:** Complete
**Maintained By:** Database Specialist Agent
**Review Date:** 2025-12-29
