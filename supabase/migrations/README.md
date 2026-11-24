# Supabase Database Migrations

This directory contains SQL migrations for the Pixray Cloud Gaming platform.

## Migration Order

**IMPORTANT**: Run migrations in this exact order:

### 1. Base Tables Migration
**File**: `000_base_tables.sql`

Creates the foundational tables:
- `users` - User accounts with credits and subscription tiers
- `games` - Game catalog with Steam integration

**Run this first** in Supabase SQL Editor.

### 2. Gaming Sessions Schema
**File**: `001_gaming_sessions_schema.sql`

Creates all gaming session related tables:
- `gaming_sessions` - Session tracking
- `host_pool` - Warm pool management
- `host_metrics` - Time-series metrics
- `payment_transactions` - Stripe payments
- `game_ownership` - Steam ownership verification
- `session_events` - Audit logging

**Run this second** after 000_base_tables.sql completes successfully.

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `000_base_tables.sql`
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Wait for success confirmation
7. Repeat steps 3-6 for `001_gaming_sessions_schema.sql`

### Option 2: Supabase CLI

```bash
# Make sure you're in the project root
cd /path/to/pixray-cloud

# Apply migrations in order
supabase db push
```

The CLI will automatically run migrations in alphanumeric order.

### Option 3: Manual psql

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres"

# Run migrations in order
\i supabase/migrations/000_base_tables.sql
\i supabase/migrations/001_gaming_sessions_schema.sql
```

## Verification

After running both migrations, verify the tables were created:

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- - users
-- - games
-- - gaming_sessions
-- - host_pool
-- - host_metrics
-- - payment_transactions
-- - game_ownership
-- - session_events
```

## Troubleshooting

### Error: "relation 'users' does not exist"

**Solution**: You tried to run `001_gaming_sessions_schema.sql` before `000_base_tables.sql`.
Run `000_base_tables.sql` first.

### Error: "relation 'users' already exists"

**Solution**: The users table already exists. You can either:
1. Skip `000_base_tables.sql` (if tables already have correct schema)
2. Or drop and recreate: `DROP TABLE IF EXISTS users CASCADE;` then run the migration

### Error: "column already exists"

**Solution**: The migration has already been partially applied. Either:
1. Skip to the next migration
2. Or reset the database and start over

## Sample Data (Optional)

To add sample games for testing, uncomment the INSERT statements at the bottom of `000_base_tables.sql`:

```sql
INSERT INTO games (name, description, image_url, steam_app_id, requires_ownership, minimum_credits)
VALUES
    ('Cyberpunk 2077', 'Open-world action RPG set in Night City', 'https://example.com/cyberpunk.jpg', '1091500', false, 10),
    ('Elden Ring', 'Action RPG from FromSoftware', 'https://example.com/eldenring.jpg', '1245620', false, 10),
    ('Red Dead Redemption 2', 'Epic tale of life in America at the dawn of the modern age', 'https://example.com/rdr2.jpg', '1174180', false, 10)
ON CONFLICT DO NOTHING;
```

## Schema Overview

```
users (base table)
  ├── gaming_sessions
  │     ├── session_events
  │     └── host_metrics
  ├── payment_transactions
  └── game_ownership

games (base table)
  ├── gaming_sessions
  └── game_ownership

host_pool (independent)
  ├── host_metrics
  └── gaming_sessions (via allocation)
```

## Row Level Security (RLS)

RLS is enabled on user-facing tables:
- Users can only view/create their own sessions
- Users can only view their own payments
- Users can only view their own game ownership records

Admin access requires service role key.
