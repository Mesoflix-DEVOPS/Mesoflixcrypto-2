import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity, 
  BarChart2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Info,
  ChevronDown,
  Settings as SettingsIcon,
  Search,
  Bell,
  MessageSquare,
  Star,
  Pin,
  ChevronRight
} from 'lucide-react';

import MarketTerminal from '../components/MarketTerminal';
import { getApiUrl, fetchWithLogging } from '../config/api';

function BybitDashboard() {
  const [activeSide, setActiveSide] = useState('BUY');
  const [activeSymbol, setActiveSymbol] = useState('BTCUSDT');
  const [activePrice, setActivePrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivePrice = async () => {
      try {
        const res = await fetchWithLogging(getApiUrl(`/api/market/ticker/${activeSymbol}`));
        if (res.ok) {
          const data = await res.json();
          setActivePrice(parseFloat(data.lastPrice));
        }
      } catch (e) {
        console.warn('Price sync failed', e);
      }
    };

    fetchActivePrice();
    const interval = setInterval(fetchActivePrice, 10000);
    return () => clearInterval(interval);
  }, [activeSymbol]);

  const handleSelectSymbol = (symbol) => {
    setActiveSymbol(symbol);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-container">
      {/* 1. MARKET DISCOVERY ENGINE (Search + Recs + Watchlist) */}
      <div className="discovery-wrapper" style={{ marginBottom: '32px' }}>
        <MarketTerminal onSelectSymbol={handleSelectSymbol} />
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-left-col">
          {/* Main Chart Card */}
          <div className="main-chart-card">
            <div className="chart-toolbar">
              <div className="toolbar-left">
                <button className="toolbar-btn active">{activeSymbol} • 15m</button>
                <button className="toolbar-btn"><BarChart2 size={16} /></button>
              </div>
            </div>
            <div className="chart-viewport">
              <div className="chart-info-overlay">
                <span className="chart-pair">{activeSymbol} Analytics •</span>
                <span className="chart-indicator">Running Real-Mode Feed</span>
              </div>
              <div className="chart-svg-container">
                <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none">
                  <path d="M0 300 Q 150 250, 300 300 T 600 200 T 800 150" stroke="#34d399" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Grid for Equity and Positions */}
          <div className="bottom-info-grid">
            <div className="info-card silver-glass">
              <div className="card-header">
                <span className="card-title">Account Equity</span>
                <button className="dot-btn">···</button>
              </div>
              <div className="card-body">
                <div className="equity-chart">
                  <svg width="100%" height="80" viewBox="0 0 200 80" preserveAspectRatio="none">
                    <path d="M0 70 Q 50 65, 100 40 T 200 5" stroke="#34d399" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <div className="equity-stats">
                   <p className="total-equity-label">Total Equity</p>
                   <h2 className="equity-value">$0.00</h2>
                   <p className="equity-change green">▲ Stable</p>
                </div>
              </div>
            </div>

            <div className="info-card silver-glass">
              <div className="card-header">
                <span className="card-title">Active Positions</span>
                <button className="dot-btn">···</button>
              </div>
              <div className="card-body">
                <div className="empty-positions">
                  <Activity size={32} className="empty-icon" />
                  <p>No active positions found.</p>
                  <span>Connect your Bybit account to start trading.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Institutional Order Panel */}
        <div className="order-sidebar">
          <div className="order-card silver-glass">
            <div className="card-header order-header">
              <span className="card-title-lg">{activeSymbol} Order</span>
              <button className="dot-btn">···</button>
            </div>
            
            <div className="order-tabs">
              <button 
                className={`order-tab buy ${activeSide === 'BUY' ? 'active' : ''}`}
                onClick={() => setActiveSide('BUY')}
              >
                BUY
              </button>
              <button 
                className={`order-tab sell ${activeSide === 'SELL' ? 'active' : ''}`}
                onClick={() => setActiveSide('SELL')}
              >
                SELL
              </button>
            </div>

            <div className="order-form">
              <div className="form-group">
                <label className="form-label">Order type</label>
                <div className="type-toggle-group">
                  <button className="type-toggle-btn active">Limit</button>
                  <button className="type-toggle-btn">Market</button>
                  <button className="type-toggle-btn">Stop</button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity ({activeSymbol.replace('USDT', '')})</label>
                <div className="number-input-wrapper">
                  <input type="text" className="form-input" defaultValue="0.1" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Price (USDT)</label>
                <div className="price-input-wrapper">
                  <span className="price-val">${activePrice.toLocaleString()}</span>
                  <span className="price-denom">USDT</span>
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-info">
                  <label className="form-label">Leverage</label>
                  <Info size={12} className="label-info-icon" />
                  <span className="label-sub">1x - 100x</span>
                </div>
                <input type="range" className="range-slider-themed" min="1" max="100" defaultValue="1" />
              </div>

              <div className="risk-mgmt-section">
                 <h4 className="section-subtitle">Risk Management</h4>
                 <div className="risk-item">
                   <span className="risk-label">Take-Profit (%)</span>
                   <div className="risk-input-box">
                     10 <ChevronDown size={14} />
                   </div>
                 </div>
                 <div className="risk-item">
                   <span className="risk-label">Stop-Loss (%)</span>
                   <div className="risk-input-box">
                     5 <ChevronDown size={14} />
                   </div>
                 </div>
              </div>

              <button className={`submit-order-btn ${activeSide === 'BUY' ? 'buy' : 'sell'}`}>
                {activeSide} {activeSymbol.replace('USDT', '')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-container {
          background: #0a0f1d;
          min-height: 100vh;
          padding: 24px;
          color: #94a3b8;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .dashboard-main-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; }
        .dashboard-left-col { display: flex; flex-direction: column; gap: 24px; }

        .main-chart-card { background: #0d121f; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; height: 520px; display: flex; flex-direction: column; overflow: hidden; }
        .chart-toolbar { padding: 12px 20px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.03); background: #0a0f1d; }
        .toolbar-btn { background: transparent; border: none; color: #475569; padding: 4px 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .toolbar-btn.active { color: #34d399; }

        .chart-viewport { flex: 1; padding: 24px; position: relative; }
        .chart-info-overlay { margin-bottom: 20px; }
        .chart-pair { color: #fff; font-weight: 700; font-size: 16px; margin-right: 12px; }
        .chart-indicator { color: #34d399; font-size: 13px; font-weight: 600; }

        .bottom-info-grid { display: grid; grid-template-columns: 320px 1fr; gap: 24px; }
        .silver-glass { background: rgba(22, 27, 44, 0.4); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 20px; }

        .card-header { padding: 20px 24px 12px; display: flex; justify-content: space-between; align-items: center; }
        .card-title { color: #fff; font-weight: 700; font-size: 15px; }
        .card-title-lg { color: #fff; font-weight: 800; font-size: 19px; }
        .dot-btn { background: transparent; border: none; color: #475569; font-size: 20px; cursor: pointer; }

        .card-body { padding: 0 24px 24px; }
        .equity-value { font-size: 34px; font-weight: 800; color: #fff; margin: 8px 0; }
        
        .empty-positions { padding: 40px 0; text-align: center; color: #475569; }
        .empty-icon { margin-bottom: 16px; opacity: 0.2; }
        .empty-positions p { color: #fff; font-weight: 700; margin-bottom: 4px; }
        .empty-positions span { font-size: 12px; }

        .order-tabs { display: flex; padding: 0 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 24px; }
        .order-tab { flex: 1; border: none; background: transparent; padding: 12px; font-weight: 800; font-size: 14px; cursor: pointer; color: #475569; }
        .order-tab.buy.active { color: #34d399; border-bottom: 2px solid #34d399; }
        .order-tab.sell.active { color: #ef4444; border-bottom: 2px solid #ef4444; }

        .order-form { padding: 0 24px; display: flex; flex-direction: column; gap: 20px; }
        .type-toggle-group { display: flex; background: #0a0f1d; border-radius: 8px; padding: 4px; gap: 4px; }
        .type-toggle-btn { flex: 1; border: none; background: transparent; color: #475569; font-size: 12px; font-weight: 700; padding: 8px; border-radius: 6px; cursor: pointer; }
        .type-toggle-btn.active { background: #1e293b; color: #fff; }

        .number-input-wrapper { background: #0a0f1d; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
        .form-input { background: transparent; border: none; color: #fff; font-weight: 700; width: 60%; font-size: 15px; outline: none; }
        .price-input-wrapper { background: #0a0f1d; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; }
        
        .submit-order-btn { width: 100%; padding: 16px; border-radius: 12px; border: none; font-weight: 800; color: #000; cursor: pointer; transition: 0.3s; margin-top: 10px; text-transform: uppercase; }
        .submit-order-btn.buy { background: #34d399; box-shadow: 0 4px 14px rgba(52, 211, 153, 0.3); }
        .submit-order-btn.sell { background: #ef4444; color: #fff; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3); }

        .green { color: #34d399; }
        
        @media (max-width: 1200px) {
          .dashboard-main-grid { grid-template-columns: 1fr; }
          .bottom-info-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
}

export default BybitDashboard;
