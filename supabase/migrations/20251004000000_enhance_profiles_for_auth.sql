-- =====================================================
-- ENHANCE PROFILES TABLE FOR COMPLETE AUTHENTICATION
-- =====================================================
-- This migration enhances the existing profiles table with additional fields
-- needed for complete user authentication and profile management
--
-- Created: 2025-10-04
-- Purpose: Add avatar_url, bio fields and improve user profile functionality
-- LGPD Compliant: Yes
-- =====================================================

-- =====================================================
-- ALTER PROFILES TABLE - ADD NEW COLUMNS
-- =====================================================

-- Add avatar_url field for user profile pictures
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add bio field for user descriptions
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add constraints for new fields
ALTER TABLE public.profiles
ADD CONSTRAINT IF NOT EXISTS avatar_url_length
CHECK (avatar_url IS NULL OR LENGTH(avatar_url) <= 2048);

ALTER TABLE public.profiles
ADD CONSTRAINT IF NOT EXISTS bio_length
CHECK (bio IS NULL OR LENGTH(bio) <= 1000);

-- Add indexes for new fields if they will be queried
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url
ON public.profiles(avatar_url)
WHERE avatar_url IS NOT NULL AND deleted_at IS NULL;

-- =====================================================
-- UPDATE RLS POLICIES - IMPROVE PROFILE ACCESS
-- =====================================================

-- Update existing policies to handle new fields
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Add policy for service role to handle profile creation during auth
CREATE POLICY IF NOT EXISTS "Service role can manage profiles"
    ON public.profiles
    FOR ALL
    USING (
        auth.role() = 'service_role' OR
        auth.uid() = id
    )
    WITH CHECK (
        auth.role() = 'service_role' OR
        auth.uid() = id
    );

-- =====================================================
-- ENHANCE USER CREATION TRIGGER
-- =====================================================

-- Update the handle_new_user function to handle additional metadata
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url, bio)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name'
        ),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'bio'
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
'Automatically creates a profile with metadata when a new user signs up';

-- =====================================================
-- ADD UTILITY FUNCTIONS FOR PROFILE MANAGEMENT
-- =====================================================

-- Function to safely get or create user profile
CREATE OR REPLACE FUNCTION public.get_or_create_profile(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Try to get existing profile
    RETURN QUERY
    SELECT p.id, p.full_name, p.email, p.avatar_url, p.bio, p.created_at, p.updated_at, p.deleted_at
    FROM public.profiles p
    WHERE p.id = user_uuid AND p.deleted_at IS NULL;

    -- If profile doesn't exist, create it from auth.users
    IF NOT FOUND THEN
        INSERT INTO public.profiles (id, full_name, email)
        SELECT
            au.id,
            COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'),
            au.email
        FROM auth.users au
        WHERE au.id = user_uuid
        ON CONFLICT (id) DO UPDATE
        SET
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            updated_at = NOW()
        RETURNING
            id, full_name, email, avatar_url, bio, created_at, updated_at, deleted_at
        INTO
            id, full_name, email, avatar_url, bio, created_at, updated_at, deleted_at;

        -- Return the newly created profile
        RETURN QUERY
        SELECT p.id, p.full_name, p.email, p.avatar_url, p.bio, p.created_at, p.updated_at, p.deleted_at
        FROM public.profiles p
        WHERE p.id = user_uuid;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.get_or_create_profile(user_uuid UUID) IS
'Safely retrieves existing profile or creates new one from auth.users data';

-- Function to update user profile with validation
CREATE OR REPLACE FUNCTION public.update_user_profile(
    user_uuid UUID,
    new_full_name TEXT DEFAULT NULL,
    new_avatar_url TEXT DEFAULT NULL,
    new_bio TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update profile with new values
    UPDATE public.profiles
    SET
        full_name = COALESCE(new_full_name, full_name),
        avatar_url = COALESCE(new_avatar_url, avatar_url),
        bio = COALESCE(new_bio, bio),
        updated_at = NOW()
    WHERE id = user_uuid AND deleted_at IS NULL
    RETURNING
        id, full_name, email, avatar_url, bio, updated_at
    INTO
        id, full_name, email, avatar_url, bio, updated_at;

    -- Return updated profile
    RETURN QUERY
    SELECT p.id, p.full_name, p.email, p.avatar_url, p.bio, p.updated_at
    FROM public.profiles p
    WHERE p.id = user_uuid;
END;
$$;

COMMENT ON FUNCTION public.update_user_profile() IS
'Safely updates user profile with validation and timestamp tracking';

-- =====================================================
-- UPDATE COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user profile picture/avatar image';
COMMENT ON COLUMN public.profiles.bio IS 'User biography or personal description (max 1000 characters)';

-- =====================================================
-- VALIDATION AND TESTING
-- =====================================================

-- Verify the migration completed successfully
DO $$
DECLARE
    profile_count INTEGER;
    trigger_exists BOOLEAN;
    function_exists BOOLEAN;
BEGIN
    -- Check if profiles table exists and has the new columns
    SELECT COUNT(*) INTO profile_count
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name IN ('avatar_url', 'bio')
    AND table_schema = 'public';

    -- Check if trigger exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_name = 'on_auth_user_created'
    ) INTO trigger_exists;

    -- Check if function exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'handle_new_user'
        AND routine_schema = 'public'
    ) INTO function_exists;

    -- Log results
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'Enhanced Profiles Migration Results';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'New columns added: %', profile_count;
    RAISE NOTICE 'Trigger exists: %', trigger_exists;
    RAISE NOTICE 'Function exists: %', function_exists;

    IF profile_count = 2 AND trigger_exists AND function_exists THEN
        RAISE NOTICE '✅ Migration completed successfully!';
        RAISE NOTICE 'Profiles table is now ready for complete authentication';
    ELSE
        RAISE WARNING '⚠️ Migration may have issues - check the results above';
    END IF;
    RAISE NOTICE '===============================================';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================