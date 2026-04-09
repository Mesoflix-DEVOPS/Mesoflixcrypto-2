-- dashboard_schema.sql
-- Database infrastructure for Institutional Dashboard & Trading Bots

-- 1. Portfolio Tracking (Daily Snapshots)
CREATE TABLE IF NOT EXISTS equity_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_equity DECIMAL(20, 8) NOT NULL,
    wallet_balance DECIMAL(20, 8) NOT NULL,
    unrealized_pnl DECIMAL(20, 8) DEFAULT 0,
    environment TEXT DEFAULT 'REAL',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Trading History (Persistent cache of Bybit orders)
CREATE TABLE IF NOT EXISTS trade_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id TEXT UNIQUE NOT NULL,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL, -- BUY | SELL
    order_type TEXT NOT NULL, -- Market | Limit
    price DECIMAL(20, 8),
    qty DECIMAL(20, 8) NOT NULL,
    cum_exec_value DECIMAL(20, 8),
    status TEXT NOT NULL, -- Filled | Cancelled | Rejected
    environment TEXT DEFAULT 'REAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. AI Trading Bots Configuration
CREATE TABLE IF NOT EXISTS trading_bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    strategy TEXT NOT NULL, -- 'Scalper' | 'Grid' | 'Trend'
    status TEXT DEFAULT 'STOPPED', -- 'RUNNING' | 'STOPPED' | 'PAUSED'
    pair TEXT DEFAULT 'BTCUSDT',
    parameters JSONB DEFAULT '{}', -- Strategy-specific settings
    total_pnl DECIMAL(20, 8) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_run_at TIMESTAMP WITH TIME ZONE
);

-- 4. Indexes for fast dashboard loading
CREATE INDEX IF NOT EXISTS idx_equity_user_time ON equity_snapshots(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_trades_user_time ON trade_history(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_bots_user_status ON trading_bots(user_id, status);

-- 5. Seed initial bots for first-time users (Optional function)
-- This can be handled by the backend during first login/link.
