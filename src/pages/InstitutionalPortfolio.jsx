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

    </div>
  );
}
