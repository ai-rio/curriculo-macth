--
-- Stripe Webhook Events Table Migration
-- Date: 2025-09-30
-- Purpose: Track Stripe webhook events for idempotency and audit trail
--

-- Create stripe_webhook_events table for idempotency and audit
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    processing_time_ms NUMERIC,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    request_id TEXT,
    client_ip TEXT,

    -- Indexes for performance
    CONSTRAINT unique_stripe_event_id UNIQUE (stripe_event_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_event_id
    ON public.stripe_webhook_events (stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type
    ON public.stripe_webhook_events (event_type);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed
    ON public.stripe_webhook_events (processed);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_created_at
    ON public.stripe_webhook_events (created_at DESC);

-- Add RLS policies (admin access only, webhooks use service role)
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access webhook events
CREATE POLICY "Service role can manage webhook events"
    ON public.stripe_webhook_events
    FOR ALL
    USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE public.stripe_webhook_events IS 'Tracks Stripe webhook events for idempotency and audit trail';
COMMENT ON COLUMN public.stripe_webhook_events.stripe_event_id IS 'Unique Stripe event ID';
COMMENT ON COLUMN public.stripe_webhook_events.event_type IS 'Type of Stripe event (e.g., checkout.session.completed)';
COMMENT ON COLUMN public.stripe_webhook_events.processed IS 'Whether the event has been processed';
COMMENT ON COLUMN public.stripe_webhook_events.processing_started_at IS 'When processing started';
COMMENT ON COLUMN public.stripe_webhook_events.processing_completed_at IS 'When processing completed';
COMMENT ON COLUMN public.stripe_webhook_events.processed_at IS 'When event was marked as processed';
COMMENT ON COLUMN public.stripe_webhook_events.error_message IS 'Error message if processing failed';
COMMENT ON COLUMN public.stripe_webhook_events.processing_time_ms IS 'Time taken to process in milliseconds';
COMMENT ON COLUMN public.stripe_webhook_events.data IS 'Event data from Stripe (JSONB)';
COMMENT ON COLUMN public.stripe_webhook_events.request_id IS 'Internal request ID for tracking';
COMMENT ON COLUMN public.stripe_webhook_events.client_ip IS 'Client IP address';
