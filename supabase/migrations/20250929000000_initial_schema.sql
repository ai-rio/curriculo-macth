-- =====================================================
-- RESUME-MATCHER INITIAL SCHEMA
-- =====================================================
-- This migration creates the complete database schema for the AI Résumé Optimization SaaS
-- Includes: profiles, optimizations tables with RLS policies, indexes, and LGPD compliance
--
-- Created: 2025-09-29
-- Database Version: PostgreSQL 15+
-- LGPD Compliant: Yes
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable text search capabilities
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- ENUMS
-- =====================================================

-- Optimization status lifecycle
CREATE TYPE optimization_status AS ENUM (
    'pending_payment',
    'payment_processing',
    'processing',
    'completed',
    'failed',
    'cancelled'
);

-- =====================================================
-- PROFILES TABLE
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    -- LGPD compliance fields
    data_retention_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 years'),
    consent_marketing BOOLEAN DEFAULT FALSE,
    consent_data_processing BOOLEAN DEFAULT TRUE,

    -- Constraints
    CONSTRAINT full_name_length CHECK (LENGTH(full_name) <= 255),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Indexes for profiles
CREATE INDEX idx_profiles_email ON public.profiles(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NOT NULL;

-- Comments
COMMENT ON TABLE public.profiles IS 'User profiles with LGPD compliance fields and soft delete support';
COMMENT ON COLUMN public.profiles.data_retention_date IS 'Date when user data should be automatically deleted per LGPD requirements';
COMMENT ON COLUMN public.profiles.deleted_at IS 'Soft delete timestamp for LGPD compliance';

-- =====================================================
-- OPTIMIZATIONS TABLE
-- =====================================================

-- Résumé optimization records
CREATE TABLE public.optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Input data
    input_resume_filename TEXT NOT NULL,
    input_resume_storage_path TEXT,
    input_job_description TEXT NOT NULL,

    -- Output data
    output_optimized_resume TEXT,
    storage_path_docx TEXT,

    -- Metadata
    status optimization_status DEFAULT 'pending_payment' NOT NULL,
    stripe_payment_id TEXT,
    stripe_payment_status TEXT,
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    error_message TEXT,

    -- AI metadata
    ai_model_used TEXT,
    ai_tokens_used INTEGER,
    ai_processing_time_ms INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    -- Constraints
    CONSTRAINT input_resume_filename_length CHECK (LENGTH(input_resume_filename) <= 255),
    CONSTRAINT input_job_description_length CHECK (LENGTH(input_job_description) BETWEEN 50 AND 10000),
    CONSTRAINT output_optimized_resume_length CHECK (output_optimized_resume IS NULL OR LENGTH(output_optimized_resume) <= 50000),
    CONSTRAINT stripe_payment_id_format CHECK (stripe_payment_id IS NULL OR stripe_payment_id ~ '^(pi_|cs_)[A-Za-z0-9]+$'),
    CONSTRAINT valid_processing_times CHECK (
        (processing_started_at IS NULL AND processing_completed_at IS NULL) OR
        (processing_completed_at IS NULL OR processing_completed_at >= processing_started_at)
    )
);

-- Enable Row Level Security
ALTER TABLE public.optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for optimizations
CREATE POLICY "Users can view own optimizations"
    ON public.optimizations
    FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own optimizations"
    ON public.optimizations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own optimizations"
    ON public.optimizations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can soft delete own optimizations"
    ON public.optimizations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes for optimizations
