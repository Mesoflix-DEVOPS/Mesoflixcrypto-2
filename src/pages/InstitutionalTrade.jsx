import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Zap, Shield, RefreshCw, ChevronDown, Activity } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { getApiUrl, fetchWithLogging } from '../config/api';
import CustomTradingChart from '../components/CustomTradingChart';

const SYMBOLS = [
  'BTCUSDT','ETHUSDT','SOLUSDT','XRPUSDT','ADAUSDT',
  'DOGEUSDT','BNBUSDT','AVAXUSDT','LINKUSDT','MATICUSDT',
];

export default function InstitutionalTrade() {
  const { tradingMode, user, balance, refresh } = useOutletContext();
  const { socket, subscribeToTicker, unsubscribeFromTicker } = useSocket();

  const [activeSymbol, setActiveSymbol] = useState('BTCUSDT');
  const [tickers, setTickers] = useState({});
  const [activeSide, setActiveSide] = useState('BUY');
  const [orderType, setOrderType] = useState('Market');
  const [qty, setQty] = useState('0.1');
  const [limitPrice, setLimitPrice] = useState('');
  const [leverage, setLeverage] = useState('10');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!socket) return;
    SYMBOLS.forEach(s => subscribeToTicker(s));
    const onTicker = (d) => setTickers(prev => ({ ...prev, [d.symbol]: d }));
    socket.on('ticker', onTicker);
    return () => {
      SYMBOLS.forEach(s => unsubscribeFromTicker(s));
      socket.off('ticker', onTicker);
    };
  }, [socket]);

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null') return setOrderStatus({ ok: false, msg: 'Auth token missing' });
    setOrderLoading(true); setOrderStatus(null);
    try {
      const body = { symbol: activeSymbol, side: activeSide, qty, orderType, leverage, environment: tradingMode };
      if (orderType === 'Limit' && limitPrice) body.price = limitPrice;
      const res = await fetchWithLogging(getApiUrl('/api/bybit/order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) setOrderStatus({ ok: true, msg: `✓ Order filled — ${activeSymbol}` });
      else {
        const msg = typeof data.error === 'object' ? (data.error.message || JSON.stringify(data.error)) : (data.error || 'Execution failed');
        setOrderStatus({ ok: false, msg });
      }
    } catch { setOrderStatus({ ok: false, msg: 'Network error' }); }
    finally {
      setOrderLoading(false);
      setTimeout(() => setOrderStatus(null), 5000);
      if (user) refresh?.();
    }
  };

  const currentTicker = tickers[activeSymbol];
  const price = parseFloat(currentTicker?.lastPrice || 0);
  const pct = parseFloat(currentTicker?.price24hPcnt || 0);
  const pctPos = pct >= 0;
  const equity = parseFloat(balance?.totalEquity || 0);
  const available = parseFloat(balance?.totalAvailableBalance || 0);

  const filteredSymbols = SYMBOLS.filter(s =>
    s.toLowerCase().includes(searchQuery.toUpperCase())
  );

  return (
    <div className="pg-trade">
      {/* ── TOP TICKER TOOLBAR ── */}
      <div className="trade-toolbar">
        {SYMBOLS.slice(0, 8).map(s => {
          const t = tickers[s];
          const p = parseFloat(t?.price24hPcnt || 0) >= 0;
          return (
            <button
              key={s}
              className={`tb-chip ${activeSymbol === s ? 'tb-active' : ''}`}
              onClick={() => setActiveSymbol(s)}
            >
              <span className="tb-sym">{s.replace('USDT','')}</span>
              <span className="tb-price">{t ? `$${parseFloat(t.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}</span>
              <span className={`tb-chg ${p ? 'pos' : 'neg'}`}>
                {t ? `${p ? '+' : ''}${(parseFloat(t.price24hPcnt || 0) * 100).toFixed(2)}%` : '—'}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── MAIN BODY ── */}
      <div className="trade-body">
        {/* Left: Symbol list */}
        <div className="trade-sym-panel">
          <div className="tsym-search">
            <Search size={12} />
            <input
              placeholder="Search…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="tsym-list">
            {filteredSymbols.map(s => {
              const t = tickers[s];
              const p = parseFloat(t?.price24hPcnt || 0) >= 0;
              return (
                <button
                  key={s}
                  className={`tsym-row ${activeSymbol === s ? 'tsym-active' : ''}`}
                  onClick={() => setActiveSymbol(s)}
                >
                  <span className="tsym-name">{s.replace('USDT','')}<span className="tsym-base">/USDT</span></span>
                  <div className="tsym-right">
                    <span className="tsym-price">{t ? `$${parseFloat(t.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}</span>
                    <span className={`tsym-chg ${p ? 'pos' : 'neg'}`}>{t ? `${p?'+':''}${(parseFloat(t.price24hPcnt||0)*100).toFixed(2)}%` : '—'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Chart */}
        <div className="trade-chart-area">
          <div className="trade-chart-header">
            <div className="trade-chart-info">
              <span className="tci-symbol">{activeSymbol}</span>
              <span className="tci-price">${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className={`tci-chg ${pctPos ? 'pos' : 'neg'}`}>
                {pctPos ? '+' : ''}{(pct * 100).toFixed(2)}%
              </span>
            </div>
            <div className="trade-chart-meta">
              {currentTicker && (
                <>
                  <span>H: <b>${parseFloat(currentTicker.highPrice24h||0).toLocaleString()}</b></span>
                  <span>L: <b>${parseFloat(currentTicker.lowPrice24h||0).toLocaleString()}</b></span>
                  <span>Vol: <b>{(parseFloat(currentTicker.volume24h||0)/1e6).toFixed(2)}M</b></span>
                </>
              )}
            </div>
          </div>
          <div className="trade-chart-canvas">
            <CustomTradingChart symbol={activeSymbol} height="100%" />
          </div>
        </div>

        {/* Right: Execution */}
        <div className="trade-exec-panel">
          {/* Balance Strip */}
          <div className="exec-balance">
            <div className="eb-item">
              <span className="eb-label">Equity</span>
              <span className="eb-val">${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="eb-item">
              <span className="eb-label">Available</span>
              <span className="eb-val" style={{ color: '#10b981' }}>${available.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Side Tabs */}
          <div className="exec-side-tabs">
            <button className={`est buy ${activeSide === 'BUY' ? 'active' : ''}`} onClick={() => setActiveSide('BUY')}>
              Long / Buy
            </button>
            <button className={`est sell ${activeSide === 'SELL' ? 'active' : ''}`} onClick={() => setActiveSide('SELL')}>
              Short / Sell
            </button>
          </div>

          {/* Order type */}
          <div className="exec-types">
            {['Market', 'Limit'].map(t => (
              <button key={t} className={`ety ${orderType === t ? 'active' : ''}`} onClick={() => setOrderType(t)}>{t}</button>
            ))}
          </div>

          {/* Fields */}
          <div className="exec-fields">
            {orderType === 'Limit' && (
              <div className="ef">
                <label>Limit Price (USDT)</label>
                <div className="ef-wrap">
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={e => setLimitPrice(e.target.value)}
                    placeholder={price.toFixed(2)}
                  />
                  <span>USDT</span>
                </div>
              </div>
            )}
            <div className="ef">
              <label>Quantity ({activeSymbol.replace('USDT','')})</label>
              <div className="ef-wrap">
                <input
                  type="number"
                  value={qty}
                  onChange={e => setQty(e.target.value)}
                  placeholder="0.000"
                />
                <span>{activeSymbol.replace('USDT','')}</span>
              </div>
            </div>
            <div className="ef">
              <label>Leverage <span style={{ color: '#10b981', float:'right' }}>{leverage}x</span></label>
              <input
                type="range" min="1" max="100"
                value={leverage}
                onChange={e => setLeverage(e.target.value)}
                className="lev-range"
              />
              <div className="lev-labels">
                {['1x','10x','25x','50x','100x'].map(l => (
                  <button key={l} className="lev-shortcut" onClick={() => setLeverage(l.replace('x',''))}>{l}</button>
                ))}
              </div>
            </div>

            {/* Cost estimate */}
            <div className="ef-estimate">
              <span>Est. Cost</span>
              <span>${(price * parseFloat(qty || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Status */}
          {orderStatus && (
            <div className={`exec-status ${orderStatus.ok ? 'ok' : 'fail'}`}>{orderStatus.msg}</div>
          )}

          {/* Execute Button */}
          <button
            className={`exec-fire ${activeSide === 'BUY' ? 'fire-buy' : 'fire-sell'} ${orderLoading ? 'loading' : ''}`}
            onClick={handlePlaceOrder}
            disabled={orderLoading}
          >
            {orderLoading ? <RefreshCw size={16} className="spin" /> : <Zap size={16} fill="currentColor" />}
            {orderLoading ? 'Executing…' : `${activeSide === 'BUY' ? 'Place Long' : 'Place Short'}`}
          </button>

          {/* Capital Shield */}
          <div className="capital-shield">
            <Shield size={12} color="#10b981" />
            <span>Capital Shield Active</span>
          </div>
        </div>
      </div>

      <style>{`
        .pg-trade {
          display: flex; flex-direction: column; height: 100%;
          background: #020610; color: #babcd0; font-family: 'Inter', sans-serif;
        }

        /* ── TOOLBAR ── */
        .trade-toolbar {
          display: flex; gap: 1px; background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          overflow-x: auto; flex-shrink: 0;
        }
        .trade-toolbar::-webkit-scrollbar { height: 3px; }
        .tb-chip {
          display: flex; flex-direction: column; align-items: center;
          padding: 10px 18px; background: #020610;
          border: none; cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s; min-width: 120px;
        }
        .tb-chip:hover { background: rgba(255,255,255,0.02); }
        .tb-chip.tb-active { border-bottom-color: #10b981; background: rgba(16,185,129,0.05); }
        .tb-sym { font-size: 11px; font-weight: 900; color: #fff; margin-bottom: 2px; }
        .tb-price { font-size: 12px; font-family: monospace; color: #e2e8f0; }
        .tb-chg { font-size: 10px; font-weight: 700; }
        .tb-chg.pos { color: #10b981; }
        .tb-chg.neg { color: #ef4444; }

        /* ── BODY ── */
        .trade-body {
          flex: 1; display: grid;
          grid-template-columns: 200px 1fr 300px;
          min-height: 0; overflow: hidden;
          gap: 1px; background: rgba(255,255,255,0.04);
        }

        /* Symbol panel */
        .trade-sym-panel { background: #020610; display: flex; flex-direction: column; overflow: hidden; }
        .tsym-search {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.05);
          color: #334155;
        }
        .tsym-search input { background: transparent; border: none; color: #fff; outline: none; font-size: 11px; flex: 1; }
        .tsym-list { flex: 1; overflow-y: auto; }
        .tsym-row {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; background: none; border: none; cursor: pointer;
          border-left: 2px solid transparent; transition: 0.15s;
        }
        .tsym-row:hover { background: rgba(255,255,255,0.03); }
        .tsym-row.tsym-active { background: rgba(16,185,129,0.06); border-left-color: #10b981; }
        .tsym-name { font-size: 12px; font-weight: 800; color: #fff; }
        .tsym-base { color: #334155; font-size: 10px; }
        .tsym-right { display: flex; flex-direction: column; align-items: flex-end; }
        .tsym-price { font-size: 11px; font-family: monospace; color: #e2e8f0; }
        .tsym-chg { font-size: 10px; font-weight: 700; }
        .tsym-chg.pos { color: #10b981; }
        .tsym-chg.neg { color: #ef4444; }

        /* Chart area */
        .trade-chart-area { background: #020610; display: flex; flex-direction: column; min-height: 0; }
        .trade-chart-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;
        }
        .trade-chart-info { display: flex; align-items: center; gap: 12px; }
        .tci-symbol { font-size: 15px; font-weight: 900; color: #fff; }
        .tci-price { font-size: 18px; font-weight: 900; color: #10b981; font-family: monospace; }
        .tci-chg { font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; }
        .tci-chg.pos { background: rgba(16,185,129,0.1); color: #10b981; }
        .tci-chg.neg { background: rgba(239,68,68,0.1); color: #ef4444; }
        .trade-chart-meta { display: flex; gap: 20px; font-size: 10px; color: #475569; }
        .trade-chart-meta b { color: #94a3b8; }
        .trade-chart-canvas { flex: 1; min-height: 0; }

        /* Execution panel */
        .trade-exec-panel {
          background: #020610; display: flex; flex-direction: column;
          padding: 0; overflow-y: auto; gap: 0;
        }
        .exec-balance {
          display: flex; gap: 1px; background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .eb-item { flex: 1; background: #020610; padding: 12px 14px; }
        .eb-label { display: block; font-size: 9px; font-weight: 900; text-transform: uppercase; color: #334155; margin-bottom: 4px; }
        .eb-val { font-size: 14px; font-weight: 900; color: #fff; font-family: monospace; }

        .exec-side-tabs { display: flex; gap: 1px; background: rgba(255,255,255,0.04); }
        .est {
          flex: 1; padding: 14px; border: none; cursor: pointer;
          font-size: 11px; font-weight: 900; transition: 0.2s;
          background: #020610; color: #334155;
        }
        .est.buy.active { background: rgba(16,185,129,0.15); color: #10b981; }
        .est.sell.active { background: rgba(239,68,68,0.15); color: #ef4444; }

        .exec-types { display: flex; gap: 6px; padding: 12px; }
        .ety {
          flex: 1; padding: 8px; border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: #475569; font-size: 10px; font-weight: 900;
          border-radius: 6px; cursor: pointer; transition: 0.2s;
        }
        .ety.active { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.08); }

        .exec-fields { padding: 0 12px; display: flex; flex-direction: column; gap: 12px; }
        .ef { display: flex; flex-direction: column; gap: 6px; }
        .ef label { font-size: 9px; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; }
        .ef-wrap {
          display: flex; align-items: center;
          background: #0b1629; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; overflow: hidden;
        }
        .ef-wrap input {
          flex: 1; background: transparent; border: none; color: #fff;
          padding: 10px 12px; font-size: 13px; font-family: monospace; outline: none;
        }
        .ef-wrap span { padding: 0 12px; font-size: 10px; color: #334155; font-weight: 900; }
        .lev-range { width: 100%; accent-color: #10b981; height: 4px; }
        .lev-labels { display: flex; gap: 4px; justify-content: space-between; }
        .lev-shortcut {
          padding: 4px 6px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 4px;
          font-size: 9px; color: #475569; cursor: pointer; font-weight: 800;
          transition: 0.15s;
        }
        .lev-shortcut:hover { color: #10b981; border-color: #10b981; }

        .ef-estimate {
          display: flex; justify-content: space-between;
          background: rgba(255,255,255,0.03); padding: 10px 12px; border-radius: 8px;
          font-size: 11px; color: #64748b;
        }
        .ef-estimate span:last-child { color: #fff; font-weight: 800; font-family: monospace; }

        .exec-status {
          margin: 0 12px; padding: 10px; border-radius: 8px;
          font-size: 10px; font-weight: 900; text-align: center;
        }
        .exec-status.ok { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .exec-status.fail { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }

        .exec-fire {
          margin: 12px; padding: 16px;
          border: none; border-radius: 12px; cursor: pointer;
          font-size: 13px; font-weight: 900; letter-spacing: 0.05em;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s;
        }
        .exec-fire.fire-buy { background: #10b981; color: #000; }
        .exec-fire.fire-sell { background: #ef4444; color: #fff; }
        .exec-fire:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .exec-fire.loading { opacity: 0.6; cursor: not-allowed; transform: none; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .capital-shield {
          margin: 0 12px 16px;
          display: flex; align-items: center; gap: 8px;
          padding: 10px 12px; background: rgba(16,185,129,0.05);
          border: 1px solid rgba(16,185,129,0.12); border-radius: 8px;
          font-size: 9px; font-weight: 900; color: #10b981; letter-spacing: 0.08em; text-transform: uppercase;
        }

        @media (max-width: 1100px) {
          .trade-body { grid-template-columns: 160px 1fr 260px; }
        }
        @media (max-width: 800px) {
          .trade-body { grid-template-columns: 1fr; }
          .trade-sym-panel { display: none; }
          .trade-chart-area { min-height: 300px; }
        }
      `}</style>
    </div>
  );
}
