import React, { useState } from 'react';
import { 
  TrendingUp, 
  Cpu, 
  Lock,
  Play,
  Square,
  Zap,
  ChevronRight
} from 'lucide-react';

function BotTrading() {
  const [botActive, setBotActive] = useState(false);

  const strategies = [
    { 
      id: 1, 
      name: 'Vortex Scalper Pro', 
      type: 'HFT', 
      status: botActive ? 'RUNNING' : 'STOPPED', 
      pnl: '+$420.50', 
      winRate: '88.4%', 
      risk: 'Medium',
      color: '#34d399'
    },
    { 
      id: 2, 
      name: 'Sentiment Divergence', 
      type: 'AI/ML', 
      status: 'STANDBY', 
      pnl: '$0.00', 
      winRate: 'N/A', 
      risk: 'Low',
      color: '#6366f1'
    },
    { 
      id: 3, 
      name: 'Infinity Grid', 
      type: 'Neutral', 
      status: 'STANDBY', 
      pnl: '$0.00', 
      winRate: 'N/A', 
      risk: 'High',
      color: '#fbbf24'
    }
  ];

  return (
    <div className="bot-trading-page">
      <div className="page-header">
        <div className="title-area">
          <div className="icon-box">
            <Cpu size={32} className="primary-color" />
          </div>
          <div>
            <h1>AI Bot Terminal</h1>
            <p className="subtitle">Execute automated institutional strategies with military-grade precision.</p>
          </div>
        </div>
        
        <div className="global-bot-toggle" onClick={() => setBotActive(!botActive)}>
          <div className={`toggle-track ${botActive ? 'active' : ''}`}>
            <div className="toggle-thumb"></div>
          </div>
          <span>{botActive ? 'SYSTEM_ARMED' : 'SYSTEM_IDLE'}</span>
        </div>
      </div>

      <div className="bot-grid">
        {/* Analytics Section */}
        <div className="analytics-column">
          <div className="stats-row">
            <div className="mini-stat glass">
              <span className="label">Total Bot Profit</span>
              <span className="value green">+$2,140.80</span>
            </div>
            <div className="mini-stat glass">
              <span className="label">Active Bots</span>
              <span className="value">{botActive ? '1/3' : '0/3'}</span>
            </div>
            <div className="mini-stat glass">
              <span className="label">Total Trades</span>
              <span className="value">1,420</span>
            </div>
          </div>

          <div className="bot-performance-chart glass">
            <div className="chart-header">
              <h3>Strategy Performance</h3>
              <div className="time-filter">
                <button className="active">1D</button>
                <button>1W</button>
                <button>1M</button>
              </div>
            </div>
            <div className="chart-placeholder">
              <TrendingUp size={48} className="chart-icon" />
              <p>Bot Equity Curve Rendering...</p>
            </div>
          </div>

          <div className="recent-bot-activity glass">
            <div className="section-header">
              <h3>Live Decision Feed</h3>
              <div className="live-pill">LIVE</div>
            </div>
            <div className="bot-logs">
              <div className="log-line">
                <span className="time">14:20:01</span>
                <span className="tag">BOT_VORTEX</span>
                <span className="msg">Scanning order book for liquidity clusters...</span>
              </div>
              <div className="log-line">
                <span className="time">14:19:45</span>
                <span className="tag green">ACTION</span>
                <span className="msg">Limit Buy 0.1 BTC at $64,210.50 (Spread Capture)</span>
              </div>
              <div className="log-line">
                <span className="time">14:18:30</span>
                <span className="tag blue">SIGNAL</span>
                <span className="msg">Sentiment Shift detected: Bullish exhaustion on M15</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Selection Column */}
        <div className="strategies-column">
          <h3 className="column-title">Available Strategies</h3>
          <div className="strategy-list">
            {strategies.map((strat) => (
              <div key={strat.id} className={`strat-large-card glass ${strat.status === 'RUNNING' ? 'active' : ''}`}>
                <div className="strat-accent" style={{ background: strat.color }}></div>
                <div className="strat-main">
                  <div className="strat-top">
                    <div>
                      <span className="strat-type">{strat.type}</span>
                      <h4>{strat.name}</h4>
                    </div>
                    {strat.status === 'RUNNING' ? (
                      <Square size={20} className="stop-btn" />
                    ) : (
                      <Play size={20} className="play-btn" />
                    )}
                  </div>
                  
                  <div className="strat-metrics">
                    <div className="m-item">
                      <span>PnL</span>
                      <span className={strat.pnl.includes('+') ? 'green' : ''}>{strat.pnl}</span>
                    </div>
                    <div className="m-item">
                      <span>Win Rate</span>
                      <span>{strat.winRate}</span>
                    </div>
                    <div className="m-item">
                      <span>Risk</span>
                      <span className="high">{strat.risk}</span>
                    </div>
                  </div>

                  <div className="strat-footer">
                    <button className="btn-details">
                      Configure Strategy <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bot-security-card glass">
            <Lock size={20} className="primary-color" />
            <div>
              <h5>Encryption Secured</h5>
              <p>All bot commands are signed and routed through your private proxy gateway.</p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bot-trading-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title-area {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .icon-box {
          width: 64px;
          height: 64px;
          background: rgba(52, 211, 153, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-header h1 {
          font-size: 32px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .subtitle {
          color: #64748b;
          margin: 4px 0 0;
          font-size: 15px;
        }

        .global-bot-toggle {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 10px 20px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
        }

        .global-bot-toggle span {
          font-family: monospace;
          font-weight: 700;
          font-size: 12px;
          color: #64748b;
        }

        .toggle-track {
          width: 40px;
          height: 20px;
          background: #334155;
          border-radius: 100px;
          position: relative;
          transition: background 0.3s;
        }

        .toggle-track.active {
          background: #10b981;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
        }

        .toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 14px;
          height: 14px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.3s;
        }

        .toggle-track.active .toggle-thumb {
          transform: translateX(20px);
        }

        .bot-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 32px;
        }

        .glass {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 24px;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .mini-stat .label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          display: block;
          margin-bottom: 8px;
        }

        .mini-stat .value {
          font-size: 24px;
          font-weight: 800;
        }

        .bot-performance-chart {
          height: 340px;
          display: flex;
          flex-direction: column;
          margin-bottom: 32px;
        }

        .chart-placeholder {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #475569;
          gap: 16px;
        }

        .chart-icon {
          opacity: 0.1;
          color: #34d399;
        }

        .recent-bot-activity {
          flex: 1;
        }

        .live-pill {
          font-size: 10px;
          font-weight: 800;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 2px 8px;
          border-radius: 4px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }

        .bot-logs {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 16px;
          padding: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 200px;
          overflow-y: auto;
        }

        .log-line {
          display: flex;
          gap: 12px;
        }

        .log-line .time { color: #475569; }
        .log-line .tag { color: #64748b; font-weight: 700; }
        .log-line .tag.green { color: #10b981; }
        .log-line .tag.blue { color: #3b82f6; }

        .strategies-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .strategy-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .strat-large-card {
          position: relative;
          overflow: hidden;
          padding: 0 !important;
          transition: all 0.3s;
        }

        .strat-accent {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          opacity: 0.5;
        }

        .strat-large-card.active .strat-accent {
          opacity: 1;
          box-shadow: 0 0 20px currentColor;
        }

        .strat-main {
          padding: 24px;
        }

        .strat-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .strat-type {
          font-size: 10px;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 8px;
          border-radius: 4px;
          color: #64748b;
          text-transform: uppercase;
        }

        .strat-top h4 {
          font-size: 18px;
          margin: 4px 0 0;
          font-weight: 700;
        }

        .play-btn { color: #34d399; cursor: pointer; }
        .stop-btn { color: #ef4444; cursor: pointer; }

        .strat-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .m-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .m-item span:first-child { font-size: 11px; color: #475569; font-weight: 600; }
        .m-item span:last-child { font-size: 14px; font-weight: 700; }

        .btn-details {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #fff;
          padding: 10px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-details:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .bot-security-card {
          margin-top: auto;
          display: flex;
          gap: 16px;
          background: rgba(16, 185, 129, 0.02);
          border-color: rgba(16, 185, 129, 0.1);
        }

        .bot-security-card h5 { margin: 0; font-size: 14px; font-weight: 700; }
        .bot-security-card p { margin: 4px 0 0; font-size: 12px; color: #64748b; line-height: 1.4; }

        .green { color: #34d399; }
        .primary-color { color: #34d399; }
      `}} />
    </div>
  );
}

export default BotTrading;
