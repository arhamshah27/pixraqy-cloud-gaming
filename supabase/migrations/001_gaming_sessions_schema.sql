-- Gaming Sessions Database Schema for Sunshine/Moonlight Integration
-- This migration creates all necessary tables for the on-demand gaming platform
-- PREREQUISITE: Run 000_base_tables.sql first to create users and games tables

-- ============================================================================
-- 1. GAMING SESSIONS TABLE
-- Tracks active and historical gaming sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS gaming_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE RESTRICT,

    -- Instance information
    instance_id VARCHAR(255), -- EC2 instance ID (i-xxxxx)
    public_ip INET,
    private_ip INET,
    instance_type VARCHAR(50) DEFAULT 't3.medium',

    -- Session state
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- pending, launching, running, pairing, active, stopping, stopped, failed

    -- GameStream/Sunshine metadata
    sunshine_port INTEGER DEFAULT 47984,
    pairing_code VARCHAR(20),
    pairing_qr_data TEXT, -- Base64 encoded QR or URL to QR image
    preferred_client VARCHAR(20) DEFAULT 'moonlight', -- moonlight, web, etc.

    -- Billing and usage
    credits_reserved INTEGER DEFAULT 0,
    credits_consumed INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2) DEFAULT 5.00,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    launched_at TIMESTAMPTZ,
    paired_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    error_message TEXT,
    launch_config JSONB, -- Store AMI ID, user_data hash, etc.
    client_metadata JSONB -- Browser info, Moonlight version, etc.
);

-- Indexes for gaming_sessions
CREATE INDEX IF NOT EXISTS idx_gaming_sessions_user_id ON gaming_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_gaming_sessions_status ON gaming_sessions(status);
CREATE INDEX IF NOT EXISTS idx_gaming_sessions_instance_id ON gaming_sessions(instance_id);
CREATE INDEX IF NOT EXISTS idx_gaming_sessions_created_at ON gaming_sessions(created_at DESC);

-- ============================================================================
-- 2. HOST POOL TABLE
-- Tracks warm pool instances and their availability
-- ============================================================================
CREATE TABLE IF NOT EXISTS host_pool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id VARCHAR(255) UNIQUE NOT NULL,
    public_ip INET,
    private_ip INET,
    instance_type VARCHAR(50) DEFAULT 't3.medium',

    -- Host status
    status VARCHAR(50) NOT NULL DEFAULT 'launching',
    -- launching, warming, available, allocated, unhealthy, terminating

    health_status VARCHAR(50) DEFAULT 'unknown',
    -- healthy, unhealthy, unknown

    -- Capacity
    gpu_model VARCHAR(100),
    gpu_driver_version VARCHAR(50),
    gpu_encoder VARCHAR(50), -- NVENC, etc.
    cpu_cores INTEGER,
    memory_mb INTEGER,

    -- Sunshine info
    sunshine_version VARCHAR(50),
    sunshine_healthy BOOLEAN DEFAULT false,

    -- Allocation
    allocated_to_session UUID REFERENCES gaming_sessions(id) ON DELETE SET NULL,
    allocated_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_heartbeat TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    agent_version VARCHAR(50),
    metadata JSONB
);

-- Indexes for host_pool
CREATE INDEX IF NOT EXISTS idx_host_pool_status ON host_pool(status);
CREATE INDEX IF NOT EXISTS idx_host_pool_instance_id ON host_pool(instance_id);
CREATE INDEX IF NOT EXISTS idx_host_pool_allocated_to ON host_pool(allocated_to_session);
CREATE INDEX IF NOT EXISTS idx_host_pool_last_heartbeat ON host_pool(last_heartbeat DESC);

-- ============================================================================
-- 3. HOST METRICS TABLE
-- Time-series metrics from host-agent heartbeats
-- ============================================================================
CREATE TABLE IF NOT EXISTS host_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES host_pool(id) ON DELETE CASCADE,
    session_id UUID REFERENCES gaming_sessions(id) ON DELETE CASCADE,

    -- Metrics
    cpu_usage_percent DECIMAL(5,2),
    memory_usage_mb INTEGER,
    memory_usage_percent DECIMAL(5,2),
    gpu_usage_percent DECIMAL(5,2),
    gpu_memory_mb INTEGER,
    gpu_temp_celsius DECIMAL(5,2),
    encoder_usage_percent DECIMAL(5,2),

    -- Network
    network_rx_mbps DECIMAL(10,2),
    network_tx_mbps DECIMAL(10,2),

    -- GameStream
    active_streams INTEGER DEFAULT 0,
    stream_bitrate_mbps DECIMAL(10,2),
    stream_fps INTEGER,
    stream_latency_ms INTEGER,

    -- Timestamp
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for host_metrics (time-series optimized)
CREATE INDEX IF NOT EXISTS idx_host_metrics_host_id_time ON host_metrics(host_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_host_metrics_session_id_time ON host_metrics(session_id, recorded_at DESC);

-- ============================================================================
-- 4. PAYMENT TRANSACTIONS TABLE
-- Track Stripe payments and credit purchases
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Stripe info
    stripe_checkout_session_id VARCHAR(255) UNIQUE,
    stripe_payment_intent_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),

    -- Transaction details
    amount_usd DECIMAL(10,2) NOT NULL,
    credits_purchased INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    -- pending, completed, failed, refunded

    -- Metadata
    product_type VARCHAR(50), -- one-time, subscription, etc.
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_session ON payment_transactions(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- ============================================================================
-- 5. GAME OWNERSHIP TABLE
-- Track verified game ownership via Steam/external platforms
-- ============================================================================
CREATE TABLE IF NOT EXISTS game_ownership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

    -- Ownership verification
    verified BOOLEAN DEFAULT false,
    verification_source VARCHAR(50), -- steam, epic, manual, etc.
    external_user_id VARCHAR(255), -- Steam ID, etc.

    -- Timestamps
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate entries
    UNIQUE(user_id, game_id)
);

