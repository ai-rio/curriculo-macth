# Supabase Quick Reference

Quick commands and snippets for Resume-Matcher Supabase operations.

---

## Common Commands

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset database (deletes all data)
supabase db reset

# Push migrations to remote
supabase db push

# Create new migration
supabase migration new migration_name

# Generate TypeScript types
npm run generate:types

# View database diff
supabase db diff

# Open Studio
open http://localhost:54323
```

---

## Database Queries

### Get User Profile

```sql
SELECT * FROM public.profiles WHERE id = auth.uid();
```

### List User Optimizations

```sql
SELECT *
FROM public.optimizations
WHERE user_id = auth.uid()
  AND deleted_at IS NULL
ORDER BY created_at DESC;
```

### Get Optimization Analytics

```sql
SELECT * FROM public.optimization_analytics
WHERE user_id = auth.uid();
```

### Test RLS Policy

```sql
-- Set role to authenticated user
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'user-uuid-here';

-- Test query (should only see own data)
SELECT * FROM public.optimizations;

-- Reset role
RESET ROLE;
```

---

## TypeScript Usage

### Import Types

```typescript
import type { Database, Profile, Optimization, OptimizationStatus, OptimizationInsert } from '@/types/database.types';
```

### Create Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Query with Types

```typescript
const { data, error } = await supabase
  .from('optimizations')
  .select('*')
  .eq('user_id', userId)
  .is('deleted_at', null)
  .order('created_at', { ascending: false });

// data is typed as Optimization[]
```

### Insert with Types

```typescript
const newOptimization: OptimizationInsert = {
  user_id: userId,
  input_resume_filename: 'resume.pdf',
  input_job_description: 'Job description...',
  status: 'pending_payment',
};

const { data, error } = await supabase.from('optimizations').insert(newOptimization).select().single();
```

---

## Storage Operations

### Upload Résumé

```typescript
const { data, error } = await supabase.storage.from('resumes').upload(`${userId}/${filename}`, file, {
  cacheControl: '3600',
  upsert: false,
});
```

### Download File

```typescript
const { data, error } = await supabase.storage.from('optimized-resumes').download(`${userId}/${optimizationId}.docx`);
```

### Get Public URL (for signed URLs)

```typescript
const { data } = supabase.storage.from('optimized-resumes').createSignedUrl(`${userId}/${optimizationId}.docx`, 3600); // 1 hour

// data.signedUrl - temporary download link
```

### Delete File

```typescript
const { error } = await supabase.storage.from('resumes').remove([`${userId}/${filename}`]);
```

---

## Authentication

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  options: {
    data: {
      full_name: 'John Doe',
    },
  },
});
```

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'SecurePassword123!',
});
```

### Get Current User

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();
```

### Sign Out

```typescript
const { error } = await supabase.auth.signOut();
```

---

## Environment Variables

### Local Development

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

---

## Migration Snippets

### Create Table with RLS

```sql
CREATE TABLE public.my_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
    ON public.my_table FOR SELECT
    USING (auth.uid() = user_id);
```

### Add Column

```sql
ALTER TABLE public.optimizations
ADD COLUMN new_column TEXT;
```

### Create Index

```sql
CREATE INDEX idx_my_table_user_id
ON public.my_table(user_id);
```

---

## Debugging

### Check RLS Policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'optimizations';
```

### View Table Structure

```sql
\d+ public.optimizations
```

### Check Storage Policies

```sql
SELECT *
FROM storage.objects
WHERE bucket_id = 'resumes'
LIMIT 10;
```

### Enable Query Logging

```typescript
const supabase = createClient(url, key, {
  auth: {
    debug: true,
  },
});
```

---

## Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Local Studio](http://localhost:54323)
- [API Docs](https://supabase.com/docs/reference/javascript/introduction)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated:** 2025-09-29
