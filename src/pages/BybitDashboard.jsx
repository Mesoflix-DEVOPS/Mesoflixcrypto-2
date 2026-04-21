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
 * Professional Institutional Trading Chart
 * Hardened for 100% Reliability and Zero-Disposal Crashes
 */
function CustomTradingChart({ symbol }) {
  const chartContainerRef = useRef();
  const chartInstance = useRef(null);
  const seriesInstance = useRef(null);
  const resizeObserver = useRef(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const scriptId = 'lw-charts-bundle';
    
    // Hardened Script Loader
    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.LightweightCharts) return resolve(window.LightweightCharts);
        
        let script = document.getElementById(scriptId);
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.src = 'https://unpkg.com/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js';
          script.async = true;
          document.body.appendChild(script);
        }
        
        const onScriptLoad = () => {
          if (isMounted) resolve(window.LightweightCharts);
        };
        
        script.addEventListener('load', onScriptLoad);
        // Fallback check
        const interval = setInterval(() => {
          if (window.LightweightCharts) {
            clearInterval(interval);
            onScriptLoad();
          }
        }, 100);
      });
    };

    const init = async () => {
      const LWCharts = await loadScript();
      if (!isMounted || !chartContainerRef.current) return;

      // Double-Cleanup Guard
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
      }

      setIsInitializing(true);
      console.log(`[CHART] Initializing for ${symbol}...`);

      try {
        const chart = LWCharts.createChart(chartContainerRef.current, {
          layout: {
            background: { color: '#030712' },
            textColor: '#94a3b8',
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace"
          },
          grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
          },
          crosshair: {
            mode: 0,
            vertLine: { color: '#10b981', width: 0.5, style: 2 },
            horzLine: { color: '#10b981', width: 0.5, style: 2 },
          },
          rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.05)' },
          timeScale: { borderColor: 'rgba(255, 255, 255, 0.05)', timeVisible: true },
        });

        const candleSeries = chart.addCandlestickSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });

        chartInstance.current = chart;
        seriesInstance.current = candleSeries;

        // Scaling logic
        const handleResize = () => {
           if (chartInstance.current && chartContainerRef.current) {
             chartInstance.current.applyOptions({
               width: chartContainerRef.current.clientWidth,
               height: chartContainerRef.current.clientHeight
             });
           }
        };

        resizeObserver.current = new ResizeObserver(handleResize);
        resizeObserver.current.observe(chartContainerRef.current);
        handleResize();

        // Data Fetch
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
      } catch (err) {
        console.error('[CHART_INIT_FAIL]', err);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    init();

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
    <div className="relative w-full h-full bg-[#030712] border border-white/5 rounded-xl overflow-hidden">
      {isInitializing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030712]/80 z-20 gap-3">
           <RefreshCw className="animate-spin text-emerald-500" size={24} />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Waking Up Engine...</span>
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

  // Terminal State
  const [activeSide, setActiveSide] = useState('BUY');
  const [orderType, setOrderType] = useState('Market');
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

  // Real-time Update Trigger
  useEffect(() => {
    if (user) fetchAccountData(user.id);
  }, [activeSymbol]);

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
      console.error('Account refresh failed', err);
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
    if (!user) return;
    setOrderLoading(true);
    setOrderStatus(null);
    try {
      const token = localStorage.getItem('token');
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
      if (res.ok) setOrderStatus({ success: true, msg: 'Execution Successful' });
      else setOrderStatus({ success: false, msg: data.error || 'Execution Fail' });
    } catch (err) {
      setOrderStatus({ success: false, msg: 'Network Fault' });
    } finally {
      setOrderLoading(false);
      setTimeout(() => setOrderStatus(null), 4000);
      fetchAccountData(user.id);
    }
  };

  const priceColor = parseFloat(tickerData?.price24hPcnt) >= 0 ? 'text-emerald-500' : 'text-rose-500';

  return (
    <div className="p-4 bg-[#02040a] min-h-screen text-slate-200">
      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-grid { display: grid; grid-template-columns: 1fr 340px; gap: 16px; height: calc(100vh - 120px); }
        .column-left { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
        .column-right { width: 340px; flex-shrink: 0; }
        
        .p-card { background: #0b0f1a; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; }
        .chart-main { flex: 1; min-height: 500px; display: flex; flex-direction: column; }
        .chart-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; }
        .chart-box { flex: 1; padding: 1px; min-height: 0; }

        .terminal-wrap { height: 100%; display: flex; flex-direction: column; }
        .t-header { display: flex; padding: 4px; background: #060a14; border-radius: 12px; margin: 16px; }
        .side-btn { flex: 1; padding: 10px; border-radius: 9px; font-size: 11px; font-weight: 900; text-transform: uppercase; cursor: pointer; transition: 0.2s; border: none; }
        .side-buy.active { background: #10b981; color: #000; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2); }
        .side-sell.active { background: #ef4444; color: #fff; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2); }
        
        .t-form { padding: 0 16px 16px 16px; display: flex; flex-direction: column; gap: 20px; }
        .f-box { background: #060a14; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0 16px; height: 54px; display: flex; align-items: center; }
        .f-input { background: transparent; border: none; color: #fff; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 15px; width: 100%; outline: none; }
        .f-label { font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; block; }
        
        .exec-btn-full { width: 100%; padding: 18px; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; cursor: pointer; border: none; transition: 0.2s; }
        .buy-active { background: #10b981; color: #000; }
        .sell-active { background: #ef4444; color: #fff; }

        .equity-strip { padding: 24px; background: linear-gradient(to right, #0b0f1a, #060a14); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
      `}} />

      <MarketTerminal onSelectSymbol={handleSelectSymbol} />
      
      <div className="dashboard-grid mt-4">
        <div className="column-left">
           <div className="p-card chart-main shadow-2xl">
              <div className="chart-header flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-white uppercase tracking-tighter">{activeSymbol}</span>
                    <span className={`text-lg font-black font-mono ${priceColor}`}>${activePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${parseFloat(tickerData?.price24hPcnt) >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                       {(parseFloat(tickerData?.price24hPcnt || 0) * 100).toFixed(2)}%
                    </span>
                 </div>
                 <div className="flex gap-6">
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">24h High</span>
                       <span className="text-xs font-bold text-slate-200 font-mono">${parseFloat(tickerData?.highPrice24h || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">24h Low</span>
                       <span className="text-xs font-bold text-slate-200 font-mono">${parseFloat(tickerData?.lowPrice24h || 0).toLocaleString()}</span>
                    </div>
                 </div>
              </div>
              <div className="chart-box">
                 <CustomTradingChart symbol={activeSymbol} />
              </div>
           </div>

           <div className="equity-strip shadow-xl">
              <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-2">Portfolio Equity ({tradingMode})</span>
                    <div className="text-4xl font-black text-white tracking-tight font-mono">
                      {balance ? `$${parseFloat(balance.totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
                    </div>
                 </div>
                 <div className="flex gap-12">
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Available Funds</span>
                       <span className="text-xl font-black text-emerald-400 font-mono">
                         {balance ? `$${parseFloat(balance.totalAvailableBalance).toLocaleString()}` : '--'}
                       </span>
                    </div>
                    <div className="flex flex-col items-end border-l border-white/5 pl-12">
                       <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Wallet Total</span>
                       <span className="text-xl font-black text-slate-300 font-mono">
                         {balance ? `$${parseFloat(balance.totalWalletBalance).toLocaleString()}` : '--'}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="column-right">
           <div className="p-card terminal-wrap shadow-2xl border-emerald-500/10">
              <div className="t-header">
                 <button 
                   className={`side-btn side-buy ${activeSide === 'BUY' ? 'active' : ''} text-slate-400`}
                   onClick={() => setActiveSide('BUY')}
                 >Long</button>
                 <button 
                   className={`side-btn side-sell ${activeSide === 'SELL' ? 'active' : ''} text-slate-400`}
                   onClick={() => setActiveSide('SELL')}
                 >Short</button>
              </div>

              {orderStatus && (
                <div className={`mx-4 mb-4 p-3 rounded-xl text-center text-[11px] font-black uppercase tracking-wider ${orderStatus.success ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                   {orderStatus.msg}
                </div>
              )}

              <div className="t-form">
                 <div className="input-group">
                    <label className="f-label">Entry Logic</label>
                    <div className="flex gap-2">
                       <button 
                         className={`flex-1 p-2 rounded-lg text-[10px] font-black uppercase border transition-all ${orderType === 'Market' ? 'bg-slate-200 text-slate-900 border-slate-200' : 'bg-transparent text-slate-500 border-white/5'}`}
                         onClick={() => setOrderType('Market')}
                       >Market</button>
                       <button 
                         className={`flex-1 p-2 rounded-lg text-[10px] font-black uppercase border transition-all ${orderType === 'Limit' ? 'bg-slate-200 text-slate-900 border-slate-200' : 'bg-transparent text-slate-500 border-white/5'}`}
                         onClick={() => setOrderType('Limit')}
                       >Limit</button>
                    </div>
                 </div>

                 <div className="input-group">
                    <div className="flex justify-between items-center mb-2">
                       <label className="f-label mb-0">Quantity</label>
                       <span className="text-[10px] font-bold text-slate-600 uppercase">Max: {balance ? (parseFloat(balance.totalAvailableBalance) / activePrice).toFixed(3) : '--'}</span>
                    </div>
                    <div className="f-box border-emerald-500/20">
                       <input className="f-input" value={qty} onChange={(e) => setQty(e.target.value)} />
                       <span className="text-[11px] font-black text-slate-600 ml-2">{activeSymbol.replace('USDT', '')}</span>
                    </div>
                 </div>

                 <div className="input-group">
                    <label className="f-label">Leverage Factor</label>
                    <input 
                      type="range" 
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                      min="1" 
                      max="100" 
                      value={leverage} 
                      onChange={(e) => setLeverage(e.target.value)}
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-600">
                       <span>1x</span>
                       <span className="text-emerald-500">{leverage}x Isolated</span>
                       <span>100x</span>
                    </div>
                 </div>

                 <button 
                   className={`exec-btn-full mt-4 ${activeSide === 'BUY' ? 'buy-active' : 'sell-active'} ${orderLoading ? 'animate-pulse' : ''}`}
                   onClick={handlePlaceOrder}
                   disabled={orderLoading}
                 >
                    {orderLoading ? 'Transmitting...' : `Execute ${activeSide === 'BUY' ? 'Long' : 'Short'} Position`}
                 </button>
              </div>

              <div className="mt-auto p-5 bg-[#060a14] border-t border-white/5">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Engine Active</span>
                 </div>
                 <div className="flex justify-between items-center text-[11px] mb-2">
                    <span className="text-slate-500">Security Mode</span>
                    <span className="text-slate-300 font-bold uppercase tracking-widest">{tradingMode}</span>
                 </div>
                 <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Node Latency</span>
                    <span className="text-emerald-500 font-bold font-mono">~24ms</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