CREATE INDEX idx_optimizations_user_id ON public.optimizations(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_optimizations_stripe_payment_id ON public.optimizations(stripe_payment_id) WHERE stripe_payment_id IS NOT NULL;
CREATE INDEX idx_optimizations_status ON public.optimizations(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_optimizations_created_at ON public.optimizations(created_at DESC);
CREATE INDEX idx_optimizations_user_created ON public.optimizations(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_optimizations_deleted_at ON public.optimizations(deleted_at) WHERE deleted_at IS NOT NULL;

-- Full-text search index for job descriptions
CREATE INDEX idx_optimizations_job_description_search
    ON public.optimizations
    USING gin(to_tsvector('portuguese', input_job_description))
    WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE public.optimizations IS 'Résumé optimization records with payment tracking and AI metadata';
COMMENT ON COLUMN public.optimizations.status IS 'Current status of the optimization job';
COMMENT ON COLUMN public.optimizations.stripe_payment_id IS 'Stripe Payment Intent ID or Checkout Session ID';
COMMENT ON COLUMN public.optimizations.deleted_at IS 'Soft delete timestamp for LGPD compliance';
COMMENT ON COLUMN public.optimizations.ai_tokens_used IS 'Number of tokens consumed by AI model for cost tracking';

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage bucket for résumé files (PDF/DOCX uploads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    false,
    2097152, -- 2MB in bytes
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for optimized résumé outputs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'optimized-resumes',
    'optimized-resumes',
    false,
    5242880, -- 5MB in bytes
    ARRAY['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE RLS POLICIES
-- =====================================================

-- RLS for resumes bucket (uploads)
CREATE POLICY "Users can upload own résumés"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'resumes' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own résumés"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'resumes' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own résumés"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'resumes' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own résumés"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'resumes' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- RLS for optimized-resumes bucket (outputs)
CREATE POLICY "Users can view own optimized résumés"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'optimized-resumes' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Backend service role can insert optimized résumés
CREATE POLICY "Service can insert optimized résumés"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'optimized-resumes');

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.email
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates a profile when a new user signs up';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column IS 'Automatically updates updated_at timestamp on row modification';

-- Function to soft delete optimizations (LGPD compliance)
CREATE OR REPLACE FUNCTION public.soft_delete_optimization()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Instead of actually deleting, set deleted_at
    UPDATE public.optimizations
    SET deleted_at = NOW()
    WHERE id = OLD.id;

    -- Prevent actual deletion
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.soft_delete_optimization IS 'Implements soft delete for LGPD compliance instead of hard delete';

-- Function to clean up old data per LGPD retention policies
CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete profiles that have passed their data retention date
    DELETE FROM public.profiles
    WHERE data_retention_date < NOW()
    AND deleted_at IS NOT NULL;

    -- Delete old soft-deleted optimizations (after 90 days)
    DELETE FROM public.optimizations
    WHERE deleted_at < (NOW() - INTERVAL '90 days');

    RAISE NOTICE 'LGPD cleanup completed at %', NOW();
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_data IS 'Cleans up expired user data per LGPD retention requirements (should be run via scheduled job)';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_optimizations_updated_at
    BEFORE UPDATE ON public.optimizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for soft delete on optimizations
CREATE TRIGGER soft_delete_optimization_trigger
    BEFORE DELETE ON public.optimizations
    FOR EACH ROW
    EXECUTE FUNCTION public.soft_delete_optimization();

-- =====================================================
-- VIEWS
-- =====================================================

-- View for optimization analytics
CREATE VIEW public.optimization_analytics AS
SELECT
    o.user_id,
    COUNT(*) as total_optimizations,
    COUNT(*) FILTER (WHERE o.status = 'completed') as completed_count,
    COUNT(*) FILTER (WHERE o.status = 'failed') as failed_count,
    COUNT(*) FILTER (WHERE o.status = 'processing') as processing_count,
    SUM(o.ai_tokens_used) as total_tokens_used,
    AVG(o.ai_processing_time_ms) as avg_processing_time_ms,
    MAX(o.created_at) as last_optimization_date,
    MIN(o.created_at) as first_optimization_date
FROM public.optimizations o
WHERE o.deleted_at IS NULL
GROUP BY o.user_id;

COMMENT ON VIEW public.optimization_analytics IS 'Aggregated optimization statistics per user';

-- =====================================================
-- INITIAL DATA / SEED
-- =====================================================

-- No initial data needed for production
-- Seed data should be in separate seed.sql file

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.optimizations TO authenticated;
GRANT SELECT ON public.optimization_analytics TO authenticated;

-- Grant necessary permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Resume-Matcher Initial Schema Migration Complete';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Tables created: profiles, optimizations';
    RAISE NOTICE 'RLS enabled on all tables';
    RAISE NOTICE 'LGPD compliance features: soft deletes, retention policies';
    RAISE NOTICE 'Storage buckets: resumes, optimized-resumes';
    RAISE NOTICE 'Database ready for application use';
    RAISE NOTICE '=================================================';
END $$;