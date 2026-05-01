import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, Star, Filter } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { getApiUrl, fetchWithLogging } from '../config/api';
import CustomTradingChart from '../components/CustomTradingChart';

const TOP_SYMBOLS = [
  'BTCUSDT','ETHUSDT','SOLUSDT','XRPUSDT','ADAUSDT',
  'DOGEUSDT','BNBUSDT','AVAXUSDT','LINKUSDT','MATICUSDT',
  'DOTUSDT','LTCUSDT','UNIUSDT','ATOMUSDT','NEARUSDT',
];

export default function InstitutionalMarkets() {
  const { tradingMode } = useOutletContext();
  const { socket, subscribeToTicker, unsubscribeFromTicker } = useSocket();
  const [tickers, setTickers] = useState({});
  const [search, setSearch] = useState('');
  const [chartSymbol, setChartSymbol] = useState('BTCUSDT');
  const [filter, setFilter] = useState('all'); // all | gainers | losers

  useEffect(() => {
    if (!socket) return;
    TOP_SYMBOLS.forEach(s => subscribeToTicker(s));
    const onTicker = (d) => setTickers(prev => ({ ...prev, [d.symbol]: d }));
    socket.on('ticker', onTicker);
    return () => {
      TOP_SYMBOLS.forEach(s => unsubscribeFromTicker(s));
      socket.off('ticker', onTicker);
    };
  }, [socket]);

  const rows = TOP_SYMBOLS
    .filter(s => s.toLowerCase().includes(search.toUpperCase()))
    .map(s => ({ symbol: s, ...tickers[s] }))
    .filter(r => {
      if (filter === 'gainers') return parseFloat(r.price24hPcnt || 0) >= 0;
      if (filter === 'losers') return parseFloat(r.price24hPcnt || 0) < 0;
      return true;
    });

  return (
    <div className="pg-markets">
      {/* Header bar */}
      <div className="mkt-topbar">
        <div className="mkt-title">
          <h1>Institutional Markets</h1>
          <span className="live-dot" />
          <span className="live-label">LIVE</span>
        </div>
        <div className="mkt-controls">
          <div className="mkt-search">
            <Search size={13} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pair…" />
          </div>
          <div className="mkt-filters">
            {['all', 'gainers', 'losers'].map(f => (
              <button key={f} className={`mkt-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body: table + chart */}
      <div className="mkt-body">
        <div className="mkt-table-wrap">
          <table className="mkt-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Last Price</th>
                <th>24h Change</th>
                <th>24h High</th>
                <th>24h Low</th>
                <th>Volume</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const pct = parseFloat(r.price24hPcnt || 0);
                const pos = pct >= 0;
                return (
                  <tr
                    key={r.symbol}
                    className={`mkt-row ${chartSymbol === r.symbol ? 'mkt-row-active' : ''}`}
                    onClick={() => setChartSymbol(r.symbol)}
                  >
                    <td>
                      <div className="mkt-sym-cell">
                        <div className="mkt-sym-icon">{r.symbol.replace('USDT','')[0]}</div>
                        <div>
                          <div className="mkt-sym-name">{r.symbol.replace('USDT','')}</div>
                          <div className="mkt-sym-pair">USDT</div>
                        </div>
                      </div>
                    </td>
                    <td className="mkt-price">{r.lastPrice ? `$${parseFloat(r.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}</td>
                    <td>
                      <span className={`mkt-chg ${pos ? 'pos' : 'neg'}`}>
                        {r.price24hPcnt ? `${pos ? '+' : ''}${(pct * 100).toFixed(2)}%` : '—'}
                      </span>
                    </td>
                    <td className="mkt-secondary">{r.highPrice24h ? `$${parseFloat(r.highPrice24h).toLocaleString()}` : '—'}</td>
                    <td className="mkt-secondary">{r.lowPrice24h ? `$${parseFloat(r.lowPrice24h).toLocaleString()}` : '—'}</td>
                    <td className="mkt-secondary">{r.volume24h ? `${(parseFloat(r.volume24h)/1e6).toFixed(2)}M` : '—'}</td>
                    <td>{pos ? <TrendingUp size={14} color="#10b981" /> : <TrendingDown size={14} color="#ef4444" />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Chart panel */}
        <div className="mkt-chart-panel">
          <div className="mkt-chart-header">
            <span className="mkt-chart-sym">{chartSymbol}</span>
            {tickers[chartSymbol] && (
              <span style={{ color: '#10b981', fontWeight: 900 }}>
                ${parseFloat(tickers[chartSymbol].lastPrice || 0).toLocaleString()}
              </span>
            )}
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <CustomTradingChart symbol={chartSymbol} height="100%" />
          </div>
        </div>
      </div>
    </div>
  );
}
