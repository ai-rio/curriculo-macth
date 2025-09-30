-- =====================================================
-- RESUME-MATCHER SEED DATA
-- =====================================================
-- This file contains seed data for local development and testing
-- DO NOT run this in production
-- =====================================================

-- Check if we're in a development environment
DO $$
BEGIN
    IF current_database() = 'postgres' AND current_setting('server_version_num')::int >= 150000 THEN
        RAISE NOTICE 'Loading seed data for Resume-Matcher development environment';
    ELSE
        RAISE EXCEPTION 'Seed data should only be loaded in development environments';
    END IF;
END $$;

-- =====================================================
-- TEST USERS
-- =====================================================

-- Note: User creation is handled by Supabase Auth
-- The profiles will be automatically created via the trigger
-- This section documents test users you should create via Supabase Auth UI

-- Test User 1: user@example.com / password: TestPassword123!
-- Test User 2: developer@example.com / password: DevPassword123!
-- Test User 3: admin@example.com / password: AdminPassword123!

-- =====================================================
-- SAMPLE OPTIMIZATIONS
-- =====================================================

-- Insert sample optimizations for testing
-- Note: Replace these UUIDs with actual user IDs after creating test users

/*
-- Example: Insert sample optimization for test user
INSERT INTO public.optimizations (
    user_id,
    input_resume_filename,
    input_job_description,
    output_optimized_resume,
    status,
    stripe_payment_id,
    ai_model_used,
    ai_tokens_used,
    processing_completed_at
) VALUES (
    'USER_UUID_HERE'::uuid,
    'john_doe_resume.pdf',
    'Estamos procurando um Desenvolvedor Full-Stack com experiência em React, Node.js e PostgreSQL. O candidato ideal terá 3+ anos de experiência e habilidades em desenvolvimento de APIs RESTful.',
    'CURRÍCULO OTIMIZADO

João Silva
Desenvolvedor Full-Stack | React | Node.js | PostgreSQL

RESUMO PROFISSIONAL
Desenvolvedor Full-Stack com 4 anos de experiência sólida em React, Node.js e PostgreSQL, especializado no desenvolvimento de aplicações web escaláveis e APIs RESTful de alto desempenho.

EXPERIÊNCIA PROFISSIONAL

Desenvolvedor Full-Stack Sênior | TechCorp Brasil | 2021-Presente
- Desenvolvimento de aplicações React com TypeScript, implementando arquitetura de componentes reutilizáveis
- Criação de APIs RESTful com Node.js e Express, atendendo 100k+ requisições diárias
- Modelagem e otimização de banco de dados PostgreSQL, reduzindo tempo de consulta em 40%

Desenvolvedor JavaScript | StartupX | 2019-2021
- Implementação de interfaces responsivas com React e Material-UI
- Desenvolvimento backend com Node.js e integração com PostgreSQL
- Colaboração em equipe ágil usando metodologias Scrum

HABILIDADES TÉCNICAS
- Frontend: React, TypeScript, Next.js, Redux, HTML5, CSS3
- Backend: Node.js, Express, RESTful APIs, GraphQL
- Banco de Dados: PostgreSQL, MongoDB, Redis
- Ferramentas: Git, Docker, Jest, CI/CD',
    'completed',
    'pi_test_1234567890',
    'anthropic/claude-3-sonnet',
    2500,
    NOW() - INTERVAL '2 days'
);
*/

-- =====================================================
-- ANALYTICS TEST DATA
-- =====================================================

-- The optimization_analytics view will automatically populate
-- once optimizations are inserted

-- =====================================================
-- SEED COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Resume-Matcher Seed Data Loaded';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Create test users via Supabase Auth UI';
    RAISE NOTICE '2. Note their user IDs';
    RAISE NOTICE '3. Uncomment and update the sample optimization SQL above';
    RAISE NOTICE '4. Re-run seed: supabase db reset';
    RAISE NOTICE '=================================================';
END $$;