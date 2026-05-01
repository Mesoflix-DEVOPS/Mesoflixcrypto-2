import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart, 
  TrendingUp, 
  Clock, 
  Shield,
  ArrowRight
} from 'lucide-react';
import { getApiUrl, fetchWithLogging } from '../config/api';

export default function InstitutionalPortfolio() {
  const { tradingMode, user, balance, refresh } = useOutletContext();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user?.id) return;
      try {
        const res = await fetchWithLogging(getApiUrl(`/api/bybit/dashboard/${user.id}?environment=${tradingMode}`));
        if (res.ok) {
          const data = await res.json();
          if (data.ok) {
            setPositions(data.data.positions || []);
          }
        }
      } catch (e) {
        console.error('Failed to fetch portfolio', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
    const t = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(t);
  }, [user, tradingMode]);

  const equity = parseFloat(balance?.totalEquity || 0);
  const pnl = positions.reduce((acc, pos) => acc + parseFloat(pos.unrealisedPnl || 0), 0);
  const pnlPct = equity > 0 ? (pnl / (equity - pnl)) * 100 : 0;

  return (
    <div className="pg-portfolio">
      {/* Header Summary */}
      <div className="port-header">
        <div className="port-summary-main">
          <div className="summary-item">
            <span className="summary-label">Total Portfolio Value</span>
            <div className="summary-value">
              ${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="currency">USDT</span>
            </div>
            <div className={`summary-delta ${pnl >= 0 ? 'pos' : 'neg'}`}>
              {pnl >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })} ({pnlPct.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="port-summary-grid">
          <div className="grid-item">
            <span className="item-label">Available Balance</span>
            <span className="item-value">${parseFloat(balance?.totalAvailableBalance || 0).toLocaleString()}</span>
          </div>
          <div className="grid-item">
            <span className="item-label">Used Margin</span>
            <span className="item-value">${parseFloat(balance?.totalUsedMargin || 0).toLocaleString()}</span>
          </div>
          <div className="grid-item">
            <span className="item-label">Maintenance Margin</span>
            <span className="item-value">${parseFloat(balance?.totalMaintenanceMargin || 0).toLocaleString()}</span>
          </div>
          <div className="grid-item">
            <span className="item-label">Active Positions</span>
            <span className="item-value">{positions.length}</span>
          </div>
        </div>
      </div>

      <div className="port-content">
        {/* Active Positions Table */}
        <div className="port-section pos-section">
          <div className="section-header">
            <div className="header-title">
              <TrendingUp size={16} />
              <span>Active Institutional Positions</span>
            </div>
            <button className="header-action" onClick={refresh}>Refresh Data</button>
          </div>
          
          <div className="table-container">
            <table className="port-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Size</th>
                  <th>Entry Price</th>
                  <th>Mark Price</th>
                  <th>Liq. Price</th>
                  <th>Unrealized PnL</th>
                  <th>Margin</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="loading-row">Synchronizing with Bybit...</td></tr>
                ) : positions.length === 0 ? (
                  <tr><td colSpan="8" className="empty-row">No active positions in {tradingMode} mode.</td></tr>
                ) : positions.map((pos, i) => {
                  const isPos = parseFloat(pos.unrealisedPnl || 0) >= 0;
                  return (
                    <tr key={i}>
                      <td>
                        <div className="symbol-cell">
                          <span className="sym-main">{pos.symbol}</span>
                          <span className={`sym-side ${pos.side.toLowerCase()}`}>{pos.side} {pos.leverage}x</span>
                        </div>
                      </td>
                      <td>{parseFloat(pos.size).toFixed(3)}</td>
                      <td>${parseFloat(pos.entryPrice).toLocaleString()}</td>
                      <td>${parseFloat(pos.markPrice).toLocaleString()}</td>
                      <td className="liq-price">${parseFloat(pos.liqPrice || 0).toLocaleString()}</td>
                      <td className={`pnl-cell ${isPos ? 'pos' : 'neg'}`}>
                        <div className="pnl-val">${parseFloat(pos.unrealisedPnl).toFixed(2)}</div>
                        <div className="pnl-pct">({(parseFloat(pos.unrealisedPnl) / parseFloat(pos.positionValue) * 100).toFixed(2)}%)</div>
                      </td>
                      <td>${parseFloat(pos.positionMargin).toLocaleString()}</td>
                      <td>
                        <button className="table-btn">Manage</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocation & Risk */}
        <div className="port-side-grid">
          <div className="port-section mini-card">
            <div className="section-header">
              <div className="header-title">
                <PieChart size={16} />
                <span>Asset Allocation</span>
              </div>
            </div>
            <div className="alloc-list">
              {positions.slice(0, 4).map((p, i) => (
                <div className="alloc-item" key={i}>
                  <div className="alloc-info">
                    <span className="alloc-name">{p.symbol}</span>
                    <span className="alloc-pct">{((parseFloat(p.positionValue) / (equity || 1)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="alloc-bar-bg">
                    <div className="alloc-bar-fill" style={{ width: `${(parseFloat(p.positionValue) / (equity || 1)) * 100}%` }}></div>
                  </div>
                </div>
              ))}
              {positions.length === 0 && <div className="empty-state">No active allocations</div>}
            </div>
          </div>

          <div className="port-section mini-card">
            <div className="section-header">
              <div className="header-title">
                <Shield size={16} />
                <span>Risk Exposure</span>
              </div>
            </div>
            <div className="risk-metrics">
              <div className="risk-item">
                <span className="risk-label">Margin Utilization</span>
                <div className="risk-val-row">
                  <span className="risk-value">{((parseFloat(balance?.totalUsedMargin || 0) / (equity || 1)) * 100).toFixed(1)}%</span>
                  <span className="risk-status">Secure</span>
                </div>
              </div>
              <div className="risk-item">
                <span className="risk-label">Net Delta Exposure</span>
                <span className="risk-value">${(positions.reduce((acc, p) => acc + parseFloat(p.positionValue), 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pg-portfolio {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          background: #07111f;
          min-height: 100%;
        }

        .port-header {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
        }

        .port-summary-main {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          padding: 32px;
          border-radius: 16px;
          color: #000;
          display: flex;
          align-items: center;
        }

        .summary-label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8; }
        .summary-value { font-size: 36px; font-weight: 900; margin: 8px 0; letter-spacing: -0.02em; }
        .summary-value .currency { font-size: 14px; margin-left: 8px; opacity: 0.7; }
        .summary-delta { display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 800; }
        .summary-delta.pos { color: #000; }
        .summary-delta.neg { color: #7f1d1d; }

        .port-summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .grid-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .item-label { font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.1em; }
        .item-value { font-size: 18px; font-weight: 900; color: #fff; font-family: 'JetBrains Mono', monospace; }

        .port-content {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
        }

        .port-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          overflow: hidden;
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

        .header-title { display: flex; align-items: center; gap: 10px; color: #fff; font-size: 14px; font-weight: 800; }
        .header-action { background: none; border: none; color: #10b981; font-size: 11px; font-weight: 800; cursor: pointer; }

        .table-container { overflow-x: auto; }
        .port-table { width: 100%; border-collapse: collapse; }
        .port-table th { padding: 12px 20px; text-align: left; font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .port-table td { padding: 16px 20px; font-size: 13px; border-bottom: 1px solid rgba(255, 255, 255, 0.02); }

        .symbol-cell { display: flex; flex-direction: column; gap: 4px; }
        .sym-main { color: #fff; font-weight: 800; }
        .sym-side { font-size: 10px; font-weight: 900; text-transform: uppercase; }
        .sym-side.buy { color: #10b981; }
        .sym-side.sell { color: #ef4444; }

        .liq-price { color: #f59e0b; font-family: monospace; }
        .pnl-cell.pos { color: #10b981; }
        .pnl-cell.neg { color: #ef4444; }
        .pnl-val { font-weight: 900; font-family: monospace; font-size: 14px; }
        .pnl-pct { font-size: 10px; font-weight: 800; }

        .table-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer; }
        .table-btn:hover { background: rgba(255, 255, 255, 0.1); }

        .port-side-grid { display: flex; flex-direction: column; gap: 24px; }
        .mini-card { padding: 0; }
        
        .alloc-list { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .alloc-item { display: flex; flex-direction: column; gap: 8px; }
        .alloc-info { display: flex; justify-content: space-between; font-size: 12px; font-weight: 800; }
        .alloc-name { color: #fff; }
        .alloc-pct { color: #10b981; }
        .alloc-bar-bg { height: 4px; background: rgba(255, 255, 255, 0.05); border-radius: 2px; }
        .alloc-bar-fill { height: 100%; background: #10b981; border-radius: 2px; }

        .risk-metrics { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
        .risk-item { display: flex; flex-direction: column; gap: 8px; }
        .risk-label { font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; }
        .risk-val-row { display: flex; justify-content: space-between; align-items: center; }
        .risk-value { font-size: 16px; font-weight: 900; color: #fff; font-family: monospace; }
        .risk-status { font-size: 9px; font-weight: 900; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px; }

        .loading-row, .empty-row { text-align: center; padding: 48px !important; color: #475569; font-size: 13px; font-weight: 700; }

        @media (max-width: 1200px) {
          .port-header { grid-template-columns: 1fr; }
          .port-content { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
