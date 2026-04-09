import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Shield, 
  Zap, 
  BarChart2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Bell,
  MessageSquare,
  User,
  Info,
  ChevronDown,
  Settings as SettingsIcon,
  HelpCircle,
  LayoutDashboard,
  BarChart3,
  SwitchCamera,
  Briefcase,
  PieChart,
  ListOrdered
} from 'lucide-react';

function BybitDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSide, setActiveSide] = useState('BUY');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
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

  return (
    <div className="institutional-container">
      {/* Top Header Row - Market Tickers */}
      <header className="dashboard-top-row">
        <div className="ticker-card">
           <div className="coin-icon btc"><BitcoinIcon size={24} /></div>
           <div className="coin-info">
              <span className="coin-name">BTC/USDT</span>
              <span className="coin-sub">BTC/USDT</span>
           </div>
           <div className="coin-chart-mini">
              <svg width="60" height="20" viewBox="0 0 60 20">
                <path d="M0 15 Q 15 5, 30 12 T 60 8" fill="none" stroke="#34d399" strokeWidth="2" />
              </svg>
           </div>
           <div className="coin-price">
              <span className="price">333.50</span>
              <span className="change green">+3.83%</span>
           </div>
        </div>

        <div className="ticker-card">
           <div className="coin-icon eth"><EthereumIcon size={24} /></div>
           <div className="coin-info">
              <span className="coin-name">ETH/USDT</span>
              <span className="coin-sub">ETH/USDT</span>
           </div>
           <div className="coin-chart-mini">
              <svg width="60" height="20" viewBox="0 0 60 20">
                <path d="M0 10 Q 15 15, 30 5 T 60 12" fill="none" stroke="#34d399" strokeWidth="2" />
              </svg>
           </div>
           <div className="coin-price">
              <span className="price">38.55</span>
              <span className="change green">+2.56%</span>
           </div>
        </div>

        <div className="header-actions">
           <button className="action-btn"><MessageSquare size={18} /></button>
           <button className="action-btn"><Bell size={18} /><span className="notif-dot"></span></button>
           <button className="action-btn profile"><User size={18} /></button>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="main-grid">
        {/* Left Column: Chart and Bottom Rows */}
        <div className="left-column">
          {/* Main Chart Section */}
          <div className="chart-section card-glass">
            <div className="chart-inner-header">
                <div className="chart-tools-left">
                   <button className="tool-btn active">15m</button>
                   <button className="tool-btn"><BarChart2 size={16} /></button>
                   <button className="tool-btn">fx</button>
                   <button className="tool-btn">amt</button>
                </div>
                <div className="chart-tools-right">
                   <button className="tool-btn"><SettingsIcon size={16} /></button>
                   <button className="tool-btn"><ChevronDown size={16} /></button>
                </div>
            </div>
            
            <div className="chart-placeholder-view">
               <div className="chart-meta">
                  <span className="symbol-title">Dtcoraatès - 1D - I •</span>
                  <span className="indicator-text">Moving AA MSB 20:23.28</span>
               </div>
               {/* Simplified SVG Chart Mockup */}
               <div className="chart-svg-container">
                  <svg width="100%" height="100%" preserveAspectRatio="none">
                    <path d="M0 250 L100 220 L200 240 L300 180 L400 210 L500 150 L600 170 L700 100" fill="none" stroke="#fbbf24" strokeWidth="2" />
                    {/* Candle sticks would go here */}
                  </svg>
                  <div className="candle-mock">
                    <div className="candle green" style={{left: '10%', height: '40px', bottom: '30%'}}></div>
                    <div className="candle green" style={{left: '15%', height: '60px', bottom: '35%'}}></div>
                    <div className="candle red" style={{left: '20%', height: '30px', bottom: '32%'}}></div>
                    <div className="candle green" style={{left: '25%', height: '80px', bottom: '38%'}}></div>
                    <div className="candle green" style={{left: '30%', height: '45px', bottom: '42%'}}></div>
                    <div className="candle red" style={{left: '35%', height: '20px', bottom: '40%'}}></div>
                    <div className="candle green" style={{left: '40%', height: '90px', bottom: '45%'}}></div>
                    <div className="volume-bars"></div>
                  </div>
               </div>
            </div>
          </div>

          {/* Bottom Row: Account Equity and Active Positions */}
          <div className="bottom-row">
             {/* Account Equity Card */}
             <div className="equity-card card-glass">
                <div className="card-header-mini">
                   <span className="card-label">Account Equity</span>
                   <button className="more-btn">...</button>
                </div>
                <div className="equity-content">
                    <div className="equity-chart-placeholder">
                       <svg width="100%" height="80" viewBox="0 0 300 80">
                         <path d="M0 70 C 50 60, 100 75, 150 40 S 250 10, 300 5" fill="none" stroke="#34d399" strokeWidth="2" />
                       </svg>
                    </div>
                    <div className="equity-stats">
                       <span className="stats-label">Total Equity</span>
                       <h2 className="equity-value">$10,976.52</h2>
                       <span className="equity-change green">▲ 110.38%</span>
                    </div>
                    <div className="equity-progress-bar">
                       <div className="progress-fill" style={{width: '35%'}}></div>
                    </div>
                </div>
             </div>

             {/* Active Positions Card */}
             <div className="positions-card card-glass">
                <div className="card-header-mini">
                   <span className="card-label">Active Positions</span>
                   <button className="more-btn">...</button>
                </div>
                <div className="positions-table-wrap">
                   <table className="mini-table">
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
                        <tr>
                          <td>
                            <div className="asset-info"><BitcoinIcon size={16} /> <span className="sym">BTC<br/><small>USDT</small></span></div>
                          </td>
                          <td>2.0k</td>
                          <td>$1.300</td>
                          <td>$1.920</td>
                          <td className="green">+$13.00</td>
                        </tr>
                        <tr>
                          <td>
                             <div className="asset-info"><EthereumIcon size={16} /> <span className="sym">ETH<br/><small>USDT</small></span></div>
                          </td>
                          <td>1.2k</td>
                          <td>$1.970</td>
                          <td>$1.850</td>
                          <td className="green">+$1.50</td>
                        </tr>
                        <tr>
                          <td>
                             <div className="asset-info"><EthereumIcon size={16} /> <span className="sym">ETH<br/><small>USDT</small></span></div>
                          </td>
                          <td>1.3k</td>
                          <td>$1.550</td>
                          <td>$1.850</td>
                          <td className="red">-$1.00</td>
                        </tr>
                      </tbody>
                   </table>
                   <div className="table-nav">
                      <ChevronDown size={14} style={{transform: 'rotate(90deg)'}} />
                      <span>1</span> <span>2</span>
                      <ChevronDown size={14} style={{transform: 'rotate(-90deg)'}} />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Institutional Order Panel */}
        <div className="right-column">
           <div className="order-panel card-glass">
              <div className="card-header-mini">
                 <span className="card-label-large">Institutional Order</span>
                 <button className="more-btn">...</button>
              </div>

              <div className="order-tabs">
                 <button className={`side-tab buy ${activeSide === 'BUY' ? 'active' : ''}`} onClick={() => setActiveSide('BUY')}>BUY</button>
                 <button className={`side-tab sell ${activeSide === 'SELL' ? 'active' : ''}`} onClick={() => setActiveSide('SELL')}>SELL</button>
              </div>

              <div className="order-fields">
                 <div className="field-row">
                    <label>Order type</label>
                    <div className="type-toggle">
                       <button className="type-btn active">Limit</button>
                       <button className="type-btn">Market</button>
                       <button className="type-btn">Stop</button>
                    </div>
                 </div>

                 <div className="field-row">
                    <label>Quantity</label>
                    <div className="input-with-arrows">
                       <input type="text" value="10" readOnly />
                       <div className="arrows">
                          <ChevronDown size={12} className="up" />
                          <ChevronDown size={12} className="down" />
                       </div>
                    </div>
                 </div>

                 <div className="field-row">
                    <label>Price</label>
                    <div className="price-input-card">
                       <span className="val">$100.00</span>
                       <span className="curr">USDT</span>
                    </div>
                    <div className="slider-container">
                       <div className="slider-dots">
                          {[0, 25, 50, 75, 100].map(d => <span key={d} className="dot"></span>)}
                       </div>
                       <input type="range" className="form-slider" />
                    </div>
                 </div>

                 <div className="field-row">
                    <div className="label-with-icon">
                       <label>Leverage</label>
                       <Info size={14} className="info-icon" />
                       <span className="val-right">4 - 100</span>
                    </div>
                    <div className="slider-single">
                       <input type="range" className="form-slider-green" />
                    </div>
                 </div>

                 <div className="field-row">
                    <div className="label-with-icon">
                       <label>Stop Loss</label>
                       <Info size={14} className="info-icon" />
                       <span className="val-right">1.5</span>
                    </div>
                    <div className="slider-single">
                       <input type="range" className="form-slider-green" />
                    </div>
                 </div>

                 <div className="risk-management">
                    <h4 className="section-title">Risk Management</h4>
                    
                    <div className="risk-item">
                       <span>Take-Profit</span>
                       <div className="risk-val-box">15 <ChevronDown size={14} /></div>
                    </div>
                    <div className="risk-item">
                       <span>Take-Profit</span>
                       <div className="form-toggle-switch active"></div>
                    </div>
                    <div className="risk-item">
                       <span>Take-Profit</span>
                       <div className="form-toggle-switch active"></div>
                    </div>
                    <div className="risk-item">
                       <span>Stop Loss</span>
                       <div className="risk-val-box">5 <ChevronDown size={14} /></div>
                    </div>
                    <div className="risk-item">
                       <span>Take-Profit</span>
                       <div className="form-toggle-switch"></div>
                    </div>
                    <div className="risk-item">
                       <span>Stop Loss</span>
                       <div className="form-toggle-switch"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .institutional-container {
          background: #0d1117;
          min-height: 100vh;
          color: #94a3b8;
          padding: 24px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .dashboard-top-row {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
          align-items: center;
        }

        .ticker-card {
          background: #161b22;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 280px;
        }

        .coin-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .coin-icon.btc { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
        .coin-icon.eth { background: rgba(99, 102, 241, 0.1); color: #6366f1; }

        .coin-info { display: flex; flex-direction: column; }
        .coin-name { color: #fff; font-weight: 700; font-size: 14px; }
        .coin-sub { font-size: 11px; opacity: 0.5; }

        .coin-price { margin-left: auto; text-align: right; }
        .coin-price .price { display: block; color: #fff; font-weight: 700; font-size: 14px; }

        .header-actions { margin-left: auto; display: flex; gap: 12px; }
        .action-btn { background: #161b22; border: 1px solid rgba(255,255,255,0.05); width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #94a3b8; cursor: pointer; position: relative; }
        .notif-dot { position: absolute; top: 12px; right: 12px; width: 6px; height: 6px; background: #ef4444; border-radius: 50%; }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
        }

        .left-column { display: flex; flex-direction: column; gap: 24px; }

        .card-glass {
          background: #161b22;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          overflow: hidden;
        }

        .chart-section { height: 500px; display: flex; flex-direction: column; }
        .chart-inner-header { background: #0d1117; padding: 12px 16px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .tool-btn { background: transparent; border: none; color: #475569; padding: 4px 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .tool-btn.active { color: #3b82f6; }
        
        .chart-placeholder-view { flex: 1; padding: 20px; position: relative; background: #0d1117; }
        .symbol-title { color: #fff; font-weight: 700; font-size: 14px; margin-right: 12px; }
        .indicator-text { color: #fbbf24; font-size: 12px; font-weight: 500; }

        .chart-svg-container { position: absolute; inset: 60px 20px 20px 20px; }
        .candle-mock { position: absolute; width: 100%; height: 100%; top: 0; left: 0; }
        .candle { position: absolute; width: 12px; border-radius: 2px; }
        .candle.green { background: #34d399; }
        .candle.red { background: #ef4444; }

        .bottom-row { display: grid; grid-template-columns: 38% 1fr; gap: 24px; }

        .card-header-mini { padding: 20px 20px 0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .card-label { font-size: 15px; font-weight: 700; color: #fff; }
        .card-label-large { font-size: 18px; font-weight: 700; color: #fff; }
        .more-btn { background: transparent; border: none; color: #475569; font-size: 20px; cursor: pointer; line-height: 0; }

        .equity-content { padding: 0 24px 24px; }
        .equity-value { color: #fff; font-size: 32px; font-weight: 800; margin: 4px 0; }
        .equity-change { font-size: 14px; font-weight: 700; }
        .equity-progress-bar { height: 4px; background: #21262d; border-radius: 10px; margin-top: 20px; overflow: hidden; }
        .progress-fill { height: 100%; background: #34d399; }

        .positions-table-wrap { padding: 0 20px 20px; }
        .mini-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .mini-table th { text-align: left; color: #475569; font-weight: 500; padding-bottom: 12px; }
        .mini-table td { padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.02); }
        .asset-info { display: flex; align-items: center; gap: 10px; }
        .asset-info .sym { color: #fff; font-weight: 700; line-height: 1.1; }
        .asset-info small { opacity: 0.5; font-size: 10px; }

        .table-nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; font-size: 12px; font-weight: 700; }

        .order-panel { padding: 24px 0; }
        .order-tabs { display: grid; grid-template-columns: 1fr 1fr; padding: 0 24px; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .side-tab { padding: 12px; border: none; background: transparent; font-weight: 800; font-size: 14px; cursor: pointer; color: #475569; }
        .side-tab.buy.active { color: #34d399; border-bottom: 2px solid #34d399; }
        .side-tab.sell.active { color: #ef4444; border-bottom: 2px solid #ef4444; }

        .order-fields { padding: 0 24px; display: flex; flex-direction: column; gap: 20px; }
        .field-row { display: flex; flex-direction: column; gap: 8px; }
        .field-row label { font-size: 12px; font-weight: 600; color: #475569; }
        .label-with-icon { display: flex; align-items: center; gap: 6px; position: relative; }
        .val-right { margin-left: auto; color: #fff; font-weight: 700; }

        .type-toggle { display: grid; grid-template-columns: repeat(3, 1fr); background: #0d1117; border-radius: 8px; padding: 3px; }
        .type-btn { padding: 8px; border: none; border-radius: 6px; background: transparent; color: #475569; font-size: 12px; font-weight: 700; cursor: pointer; }
        .type-btn.active { background: #21262d; color: #fff; }

        .input-with-arrows { background: #0d1117; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; }
        .input-with-arrows input { background: transparent; border: none; color: #fff; width: 50%; font-weight: 700; }
        .arrows { display: flex; flex-direction: column; gap: 4px; color: #475569; }

        .price-input-card { background: #0d1117; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px 14px; display: flex; justify-content: space-between; }
        .price-input-card .val { color: #475569; font-weight: 700; }
        .price-input-card .curr { font-size: 11px; font-weight: 800; }

        .slider-container { margin-top: 10px; position: relative; }
        .slider-dots { display: flex; justify-content: space-between; padding: 0 4px; margin-bottom: 4px; }
        .slider-dots .dot { width: 4px; height: 4px; background: #475569; border-radius: 50%; }

        .form-slider { width: 100%; -webkit-appearance: none; height: 2px; background: #21262d; outline: none; }
        .form-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; background: #fff; border-radius: 50%; cursor: pointer; }
        .form-slider-green::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; background: #34d399; border-radius: 50%; cursor: pointer; }

        .risk-management { background: #0d1117; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }
        .section-title { font-size: 13px; font-weight: 700; color: #475569; margin: 0 0 8px; }
        .risk-item { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #94a3b8; font-weight: 600; }
        .risk-val-box { background: #161b22; border: 1px solid rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; display: flex; align-items: center; gap: 6px; color: #fff; }

        .form-toggle-switch { width: 24px; height: 12px; background: #21262d; border-radius: 10px; position: relative; cursor: pointer; }
        .form-toggle-switch.active { background: #34d399; }
        .form-toggle-switch::after { content: ''; position: absolute; left: 2px; top: 2px; width: 8px; height: 8px; background: #fff; border-radius: 50%; transition: 0.2s; }
        .form-toggle-switch.active::after { left: 14px; }

        .green { color: #34d399; }
        .red { color: #ef4444; }
      `}} />
    </div>
  );
}

// Sub-components for icons
function BitcoinIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#F7931A"/>
      <path d="M15.111 11.2065C15.4851 10.9535 15.7196 10.596 15.7196 10.125C15.7196 9.375 15.1103 8.85226 14.1255 8.71871V7.5H13.2V8.625H12.3563V7.5H11.4308V8.625H10.125V9.46274H10.5938C10.968 9.46274 11.1563 9.60523 11.1563 9.8947V14.125C11.1563 14.4145 10.968 14.557 10.5938 14.557H10.125V15.4323H11.4308V16.5H12.3563V15.4323H13.2V16.5H14.1255V15.3477C15.3908 15.1965 16.125 14.6183 16.125 13.5658C16.125 12.6053 15.6563 11.9647 15.111 11.2065ZM12.3563 9.6231H13.8441C14.3126 9.6231 14.6869 9.81308 14.6869 10.2885C14.6869 10.7639 14.3126 10.9539 13.8441 10.9539H12.3563V9.6231ZM14.1255 14.2882H12.3563V12.004H14.1255C14.5939 12.004 15.0626 12.2882 15.0626 13.0941C15.0626 13.9 14.5939 14.2882 14.1255 14.2882Z" fill="white"/>
    </svg>
  );
}

function EthereumIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <path d="M16.498 4v8.87l7.497 3.35L16.498 4z" fill="#fff" fillOpacity=".602"/>
      <path d="M16.498 4L9 16.22l7.498-3.35V4z" fill="#fff"/>
      <path d="M16.498 21.968l7.497-4.422-7.497-3.35v7.772z" fill="#fff" fillOpacity=".602"/>
      <path d="M16.498 21.968v7.772L24 17.546l-7.502 4.422z" fill="#fff" fillOpacity=".298"/>
      <path d="M16.498 29.74v-7.772L9 17.546l7.498 12.194z" fill="#fff" fillOpacity=".602"/>
      <path d="M16.498 14.196l-7.498 2.024 7.498 3.35v-5.374z" fill="#fff"/>
    </svg>
  );
}

export default BybitDashboard;
