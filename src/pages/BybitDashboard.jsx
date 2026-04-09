import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Shield, 
  Zap, 
  Cpu, 
  BarChart2,
  Lock,
  RefreshCw
} from 'lucide-react';

function BybitDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [botActive, setBotActive] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // For now using placeholder ID, in production this comes from Auth context
      const userId = 'placeholder-uid'; 
      const res = await fetch(`/api/bybit/dashboard/${userId}`);
      const result = await res.json();
      
      if (res.ok) {
        setData(result);
      } else {
        setError(result.error || 'Failed to sync data');
      }
    } catch (err) {
      setError('Connection to gateway interrupted.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBot = () => {
    setBotActive(!botActive);
  };

  return (
    <div className="institutional-dashboard">
      <div className="dashboard-grid">
        
        {/* Main Section (Left & Center) */}
        <div className="main-content-column">
          
          {/* Top Metric Cards */}
          <div className="metric-cards">
            <div className="stat-card glass">
              <div className="card-top">
                <span className="label">Total Equity</span>
                <div className="icon"><Wallet size={16} /></div>
              </div>
              <div className="card-value">
                ${data ? parseFloat(data.summary?.totalEquity).toLocaleString() : '0.00'}
                <span className="currency">USDT</span>
              </div>
              <div className="card-footer green">
                <TrendingUp size={14} />
                <span>+2.4% ($1,240.50)</span>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="card-top">
                <span className="label">Available Margin</span>
                <div className="icon"><Shield size={16} /></div>
              </div>
              <div className="card-value">
                ${data ? parseFloat(data.summary?.totalAvailableBalance).toLocaleString() : '0.00'}
              </div>
              <div className="card-footer">
                <span>Maintenance: 0.05%</span>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="card-top">
                <span className="label">Open PnL</span>
                <div className="icon"><Activity size={16} /></div>
              </div>
              <div className="card-value green">
                +${data ? data.positions.reduce((acc, p) => acc + parseFloat(p.unrealisedPnl), 0).toFixed(2) : '0.00'}
              </div>
              <div className="card-footer grey">
                <span>{data?.positions.length || 0} Open Positions</span>
              </div>
            </div>
          </div>

          {/* Central Chart Area */}
          <div className="chart-container glass">
            <div className="chart-header">
              <div className="active-symbol">
                <Zap size={18} fill="#34d399" color="#34d399" />
                <span>BTCUSDT Perpetual</span>
                <span className="price-label highlight">$64,842.50</span>
              </div>
              <div className="chart-controls">
                <button className="active">1H</button>
                <button>4H</button>
                <button>1D</button>
                <button>1W</button>
              </div>
            </div>
            
            <div className="tradingview-wrapper">
              {/* TradingView Widget Placeholder */}
              <div className="tv-widget-mock">
                <div className="tv-inner">
                  <BarChart2 size={48} className="placeholder-icon" />
                  <p>Real-time Candlestick Stream Rendering...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Positions Table */}
          <div className="positions-section glass">
            <div className="section-header">
              <h3>Active Institutional Positions</h3>
              <button className="btn-refresh" onClick={fetchDashboardData}>
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                Refresh
              </button>
            </div>
            
            <div className="table-responsive">
              <table className="institutional-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Size</th>
                    <th>Entry Price</th>
                    <th>Mark Price</th>
                    <th>PnL (ROE%)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.positions.length > 0 ? (
                    data.positions.map((pos, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="asset-cell">
                            <span className={`side-tag ${pos.side.toLowerCase()}`}>{pos.side}</span>
                            <span className="symbol">{pos.symbol}</span>
                          </div>
                        </td>
                        <td>{pos.size} {pos.symbol.replace('USDT', '')}</td>
                        <td>${parseFloat(pos.avgPrice).toFixed(2)}</td>
                        <td>${parseFloat(pos.markPrice).toFixed(2)}</td>
                        <td className={parseFloat(pos.unrealisedPnl) >= 0 ? 'green' : 'red'}>
                          ${parseFloat(pos.unrealisedPnl).toFixed(2)} 
                          ({((parseFloat(pos.unrealisedPnl) / (parseFloat(pos.positionValue) / 10)) * 100).toFixed(2)}%)
                        </td>
                        <td>
                          <button className="btn-close-pos">Close</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-table">No active positions found in current environment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bot Sidepanel (Right Sidebar) */}
        <div className="bot-sidepanel glass">
          <div className="sidepanel-inner">
            <div className="bot-header">
              <div className="bot-title">
                <Cpu size={24} className="primary-color" />
                <h2>AI Bot Terminal</h2>
              </div>
              <div className="bot-status-ring">
                <div className={`status-dot ${botActive ? 'active' : ''}`}></div>
                <span>{botActive ? 'SYSTEM_ARMED' : 'SYSTEM_IDLE'}</span>
              </div>
            </div>

            <div className="bot-master-toggle" onClick={toggleBot}>
              <div className={`toggle-track ${botActive ? 'active' : ''}`}>
                <div className="toggle-thumb"></div>
              </div>
              <span className="toggle-label">{botActive ? 'Disable All Bots' : 'Initialize Trading Bots'}</span>
            </div>

            <div className="bot-strategies">
              <h4 className="panel-label">Active Strategies</h4>
              
              <div className={`strategy-card ${botActive ? 'active' : ''}`}>
                <div className="strat-top">
                  <span className="strat-name">Vortex Scalper Pro</span>
                  <div className="strat-tag">HFT</div>
                </div>
                <div className="strat-progress">
                  <div className="progress-bar" style={{ width: '75%' }}></div>
                </div>
                <div className="strat-stats">
                  <div className="stat">
                    <span>24h PnL</span>
                    <span className="green">+$420.50</span>
                  </div>
                  <div className="stat">
                    <span>Win Rate</span>
                    <span>88.4%</span>
                  </div>
                </div>
              </div>

              <div className="strategy-card">
                <div className="strat-top">
                  <span className="strat-name">Sentiment Divergence</span>
                  <div className="strat-tag">AI/ML</div>
                </div>
                <div className="strat-stats">
                  <div className="stat">
                    <span>Status</span>
                    <span className="grey">STANDBY</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bot-feed-section">
              <h4 className="panel-label">Live Decision Feed</h4>
              <div className="bot-logs">
                <div className="log-line">
                  <span className="tag">BOT_VORTEX</span>
                  <span className="msg">Analyzing RSI divergence on BTCUSDT M5...</span>
                </div>
                <div className="log-line">
                  <span className="tag green">ACTION</span>
                  <span className="msg">Limit order placed: Buy 0.05 BTC @ $64,810</span>
                </div>
                <div className="log-line">
                  <span className="tag">SIGNAL</span>
                  <span className="msg">Institutional order flow detected: BULLISH</span>
                </div>
              </div>
            </div>

            <div className="bot-footer">
              <div className="security-badge">
                 <Lock size={12} />
                 <span>Military Grade Encryption Active</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .institutional-dashboard {
          max-width: 1600px;
          margin: 0 auto;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
        }

        .main-content-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .glass {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
        }

        .metric-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .stat-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-card .label {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-card .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-card .icon {
          color: #34d399;
          opacity: 0.6;
        }

        .stat-card .card-value {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .card-value .currency {
          font-size: 14px;
          color: #475569;
        }

        .card-footer {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }

        .card-footer.green { color: #34d399; }
        .card-footer.red { color: #ef4444; }
        .card-footer.grey { color: #64748b; }

        /* Chart Area */
        .chart-container {
          padding: 24px;
          height: 480px;
          display: flex;
          flex-direction: column;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .active-symbol {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 700;
        }

        .price-label.highlight {
          color: #34d399;
          background: rgba(16, 185, 129, 0.1);
          padding: 4px 12px;
          border-radius: 8px;
          font-family: monospace;
        }

        .chart-controls {
          display: flex;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          padding: 4px;
        }

        .chart-controls button {
          background: none;
          border: none;
          color: #64748b;
          padding: 6px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chart-controls button.active {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .tradingview-wrapper {
          flex: 1;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .tv-widget-mock {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
        }

        .tv-inner {
           text-align: center;
        }

        .placeholder-icon {
          margin-bottom: 12px;
          opacity: 0.2;
        }

        /* Positions Table */
        .positions-section {
          padding: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h3 {
          font-size: 18px;
          font-weight: 700;
        }

        .btn-refresh {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          padding: 6px 16px;
          border-radius: 10px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .institutional-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .institutional-table th {
          text-align: left;
          color: #64748b;
          font-weight: 600;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .institutional-table td {
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
        }

        .asset-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .side-tag {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .side-tag.buy { background: rgba(16, 185, 129, 0.1); color: #34d399; }
        .side-tag.sell { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .green { color: #34d399; }
        .red { color: #ef4444; }

        .btn-close-pos {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 4px 12px;
          border-radius: 6px;
          color: #94a3b8;
          cursor: pointer;
        }

        /* Bot Sidebar Panel */
        .bot-sidepanel {
          padding: 32px 24px;
          position: sticky;
          top: 104px;
          height: calc(100vh - 128px);
        }

        .bot-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .bot-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bot-title h2 {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .bot-status-ring {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          font-family: monospace;
          color: #64748b;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #475569;
        }

        .status-dot.active {
          background: #34d399;
          box-shadow: 0 0 12px #34d399;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }

        .bot-master-toggle {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 16px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          margin-bottom: 32px;
          transition: all 0.2s;
        }

        .bot-master-toggle:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .toggle-track {
          width: 44px;
          height: 24px;
          background: #334155;
          border-radius: 100px;
          position: relative;
          transition: background 0.3s;
        }

        .toggle-track.active {
          background: #10b981;
        }

        .toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.3s;
        }

        .toggle-track.active .toggle-thumb {
          transform: translateX(20px);
        }

        .toggle-label {
          font-size: 13px;
          font-weight: 600;
        }

        .panel-label {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }

        .strategy-card {
           background: rgba(255, 255, 255, 0.02);
           border: 1px solid rgba(255, 255, 255, 0.03);
           border-radius: 16px;
           padding: 16px;
           margin-bottom: 16px;
           transition: all 0.3s;
        }

        .strategy-card.active {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.03);
        }

        .strat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .strat-name {
          font-size: 13px;
          font-weight: 700;
        }

        .strat-tag {
          font-size: 9px;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 800;
        }

        .strat-stats {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 12px;
        }

        .strat-stats .stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat span:first-child { font-size: 10px; color: #64748b; }
        .stat span:last-child { font-size: 12px; font-weight: 700; }

        .bot-logs {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          padding: 12px;
          font-family: monospace;
          font-size: 11px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
        }

        .log-line {
          display: flex;
          gap: 8px;
        }

        .log-line .tag { color: #475569; font-weight: 700; }
        .log-line .tag.green { color: #10b981; }
        .log-line .msg { color: #94a3b8; }

        .bot-footer {
          margin-top: auto;
          padding-top: 24px;
        }

        .security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 10px;
          color: #475569;
          font-weight: 600;
        }

        .primary-color { color: #34d399; }
      `}} />
    </div>
  );
}

// Placeholder helper
function Wallet({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
      <path d="M18 12h4" />
    </svg>
  );
}

export default BybitDashboard;

