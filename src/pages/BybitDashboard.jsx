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
  Wallet
} from 'lucide-react';

function BybitDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSide, setActiveSide] = useState('Buy');

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
    <div className="institutional-dashboard">
      <div className="dashboard-grid">
        
        {/* Manual Trading Main View (Left/Center) */}
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
                <span>+2.4% Today</span>
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
                <span>Free Margin: 92%</span>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="card-top">
                <span className="label">Unrealized PnL</span>
                <div className="icon"><Activity size={16} /></div>
              </div>
              <div className="card-value green">
                +${data ? data.positions.reduce((acc, p) => acc + parseFloat(p.unrealisedPnl), 0).toFixed(2) : '0.00'}
              </div>
              <div className="card-footer grey">
                <span>{data?.positions.length || 0} Open Trades</span>
              </div>
            </div>
          </div>

          {/* Central Price Chart Area */}
          <div className="chart-container glass">
            <div className="chart-header">
              <div className="active-symbol">
                <Zap size={18} fill="#fbbf24" color="#fbbf24" />
                <span>BTCUSDT Perpetual</span>
                <span className="price-label highlight">$64,842.50</span>
              </div>
              <div className="chart-controls">
                <button className="active">15M</button>
                <button>1H</button>
                <button>4H</button>
                <button>1D</button>
              </div>
            </div>
            
            <div className="tradingview-wrapper">
              <div className="tv-widget-mock">
                <div className="tv-inner">
                  <BarChart2 size={48} className="placeholder-icon" />
                  <p>Initializing High-Frequency Data Stream...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Positions Table */}
          <div className="positions-section glass">
            <div className="section-header">
              <h3>Portfolio & Performance</h3>
              <button className="btn-refresh" onClick={fetchDashboardData}>
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                Sync
              </button>
            </div>
            
            <div className="table-responsive">
              <table className="institutional-table">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Qty</th>
                    <th>Entry</th>
                    <th>Mark</th>
                    <th>PnL</th>
                    <th>TP/SL</th>
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
                        <td>{pos.size}</td>
                        <td>${parseFloat(pos.avgPrice).toFixed(2)}</td>
                        <td>${parseFloat(pos.markPrice).toFixed(2)}</td>
                        <td className={parseFloat(pos.unrealisedPnl) >= 0 ? 'green' : 'red'}>
                          ${parseFloat(pos.unrealisedPnl).toFixed(2)}
                        </td>
                        <td><button className="btn-action-small">Edit</button></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-table">No active trades in this environment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Manual Trading Sidebar (Right) */}
        <div className="manual-sidebar">
          
          {/* Order Entry Form */}
          <div className="order-panel glass">
            <div className="order-tabs">
              <button 
                className={`tab ${activeSide === 'Buy' ? 'active-buy' : ''}`}
                onClick={() => setActiveSide('Buy')}
              >
                Buy
              </button>
              <button 
                className={`tab ${activeSide === 'Sell' ? 'active-sell' : ''}`}
                onClick={() => setActiveSide('Sell')}
              >
                Sell
              </button>
            </div>

            <div className="order-form">
              <div className="form-group">
                <label>Type</label>
                <select className="form-input">
                  <option>Limit</option>
                  <option>Market</option>
                  <option>TP/SL</option>
                </select>
              </div>

              <div className="form-group">
                <label>Order Price</label>
                <div className="input-wrap">
                  <input type="text" value="64842.50" readOnly />
                  <span className="unit">USDT</span>
                </div>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <div className="input-wrap">
                  <input type="text" placeholder="0.00" />
                  <span className="unit">BTC</span>
                </div>
              </div>

              <div className="leverage-slider">
                <div className="marks" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#475569', marginBottom: '8px' }}>
                  <span>1x</span>
                  <span>10x</span>
                  <span>25x</span>
                  <span>100x</span>
                </div>
                <div className="slider-track" style={{ height: '4px', background: '#334155', borderRadius: '2px', position: 'relative' }}>
                  <div className="slider-fill" style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '10%', background: '#fbbf24', borderRadius: '2px' }}></div>
                  <div className="slider-thumb" style={{ position: 'absolute', left: '10%', top: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}></div>
                </div>
              </div>

              <button className={`btn-place-order ${activeSide.toLowerCase()}`}>
                Place {activeSide} Order
              </button>
            </div>
          </div>

          {/* Quick Order Book Card */}
          <div className="order-book-mini glass">
             <div className="panel-label">Order Book</div>
             <div className="book-list sell">
                <div className="book-row"><span className="p red">64845.0</span><span className="v">1.240</span></div>
                <div className="book-row"><span className="p red">64844.5</span><span className="v">0.054</span></div>
                <div className="book-row"><span className="p red">64843.0</span><span className="v">2.110</span></div>
             </div>
             <div className="book-mid">
                <span className="mid-price">64,842.50</span>
             </div>
             <div className="book-list buy">
                <div className="book-row"><span className="p green">64842.0</span><span className="v">0.980</span></div>
                <div className="book-row"><span className="p green">64841.5</span><span className="v">4.200</span></div>
                <div className="book-row"><span className="p green">64840.0</span><span className="v">0.015</span></div>
             </div>
          </div>

          {/* Performance Summary */}
          <div className="recent-executed glass">
             <div className="panel-label">Recent Executions</div>
             <div className="exec-list">
                <div className="exec-row">
                   <ArrowUpRight size={14} className="green" />
                   <div className="info">
                      <span>BTCUSD-P</span>
                      <small>Filled @ $64,210</small>
                   </div>
                   <span className="time">12:05</span>
                </div>
                <div className="exec-row">
                   <ArrowDownRight size={14} className="red" />
                   <div className="info">
                      <span>ETHUSD-P</span>
                      <small>Filled @ $3,450</small>
                   </div>
                   <span className="time">11:42</span>
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
          border-radius: 20px;
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

        .stat-card .label { font-size: 13px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-card .card-top { display: flex; justify-content: space-between; }
        .stat-card .icon { color: #fbbf24; opacity: 0.4; }
        .stat-card .card-value { font-size: 28px; font-weight: 800; display: flex; align-items: baseline; gap: 6px; }
        .card-value .currency { font-size: 14px; color: #475569; }
        .card-footer { font-size: 12px; display: flex; align-items: center; gap: 4px; font-weight: 600; }
        .card-footer.green { color: #34d399; }
        .card-footer.grey { color: #64748b; }

        .chart-container { padding: 24px; height: 480px; display: flex; flex-direction: column; }
        .chart-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .active-symbol { display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: 700; }
        .price-label.highlight { color: #34d399; background: rgba(16, 185, 129, 0.1); padding: 4px 12px; border-radius: 8px; }

        .chart-controls { display: flex; background: rgba(255, 255, 255, 0.03); padding: 4px; border-radius: 10px; }
        .chart-controls button { background: none; border: none; color: #64748b; padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; }
        .chart-controls button.active { background: rgba(255, 255, 255, 0.06); color: #fff; }

        .tradingview-wrapper { flex: 1; background: rgba(0, 0, 0, 0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #475569; }

        .positions-section { padding: 24px; }
        .section-header { display: flex; justify-content: space-between; margin-bottom: 24px; }

        .institutional-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .institutional-table th { text-align: left; color: #64748b; padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .institutional-table td { padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.02); }

        .manual-sidebar { display: flex; flex-direction: column; gap: 24px; }
        .order-panel { padding: 24px; }
        .order-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .tab { padding: 10px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); background: rgba(255, 255, 255, 0.02); color: #64748b; cursor: pointer; font-weight: 700; }
        .tab.active-buy { background: #10b981; color: #fff; border-color: #10b981; }
        .tab.active-sell { background: #ef4444; color: #fff; border-color: #ef4444; }

        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: 600; }
        .form-input { width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; color: #fff; }
        
        .input-wrap { position: relative; }
        .input-wrap input { width: 100%; padding: 10px 48px 10px 12px; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; color: #fff; }
        .unit { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 11px; color: #475569; font-weight: 800; }

        .btn-place-order { width: 100%; padding: 14px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer; margin-top: 12px; font-size: 14px; transition: opacity 0.2s; }
        .btn-place-order.buy { background: #10b981; color: #fff; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        .btn-place-order.sell { background: #ef4444; color: #fff; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }

        .panel-label { font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 16px; }
        .order-book-mini { padding: 20px; }
        .book-list { display: flex; flex-direction: column; gap: 4px; }
        .book-row { display: flex; justify-content: space-between; font-family: monospace; font-size: 12px; }
        .book-mid { padding: 8px 0; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.03); border-bottom: 1px solid rgba(255, 255, 255, 0.03); margin: 8px 0; }
        .mid-price { font-size: 14px; font-weight: 800; color: #fff; }

        .recent-executed { padding: 20px; }
        .exec-list { display: flex; flex-direction: column; gap: 12px; }
        .exec-row { display: flex; align-items: center; gap: 12px; position: relative; }
        .exec-row .info { flex: 1; display: flex; flex-direction: column; }
        .exec-row .info span { font-size: 13px; font-weight: 700; }
        .exec-row .info small { font-size: 11px; color: #475569; }
        .exec-row .time { font-size: 11px; color: #475569; }

        .green { color: #34d399; }
        .red { color: #ef4444; }
        .side-tag { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; }
        .side-tag.buy { background: rgba(16, 185, 129, 0.1); color: #34d399; }
        .side-tag.sell { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
      `}} />
    </div>
  );
}

export default BybitDashboard;
