-- =====================================================
-- QUOTEKIT FEATURES MIGRATION FOR RESUME-MATCHER
-- =====================================================
-- This migration adds enterprise-grade SaaS features adapted from QuoteKit
-- Includes subscriptions, payments, analytics, and usage tracking

-- =====================================================
-- EXTEND EXISTING TABLES FOR SaaS FEATURES
-- =====================================================

-- Add SaaS fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due', 'trialing')) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_tier TEXT CHECK (subscription_tier IN ('free', 'lifetime', 'monthly')) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Add SaaS fields to optimizations table
ALTER TABLE optimizations
ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT,
ADD COLUMN IF NOT EXISTS is_free_tier BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- =====================================================
-- NEW SaaS TABLES
-- =====================================================

-- Subscriptions table (Stripe integration)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    stripe_price_id TEXT,
    status TEXT CHECK (status IN ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused')) NOT NULL,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ
);

-- Usage tracking table (freemium limits)
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    month_date DATE NOT NULL,
    free_optimizations_used INTEGER DEFAULT 0,
    paid_optimizations_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month_date)
);

-- Payment history table (analytics and receipts)
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_id TEXT UNIQUE,
    stripe_invoice_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled', 'refunded')) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    error_message TEXT
);

-- Stripe products table (for subscription plans)
CREATE TABLE IF NOT EXISTS stripe_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe prices table (for pricing tiers)
CREATE TABLE IF NOT EXISTS stripe_prices (
    id TEXT PRIMARY KEY,
    stripe_product_id TEXT REFERENCES stripe_products(id) ON DELETE CASCADE NOT NULL,
    active BOOLEAN DEFAULT true,
    description TEXT,
    unit_amount INTEGER, -- in cents
    currency TEXT NOT NULL DEFAULT 'USD',
    type TEXT CHECK (type IN ('one_time', 'recurring')) NOT NULL,
    interval TEXT CHECK (interval IN ('day', 'week', 'month', 'year')),
    interval_count INTEGER DEFAULT 1,
    trial_period_days INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook logs table (for debugging and monitoring)
CREATE TABLE IF NOT EXISTS webhook_logs (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    processed BOOLEAN DEFAULT false,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    result JSONB
);

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- User analytics view (subscription and usage metrics)
CREATE OR REPLACE VIEW user_analytics AS
SELECT
    p.user_id,
    COUNT(DISTINCT o.id) as total_optimizations,
    COUNT(DISTINCT CASE WHEN o.is_free_tier = true THEN o.id END) as free_optimizations,
    COUNT(DISTINCT CASE WHEN o.is_free_tier = false THEN o.id END) as paid_optimizations,
    COALESCE(SUM(ph.amount), 0) as total_revenue,
    p.subscription_status,
    p.subscription_tier,
    MAX(o.created_at) as last_optimization_at,
    CASE
        WHEN p.is_pro THEN true
        WHEN COALESCE(ut.free_optimizations_used, 0) < 1 THEN true
        ELSE false
    END as can_create_optimization,
    COALESCE(ut.free_optimizations_used, 0) as current_month_free_usage
FROM profiles p
LEFT JOIN optimizations o ON o.user_id = p.user_id
LEFT JOIN payment_history ph ON ph.user_id = p.user_id AND ph.status = 'succeeded'
LEFT JOIN usage_tracking ut ON ut.user_id = p.user_id AND ut.month_date = TO_CHAR(NOW(), 'YYYY-MM')
GROUP BY p.user_id, p.subscription_status, p.subscription_tier, p.is_pro, ut.free_optimizations_used;

-- Subscription analytics view (business metrics)
CREATE OR REPLACE VIEW subscription_analytics AS
SELECT
    TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') as month,
    COUNT(DISTINCT CASE WHEN created_at >= date_trunc('month', NOW()) THEN user_id END) as new_subscriptions,
    COUNT(DISTINCT CASE WHEN status = 'canceled' AND updated_at >= date_trunc('month', NOW()) THEN user_id END) as canceled_subscriptions,
    COUNT(DISTINCT CASE WHEN status = 'active' THEN user_id END) as active_subscriptions,
    COALESCE(SUM(CASE
        WHEN ph.status = 'succeeded' AND ph.created_at >= date_trunc('month', NOW())
        THEN ph.amount
        ELSE 0
    END), 0) as monthly_revenue
FROM subscriptions s
LEFT JOIN payment_history ph ON ph.user_id = s.user_id
GROUP BY TO_CHAR(date_trunc('month', created_at), 'YYYY-MM')
ORDER BY month DESC;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_date ON usage_tracking(user_id, month_date);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month ON usage_tracking(month_date);

-- Payment history indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at);

-- Webhook logs indexes
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_received_at ON webhook_logs(received_at);

