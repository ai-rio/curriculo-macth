-- =====================================================
-- LEGACY COMPATIBILITY MIGRATION
-- =====================================================
-- This migration creates legacy tables to maintain backward compatibility
-- with existing ResumeService, JobService, and ScoreImprovementService
-- during the migration from SQLite to Supabase.
--
-- These tables mirror the old SQLite structure and will be used
-- temporarily while we refactor services to use the new optimizations table.
--
-- Created: 2025-10-01
-- Purpose: Backward compatibility during SQLite → Supabase migration
-- =====================================================

-- =====================================================
-- LEGACY RESUMES TABLE
-- =====================================================
-- Mirrors the old SQLite Resume model structure
CREATE TABLE public.resumes (
    id BIGSERIAL PRIMARY KEY,
    resume_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text/markdown',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    -- Constraints
    CONSTRAINT resume_id_not_empty CHECK (length(resume_id::text) > 0),
    CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0),
    CONSTRAINT valid_content_type CHECK (content_type IN ('text/markdown', 'text/html', 'text/plain'))
);

-- Enable RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role bypasses RLS, these are for completeness)
CREATE POLICY "Service full access to resumes"
    ON public.resumes
    FOR ALL
    USING (current_setting('app.current_user_id', true) IS NULL);

-- Indexes
CREATE INDEX idx_resumes_resume_id ON public.resumes(resume_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_resumes_created_at ON public.resumes(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_resumes_deleted_at ON public.resumes(deleted_at) WHERE deleted_at IS NOT NULL;

-- =====================================================
-- LEGACY PROCESSED RESUMES TABLE
-- =====================================================
-- Mirrors the old SQLite ProcessedResume model structure
CREATE TABLE public.processed_resumes (
    id BIGSERIAL PRIMARY KEY,
    resume_id UUID NOT NULL REFERENCES public.resumes(resume_id) ON DELETE CASCADE,
    personal_data JSONB,
    experiences JSONB,
    projects JSONB,
    skills JSONB,
    research_work JSONB,
    achievements JSONB,
    education JSONB,
    extracted_keywords JSONB,
    processed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    -- Constraints
    CONSTRAINT processed_resume_id_not_empty CHECK (length(resume_id::text) > 0)
);

-- Enable RLS
ALTER TABLE public.processed_resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service full access to processed_resumes"
    ON public.processed_resumes
    FOR ALL
    USING (current_setting('app.current_user_id', true) IS NULL);

-- Indexes
CREATE INDEX idx_processed_resumes_resume_id ON public.processed_resumes(resume_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_processed_resumes_processed_at ON public.processed_resumes(processed_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_processed_resumes_deleted_at ON public.processed_resumes(deleted_at) WHERE deleted_at IS NOT NULL;

-- =====================================================
-- LEGACY JOBS TABLE
-- =====================================================
-- Mirrors the old SQLite Job model structure
CREATE TABLE public.jobs (
    id BIGSERIAL PRIMARY KEY,
    job_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(resume_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text/markdown',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    -- Constraints
    CONSTRAINT job_id_not_empty CHECK (length(job_id::text) > 0),
    CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0),
    CONSTRAINT valid_content_type CHECK (content_type IN ('text/markdown', 'text/html', 'text/plain'))
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service full access to jobs"
    ON public.jobs
    FOR ALL
    USING (current_setting('app.current_user_id', true) IS NULL);

-- Indexes
CREATE INDEX idx_jobs_job_id ON public.jobs(job_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_resume_id ON public.jobs(resume_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_deleted_at ON public.jobs(deleted_at) WHERE deleted_at IS NOT NULL;

-- =====================================================
-- LEGACY PROCESSED JOBS TABLE
-- =====================================================
-- Mirrors the old SQLite ProcessedJob model structure
CREATE TABLE public.processed_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(job_id) ON DELETE CASCADE,
    job_title TEXT,
    company_profile JSONB,
    location JSONB,
    date_posted TEXT,
    employment_type TEXT,
    job_summary TEXT,
    key_responsibilities JSONB,
    qualifications JSONB,
    compensation_and_benfits JSONB,
    application_info JSONB,
    extracted_keywords JSONB,
    processed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    -- Constraints
    CONSTRAINT processed_job_id_not_empty CHECK (length(job_id::text) > 0),
    CONSTRAINT job_title_length CHECK (job_title IS NULL OR length(job_title) <= 255),
    CONSTRAINT job_summary_length CHECK (job_summary IS NULL OR length(job_summary) <= 2000)
);

-- Enable RLS
ALTER TABLE public.processed_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service full access to processed_jobs"
    ON public.processed_jobs
    FOR ALL
    USING (current_setting('app.current_user_id', true) IS NULL);

-- Indexes
CREATE INDEX idx_processed_jobs_job_id ON public.processed_jobs(job_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_processed_jobs_processed_at ON public.processed_jobs(processed_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_processed_jobs_deleted_at ON public.processed_jobs(deleted_at) WHERE deleted_at IS NOT NULL;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT COLUMNS
-- =====================================================

-- Create updated_at trigger function for legacy tables
CREATE OR REPLACE FUNCTION public.update_legacy_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply triggers to all legacy tables
CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_legacy_updated_at_column();

CREATE TRIGGER update_processed_resumes_updated_at
    BEFORE UPDATE ON public.processed_resumes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_legacy_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_legacy_updated_at_column();

CREATE TRIGGER update_processed_jobs_updated_at
    BEFORE UPDATE ON public.processed_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_legacy_updated_at_column();

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant permissions to service role (backend will use service role key)
GRANT ALL ON public.resumes TO service_role;
GRANT ALL ON public.processed_resumes TO service_role;
GRANT ALL ON public.jobs TO service_role;
GRANT ALL ON public.processed_jobs TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant usage on sequences for IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.resumes IS 'Legacy table for backward compatibility during SQLite → Supabase migration';
COMMENT ON TABLE public.processed_resumes IS 'Legacy table for processed resume data during migration';
COMMENT ON TABLE public.jobs IS 'Legacy table for job descriptions during migration';
COMMENT ON TABLE public.processed_jobs IS 'Legacy table for processed job data during migration';

COMMENT ON COLUMN public.processed_resumes.personal_data IS 'JSON structure containing personal information from resume';
COMMENT ON COLUMN public.processed_resumes.experiences IS 'JSON array containing work experience entries';
COMMENT ON COLUMN public.processed_resumes.skills IS 'JSON array containing technical and soft skills';
COMMENT ON COLUMN public.processed_resumes.extracted_keywords IS 'JSON array containing keywords extracted for matching';

COMMENT ON COLUMN public.processed_jobs.extracted_keywords IS 'JSON array containing keywords extracted from job description';
COMMENT ON COLUMN public.processed_jobs.key_responsibilities IS 'JSON array containing job responsibilities';
COMMENT ON COLUMN public.processed_jobs.qualifications IS 'JSON array containing required qualifications';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Legacy Compatibility Migration Complete';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Tables created: resumes, processed_resumes, jobs, processed_jobs';
    RAISE NOTICE 'Purpose: Backward compatibility during SQLite → Supabase migration';
    RAISE NOTICE 'Services can now be migrated to use Supabase instead of SQLAlchemy';
    RAISE NOTICE '=================================================';
END $$;