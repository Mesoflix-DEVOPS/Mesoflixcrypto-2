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

  const [expandedStat, setExpandedStat] = useState(null);

  const stats = [
    { label: 'Vault Equity', val: `$${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: tradingMode, color: '#10b981' },
    { label: 'Available Margin', val: `$${available.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: 'Deployable', color: '#38bdf8' },
    { label: 'Open Positions', val: positions.length, sub: 'Active', color: '#f59e0b' },
    { label: 'Mode', val: tradingMode, sub: 'Environment', color: tradingMode === 'REAL' ? '#ef4444' : '#8b5cf6' },
  ];

  const getSymbolIcon = (s) => {
    const base = s.replace('USDT', '').toLowerCase();
    return `https://assets.coincap.io/assets/icons/${base}@2x.png`;
  };

  return (
    <div className="pg-overview">
      {/* ── STAT BAR ── */}
      <div className="ov-statbar">
        {stats.map((s, idx) => (
          <div 
            className={`ov-stat ${expandedStat === idx ? 'ov-stat-expanded' : ''}`} 
            key={s.label}
            onClick={() => setExpandedStat(expandedStat === idx ? null : idx)}
          >
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
          <div className="ov-card asset-card">
            <div className="ov-card-header">
              <span>Market Intelligence</span>
              <Activity size={12} className="ov-card-icon" />
            </div>
            <div className="sym-list-wrap">
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
                      <div className="sym-info">
                        <img src={getSymbolIcon(s)} alt={s} className="sym-icon-img" onError={(e) => e.target.style.display='none'} />
                        <div className="sym-meta">
                          <span className="sym-name">{s.replace('USDT', '')}</span>
                          <span className="sym-full">Perpetual</span>
                        </div>
                      </div>
                      <div className="sym-prices">
                        <span className="sym-price">{t ? `$${parseFloat(t.lastPrice).toLocaleString()}` : '—'}</span>
                        <span className={`sym-chg ${pos ? 'pos' : 'neg'}`}>
                          {t ? `${pos ? '+' : ''}${(parseFloat(t.price24hPcnt) * 100).toFixed(2)}%` : '—'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Entry */}
          <div className="ov-card exec-card">
            <div className="ov-card-header">
              <span>Mission Control</span>
              <Zap size={12} className="ov-card-icon" />
            </div>
            <div className="ov-order-body">
              <div className="exec-side-tabs">
                <button className={`side-tab buy ${activeSide === 'BUY' ? 'active' : ''}`} onClick={() => setActiveSide('BUY')}>Buy / Long</button>
                <button className={`side-tab sell ${activeSide === 'SELL' ? 'active' : ''}`} onClick={() => setActiveSide('SELL')}>Sell / Short</button>
              </div>
              
              <div className="exec-main-fields">
                <div className="exec-type-tabs">
                  {['Market', 'Limit'].map(t => (
                    <button key={t} className={`type-tab ${orderType === t ? 'active' : ''}`} onClick={() => setOrderType(t)}>{t}</button>
                  ))}
                </div>
                
                {orderStatus && (
                  <div className={`order-status ${orderStatus.ok ? 'ok' : 'fail'}`}>{orderStatus.msg}</div>
                )}
                
                <div className="ov-field">
                  <div className="field-head">
                    <label>Position Size</label>
                    <span className="field-unit">{activeSymbol.replace('USDT', '')}</span>
                  </div>
                  <input value={qty} onChange={e => setQty(e.target.value)} placeholder="0.000" />
                </div>
                
                <div className="ov-field">
                  <div className="field-head">
                    <label>Leverage</label>
                    <span className="field-unit active">{leverage}x</span>
                  </div>
                  <input type="range" min="1" max="100" value={leverage} onChange={e => setLeverage(e.target.value)} className="lev-slider" />
                  <div className="lev-presets">
                    {[1, 10, 25, 50, 100].map(l => (
                      <button key={l} onClick={() => setLeverage(l.toString())}>{l}x</button>
                    ))}
                  </div>
                </div>

                <button
                  className={`exec-go ${activeSide === 'BUY' ? 'go-buy' : 'go-sell'} ${orderLoading ? 'loading' : ''}`}
                  onClick={handlePlaceOrder}
                  disabled={orderLoading}
                >
                  <Zap size={16} fill="currentColor" />
                  {orderLoading ? 'Executing…' : `${activeSide === 'BUY' ? 'Open Long' : 'Open Short'} ${activeSymbol.replace('USDT', '')}`}
                </button>
              </div>
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
              <CustomTradingChart symbol={activeSymbol} tickerData={activeTicker} height="100%" />
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

    </div>
  );
}