-- Indexes for game_ownership
CREATE INDEX IF NOT EXISTS idx_game_ownership_user_id ON game_ownership(user_id);
CREATE INDEX IF NOT EXISTS idx_game_ownership_game_id ON game_ownership(game_id);
CREATE INDEX IF NOT EXISTS idx_game_ownership_verified ON game_ownership(verified);

-- ============================================================================
-- 6. SESSION EVENTS LOG
-- Audit log for session lifecycle events
-- ============================================================================
CREATE TABLE IF NOT EXISTS session_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES gaming_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Event details
    event_type VARCHAR(100) NOT NULL,
    -- session_requested, instance_launching, instance_ready,
    -- sunshine_registered, pairing_initiated, pairing_completed,
    -- stream_started, stream_ended, session_stopped, session_failed

    severity VARCHAR(20) DEFAULT 'info', -- debug, info, warning, error, critical
    message TEXT,

    -- Context
    metadata JSONB,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for session_events
CREATE INDEX IF NOT EXISTS idx_session_events_session_id ON session_events(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_events_user_id ON session_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_events_event_type ON session_events(event_type);

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Apply updated_at triggers to new tables
DROP TRIGGER IF EXISTS update_gaming_sessions_updated_at ON gaming_sessions;
CREATE TRIGGER update_gaming_sessions_updated_at
    BEFORE UPDATE ON gaming_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_host_pool_updated_at ON host_pool;
CREATE TRIGGER update_host_pool_updated_at
    BEFORE UPDATE ON host_pool
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_ownership_updated_at ON game_ownership;
CREATE TRIGGER update_game_ownership_updated_at
    BEFORE UPDATE ON game_ownership
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log session events automatically on status changes
CREATE OR REPLACE FUNCTION log_session_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO session_events (session_id, user_id, event_type, message, metadata)
        VALUES (
            NEW.id,
            NEW.user_id,
            'status_changed',
            format('Session status changed from %s to %s', OLD.status, NEW.status),
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'instance_id', NEW.instance_id
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_gaming_session_status_change ON gaming_sessions;
CREATE TRIGGER log_gaming_session_status_change
    AFTER UPDATE ON gaming_sessions
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION log_session_status_change();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- Enable RLS for user data protection
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE gaming_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
DROP POLICY IF EXISTS "Users can view own gaming sessions" ON gaming_sessions;
CREATE POLICY "Users can view own gaming sessions"
    ON gaming_sessions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own gaming sessions" ON gaming_sessions;
CREATE POLICY "Users can create own gaming sessions"
    ON gaming_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only see their own ownership records
DROP POLICY IF EXISTS "Users can view own game ownership" ON game_ownership;
CREATE POLICY "Users can view own game ownership"
    ON game_ownership FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only see their own payment transactions
DROP POLICY IF EXISTS "Users can view own payment transactions" ON payment_transactions;
CREATE POLICY "Users can view own payment transactions"
    ON payment_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only see their own session events
DROP POLICY IF EXISTS "Users can view own session events" ON session_events;
CREATE POLICY "Users can view own session events"
    ON session_events FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================================
-- 9. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active sessions with host info
CREATE OR REPLACE VIEW active_sessions_view AS
SELECT
    gs.id,
    gs.user_id,
    u.email,
    gs.game_id,
    g.name as game_name,
    gs.instance_id,
    gs.public_ip,
    gs.status,
    gs.pairing_code,
    gs.created_at,
    gs.started_at,
    hp.gpu_model,
    hp.sunshine_healthy,
    hp.last_heartbeat
FROM gaming_sessions gs
JOIN users u ON gs.user_id = u.id
JOIN games g ON gs.game_id = g.id
LEFT JOIN host_pool hp ON gs.instance_id = hp.instance_id
WHERE gs.status IN ('running', 'pairing', 'active')
ORDER BY gs.created_at DESC;

-- Available hosts in warm pool
CREATE OR REPLACE VIEW available_hosts_view AS
SELECT
    id,
    instance_id,
    public_ip,
    instance_type,
    gpu_model,
    gpu_driver_version,
    sunshine_healthy,
    last_heartbeat,
    EXTRACT(EPOCH FROM (NOW() - last_heartbeat)) as seconds_since_heartbeat
FROM host_pool
WHERE status = 'available'
    AND health_status = 'healthy'
    AND sunshine_healthy = true
    AND last_heartbeat > NOW() - INTERVAL '2 minutes'
ORDER BY last_heartbeat DESC;

-- ============================================================================
-- COMPLETE
-- ============================================================================

COMMENT ON TABLE gaming_sessions IS 'Tracks all gaming sessions from creation to completion';
COMMENT ON TABLE host_pool IS 'Manages warm pool of EC2 instances running Sunshine';
COMMENT ON TABLE host_metrics IS 'Time-series metrics from host-agent heartbeats';
COMMENT ON TABLE payment_transactions IS 'Stripe payment transactions and credit purchases';
COMMENT ON TABLE game_ownership IS 'Verified game ownership records via external platforms';
COMMENT ON TABLE session_events IS 'Audit log for session lifecycle events';
