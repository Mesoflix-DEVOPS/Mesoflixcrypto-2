import React, { useState, useEffect, useRef } from 'react';
import { Search, Star, TrendingUp, ChevronRight, X, Pin } from 'lucide-react';
import { getApiUrl, fetchWithLogging } from '../config/api';
import { useSocket } from '../context/SocketContext';

const RECOMMENDED_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

function MarketTerminal({ onSelectSymbol }) {
  const { socket, isConnected, subscribeToTicker } = useSocket();
  const [allSymbols, setAllSymbols] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 1. Fetch available symbols for search
        const symbolsRes = await fetchWithLogging(getApiUrl('/api/market/all-symbols'));
        if (symbolsRes.ok) {
          const res = await symbolsRes.json();
          const rawData = res.data || (Array.isArray(res) ? res : []);
          // Normalize: Ensure we have objects with a .symbol property
          const data = rawData.map(s => typeof s === 'string' ? { symbol: s } : s);
          setAllSymbols(data);
        }

        // 2. Fetch User Watchlist
        if (token) {
          const watchRes = await fetchWithLogging(getApiUrl('/api/dashboard/watchlist'), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (watchRes.ok) {
            const res = await watchRes.json();
            setWatchlist(res.data || []);
          }
        }
      } catch (err) {
        console.error('Market init failed', err);
      } finally {
        setLoading(false);
      }
    };

    init();

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time Market Data Bridge - Use Global Socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const visibleSymbols = [...new Set([...RECOMMENDED_SYMBOLS, ...watchlist])];
    visibleSymbols.forEach(symbol => subscribeToTicker(symbol));

    const onTicker = (data) => {
      setPrices(prev => ({
        ...prev,
        [data.symbol]: { ...(prev[data.symbol] || {}), ...data }
      }));
    };

    socket.on('ticker', onTicker);
    return () => {
      socket.off('ticker', onTicker);
    };
  }, [socket, isConnected, watchlist]);

  const handleSearch = (e) => {
    const query = e.target.value.toUpperCase();
    setSearchQuery(query);
    setIsSearching(true);
    
    if (query.length > 0 && Array.isArray(allSymbols)) {
      const filtered = allSymbols
        .filter(s => s.symbol && s.symbol.includes(query))
        .slice(0, 10);
      setSuggestions(filtered);
    } else {
      // Show recommended as "Hot Pairs" when query is empty
      const hotPairs = allSymbols.filter(s => RECOMMENDED_SYMBOLS.includes(s.symbol));
      setSuggestions(hotPairs);
    }
  };

  const onFocusSearch = () => {
    setIsSearching(true);
    if (searchQuery.length === 0) {
      const hotPairs = allSymbols.filter(s => RECOMMENDED_SYMBOLS.includes(s.symbol));
      setSuggestions(hotPairs);
    }
  };

  const toggleWatchlist = async (symbol) => {
    try {
      const token = localStorage.getItem('token');
      const isPinned = watchlist.includes(symbol);
      
      const res = await fetchWithLogging(getApiUrl('/api/dashboard/watchlist/add'), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbol })
      });

      if (!res.ok) {
        if (res.status === 401) {
           console.error('[WATCHLIST] Auth failed. Check if token is valid.');
        }
      } else {
        if (isPinned) {
          setWatchlist(prev => prev.filter(s => s !== symbol));
        } else {
          setWatchlist(prev => [...prev, symbol]);
        }
      }
    } catch (err) {
      console.error('Toggle watchlist failed', err);
    }
  };

  return (
    <div className="market-terminal">
      {/* 1. SEARCH BAR */}
      <div className="discovery-search" ref={searchRef}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search crypto pairs (e.g. BTC, SOL)"
            className="search-input"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={onFocusSearch}
          />
          {searchQuery && <X size={16} className="clear-icon" onClick={() => { setSearchQuery(''); setSuggestions([]); }} />}
        </div>
        
        {isSearching && suggestions.length > 0 && (
          <div className="search-suggestions glass-card">
            <div className="suggestion-header">
               {searchQuery.length > 0 ? 'Search Results' : '🔥 Hottest Pairs'}
            </div>
            {suggestions.map(s => (
              <div key={s.symbol} className="suggestion-item" onClick={() => { onSelectSymbol(s.symbol); setSearchQuery(''); setIsSearching(false); }}>
                <span className="s-symbol">{s.symbol}</span>
                <span className="s-base">{s.base || 'USDT'} Trading</span>
                <ChevronRight size={14} className="s-arrow" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. RECOMMENDED SECTION */}
      <div className="market-section">
        <div className="section-header">
          <TrendingUp size={16} className="section-icon green" />
          <h3>Recommended Pairs</h3>
        </div>
        <div className="symbol-cards-scroll">
          {RECOMMENDED_SYMBOLS.map(symbol => (
             <SymbolCard 
               key={symbol} 
               symbol={symbol} 
               data={prices[symbol]} 
               isPinned={watchlist.includes(symbol)}
               onTogglePin={() => toggleWatchlist(symbol)}
               onSelect={() => onSelectSymbol(symbol)}
             />
          ))}
        </div>
      </div>

      {/* 3. WATCHLIST SECTION */}
      <div className="market-section">
        <div className="section-header">
          <Star size={16} className="section-icon yellow" />
          <h3>Your Watchlist</h3>
        </div>
        {watchlist.length > 0 ? (
          <div className="watchlist-list">
            {watchlist.map(symbol => (
              <WatchlistItem 
                key={symbol}
                symbol={symbol}
                data={prices[symbol]}
                onSelect={() => onSelectSymbol(symbol)}
                onRemove={() => toggleWatchlist(symbol)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-watchlist glass-card">
            <Star size={24} />
            <p>Your watchlist is empty</p>
            <span>Search and star pairs to track them here</span>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .market-terminal { display: flex; flex-direction: column; gap: 32px; }
        
        .discovery-search { position: relative; max-width: 500px; }
        .search-box { 
          display: flex; align-items: center; background: rgba(10, 15, 29, 0.8); 
          border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 14px; padding: 14px 20px;
          gap: 14px; transition: 0.3s;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        .search-box:focus-within { border-color: #10b981; background: rgba(10, 15, 29, 0.9); box-shadow: 0 0 20px rgba(16, 185, 129, 0.1); }
        .search-input { width: 100%; background: transparent; border: none; color: #fff; font-size: 14px; font-weight: 600; outline: none; }
        .search-input::placeholder { color: #475569; font-weight: 500; }
        
        .search-suggestions { 
          position: absolute; top: calc(100% + 10px); left: 0; right: 0; 
          background: rgba(10, 15, 29, 0.95); backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px;
          z-index: 1000; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          padding: 8px;
        }
        .suggestion-header {
           padding: 10px 16px; font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.1em;
        }
        .suggestion-item { 
          padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;
          border-radius: 10px; cursor: pointer; transition: 0.2s;
        }
        .suggestion-item:hover { background: rgba(52, 211, 153, 0.1); color: #34d399; }
        .s-symbol { color: #fff; font-weight: 700; font-size: 14px; }
        .suggestion-item:hover .s-symbol { color: #34d399; }
        .s-base { color: #64748b; font-size: 12px; }
        .s-arrow { color: #2d3748; }

        .market-section { display: flex; flex-direction: column; gap: 16px; }
        .section-header { display: flex; align-items: center; gap: 10px; }
        .section-header h3 { color: #fff; font-size: 15px; font-weight: 700; margin: 0; }
        .section-icon.green { color: #34d399; }
        .section-icon.yellow { color: #fbbf24; }

        .symbol-cards-scroll { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
        .symbol-cards-scroll::-webkit-scrollbar { display: none; }

        .symbol-card { 
          min-width: 220px; background: rgba(22, 27, 44, 0.4); border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px; padding: 16px; cursor: pointer; transition: 0.3s; position: relative;
        }
        .symbol-card:hover { border-color: rgba(52, 211, 153, 0.3); background: rgba(22, 27, 44, 0.6); transform: translateY(-2px); }
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .c-symbol { color: #fff; font-weight: 800; font-size: 16px; }
        .pin-btn { background: transparent; border: none; color: #475569; padding: 4px; cursor: pointer; transition: 0.2s; }
        .pin-btn:hover { color: #fff; }
        .pin-btn.active { color: #34d399; }
        .c-price { display: block; color: #fff; font-size: 20px; font-weight: 800; margin-bottom: 4px; }
        .c-change { font-size: 12px; font-weight: 700; }
        .c-change.up { color: #34d399; }
        .c-change.down { color: #ef4444; }

        .watchlist-list { display: flex; flex-direction: column; gap: 10px; }
        .watchlist-item { 
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(22, 27, 44, 0.4); border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px; padding: 12px 20px; cursor: pointer; transition: 0.2s;
        }
        .watchlist-item:hover { background: rgba(22, 27, 44, 0.6); border-color: rgba(255, 255, 255, 0.1); }
        .w-info { display: flex; align-items: center; gap: 16px; }
        .w-symbol { color: #fff; font-weight: 700; font-size: 14px; }
        .w-price { color: #34d399; font-weight: 700; font-size: 14px; }
        .w-actions { display: flex; align-items: center; gap: 12px; }
        .w-remove { color: #475569; padding: 4px; cursor: pointer; transition: 0.2s; }
        .w-remove:hover { color: #ef4444; }

        .empty-watchlist { 
          padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
          color: #475569; background: rgba(22, 27, 44, 0.2);
        }
        .empty-watchlist p { color: #fff; font-weight: 700; margin: 0; }
        .empty-watchlist span { font-size: 12px; }

        @media (max-width: 768px) {
          .symbol-card { min-width: 180px; }
        }
      `}} />
    </div>
  );
}

function SymbolCard({ symbol, data, isPinned, onTogglePin, onSelect }) {
  const price = data ? parseFloat(data.lastPrice).toLocaleString() : '...';
  const change = data ? (parseFloat(data.price24hPcnt) * 100).toFixed(2) : '0.00';
  const isUp = parseFloat(change) >= 0;

  return (
    <div className="symbol-card shadow-lg" onClick={onSelect}>
      <div className="card-top">
        <span className="c-symbol">{symbol}</span>
        <button 
          className={`pin-btn ${isPinned ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
        >
          <Pin size={16} />
        </button>
      </div>
      <span className="c-price">${price}</span>
      <span className={`c-change ${isUp ? 'up' : 'down'}`}>
        {isUp ? '▲' : '▼'} {change}%
      </span>
    </div>
  );
}

function WatchlistItem({ symbol, data, onSelect, onRemove }) {
  const price = data ? parseFloat(data.lastPrice).toLocaleString() : '...';
  const change = data ? (parseFloat(data.price24hPcnt) * 100).toFixed(2) : '0.00';
  const isUp = parseFloat(change) >= 0;

  return (
    <div className="watchlist-item" onClick={onSelect}>
      <div className="w-info">
        <span className="w-symbol">{symbol}</span>
        <span className={`c-change ${isUp ? 'up' : 'down'}`} style={{fontSize: '11px'}}>
          {isUp ? '▲' : '▼'} {change}%
        </span>
      </div>
      <div className="w-actions">
        <span className="w-price">${price}</span>
        <div className="w-remove" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          <X size={14} />
        </div>
      </div>
    </div>
  );
}

export default MarketTerminal;
