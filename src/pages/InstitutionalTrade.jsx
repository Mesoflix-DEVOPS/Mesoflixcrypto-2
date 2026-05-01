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
            <CustomTradingChart symbol={activeSymbol} tickerData={currentTicker} height="100%" />
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
    </div>
  );
}
