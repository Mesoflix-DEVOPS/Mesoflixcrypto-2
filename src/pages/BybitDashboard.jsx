import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, TrendingDown, BarChart2, Activity, Shield, Zap, Clock, ArrowUpRight } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { getApiUrl, fetchWithLogging } from '../config/api';
import CustomTradingChart from '../components/CustomTradingChart';
import MarketTerminal from '../components/MarketTerminal';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT'];

export default function BybitDashboard() {
  const { tradingMode, user, balance, refresh } = useOutletContext();
  const { socket, subscribeToTicker, unsubscribeFromTicker, initPrivateStream } = useSocket();

  const [activeSymbol, setActiveSymbol] = useState('BTCUSDT');
  const [tickers, setTickers] = useState({});
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeSide, setActiveSide] = useState('BUY');
  const [orderType, setOrderType] = useState('Market');
  const [qty, setQty] = useState('0.1');
  const [leverage, setLeverage] = useState('10');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    if (!socket) return;
    SYMBOLS.forEach(s => subscribeToTicker(s));
    if (user?.id) initPrivateStream(user.id, tradingMode);
    const onTicker = (data) => {
      setTickers(prev => ({ ...prev, [data.symbol]: data }));
    };
    socket.on('ticker', onTicker);
    return () => {
      SYMBOLS.forEach(s => unsubscribeFromTicker(s));
      socket.off('ticker', onTicker);
    };
  }, [socket, user, tradingMode]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.id) return;
      try {
        const res = await fetchWithLogging(getApiUrl(`/api/bybit/dashboard/${user.id}?environment=${tradingMode}`));
        if (res.ok) {
          const data = await res.json();
          if (data.ok) {
            setPositions(data.data.positions || []);
            setHistory(data.data.history || []);
            if (refresh) refresh();
          }
        }
      } catch (e) {}
    };
    fetchDashboard();
    const t = setInterval(fetchDashboard, 60000);
    return () => clearInterval(t);
  }, [user, tradingMode]);

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null') return setOrderStatus({ ok: false, msg: 'Auth token missing' });
    setOrderLoading(true); setOrderStatus(null);
    try {
      const res = await fetchWithLogging(getApiUrl('/api/bybit/order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ symbol: activeSymbol, side: activeSide, qty, orderType, leverage, environment: tradingMode }),
      });
      const data = await res.json();
      if (res.ok) setOrderStatus({ ok: true, msg: 'Order executed ✓' });
      else {
        const msg = typeof data.error === 'object' ? (data.error.message || JSON.stringify(data.error)) : (data.error || 'Execution failed');
        setOrderStatus({ ok: false, msg });
      }
    } catch { setOrderStatus({ ok: false, msg: 'Network error' }); }
    finally {
      setOrderLoading(false);
      setTimeout(() => setOrderStatus(null), 4000);
      if (user) refresh?.();
    }
  };

  const activeTicker = tickers[activeSymbol];
  const pnlPositive = parseFloat(activeTicker?.price24hPcnt || 0) >= 0;
  const equity = parseFloat(balance?.totalEquity || 0);
  const available = parseFloat(balance?.totalAvailableBalance || 0);
  const usedMarginPct = equity > 0 ? ((parseFloat(balance?.totalUsedMargin || 0) / equity) * 100) : 0;

  return (
    <div className="pg-overview">
      {/* ── STAT BAR ── */}
      <div className="ov-statbar">
        {[
          { label: 'Vault Equity', val: `$${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: tradingMode, color: '#10b981' },
          { label: 'Available Margin', val: `$${available.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: 'Deployable', color: '#38bdf8' },
          { label: 'Open Positions', val: positions.length, sub: 'Active', color: '#f59e0b' },
          { label: 'Mode', val: tradingMode, sub: 'Environment', color: tradingMode === 'REAL' ? '#ef4444' : '#8b5cf6' },
        ].map(s => (
          <div className="ov-stat" key={s.label}>
            <span className="ov-stat-label">{s.label}</span>
            <span className="ov-stat-val" style={{ color: s.color }}>{s.val}</span>
            <span className="ov-stat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="ov-grid">
        {/* LEFT: symbol picker + order panel */}
        <div className="ov-left">
          {/* Symbol Switcher */}
          <div className="ov-card">
            <div className="ov-card-header">
              <span>Top Assets</span>
              <Activity size={12} className="ov-card-icon" />
            </div>
            <div className="sym-list">
              {SYMBOLS.map(s => {
                const t = tickers[s];
                const pos = parseFloat(t?.price24hPcnt || 0) >= 0;
                return (
                  <button
                    key={s}
                    className={`sym-row ${activeSymbol === s ? 'sym-active' : ''}`}
                    onClick={() => setActiveSymbol(s)}
                  >
                    <span className="sym-name">{s.replace('USDT', '')}</span>
                    <span className="sym-price">{t ? `$${parseFloat(t.lastPrice).toLocaleString()}` : '—'}</span>
                    <span className={`sym-chg ${pos ? 'pos' : 'neg'}`}>
                      {t ? `${pos ? '+' : ''}${(parseFloat(t.price24hPcnt) * 100).toFixed(2)}%` : '—'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Entry */}
          <div className="ov-card">
            <div className="ov-card-header">
              <span>Quick Execution</span>
              <Zap size={12} className="ov-card-icon" />
            </div>
            <div className="ov-order-body">
              <div className="exec-side-tabs">
                <button className={`side-tab buy ${activeSide === 'BUY' ? 'active' : ''}`} onClick={() => setActiveSide('BUY')}>Buy / Long</button>
                <button className={`side-tab sell ${activeSide === 'SELL' ? 'active' : ''}`} onClick={() => setActiveSide('SELL')}>Sell / Short</button>
              </div>
              <div className="exec-type-tabs">
                {['Market', 'Limit'].map(t => (
                  <button key={t} className={`type-tab ${orderType === t ? 'active' : ''}`} onClick={() => setOrderType(t)}>{t}</button>
                ))}
              </div>
              {orderStatus && (
                <div className={`order-status ${orderStatus.ok ? 'ok' : 'fail'}`}>{orderStatus.msg}</div>
              )}
              <div className="ov-field">
                <label>Quantity ({activeSymbol.replace('USDT', '')})</label>
                <input value={qty} onChange={e => setQty(e.target.value)} placeholder="0.000" />
              </div>
              <div className="ov-field">
                <label>Leverage <span style={{ color: '#10b981', float: 'right' }}>{leverage}x</span></label>
                <input type="range" min="1" max="100" value={leverage} onChange={e => setLeverage(e.target.value)} className="lev-slider" />
              </div>
              <button
                className={`exec-go ${activeSide === 'BUY' ? 'go-buy' : 'go-sell'} ${orderLoading ? 'loading' : ''}`}
                onClick={handlePlaceOrder}
                disabled={orderLoading}
              >
                <Zap size={16} fill="currentColor" />
                {orderLoading ? 'Executing…' : `${activeSide === 'BUY' ? 'LONG' : 'SHORT'} ${activeSymbol.replace('USDT', '')}`}
              </button>
            </div>
          </div>

          {/* Risk HUD */}
          <div className="ov-card">
            <div className="ov-card-header">
              <span>Risk Metrics</span>
              <Shield size={12} className="ov-card-icon" />
            </div>
            <div className="risk-body">
              {[
                { label: 'Account Safety', pct: 94, color: '#10b981' },
                { label: 'Margin Deployed', pct: Math.min(usedMarginPct, 100), color: usedMarginPct > 70 ? '#ef4444' : '#f59e0b' },
              ].map(r => (
                <div className="risk-row" key={r.label}>
                  <div className="risk-head">
                    <span>{r.label}</span>
                    <span style={{ color: r.color }}>{r.pct.toFixed(1)}%</span>
                  </div>
                  <div className="risk-track">
                    <div className="risk-fill" style={{ width: `${r.pct}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: chart */}
        <div className="ov-center">
          <div className="ov-card chart-card">
            <div className="ov-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{activeSymbol}</span>
                {activeTicker && (
                  <>
                    <span style={{ color: '#10b981', fontWeight: 900 }}>${parseFloat(activeTicker.lastPrice).toLocaleString()}</span>
                    <span className={`chg-badge ${pnlPositive ? 'pos' : 'neg'}`}>
                      {pnlPositive ? '+' : ''}{(parseFloat(activeTicker.price24hPcnt) * 100).toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
              <span style={{ fontSize: 9, color: '#334155', fontWeight: 900 }}>HIGH-FREQUENCY FEED</span>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <CustomTradingChart symbol={activeSymbol} height="100%" />
            </div>
          </div>
        </div>

        {/* RIGHT: positions + history */}
        <div className="ov-right">
          <div className="ov-card" style={{ flex: 1 }}>
            <div className="ov-card-header">
              <span>Open Positions</span>
              <TrendingUp size={12} className="ov-card-icon" />
            </div>
            <div className="pos-list">
              {positions.length === 0 ? (
                <div className="empty-state">No open positions</div>
              ) : positions.map((p, i) => (
                <div className="pos-row" key={i}>
                  <div className="pos-sym">{p.symbol}</div>
                  <div className="pos-meta">
                    <span className={parseFloat(p.unrealisedPnl || 0) >= 0 ? 'pos' : 'neg'}>
                      {parseFloat(p.unrealisedPnl || 0) >= 0 ? '+' : ''}${parseFloat(p.unrealisedPnl || 0).toFixed(2)}
                    </span>
                    <span className="pos-side" style={{ color: p.side === 'Buy' ? '#10b981' : '#ef4444' }}>{p.side}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ov-card" style={{ flex: 1 }}>
            <div className="ov-card-header">
              <span>Recent History</span>
              <Clock size={12} className="ov-card-icon" />
            </div>
            <div className="pos-list">
              {history.length === 0 ? (
                <div className="empty-state">No recent trades</div>
              ) : history.slice(0, 10).map((h, i) => (
                <div className="pos-row" key={i}>
                  <div className="pos-sym">{h.symbol}</div>
                  <div className="pos-meta">
                    <span className={parseFloat(h.closedPnl || 0) >= 0 ? 'pos' : 'neg'}>
                      {parseFloat(h.closedPnl || 0) >= 0 ? '+' : ''}${parseFloat(h.closedPnl || 0).toFixed(2)}
                    </span>
                    <span style={{ fontSize: 9, color: '#475569' }}>{h.side}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pg-overview {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #07111f;
          gap: 0;
        }
        .ov-statbar {
          display: flex;
          gap: 1px;
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .ov-stat {
          flex: 1;
          padding: 16px 20px;
          background: #07111f;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ov-stat-label { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; color: #334155; }
        .ov-stat-val { font-size: 20px; font-weight: 900; font-family: 'JetBrains Mono', monospace; letter-spacing: -0.03em; }
        .ov-stat-sub { font-size: 9px; color: #475569; font-weight: 700; }

        .ov-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 260px 1fr 260px;
          gap: 1px;
          background: rgba(255,255,255,0.04);
          min-height: 0;
          overflow: hidden;
        }
        .ov-left, .ov-right {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: rgba(255,255,255,0.04);
          overflow-y: auto;
        }
        .ov-center {
          display: flex;
          flex-direction: column;
          background: #07111f;
          min-height: 0;
        }
        .ov-card {
          background: #07111f;
          display: flex;
          flex-direction: column;
        }
        .chart-card { flex: 1; }
        .ov-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 11px; font-weight: 800; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.08em;
          flex-shrink: 0;
        }
        .ov-card-icon { color: #334155; }

        .sym-list { display: flex; flex-direction: column; }
        .sym-row {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px;
          background: none; border: none; cursor: pointer;
          border-left: 2px solid transparent;
          transition: all 0.15s;
          text-align: left;
        }
        .sym-row:hover { background: rgba(255,255,255,0.03); }
        .sym-row.sym-active { background: rgba(16,185,129,0.07); border-left-color: #10b981; }
        .sym-name { font-size: 12px; font-weight: 800; color: #fff; flex: 1; }
        .sym-price { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #e2e8f0; }
        .sym-chg { font-size: 10px; font-weight: 800; min-width: 50px; text-align: right; }
        .sym-chg.pos { color: #10b981; }
        .sym-chg.neg { color: #ef4444; }

        .ov-order-body { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
        .exec-side-tabs { display: flex; background: #0b1629; border-radius: 8px; padding: 3px; gap: 3px; }
        .side-tab {
          flex: 1; padding: 8px; border: none; background: transparent;
          font-size: 10px; font-weight: 900; cursor: pointer;
          border-radius: 6px; color: #475569; transition: 0.2s;
        }
        .side-tab.buy.active { background: rgba(16,185,129,0.2); color: #10b981; }
        .side-tab.sell.active { background: rgba(239,68,68,0.2); color: #ef4444; }
        .exec-type-tabs { display: flex; gap: 6px; }
        .type-tab {
          flex: 1; padding: 7px; border: 1px solid rgba(255,255,255,0.08); background: transparent;
          color: #475569; font-size: 10px; font-weight: 900; border-radius: 6px; cursor: pointer; transition: 0.2s;
        }
        .type-tab.active { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.08); }
        .order-status {
          padding: 8px; border-radius: 8px;
          font-size: 10px; font-weight: 900; text-align: center;
        }
        .order-status.ok { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .order-status.fail { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .ov-field { display: flex; flex-direction: column; gap: 6px; }
        .ov-field label { font-size: 9px; font-weight: 900; color: #475569; text-transform: uppercase; }
        .ov-field input[type="text"], .ov-field input[type="number"] {
          background: #0b1629; border: 1px solid rgba(255,255,255,0.08);
          color: #fff; padding: 10px 12px; border-radius: 8px; font-size: 13px;
          font-family: 'JetBrains Mono', monospace; outline: none; width: 100%;
        }
        .lev-slider { width: 100%; accent-color: #10b981; height: 4px; }
        .exec-go {
          width: 100%; padding: 14px; border: none; border-radius: 10px;
          font-size: 12px; font-weight: 900; letter-spacing: 0.08em;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: 0.2s;
        }
        .exec-go.go-buy { background: #10b981; color: #000; }
        .exec-go.go-sell { background: #ef4444; color: #fff; }
        .exec-go:hover { transform: translateY(-2px); }
        .exec-go.loading { opacity: 0.6; cursor: not-allowed; }

        .risk-body { padding: 12px; display: flex; flex-direction: column; gap: 14px; }
        .risk-row { display: flex; flex-direction: column; gap: 6px; }
        .risk-head { display: flex; justify-content: space-between; font-size: 10px; color: #64748b; font-weight: 700; }
        .risk-track { background: #0b1629; border-radius: 4px; height: 4px; overflow: hidden; }
        .risk-fill { height: 100%; border-radius: 4px; transition: width 0.4s; }

        .chg-badge { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 20px; }
        .chg-badge.pos { background: rgba(16,185,129,0.15); color: #10b981; }
        .chg-badge.neg { background: rgba(239,68,68,0.15); color: #ef4444; }

        .pos-list { display: flex; flex-direction: column; overflow-y: auto; }
        .pos-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .pos-sym { font-size: 12px; font-weight: 800; color: #e2e8f0; }
        .pos-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .pos-meta .pos { color: #10b981; font-size: 11px; font-weight: 900; font-family: monospace; }
        .pos-meta .neg { color: #ef4444; font-size: 11px; font-weight: 900; font-family: monospace; }
        .pos-side { font-size: 9px; font-weight: 900; }
        .empty-state { padding: 24px; text-align: center; font-size: 11px; color: #334155; }

        @media (max-width: 1280px) {
          .ov-grid { grid-template-columns: 220px 1fr 220px; }
        }
        @media (max-width: 900px) {
          .ov-grid { grid-template-columns: 1fr; grid-template-rows: auto; }
          .ov-left, .ov-right { overflow: visible; }
          .ov-statbar { flex-wrap: wrap; }
          .ov-stat { min-width: 50%; }
        }
      `}</style>
    </div>
  );
}
