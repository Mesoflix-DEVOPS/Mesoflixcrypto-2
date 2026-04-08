-- Table to store Bybit Sub-Account mappings for Mesoflix users
CREATE TABLE IF NOT EXISTS user_broker_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bybit_sub_uid TEXT NOT NULL,
    bybit_username TEXT NOT NULL,
    encrypted_api_key TEXT NOT NULL,
    encrypted_api_secret TEXT NOT NULL,
    environment TEXT DEFAULT 'REAL', -- 'REAL', 'DEMO', 'TESTNET'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_env UNIQUE (user_id, environment)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_broker_accounts_user_id ON user_broker_accounts(user_id);