-- Stripe products/prices indexes
CREATE INDEX IF NOT EXISTS idx_stripe_prices_product_id ON stripe_prices(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_prices_active ON stripe_prices(active);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Subscriptions RLS
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Usage tracking RLS
CREATE POLICY "Users can view own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON usage_tracking
    FOR UPDATE USING (auth.uid() = user_id);

-- Payment history RLS
CREATE POLICY "Users can view own payment history" ON payment_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payment history" ON payment_history
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Stripe products (public read, service write)
CREATE POLICY "Public can read active products" ON stripe_products
    FOR SELECT USING (active = true);

CREATE POLICY "Service role can manage products" ON stripe_products
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Stripe prices (public read active, service write)
CREATE POLICY "Public can read active prices" ON stripe_prices
    FOR SELECT USING (active = true);

CREATE POLICY "Service role can manage prices" ON stripe_prices
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Webhook logs (service only)
CREATE POLICY "Service role can manage webhook logs" ON webhook_logs
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role'
    );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
    BEFORE UPDATE ON usage_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create free subscription for new users
CREATE OR REPLACE FUNCTION create_free_subscription(user_uuid UUID)
RETURNS TABLE(
    success BOOLEAN,
    subscription_id UUID,
    error TEXT
) AS $$
BEGIN
    -- Check if user already has active subscription
    IF EXISTS (
        SELECT 1 FROM subscriptions
        WHERE user_id = user_uuid
        AND status IN ('active', 'trialing', 'past_due')
        LIMIT 1
    ) THEN
        RETURN QUERY SELECT true, NULL::UUID, NULL;
        RETURN;
    END IF;

    -- Create free subscription
    INSERT INTO subscriptions (
        user_id,
        status,
        current_period_start,
        current_period_end
    ) VALUES (
        user_uuid,
        'active',
        NOW(),
        NOW() + INTERVAL '1 year'
    ) RETURNING id INTO subscription_id;

    -- Update user profile
    UPDATE profiles
    SET
        subscription_tier = 'free',
        subscription_status = 'active',
        updated_at = NOW()
    WHERE user_id = user_uuid;

    RETURN QUERY SELECT true, subscription_id, NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
    user_uuid UUID,
    is_free BOOLEAN DEFAULT true
)
RETURNS TABLE(
    success BOOLEAN,
    remaining_optimizations INTEGER,
    error TEXT
) AS $$
DECLARE
    current_month DATE := DATE_TRUNC('month', NOW())::DATE;
    current_usage RECORD;
    remaining INTEGER;
BEGIN
    -- Get current usage
    SELECT * INTO current_usage
    FROM usage_tracking
    WHERE user_id = user_uuid AND month_date = current_month;

    -- Create usage record if doesn't exist
    IF current_usage IS NULL THEN
        INSERT INTO usage_tracking (user_id, month_date, free_optimizations_used, paid_optimizations_used)
        VALUES (user_uuid, current_month, 0, 0)
        RETURNING * INTO current_usage;
    END IF;

    -- Check if user can create optimization (free tier limit: 1 per month)
    IF is_free THEN
        remaining := GREATEST(0, 1 - current_usage.free_optimizations_used);

        IF remaining <= 0 THEN
            RETURN QUERY SELECT false, 0, 'Free monthly limit reached';
            RETURN;
        END IF;

        -- Increment free usage
        UPDATE usage_tracking
        SET free_optimizations_used = free_optimizations_used + 1,
            updated_at = NOW()
        WHERE id = current_usage.id;

        remaining := remaining - 1;
    ELSE
        -- Pro users have unlimited optimizations
        UPDATE usage_tracking
        SET paid_optimizations_used = paid_optimizations_used + 1,
            updated_at = NOW()
        WHERE id = current_usage.id;

        remaining := -1; -- Unlimited for pro users
    END IF;

    RETURN QUERY SELECT true, remaining, NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (for development)
-- =====================================================

-- Insert sample subscription products
INSERT INTO stripe_products (id, name, description, active) VALUES
('prod_free', 'Free Plan', 'Basic resume optimization with 1 optimization per month', true),
('prod_pro_lifetime', 'Pro Lifetime', 'Unlimited resume optimization for life', true),
('prod_pro_monthly', 'Pro Monthly', 'Unlimited resume optimization with monthly billing', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample prices
INSERT INTO stripe_prices (id, stripe_product_id, unit_amount, currency, type, interval) VALUES
('price_free', 'prod_free', 0, 'USD', 'one_time', NULL),
('price_pro_lifetime', 'prod_pro_lifetime', 2900, 'USD', 'one_time', NULL),
('price_pro_monthly', 'prod_pro_monthly', 499, 'USD', 'recurring', 'month')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Grant necessary permissions
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON usage_tracking TO authenticated;
GRANT SELECT ON payment_history TO authenticated;
GRANT SELECT ON stripe_products TO authenticated, anon;
GRANT SELECT ON stripe_prices TO authenticated, anon;
GRANT SELECT ON user_analytics TO authenticated;
GRANT SELECT ON subscription_analytics TO authenticated;

COMMENT ON TABLE subscriptions IS 'User subscription management with Stripe integration';
COMMENT ON TABLE usage_tracking IS 'Monthly usage tracking for freemium limits';
COMMENT ON TABLE payment_history IS 'Payment transaction history and receipts';
COMMENT ON TABLE stripe_products IS 'Subscription products configuration';
COMMENT ON TABLE stripe_prices IS 'Pricing tiers and billing information';
COMMENT ON TABLE webhook_logs IS 'Stripe webhook event logging for debugging';
COMMENT ON VIEW user_analytics IS 'User-specific subscription and usage metrics';
COMMENT ON VIEW subscription_analytics IS 'Business metrics and revenue analytics';