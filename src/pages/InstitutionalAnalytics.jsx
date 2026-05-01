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

    </div>
  );
}
