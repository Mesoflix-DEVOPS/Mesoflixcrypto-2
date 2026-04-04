-- Table for general platform users (Traders)
-- This is separate from staff_profiles to ensure data isolation
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'trader',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Link broker accounts to this new users table as well
-- (Note: user_broker_accounts already has user_id, we just need to ensure it can reference both or we migrate staff to users)
-- For now, let's keep user_broker_accounts referencing staff_profiles or users specifically.
-- Better: make user_broker_accounts polymorphic or just have two columns.
-- For this platform, we'll assume a "Unified User" model going forward.
