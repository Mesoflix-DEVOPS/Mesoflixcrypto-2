import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { 
  TrendingUp, 
  Activity, 
  BarChart2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Info,
  ChevronDown,
  Settings as SettingsIcon,
  Search,
  Bell,
  MessageSquare,
  Star,
  Pin,
  ChevronRight,
  Maximize2,
  Clock,
  Zap,
  Globe
} from 'lucide-react';

import MarketTerminal from '../components/MarketTerminal';
import { getApiUrl, fetchWithLogging } from '../config/api';

/**
 * High-Stability Terminal Chart Component
 */
function CustomTradingChart({ symbol }) {
  const chartContainerRef = useRef();
  const chartInstance = useRef(null);
  const seriesInstance = useRef(null);
  const resizeObserver = useRef(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Robust initialization logic
  useEffect(() => {
    let isMounted = true;
    const scriptId = 'lightweight-charts-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js';
      script.async = true;
      document.body.appendChild(script);
    }

    const init = async () => {
      if (!window.LightweightCharts || !chartContainerRef.current || !isMounted) return;

      // Ensure previous instance is fully gone
      if (chartInstance.current) {
        try {
          chartInstance.current.remove();
        } catch (e) {
          console.warn('Silent chart cleanup error', e);
        }
        chartInstance.current = null;
      }

      setIsInitializing(true);

      const chart = window.LightweightCharts.createChart(chartContainerRef.current, {
        layout: {
          background: { color: 'transparent' },
          textColor: '#94a3b8',
          fontSize: 10,
          fontFamily: 'Instrument Sans, sans-serif'
        },
        grid: {
          vertLines: { color: 'rgba(148, 163, 184, 0.05)' },
          horzLines: { color: 'rgba(148, 163, 184, 0.05)' },
        },
        crosshair: {
            mode: 0,
            vertLine: { color: '#10b981', width: 0.5, style: 2 },
            horzLine: { color: '#10b981', width: 0.5, style: 2 },
        },
        rightPriceScale: { 
            borderColor: 'rgba(255, 255, 255, 0.05)',
            scaleMargins: { top: 0.3, bottom: 0.25 }
        },
        timeScale: { 
            borderColor: 'rgba(255, 255, 255, 0.05)',
            timeVisible: true 
        },
        handleScroll: true,
        handleScale: true,
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      chartInstance.current = chart;
      seriesInstance.current = candlestickSeries;

      // Initial Fetch
      try {
        const res = await fetchWithLogging(getApiUrl(`/api/market/kline/${symbol}?interval=15&limit=150`));
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.list && seriesInstance.current) {
            const formatted = data.list.map(item => ({
              time: parseInt(item[0]) / 1000,
              open: parseFloat(item[1]),
              high: parseFloat(item[2]),
              low: parseFloat(item[3]),
              close: parseFloat(item[4]),
            })).reverse();
            seriesInstance.current.setData(formatted);
            chart.timeScale().fitContent();
          }
        }
      } catch (e) {
        console.error('History fetch failed', e);
      }

      setIsInitializing(false);

      // Handle Resize with Guard
      resizeObserver.current = new ResizeObserver(entries => {
        if (isMounted && chartInstance.current && entries[0].contentRect) {
          try {
            chartInstance.current.applyOptions({
              width: entries[0].contentRect.width,
              height: entries[0].contentRect.height
            });
          } catch (err) {
            // Silently catch disposal race conditions
          }
        }
      });
      resizeObserver.current.observe(chartContainerRef.current);
    };

    if (window.LightweightCharts) {
      init();
    } else {
      script.onload = init;
    }

    return () => {
      isMounted = false;
      if (resizeObserver.current) resizeObserver.current.disconnect();
      if (chartInstance.current) {
          try {
            chartInstance.current.remove();
          } catch (e) {}
          chartInstance.current = null;
      }
    };
  }, [symbol]);

  return (
    <div className="relative w-full h-full min-h-[450px]">
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#060a14]/50 z-10 backdrop-blur-sm">
           <RefreshCw className="animate-spin text-emerald-500" size={24} />
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}

export default function BybitDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tradingMode } = useOutletContext();
  const paramSymbol = searchParams.get('symbol') || 'BTCUSDT';
  
  const [user, setUser] = useState(null);
  const [activeSymbol, setActiveSymbol] = useState(paramSymbol);
  const [activePrice, setActivePrice] = useState(0);
  const [tickerData, setTickerData] = useState(null);
  const [balance, setBalance] = useState(null);
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Execution State
  const [activeSide, setActiveSide] = useState('BUY'); // BUY | SELL
  const [orderType, setOrderType] = useState('Market'); // Market | Limit
  const [qty, setQty] = useState('0.1');
  const [leverage, setLeverage] = useState('10');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_profile');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      fetchAccountData(parsed.id);
    }
  }, [tradingMode]);

  useEffect(() => {
    if (paramSymbol && paramSymbol !== activeSymbol) {
      setActiveSymbol(paramSymbol);
    }
  }, [paramSymbol]);

  const fetchAccountData = async (userId) => {
    try {
      const response = await fetchWithLogging(getApiUrl(`/api/bybit/dashboard/${userId}?environment=${tradingMode}`));
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
        setPositions(data.positions);
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Account data fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    const fetchTicker = async () => {
      try {
        const res = await fetch(getApiUrl(`/api/market/ticker/${activeSymbol}`));
        if (res.ok) {
          const data = await res.json();
          setTickerData(data);
          setActivePrice(parseFloat(data.lastPrice));
        }
      } catch (e) {}
    };

    fetchTicker();
    intervalId = setInterval(fetchTicker, 2000);
    return () => clearInterval(intervalId);
  }, [activeSymbol]);

  const handleSelectSymbol = (symbol) => {
    setSearchParams({ symbol });
    setActiveSymbol(symbol);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      setOrderStatus({ success: false, msg: 'Session expired. Please sign in.' });
      return;
    }
    
    setOrderLoading(true);
    setOrderStatus(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Missing auth token');

      const res = await fetchWithLogging(getApiUrl('/api/bybit/order'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          symbol: activeSymbol,
          side: activeSide,
          qty,
          orderType,
          leverage,
          environment: tradingMode,
          price: orderType === 'Limit' ? activePrice : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setOrderStatus({ success: true, msg: 'Order placed successfully!' });
      } else {
        setOrderStatus({ success: false, msg: data.error || 'Execution failed' });
      }
    } catch (err) {
      setOrderStatus({ success: false, msg: err.message || 'Execution error' });
    } finally {
      setOrderLoading(false);
      setTimeout(() => setOrderStatus(null), 5000);
      fetchAccountData(user.id);
    }
  };

  const priceColor = parseFloat(tickerData?.price24hPcnt) >= 0 ? 'text-emerald-500' : 'text-rose-500';

  return (
    <div className="bybit-dashboard-container p-6 bg-[#05050a] min-h-screen font-instrument">
      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
        .panel-card { background: #0b0f1a; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; position: relative; }
        
        .chart-header-bar { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .h-pair-info { display: flex; align-items: center; gap: 12px; }
        .h-price { font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 18px; }
        .h-change { font-size: 11px; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
        .h-change.up { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .h-change.down { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .ticker-metrics { display: flex; gap: 24px; }
        .m-item { display: flex; flex-direction: column; }
        .m-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .m-value { font-size: 12px; font-weight: 700; color: #cbd5e1; margin-top: 2px; }

        /* Terminal Overhaul styles */
        .terminal-header { display: flex; padding: 4px; background: #060a14; border-radius: 10px; margin: 16px; border: 1px solid rgba(255,255,255,0.05); }
        .side-tab { flex: 1; padding: 10px; border: none; border-radius: 7px; font-size: 11px; font-weight: 900; color: #475569; background: transparent; cursor: pointer; transition: 0.2s; text-transform: uppercase; }
        .side-tab.active-buy { background: #10b981; color: #000; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        .side-tab.active-sell { background: #ef4444; color: #fff; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
        
        .terminal-form { padding: 0 16px 16px 16px; display: flex; flex-direction: column; gap: 16px; }
        .field-group { display: flex; flex-direction: column; gap: 8px; }
        .field-header { display: flex; justify-content: space-between; align-items: center; }
        .field-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .field-sub { font-size: 10px; font-weight: 700; color: #475569; }
        
        .field-input-wrap { background: #060a14; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; display: flex; align-items: center; padding: 0 16px; height: 50px; transition: 0.2s; }
        .field-input-wrap:focus-within { border-color: #10b981; background: #080d1a; }
        .field-input { background: transparent; border: none; outline: none; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; width: 100%; height: 100%; }
        .field-unit { font-size: 11px; font-weight: 800; color: #475569; }

        .segment-control { display: flex; background: #060a14; border-radius: 8px; padding: 3px; border: 1px solid rgba(255,255,255,0.03); }
        .segment-btn { flex: 1; padding: 6px; border: none; border-radius: 6px; font-size: 10px; font-weight: 800; color: #475569; background: transparent; cursor: pointer; text-transform: uppercase; }
        .segment-btn.active { background: #1e293b; color: #fff; }

        .leverage-slider { width: 100%; height: 6px; -webkit-appearance: none; background: #060a14; border-radius: 3px; outline: none; margin: 10px 0; }
        .leverage-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: #10b981; border-radius: 50%; cursor: pointer; border: 3px solid #0b0f1a; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }

        .place-order-btn { width: 100%; padding: 18px; border-radius: 10px; border: none; font-weight: 900; font-size: 13px; text-transform: uppercase; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .place-order-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-buy { background: #10b981; color: #000; }
        .btn-sell { background: #ef4444; color: #fff; }

        .order-status-msg { margin: 16px; padding: 12px; border-radius: 10px; font-size: 11px; font-weight: 800; text-align: center; }
        .msg-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.1); }
        .msg-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.1); }

        @media (max-width: 1000px) { .dashboard-main-grid { grid-template-columns: 1fr; } }
      `}} />

      <div className="discovery-wrapper mb-6">
        <MarketTerminal onSelectSymbol={handleSelectSymbol} />
      </div>

      <div className="dashboard-main-grid">
        <div className="left-content flex flex-col gap-5">
          <div className="panel-card flex-1 min-h-[500px]">
             <div className="chart-header-bar">
                <div className="h-pair-info">
                   <div className="bg-[#10b981]/10 p-2 rounded-lg"><TrendingUp size={20} className="text-emerald-500"/></div>
                   <span className="text-xl font-black text-white tracking-tighter uppercase">{activeSymbol}</span>
                   <div className={`h-price ${priceColor}`}>${activePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                   <div className={`h-change ${parseFloat(tickerData?.price24hPcnt) >= 0 ? 'up' : 'down'}`}>
                     {(parseFloat(tickerData?.price24hPcnt || 0) * 100).toFixed(2)}%
                   </div>
                </div>
                <div className="ticker-metrics hidden lg:flex">
                   <div className="m-item">
                     <span className="m-label">24h High</span>
                     <span className="m-value">${parseFloat(tickerData?.highPrice24h || 0).toLocaleString()}</span>
                   </div>
                   <div className="m-item">
                     <span className="m-label">24h Low</span>
                     <span className="m-value">${parseFloat(tickerData?.lowPrice24h || 0).toLocaleString()}</span>
                   </div>
                   <div className="m-item">
                     <span className="m-label">24h Turnover</span>
                     <span className="m-value">${(parseFloat(tickerData?.turnover24h || 0) / 1e6).toFixed(1)}M</span>
                   </div>
                </div>
             </div>
             <div className="chart-viewport h-[500px]">
                <CustomTradingChart symbol={activeSymbol} />
             </div>
          </div>

          <div className="panel-card bg-gradient-to-br from-[#0b0f1a] to-[#060a14] p-6">
             <div className="flex justify-between items-center">
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-2">Total Node Equity ({tradingMode})</span>
                   <div className="text-3xl font-black text-white tracking-tight font-mono">
                     {balance ? `$${parseFloat(balance.totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
                    </div>
                </div>
                <div className="flex gap-12">
                   <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-600 mb-1 block">Available</span>
                      <span className="text-emerald-400 font-mono font-black text-lg">
                        {balance ? `$${parseFloat(balance.totalAvailableBalance).toLocaleString()}` : '--'}
                      </span>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-600 mb-1 block">Wallet</span>
                      <span className="text-slate-400 font-mono font-black text-lg">
                        {balance ? `$${parseFloat(balance.totalWalletBalance).toLocaleString()}` : '--'}
                      </span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="right-content">
          <div className="panel-card h-full flex flex-col border-[#10b981]/10 shadow-2xl">
            <div className="terminal-header">
               <button 
                 className={`side-tab ${activeSide === 'BUY' ? 'active-buy' : ''}`}
                 onClick={() => setActiveSide('BUY')}
               >Long</button>
               <button 
                 className={`side-tab ${activeSide === 'SELL' ? 'active-sell' : ''}`}
                 onClick={() => setActiveSide('SELL')}
               >Short</button>
            </div>

            {orderStatus && (
              <div className={`order-status-msg ${orderStatus.success ? 'msg-success' : 'msg-error'}`}>
                 {orderStatus.msg}
              </div>
            )}

            <div className="terminal-form">
               <div className="field-group">
                  <div className="field-header">
                     <span className="field-label">Order Type</span>
                  </div>
                  <div className="segment-control">
                     <button 
                       className={`segment-btn ${orderType === 'Limit' ? 'active' : ''}`}
                       onClick={() => setOrderType('Limit')}
                     >Limit</button>
                     <button 
                       className={`segment-btn ${orderType === 'Market' ? 'active' : ''}`}
                       onClick={() => setOrderType('Market')}
                     >Market</button>
                  </div>
               </div>

               <div className="field-group">
                  <div className="field-header">
                     <span className="field-label">Quantity</span>
                     <span className="field-sub">Max: {balance ? (parseFloat(balance.totalAvailableBalance) / activePrice).toFixed(4) : '0'}</span>
                  </div>
                  <div className="field-input-wrap">
                     <input 
                       className="field-input" 
                       value={qty} 
                       onChange={(e) => setQty(e.target.value)} 
                     />
                     <span className="field-unit">{activeSymbol.replace('USDT', '')}</span>
                  </div>
               </div>

               {orderType === 'Limit' && (
                 <div className="field-group">
                    <div className="field-header">
                       <span className="field-label">Price</span>
                    </div>
                    <div className="field-input-wrap">
                       <input 
                         className="field-input" 
                         value={activePrice.toFixed(2)} 
                         disabled
                       />
                       <span className="field-unit">USDT</span>
                    </div>
                 </div>
               )}

               <div className="field-group">
                  <div className="field-header">
                     <span className="field-label">Leverage</span>
                     <span className="field-sub">{leverage}x Isolated</span>
                  </div>
                  <input 
                    type="range" 
                    className="leverage-slider"
                    min="1" 
                    max="100" 
                    value={leverage} 
                    onChange={(e) => setLeverage(e.target.value)}
                  />
               </div>

               <button 
                 className={`place-order-btn ${activeSide === 'BUY' ? 'btn-buy' : 'btn-sell'}`}
                 onClick={handlePlaceOrder}
                 disabled={orderLoading}
               >
                 <Zap size={14} className="inline mr-2" />
                 {orderLoading ? 'Processing...' : `Place ${activeSide === 'BUY' ? 'Long' : 'Short'}`}
               </button>

               <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                     <span className="text-[9px] uppercase font-bold text-slate-600 mb-1">Spread</span>
                     <span className="text-emerald-500 font-mono text-[13px] font-bold">0.01 (0.00%)</span>
                  </div>
                  <div className="text-right flex flex-col">
                     <span className="text-[9px] uppercase font-bold text-slate-600 mb-1">Funding Rate</span>
                     <span className="text-slate-400 font-mono text-[13px] font-bold">0.0100%</span>
                  </div>
               </div>
            </div>

            <div className="mt-auto p-4 bg-[#060a14] border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                   <Globe size={12} className="text-blue-500" />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Network Engine</span>
                </div>
                <div className="flex justify-between text-[11px]">
                   <span className="text-slate-500">Node Env</span>
                   <span className={tradingMode === 'REAL' ? 'text-emerald-500 font-black' : 'text-amber-500 font-black'}>{tradingMode}</span>
                </div>
                <div className="flex justify-between text-[11px] mt-1">
                   <span className="text-slate-500">Latency</span>
                   <span className="text-emerald-500 font-black">~38ms</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
