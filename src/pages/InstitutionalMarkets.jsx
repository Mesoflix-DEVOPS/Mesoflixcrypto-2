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

      <style>{`
        .pg-markets {
          display: flex; flex-direction: column; height: 100%;
          background: #07111f; color: #e2e8f0;
        }
        .mkt-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: #060c1a;
          gap: 16px; flex-wrap: wrap;
        }
        .mkt-title { display: flex; align-items: center; gap: 10px; }
        .mkt-title h1 { font-size: 16px; font-weight: 900; color: #fff; margin: 0; }
        .live-dot { width: 7px; height: 7px; background: #10b981; border-radius: 50%; animation: blink 1.5s infinite; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
        .live-label { font-size: 9px; font-weight: 900; color: #10b981; letter-spacing: 0.15em; }
        .mkt-controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .mkt-search {
          display: flex; align-items: center; gap: 8px;
          background: #0b1629; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 8px 12px; color: #64748b;
        }
        .mkt-search input { background: transparent; border: none; color: #fff; outline: none; font-size: 12px; width: 140px; }
        .mkt-filters { display: flex; gap: 4px; }
        .mkt-filter-btn {
          padding: 7px 14px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: #475569; font-size: 10px; font-weight: 900;
          cursor: pointer; transition: 0.2s; text-transform: capitalize;
        }
        .mkt-filter-btn.active { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.08); }

        .mkt-body {
          flex: 1; display: grid;
          grid-template-columns: 1fr 440px;
          min-height: 0; overflow: hidden;
          gap: 1px; background: rgba(255,255,255,0.04);
        }
        .mkt-table-wrap { overflow-y: auto; background: #07111f; }
        .mkt-table { width: 100%; border-collapse: collapse; }
        .mkt-table thead th {
          padding: 10px 16px; text-align: left;
          font-size: 9px; font-weight: 900; color: #334155;
          text-transform: uppercase; letter-spacing: 0.1em;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          position: sticky; top: 0; background: #060c1a; z-index: 1;
        }
        .mkt-row { cursor: pointer; transition: background 0.15s; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .mkt-row:hover { background: rgba(255,255,255,0.03); }
        .mkt-row-active { background: rgba(16,185,129,0.05) !important; }
        .mkt-table td { padding: 12px 16px; font-size: 12px; }
        .mkt-sym-cell { display: flex; align-items: center; gap: 10px; }
        .mkt-sym-icon {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 12px; color: #fff; flex-shrink: 0;
        }
        .mkt-sym-name { font-weight: 800; color: #fff; font-size: 13px; }
        .mkt-sym-pair { font-size: 9px; color: #334155; font-weight: 700; }
        .mkt-price { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #e2e8f0; }
        .mkt-chg { font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 20px; }
        .mkt-chg.pos { background: rgba(16,185,129,0.1); color: #10b981; }
        .mkt-chg.neg { background: rgba(239,68,68,0.1); color: #ef4444; }
        .mkt-secondary { color: #475569; font-family: monospace; }

        .mkt-chart-panel { display: flex; flex-direction: column; background: #07111f; min-height: 0; }
        .mkt-chart-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }
        .mkt-chart-sym { font-size: 14px; font-weight: 900; color: #fff; }

        @media (max-width: 900px) {
          .mkt-body { grid-template-columns: 1fr; }
          .mkt-chart-panel { height: 300px; }
        }
      `}</style>
    </div>
  );
}
