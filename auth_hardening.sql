-- auth_hardening.sql
-- Phase 1 Security Migration

-- 1. Table to track unique OAuth sessions (Signed State Tracking)
CREATE TABLE IF NOT EXISTS oauth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jti TEXT UNIQUE NOT NULL, -- Unique ID of the signed state token
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT DEFAULT 'bybit',
    status TEXT DEFAULT 'issued', -- issued | consumed | failed
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE,
    error_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Audit table for callback lifecycle tracking
CREATE TABLE IF NOT EXISTS oauth_audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES oauth_sessions(id),
    user_id UUID REFERENCES users(id),
    event_type TEXT NOT NULL, -- REDIRECT | CALLBACK | TOKEN_EXCHANGE | DB_UPSERT
    status TEXT NOT NULL, -- SUCCESS | FAILURE
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Enforce strict uniqueness on sub-accounts to prevent account swapping attacks
ALTER TABLE user_broker_accounts 
ADD CONSTRAINT unique_provider_sub_uid UNIQUE (bybit_sub_uid);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_jti ON oauth_sessions(jti);
CREATE INDEX IF NOT EXISTS idx_oauth_audit_session ON oauth_audit_events(session_id);
