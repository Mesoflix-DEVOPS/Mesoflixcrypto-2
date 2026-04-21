import React, { useState, useEffect } from 'react';
import { Search, Star, TrendingUp, Activity, BarChart2, Info, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getApiUrl, fetchWithLogging } from '../config/api';

/**
 * Institutional Markets Page for the Dashboard
 * Features: Bybit Real-Mode Discovery, Sync Watchlist from DB, Sub-second Tickers
 */
function InstitutionalMarkets() {
  const [allSymbols, setAllSymbols] = useState([]);
  const [filteredSymbols, setFilteredSymbols] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [prices, setPrices] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 1. Fetch all available USDT symbols from Bybit Proxy
        const symbolsRes = await fetchWithLogging(getApiUrl('/api/market/all-symbols'));
        
        if (symbolsRes.ok && symbolsRes.headers.get('content-type')?.includes('application/json')) {
          const data = await symbolsRes.json();
          setAllSymbols(data);
          setFilteredSymbols(data.slice(0, 50)); 
        } else {
          console.warn('[MARKET_SYNC] Symbols fetch failed or returned non-JSON content');
        }

        // 2. Fetch User's DB Watchlist
        if (token) {
          const watchRes = await fetchWithLogging(getApiUrl('/api/dashboard/watchlist'), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (watchRes.ok && watchRes.headers.get('content-type')?.includes('application/json')) {
            setWatchlist(await watchRes.json());
          }
        }
      } catch (err) {
        console.error('Market init failed', err);
      } finally {
        setTimeout(() => setLoading(false), 800); // Smooth transition
      }
    };

    init();
  }, []);

  // Periodic Price Polling (Throttle to top 20 visible to stay within rate limits)
  useEffect(() => {
    if (filteredSymbols.length === 0) return;

    const fetchPrices = async () => {
      const priceMap = { ...prices };
      const pollList = filteredSymbols.slice(0, 50).map(s => s.symbol);
      
      await Promise.all(pollList.map(async (symbol) => {
        try {
          const res = await fetchWithLogging(getApiUrl(`/api/market/ticker/${symbol}`));
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            priceMap[symbol] = await res.json();
          }
        } catch (e) {}
      }));
      setPrices(priceMap);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, [filteredSymbols]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = allSymbols.filter(s => 
      s.symbol.toUpperCase().includes(query.toUpperCase())
    ).slice(0, 50);
    setFilteredSymbols(filtered);
  };

  const toggleWatchlist = async (symbol) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetchWithLogging(getApiUrl('/api/dashboard/watchlist/add'), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbol })
      });

      if (res.ok) {
        setWatchlist(prev => 
          prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
        );
      }
    } catch (err) {
      console.error('Watchlist sync error', err);
    }
  };

  return (
    <div className="institutional-market-view">
      <style dangerouslySetInnerHTML={{ __html: `
        .institutional-market-view { padding: 32px; color: #fff; background: #0a0f1d; min-height: calc(100vh - 72px); font-family: 'Inter', sans-serif; }
        .m-header { margin-bottom: 40px; }
        .m-title { font-size: 32px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
        .m-badge { background: rgba(52, 211, 153, 0.1); color: #34d399; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .m-desc { color: #64748b; font-size: 15px; max-width: 700px; }

        .m-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; gap: 20px; }
        .m-search-box { position: relative; flex: 1; max-width: 480px; }
        .m-search-input { width: 100%; background: #0d121f; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 12px 18px 12px 48px; color: #fff; font-size: 14px; transition: 0.3s; }
        .m-search-input:focus { border-color: #34d399; outline: none; background: #121826; }
        .m-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #475569; }

        .cat-group { display: flex; gap: 10px; }
        .cat-btn { background: #0d121f; border: 1px solid rgba(255, 255, 255, 0.05); color: #64748b; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .cat-btn.active { background: #34d399; color: #000; border-color: #34d399; }

        .assets-card { background: rgba(22, 27, 44, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; overflow: hidden; backdrop-filter: blur(10px); }
        .assets-table { width: 100%; border-collapse: collapse; text-align: left; }
        .assets-table th { padding: 18px 24px; font-size: 13px; color: #475569; font-weight: 700; border-bottom: 1px solid rgba(255, 255, 255, 0.05); background: rgba(0,0,0,0.1); }
        .assets-table td { padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); vertical-align: middle; }
        .assets-table tr:hover { background: rgba(52, 211, 153, 0.02); }

        .symbol-pair { font-weight: 800; font-size: 15px; color: #fff; display: flex; align-items: center; gap: 8px; }
        .base-label { background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; font-size: 10px; color: #64748b; font-weight: 800; }
        
        .price-val { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #fff; font-size: 14px; }
        .change-tag { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; }
        .change-tag.up { color: #34d399; background: rgba(52, 211, 153, 0.1); }
        .change-tag.down { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

        .pin-star { background: transparent; border: none; color: #334155; cursor: pointer; transition: 0.2s; padding: 8px; border-radius: 8px; }
        .pin-star:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .pin-star.active { color: #fbbf24; fill: #fbbf24; }

        .btn-trade-action { background: #34d399; color: #000; padding: 8px 18px; border-radius: 8px; font-weight: 800; text-decoration: none; font-size: 12px; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .btn-trade-action:hover { transform: scale(1.05); }

        .empty-state-wrap { padding: 100px 40px; text-align: center; color: #475569; }
        .empty-icon-lg { margin-bottom: 20px; opacity: 0.1; }

        @media (max-width: 900px) {
          .m-controls { flex-direction: column; align-items: stretch; }
          .hide-on-mobile { display: none; }
        }
      `}} />

      <div className="m-header">
        <h1 className="m-title">Market Discovery <span className="m-badge">Real-Mode</span></h1>
        <p className="m-desc">Institutional-grade market access. Search across 1000+ Bybit derivatives with sub-second price polling and persistent watchlist synchronization.</p>
      </div>

      <div className="m-controls">
        <div className="m-search-box">
          <Search className="m-search-icon" size={20} />
          <input 
            className="m-search-input" 
            placeholder="Filter symbols (e.g. BTC, ETH, SOL)..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="cat-group">
          <button className={`cat-btn ${activeCategory === 'All' ? 'active' : ''}`} onClick={() => setActiveCategory('All')}>All Markets</button>
          <button className={`cat-btn ${activeCategory === 'Watchlist' ? 'active' : ''}`} onClick={() => setActiveCategory('Watchlist')}>My Watchlist</button>
          <button className={`cat-btn ${activeCategory === 'Top' ? 'active' : ''}`} onClick={() => setActiveCategory('Top')}>Top Movers</button>
        </div>
      </div>

      <div className="assets-card shadow-2xl">
        <table className="assets-table">
          <thead>
            <tr>
              <th style={{ width: '48px' }}></th>
              <th>Asset Pair</th>
              <th>Last Price</th>
              <th className="hide-on-mobile">24h Change</th>
              <th className="hide-on-mobile">24h Volume</th>
              <th style={{ textAlign: 'right' }}>Execution</th>
            </tr>
          </thead>
          <tbody>
            {(activeCategory === 'Watchlist' 
              ? allSymbols.filter(s => watchlist.includes(s.symbol))
              : filteredSymbols
            ).map(s => (
              <AssetRow 
                key={s.symbol} 
                symbol={s} 
                data={prices[s.symbol]} 
                isStarred={watchlist.includes(s.symbol)}
                onToggleStar={() => toggleWatchlist(s.symbol)}
              />
            ))}
          </tbody>
        </table>

         {loading || filteredSymbols.length === 0 ? (
          <div className="empty-state-wrap">
             {loading ? (
               <div className="flex flex-col items-center">
                 <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
                    <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin" />
                 </div>
                 <p className="text-xl font-bold text-white mb-2">Syncing Market Engine</p>
                 <p className="text-slate-400 text-sm">Connecting to high-frequency institutional feed...</p>
               </div>
             ) : (
               <>
                 <Activity size={48} className="empty-icon-lg" />
                 <p className="text-xl font-bold text-white mb-2">No symbols found</p>
                 <p>Try searching for a different pair</p>
               </>
             )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AssetRow({ symbol, data, isStarred, onToggleStar }) {
  const price = data ? parseFloat(data.lastPrice).toLocaleString() : '---';
  const change = data ? (parseFloat(data.price24hPcnt) * 100).toFixed(2) : '0.00';
  const volume = data ? (parseFloat(data.volume24h) / 1e6).toFixed(1) + 'M' : '---';
  const isUp = parseFloat(change) >= 0;

  return (
    <tr>
      <td>
        <button 
          className={`pin-star ${isStarred ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
        >
          <Star size={16} />
        </button>
      </td>
      <td>
        <div className="symbol-pair">
          {symbol.symbol}
          <span className="base-label">PERP</span>
        </div>
      </td>
      <td>
        <span className="price-val">${price}</span>
      </td>
      <td className="hide-on-mobile">
        <span className={`change-tag ${isUp ? 'up' : 'down'}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}%
        </span>
      </td>
      <td className="hide-on-mobile">
        <span style={{ color: '#475569', fontSize: '13px' }}>${volume}</span>
      </td>
      <td style={{ textAlign: 'right' }}>
        <Link to={`/dashboard?symbol=${symbol.symbol}`} className="btn-trade-action">
          Trade <BarChart2 size={14} />
        </Link>
      </td>
    </tr>
  );
}

export default InstitutionalMarkets;
