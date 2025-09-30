-- =====================================================
-- ROLLBACK: RESUME-MATCHER INITIAL SCHEMA
-- =====================================================
-- This migration rolls back the initial schema creation
-- Use with caution - this will delete all data
-- =====================================================

-- Log rollback start
DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Starting rollback of Resume-Matcher Initial Schema';
    RAISE NOTICE 'WARNING: This will delete all data!';
    RAISE NOTICE '=================================================';
END $$;

-- =====================================================
-- DROP VIEWS
-- =====================================================

DROP VIEW IF EXISTS public.optimization_analytics CASCADE;

-- =====================================================
-- DROP TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS soft_delete_optimization_trigger ON public.optimizations;
DROP TRIGGER IF EXISTS update_optimizations_updated_at ON public.optimizations;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =====================================================
-- DROP FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS public.cleanup_expired_data() CASCADE;
DROP FUNCTION IF EXISTS public.soft_delete_optimization() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- =====================================================
-- DROP STORAGE POLICIES
-- =====================================================

-- Drop policies for optimized-resumes bucket
DROP POLICY IF EXISTS "Service can insert optimized résumés" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own optimized résumés" ON storage.objects;

-- Drop policies for resumes bucket
DROP POLICY IF EXISTS "Users can delete own résumés" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own résumés" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own résumés" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own résumés" ON storage.objects;

-- =====================================================
-- DROP STORAGE BUCKETS
-- =====================================================

DELETE FROM storage.buckets WHERE id = 'optimized-resumes';
DELETE FROM storage.buckets WHERE id = 'resumes';

-- =====================================================
-- DROP TABLES
-- =====================================================

-- Drop optimizations table
DROP TABLE IF EXISTS public.optimizations CASCADE;

-- Drop profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- DROP ENUMS
-- =====================================================

DROP TYPE IF EXISTS optimization_status CASCADE;

-- =====================================================
-- DROP EXTENSIONS (Optional - uncomment if needed)
-- =====================================================

-- Note: Only drop extensions if you're sure they're not used by other schemas
-- DROP EXTENSION IF EXISTS "pg_trgm" CASCADE;
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- =====================================================
-- REVOKE PERMISSIONS
-- =====================================================

REVOKE ALL ON SCHEMA public FROM authenticated;
REVOKE ALL ON SCHEMA public FROM service_role;

-- Re-grant default permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- =====================================================
-- ROLLBACK COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Resume-Matcher Initial Schema Rollback Complete';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'All tables, functions, and policies removed';
    RAISE NOTICE 'Database returned to pre-migration state';
    RAISE NOTICE '=================================================';
END $$;