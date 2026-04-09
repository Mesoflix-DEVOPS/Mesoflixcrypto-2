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
  MessageSquare
} from 'lucide-react';

function BybitDashboard() {
  const [activeSide, setActiveSide] = useState('BUY');

  return (
    <div className="dashboard-container">
      {/* Top Row: Sparkline Cards */}
      <div className="ticker-grid">
        <div className="ticker-card">
          <div className="ticker-header">
            <div className="ticker-icon-container btc">
              <BitcoinIcon size={20} />
            </div>
            <div className="ticker-names">
              <span className="ticker-symbol">BTC/USDT</span>
              <span className="ticker-full-name">BTC/USDT</span>
            </div>
            <div className="ticker-chart">
               <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
                  <path d="M1 18C10 18 15 2 30 10C45 18 50 4 59 4" stroke="#34d399" strokeWidth="2" strokeLinecap="round"/>
               </svg>
            </div>
            <div className="ticker-price-info">
              <span className="ticker-price">333.50</span>
              <span className="ticker-percent green">+3.83%</span>
            </div>
          </div>
        </div>

        <div className="ticker-card">
          <div className="ticker-header">
            <div className="ticker-icon-container eth">
              <EthereumIcon size={20} />
            </div>
            <div className="ticker-names">
              <span className="ticker-symbol">ETH/USDT</span>
              <span className="ticker-full-name">ETH/USDT</span>
            </div>
            <div className="ticker-chart">
               <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
                  <path d="M1 12C10 20 20 4 30 12C40 20 50 8 59 12" stroke="#34d399" strokeWidth="2" strokeLinecap="round"/>
               </svg>
            </div>
            <div className="ticker-price-info">
              <span className="ticker-price">38.55</span>
              <span className="ticker-percent green">+2.56%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main-grid">
        <div className="dashboard-left-col">
          {/* Main Chart Card */}
          <div className="main-chart-card">
            <div className="chart-toolbar">
              <div className="toolbar-left">
                <button className="toolbar-btn active">15m</button>
                <button className="toolbar-btn"><BarChart2 size={16} /></button>
                <button className="toolbar-btn">fx</button>
                <button className="toolbar-btn">amt</button>
              </div>
              <div className="toolbar-right">
                <button className="toolbar-btn"><SettingsIcon size={16} /></button>
                <button className="toolbar-btn"><ChevronDown size={16} /></button>
              </div>
            </div>
            <div className="chart-viewport">
              <div className="chart-info-overlay">
                <span className="chart-pair">Dtcoraatès - 1D - I •</span>
                <span className="chart-indicator">Moving AA MSB 20:23.28</span>
              </div>
              <div className="chart-svg-container">
                <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none">
                  <path d="M0 300 L100 320 L200 280 L300 310 L400 250 L500 220 L600 200 L700 180 L800 150" stroke="#f59e0b" strokeWidth="2" fill="none" />
                  {/* Candlestick Mockup */}
                  <rect x="150" y="280" width="10" height="40" fill="#34d399" />
                  <rect x="250" y="300" width="10" height="20" fill="#ef4444" />
                  <rect x="350" y="240" width="10" height="70" fill="#34d399" />
                  <rect x="450" y="210" width="10" height="40" fill="#34d399" />
                  <rect x="550" y="180" width="10" height="50" fill="#34d399" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Grid for Equity and Positions */}
          <div className="bottom-info-grid">
            {/* Account Equity Card */}
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
                   <h2 className="equity-value">$10,976.52</h2>
                   <p className="equity-change green">▲ 110.38%</p>
                </div>
                <div className="equity-progress-bg">
                   <div className="equity-progress-fill" style={{width: '35%'}}></div>
                </div>
              </div>
            </div>

            {/* Active Positions Card */}
            <div className="info-card silver-glass">
              <div className="card-header">
                <span className="card-title">Active Positions</span>
                <button className="dot-btn">···</button>
              </div>
              <div className="card-body">
                <table className="positions-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Size</th>
                      <th>Entry</th>
                      <th>Price</th>
                      <th>Prof/Los</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="pos-row">
                      <td>
                        <div className="asset-cell">
                          <BitcoinIcon size={14} />
                          <div className="asset-meta">
                             <span className="asset-sym">BTC</span>
                             <span className="asset-pair">USDT</span>
                          </div>
                        </div>
                      </td>
                      <td>2.0k</td>
                      <td>$1.300</td>
                      <td>$1.920</td>
                      <td className="green">+$13.00</td>
                    </tr>
                    {/* Additional rows */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Institutional Order Panel */}
        <div className="order-sidebar">
          <div className="order-card silver-glass">
            <div className="card-header order-header">
              <span className="card-title-lg">Institutional Order</span>
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
                <label className="form-label">Quantity</label>
                <div className="number-input-wrapper">
                  <input type="text" className="form-input" value="10" readOnly />
                  <div className="input-arrows">
                    <ChevronDown size={14} className="arrow-up" />
                    <ChevronDown size={14} className="arrow-down" />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Price</label>
                <div className="price-input-wrapper">
                  <span className="price-val">$100.00</span>
                  <span className="price-denom">USDT</span>
                </div>
                <div className="range-slider-container">
                    <div className="slider-track-dots">
                      <span></span><span></span><span></span><span></span><span></span>
                    </div>
                    <input type="range" className="range-slider" />
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-info">
                  <label className="form-label">Leverage</label>
                  <Info size={12} className="label-info-icon" />
                  <span className="label-sub">4 - 100</span>
                </div>
                <input type="range" className="range-slider-themed" />
              </div>

              <div className="form-group">
                <div className="label-with-info">
                  <label className="form-label">Stop Loss</label>
                  <Info size={12} className="label-info-icon" />
                  <span className="label-sub">1.5</span>
                </div>
                <input type="range" className="range-slider-themed" />
              </div>

              <div className="risk-mgmt-section">
                 <h4 className="section-subtitle">Risk Management</h4>
                 <div className="risk-item">
                   <span className="risk-label">Take-Profit</span>
                   <div className="risk-input-box">
                     15 <ChevronDown size={14} />
                   </div>
                 </div>
                 <div className="risk-item">
                   <span className="risk-label">Take-Profit</span>
                   <div className="custom-toggle active"></div>
                 </div>
                 <div className="risk-item">
                   <span className="risk-label">Take-Profit</span>
                   <div className="custom-toggle active"></div>
                 </div>
                 <div className="risk-item">
                   <span className="risk-label">Stop Loss</span>
                   <div className="risk-input-box">
                     5 <ChevronDown size={14} />
                   </div>
                 </div>
                 {/* ... other toggles */}
              </div>
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

        /* Ticker Row */
        .ticker-grid {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
        }

        .ticker-card {
          background: rgba(22, 27, 44, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 12px 20px;
          flex: 0 0 320px;
        }

        .ticker-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ticker-icon-container {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ticker-icon-container.btc { background: rgba(247, 147, 26, 0.1); color: #f7931a; }
        .ticker-icon-container.eth { background: rgba(98, 126, 234, 0.1); color: #627eea; }

        .ticker-names { display: flex; flex-direction: column; }
        .ticker-symbol { color: #fff; font-weight: 700; font-size: 14px; }
        .ticker-full-name { font-size: 11px; opacity: 0.5; }

        .ticker-price-info { margin-left: auto; text-align: right; }
        .ticker-price { display: block; color: #fff; font-weight: 700; font-size: 15px; }
        .ticker-percent { font-size: 12px; font-weight: 600; }

        /* Main Grid */
        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
        }

        .dashboard-left-col { display: flex; flex-direction: column; gap: 24px; }

        .main-chart-card {
          background: #0d121f;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          height: 520px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chart-toolbar {
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          background: #0a0f1d;
        }
        .toolbar-btn { background: transparent; border: none; color: #475569; padding: 4px 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .toolbar-btn.active { color: #3b82f6; }

        .chart-viewport { flex: 1; padding: 24px; position: relative; }
        .chart-info-overlay { margin-bottom: 20px; }
        .chart-pair { color: #fff; font-weight: 700; font-size: 16px; margin-right: 12px; }
        .chart-indicator { color: #fbbf24; font-size: 13px; }
        .chart-svg-container { position: absolute; bottom: 40px; left: 40px; right: 40px; top: 100px; }

        .bottom-info-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
        }

        .silver-glass {
          background: rgba(22, 27, 44, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
        }

        .card-header { padding: 20px 24px 12px; display: flex; justify-content: space-between; align-items: center; }
        .card-title { color: #fff; font-weight: 700; font-size: 15px; }
        .card-title-lg { color: #fff; font-weight: 800; font-size: 19px; }
        .dot-btn { background: transparent; border: none; color: #475569; font-size: 20px; cursor: pointer; }

        .card-body { padding: 0 24px 24px; }
        .equity-value { font-size: 34px; font-weight: 800; color: #fff; margin: 8px 0; }
        .equity-progress-bg { height: 4px; background: #1e293b; border-radius: 10px; margin-top: 16px; }
        .equity-progress-fill { height: 100%; background: #34d399; border-radius: 10px; box-shadow: 0 0 10px rgba(52, 211, 153, 0.4); }

        .positions-table { width: 100%; border-collapse: collapse; }
        .positions-table th { text-align: left; font-size: 12px; color: #475569; font-weight: 600; padding-bottom: 12px; }
        .asset-cell { display: flex; align-items: center; gap: 10px; }
        .asset-meta { line-height: 1.2; }
        .asset-sym { display: block; color: #fff; font-weight: 700; font-size: 13px; }
        .asset-pair { font-size: 10px; opacity: 0.5; }
        .pos-row td { padding: 12px 0; border-top: 1px solid rgba(255, 255, 255, 0.02); color: #fff; font-weight: 600; font-size: 13px; }

        /* Order Sidebar */
        .order-card { padding-bottom: 24px; }
        .order-header { margin-bottom: 16px; }
        .order-tabs { display: flex; padding: 0 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 24px; }
        .order-tab { flex: 1; border: none; background: transparent; padding: 12px; font-weight: 800; font-size: 14px; cursor: pointer; color: #475569; }
        .order-tab.buy.active { color: #34d399; border-bottom: 2px solid #34d399; }
        .order-tab.sell.active { color: #ef4444; border-bottom: 2px solid #ef4444; }

        .order-form { padding: 0 24px; display: flex; flex-direction: column; gap: 20px; }
        .form-label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 8px; }
        .type-toggle-group { display: flex; background: #0a0f1d; border-radius: 8px; padding: 4px; gap: 4px; }
        .type-toggle-btn { flex: 1; border: none; background: transparent; color: #475569; font-size: 12px; font-weight: 700; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
        .type-toggle-btn.active { background: #1e293b; color: #fff; }

        .number-input-wrapper { background: #0a0f1d; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
        .form-input { background: transparent; border: none; color: #fff; font-weight: 700; width: 60%; font-size: 15px; }
        .input-arrows { display: flex; flex-direction: column; color: #475569; gap: 4px; }

        .price-input-wrapper { background: #0a0f1d; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; }
        .price-val { color: #475569; font-weight: 700; font-size: 15px; }
        .price-denom { font-size: 11px; font-weight: 800; color: #475569; }

        .range-slider-container { margin-top: 12px; position: relative; }
        .slider-track-dots { display: flex; justify-content: space-between; padding: 0 4px; margin-bottom: 6px; }
        .slider-track-dots span { width: 4px; height: 4px; background: #334155; border-radius: 50%; }
        .range-slider { width: 100%; -webkit-appearance: none; background: #1e293b; height: 2px; outline: none; }
        .range-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: #fff; border-radius: 50%; cursor: pointer; }

        .range-slider-themed { width: 100%; -webkit-appearance: none; background: #1e293b; height: 2px; outline: none; }
        .range-slider-themed::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: #34d399; border-radius: 50%; cursor: pointer; box-shadow: 0 0 8px rgba(52, 211, 153, 0.5); }

        .label-with-info { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
        .label-info-icon { color: #475569; }
        .label-sub { margin-left: auto; font-size: 13px; font-weight: 700; color: #fff; }

        .risk-mgmt-section { padding: 16px; background: #0a1121; border-radius: 16px; display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }
        .section-subtitle { font-size: 14px; font-weight: 700; color: #475569; margin: 0 0 4px; }
        .risk-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; }
        .risk-input-box { background: #161b2c; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 6px 12px; color: #fff; display: flex; align-items: center; gap: 8px; }
        .custom-toggle { width: 32px; height: 16px; background: #1e293b; border-radius: 20px; position: relative; cursor: pointer; transition: 0.3s; }
        .custom-toggle.active { background: #34d399; }
        .custom-toggle::after { content: ''; position: absolute; left: 3px; top: 3px; width: 10px; height: 10px; background: #fff; border-radius: 50%; transition: 0.3s; }
        .custom-toggle.active::after { left: 19px; }

        .green { color: #34d399; }
        .red { color: #ef4444; }
      `}} />
    </div>
  );
}

// Minimal Icons to match screenshot
function BitcoinIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#F7931A"/>
      <path d="M15.1 11.2c.4-.3.6-.6.6-1.1 0-.8-.6-1.3-1.6-1.4V7.5h-.9v1.1h-.8V7.5h-.9v1.1h-1.3V9.5h.5c.4 0 .6.2.6.5v4.2c0 .3-.2.5-.6.5h-.5v.9h1.3v1.1h.9v-1.1h.8v1.1h.9v-1.1c1.3-.2 2-.8 2-1.8 0-1-.5-1.6-1.1-2.2zm-2.7-1.6h1.5c.5 0 .9.2.9.7 0 .5-.4.7-.9.7h-1.5V9.6zm1.8 4.7h-1.8v-2.3h1.8c.5 0 1 .3 1 1.1 0 .8-.5 1.2-1 1.2z" fill="white"/>
    </svg>
  );
}

function EthereumIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <path d="M16.5 4v8.9l7.5 3.4-7.5-12.3z" fill="white" fillOpacity=".6"/>
      <path d="M16.5 4L9 16.2l7.5-3.3V4z" fill="white"/>
      <path d="M16.5 22l7.5-4.4-7.5-3.4v7.8z" fill="white" fillOpacity=".6"/>
      <path d="M16.5 22v7.7L24 17.5l-7.5 4.5z" fill="white" fillOpacity=".3"/>
      <path d="M16.5 29.7v-7.7L9 17.5l7.5 12.2z" fill="white" fillOpacity=".6"/>
      <path d="M16.5 14.2l-7.5 2L16.5 19.5v-5.3z" fill="white"/>
    </svg>
  );
}

export default BybitDashboard;
