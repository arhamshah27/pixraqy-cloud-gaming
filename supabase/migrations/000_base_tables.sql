-- Base Tables Migration
-- Creates foundational users and games tables required by the gaming sessions schema

-- ============================================================================
-- USERS TABLE
-- Core user information and credits
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,

    -- Subscription and credits
    subscription_tier VARCHAR(50) DEFAULT 'free',
    -- free, premium, enterprise
    credits INTEGER DEFAULT 20,

    -- External accounts
    steam_id VARCHAR(255) UNIQUE,
    external_accounts JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_steam_id ON users(steam_id);

-- ============================================================================
-- GAMES TABLE
-- Available games catalog
-- ============================================================================
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,

    -- External platform IDs
    steam_app_id VARCHAR(50),

    -- Game requirements
    requires_ownership BOOLEAN DEFAULT false,
    minimum_credits INTEGER DEFAULT 10,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for games
CREATE INDEX IF NOT EXISTS idx_games_steam_app_id ON games(steam_app_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to games table
DROP TRIGGER IF EXISTS update_games_updated_at ON games;
CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - for development/testing)
-- ============================================================================

-- Insert sample games (uncomment if needed for testing)
/*
INSERT INTO games (name, description, image_url, steam_app_id, requires_ownership, minimum_credits)
VALUES
    ('Cyberpunk 2077', 'Open-world action RPG set in Night City', 'https://example.com/cyberpunk.jpg', '1091500', false, 10),
    ('Elden Ring', 'Action RPG from FromSoftware', 'https://example.com/eldenring.jpg', '1245620', false, 10),
    ('Red Dead Redemption 2', 'Epic tale of life in America at the dawn of the modern age', 'https://example.com/rdr2.jpg', '1174180', false, 10)
ON CONFLICT DO NOTHING;
*/
