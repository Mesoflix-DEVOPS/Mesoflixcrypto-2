import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  BarChart, 
  LineChart, 
  Activity, 
  TrendingUp, 
  Zap, 
  Target, 
  Award, 
  Calendar,
  ChevronDown
} from 'lucide-react';
import { getApiUrl, fetchWithLogging } from '../config/api';

export default function InstitutionalAnalytics() {
  const { tradingMode, user } = useOutletContext();
  const [stats, setStats] = useState({
    winRate: 68.4,
    profitFactor: 2.14,
    avgTrade: 142.50,
    maxDrawdown: 4.2,
    sharpeRatio: 1.85,
    totalTrades: 124
  });

  // Simulation of performance data for the UI
  const perfData = [
    { day: 'Mon', pnl: 450 },
    { day: 'Tue', pnl: -120 },
    { day: 'Wed', pnl: 890 },
    { day: 'Thu', pnl: 230 },
    { day: 'Fri', pnl: 560 },
    { day: 'Sat', pnl: 1100 },
    { day: 'Sun', pnl: -400 },
  ];

  return (
    <div className="pg-analytics">
      {/* Top Performance Cards */}
      <div className="ana-hero">
        <div className="ana-card primary">
          <div className="ana-card-header">
            <Award size={16} />
            <span>Trading Performance</span>
            <span className="badge-live">Real-Time</span>
          </div>
          <div className="ana-main-stat">
            <div className="stat-group">
              <span className="stat-label">Aggregated PnL</span>
              <span className="stat-value pos">+$14,250.84</span>
            </div>
            <div className="stat-chart-mini">
              {/* Mock chart visualization */}
              <div className="mini-bars">
                {[40, 25, 60, 45, 90, 70, 85].map((h, i) => (
                  <div key={i} className="mini-bar" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="ana-stats-grid">
          <div className="stat-card">
            <span className="stat-label">Win Rate</span>
            <div className="stat-row">
              <span className="stat-val">{stats.winRate}%</span>
              <div className="win-track"><div className="win-fill" style={{ width: `${stats.winRate}%` }}></div></div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Profit Factor</span>
            <span className="stat-val" style={{ color: '#10b981' }}>{stats.profitFactor}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Sharpe Ratio</span>
            <span className="stat-val" style={{ color: '#38bdf8' }}>{stats.sharpeRatio}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Max Drawdown</span>
            <span className="stat-val" style={{ color: '#ef4444' }}>{stats.maxDrawdown}%</span>
          </div>
        </div>
      </div>

      <div className="ana-layout">
        {/* PnL History Visualization */}
        <div className="ana-section pnl-visual">
          <div className="section-header">
            <div className="title-group">
              <Activity size={16} />
              <span>Institutional Alpha Curve</span>
            </div>
            <div className="time-picker">
              <button className="active">7D</button>
              <button>1M</button>
              <button>3M</button>
              <button>ALL</button>
            </div>
          </div>
          <div className="pnl-chart-container">
            <div className="y-axis">
              <span>$20k</span>
              <span>$15k</span>
              <span>$10k</span>
              <span>$5k</span>
              <span>$0</span>
            </div>
            <div className="chart-bars">
              {perfData.map((d, i) => (
                <div className="bar-group" key={i}>
                  <div className="bar-wrapper">
                    <div className={`bar-fill ${d.pnl >= 0 ? 'pos' : 'neg'}`} style={{ height: `${Math.abs(d.pnl) / 15}%` }}>
                      <div className="bar-tooltip">${d.pnl}</div>
                    </div>
                  </div>
                  <span className="bar-label">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trade Analysis */}
        <div className="ana-side-panel">
          <div className="ana-section side-card">
            <div className="section-header">
              <div className="title-group">
                <Target size={16} />
                <span>Trade Distribution</span>
              </div>
            </div>
            <div className="dist-list">
              {[
                { label: 'BTC/USDT', count: 42, color: '#f59e0b' },
                { label: 'ETH/USDT', count: 28, color: '#6366f1' },
                { label: 'SOL/USDT', count: 15, color: '#10b981' },
                { label: 'Others', count: 39, color: '#475569' },
              ].map((item, i) => (
                <div className="dist-item" key={i}>
                  <div className="dist-info">
                    <span>{item.label}</span>
                    <span>{item.count} trades</span>
                  </div>
                  <div className="dist-bar"><div className="dist-fill" style={{ width: `${(item.count/124)*100}%`, background: item.color }}></div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="ana-section side-card">
            <div className="section-header">
              <div className="title-group">
                <Calendar size={16} />
                <span>Recent Activity</span>
              </div>
            </div>
            <div className="activity-feed">
              {[
                { type: 'trade', msg: 'Large Long BTC filled', time: '2m ago', val: '+0.4 BTC' },
                { type: 'system', msg: 'Auto-Risk rebalanced', time: '15m ago', val: 'OK' },
                { type: 'trade', msg: 'ETH Short closed', time: '1h ago', val: '+$420' },
              ].map((a, i) => (
                <div className="feed-item" key={i}>
                  <div className="feed-dot"></div>
                  <div className="feed-content">
                    <div className="feed-main">
                      <span className="feed-msg">{a.msg}</span>
                      <span className="feed-val">{a.val}</span>
                    </div>
                    <span className="feed-time">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pg-analytics {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          background: #07111f;
          min-height: 100%;
        }

        .ana-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .ana-card {
          background: #0b1629;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ana-card.primary {
          background: linear-gradient(135deg, #0b1629 0%, #060c1a 100%);
          border-left: 4px solid #10b981;
        }

        .ana-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-live {
          margin-left: auto;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .ana-main-stat {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .stat-group { display: flex; flex-direction: column; gap: 4px; }
        .stat-label { font-size: 12px; font-weight: 700; color: #475569; }
        .stat-value { font-size: 32px; font-weight: 900; letter-spacing: -0.02em; }
        .stat-value.pos { color: #10b981; }

        .stat-chart-mini {
          height: 60px;
          display: flex;
          align-items: flex-end;
        }
        .mini-bars { display: flex; gap: 4px; align-items: flex-end; height: 100%; }
        .mini-bar { width: 12px; background: #10b981; border-radius: 2px; opacity: 0.3; transition: 0.3s; }
        .mini-bar:hover { opacity: 1; }

        .ana-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-val { font-size: 22px; font-weight: 900; color: #fff; }
        .stat-row { display: flex; align-items: center; gap: 12px; }
        .win-track { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .win-fill { height: 100%; background: #10b981; }

        .ana-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
        }

        .ana-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
        }

        .section-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title-group { display: flex; align-items: center; gap: 10px; color: #fff; font-size: 14px; font-weight: 800; }
        .time-picker { display: flex; gap: 4px; background: #0b1629; padding: 4px; border-radius: 8px; }
        .time-picker button {
          border: none; background: transparent; color: #475569; font-size: 10px; font-weight: 900;
          padding: 4px 10px; border-radius: 6px; cursor: pointer;
        }
        .time-picker button.active { background: #10b981; color: #000; }

        .pnl-visual { min-height: 360px; }
        .pnl-chart-container {
          flex: 1;
          display: flex;
          padding: 32px;
          gap: 24px;
        }

        .y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-size: 10px;
          color: #334155;
          font-weight: 800;
          padding-bottom: 24px;
        }

        .chart-bars {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 24px;
          position: relative;
        }

        .bar-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .bar-wrapper {
          flex: 1;
          width: 24px;
          display: flex;
          align-items: flex-end;
          position: relative;
        }

        .bar-fill {
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: 0.3s;
          cursor: pointer;
          position: relative;
        }
        .bar-fill.pos { background: #10b981; }
        .bar-fill.neg { background: #ef4444; }
        .bar-fill:hover { filter: brightness(1.2); }

        .bar-tooltip {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          color: #000;
          font-size: 10px;
          font-weight: 900;
          padding: 4px 8px;
          border-radius: 4px;
          opacity: 0;
          transition: 0.2s;
          pointer-events: none;
          white-space: nowrap;
        }
        .bar-fill:hover .bar-tooltip { opacity: 1; top: -35px; }

        .bar-label { font-size: 10px; font-weight: 800; color: #475569; }

        .ana-side-panel { display: flex; flex-direction: column; gap: 24px; }
        .side-card { padding-bottom: 20px; }

        .dist-list { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .dist-item { display: flex; flex-direction: column; gap: 8px; }
        .dist-info { display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #94a3b8; }
        .dist-bar { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; }
        .dist-fill { height: 100%; border-radius: 2px; }

        .activity-feed { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .feed-item { display: flex; gap: 12px; }
        .feed-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
        .feed-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .feed-main { display: flex; justify-content: space-between; align-items: center; }
        .feed-msg { font-size: 12px; font-weight: 700; color: #fff; }
        .feed-val { font-size: 11px; font-weight: 900; color: #10b981; }
        .feed-time { font-size: 10px; color: #475569; font-weight: 600; }

        @media (max-width: 1200px) {
          .ana-hero { grid-template-columns: 1fr; }
          .ana-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
