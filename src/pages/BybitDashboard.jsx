import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { 
  TrendingUp, 
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
 * Institutional Terminal Chart Engine
 */
function CustomTradingChart({ symbol }) {
  const chartContainerRef = useRef();
  const chartInstance = useRef(null);
  const seriesInstance = useRef(null);
  const resizeObserver = useRef(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.LightweightCharts) return resolve(window.LightweightCharts);
        const scriptId = 'lw-charts-bundle';
        let script = document.getElementById(scriptId);
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.src = 'https://unpkg.com/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js';
          script.async = true;
          document.body.appendChild(script);
        }
        const onScriptLoad = () => { if (isMounted) resolve(window.LightweightCharts); };
        script.addEventListener('load', onScriptLoad);
        const interval = setInterval(() => { if (window.LightweightCharts) { clearInterval(interval); onScriptLoad(); } }, 100);
      });
    };

    const init = async () => {
      const LWCharts = await loadScript();
      if (!isMounted || !chartContainerRef.current) return;
      if (chartInstance.current) { chartInstance.current.remove(); chartInstance.current = null; }

      setIsInitializing(true);
      try {
        const chart = LWCharts.createChart(chartContainerRef.current, {
          layout: { background: { color: '#030712' }, textColor: '#94a3b8', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" },
          grid: { vertLines: { color: '#111827' }, horzLines: { color: '#111827' } },
          crosshair: { mode: 0, vertLine: { color: '#10b981', width: 0.5, style: 2 }, horzLine: { color: '#10b981', width: 0.5, style: 2 } },
          rightPriceScale: { borderColor: '#1f2937', scaleMargins: { top: 0.1, bottom: 0.1 } },
          timeScale: { borderColor: '#1f2937', barSpacing: 12 },
        });

        const candleSeries = chart.addCandlestickSeries({
          upColor: '#10b981', downColor: '#ef4444', borderVisible: false, wickUpColor: '#10b981', wickDownColor: '#ef4444'
        });

        chartInstance.current = chart;
        seriesInstance.current = candleSeries;

        resizeObserver.current = new ResizeObserver(() => {
           if (chartInstance.current && chartContainerRef.current) {
             chartInstance.current.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
           }
        });
        resizeObserver.current.observe(chartContainerRef.current);

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
      } catch (err) { console.error('[CHART_INIT_FAIL]', err); } finally { if (isMounted) setIsInitializing(false); }
    };
    init();
    return () => { isMounted = false; if (resizeObserver.current) resizeObserver.current.disconnect(); if (chartInstance.current) { try { chartInstance.current.remove(); } catch (e) {} } };
  }, [symbol]);

  return (
    <div className="relative w-full h-full bg-[#030712] border border-[#1e293b] rounded-lg overflow-hidden">
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#030712]/90 z-20">
           <RefreshCw className="animate-spin text-emerald-500" size={18} />
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
    } catch (err) { console.error('Account refresh failed', err); } finally { setLoading(false); }
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
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
        setOrderStatus({ success: false, msg: 'Auth token missing' });
        return;
    }
    setOrderLoading(true);
    setOrderStatus(null);
    try {
      const res = await fetchWithLogging(getApiUrl('/api/bybit/order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ symbol: activeSymbol, side: activeSide, qty, orderType, leverage, environment: tradingMode, price: orderType === 'Limit' ? activePrice : undefined })
      });
      const data = await res.json();
      if (res.ok) setOrderStatus({ success: true, msg: 'Order Complete' });
      else setOrderStatus({ success: false, msg: data.error || 'Execution Fail' });
    } catch (err) { setOrderStatus({ success: false, msg: 'Auth Error' }); } finally { setOrderLoading(false); setTimeout(() => setOrderStatus(null), 4000); fetchAccountData(user.id); }
  };

  const priceColor = parseFloat(tickerData?.price24hPcnt) >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="p-4 bg-[#02040a] min-h-screen text-slate-400 font-sans selection:bg-emerald-500/20">
      <style dangerouslySetInnerHTML={{ __html: `
        .main-scaffold { display: grid; grid-template-columns: 1fr 340px; gap: 24px; min-height: 800px; }
        .col-left { display: flex; flex-direction: column; gap: 24px; min-width: 0; }
        .col-right { width: 340px; flex-shrink: 0; }
        
        @media (max-width: 1100px) {
          .main-scaffold { grid-template-columns: 1fr; }
          .col-right { width: 100%; order: 1; }
          .col-left { order: 2; }
        }

        .box-panel { background: #0b111e; border: 1px solid #1f2937; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
        .chart-section { min-height: 650px; display: flex; flex-direction: column; }
        
        .exec-tabs { display: flex; padding: 4px; background: #030712; border-radius: 8px; margin: 16px; border: 1px solid #1f2937; height: 44px; align-items: center; }
        .tab-trigger { flex: 1; height: 100%; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; border: none; background: transparent; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .tab-buy.active { background: #10b981; color: #000; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2); }
        .tab-sell.active { background: #ef4444; color: #fff; box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2); }
        
        .exec-form { padding: 0 20px 24px 20px; display: flex; flex-direction: column; gap: 20px; flex: 1; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-wrap { background: #030712; border: 1px solid #1f2937; border-radius: 8px; padding: 12px 16px; min-height: 52px; display: flex; align-items: center; transition: 0.2s; }
        .input-wrap:focus-within { border-color: #3b82f6; background: #050810; box-shadow: 0 0 15px rgba(59, 130, 246, 0.1); }
        .input-field { background: transparent; border: none; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; width: 100%; outline: none; }
        .label-text { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
        
        .primary-btn { width: 100%; padding: 18px; border-radius: 10px; font-weight: 900; font-size: 14px; text-transform: uppercase; cursor: pointer; border: none; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .btn-green { background: #10b981; color: #000; }
        .btn-red { background: #ef4444; color: #fff; }
        .primary-btn:active { transform: scale(0.97); }

        .equity-footer { padding: 24px 32px; background: #0b111e; border: 1px solid #1f2937; border-radius: 12px; }
        .chart-header { padding: 20px 24px; border-bottom: 1px solid #1f2937; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; }
        .chart-box { flex: 1; padding: 12px; min-height: 550px; }

        @media (max-width: 768px) {
          .chart-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .chart-box { min-height: 450px; }
          .equity-footer .justify-between { flex-direction: column; gap: 24px; align-items: flex-start; }
          .equity-footer .flex-col.items-end { align-items: flex-start; border-left: none !important; padding-left: 0 !important; margin-top: 12px; }
        }
      `}} />

      <MarketTerminal onSelectSymbol={handleSelectSymbol} />
      
      <div className="main-scaffold mt-4">
        <div className="col-left">
           <div className="box-panel chart-section shadow-lg">
              <div className="chart-header">
                 <div className="flex items-center gap-6">
                    <span className="text-xl font-black text-white uppercase tracking-tighter">{activeSymbol}</span>
                    <span className={`text-xl font-mono font-black ${priceColor}`}>${activePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${parseFloat(tickerData?.price24hPcnt) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                       {(parseFloat(tickerData?.price24hPcnt || 0) * 100).toFixed(2)}%
                    </span>
                 </div>
                 <div className="flex gap-8">
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] font-bold text-slate-500 uppercase">24h High</span>
                       <span className="text-xs font-bold text-slate-300 font-mono">${parseFloat(tickerData?.highPrice24h || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] font-bold text-slate-500 uppercase">24h Low</span>
                       <span className="text-xs font-bold text-slate-300 font-mono">${parseFloat(tickerData?.lowPrice24h || 0).toLocaleString()}</span>
                    </div>
                 </div>
              </div>
              <div className="chart-box">
                 <CustomTradingChart symbol={activeSymbol} />
              </div>
           </div>

           <div className="equity-footer shadow-lg">
              <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-1">Node Equity ({tradingMode})</span>
                    <div className="text-3xl font-black text-white tracking-tight font-mono">
                      {balance ? `$${parseFloat(balance.totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
                    </div>
                 </div>
                 <div className="flex gap-12">
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] uppercase font-bold text-slate-600 mb-1">Available balance</span>
                       <span className="text-xl font-black text-emerald-400 font-mono">
                         {balance ? `$${parseFloat(balance.totalAvailableBalance).toLocaleString()}` : '--'}
                       </span>
                    </div>
                    <div className="flex flex-col items-end border-l border-[#1f2937] pl-12">
                       <span className="text-[10px] uppercase font-bold text-slate-600 mb-1">Wallet Total</span>
                       <span className="text-xl font-black text-slate-400 font-mono">
                         {balance ? `$${parseFloat(balance.totalWalletBalance).toLocaleString()}` : '--'}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="col-right">
           <div className="box-panel h-full shadow-2xl border border-emerald-500/5">
              <div className="exec-tabs">
                 <button className={`tab-trigger tab-buy ${activeSide === 'BUY' ? 'active' : ''}`} onClick={() => setActiveSide('BUY')}>Long</button>
                 <button className={`tab-trigger tab-sell ${activeSide === 'SELL' ? 'active' : ''}`} onClick={() => setActiveSide('SELL')}>Short</button>
              </div>

              {orderStatus && (
                <div className={`mx-4 mb-4 p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-wider ${orderStatus.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                   {orderStatus.msg}
                </div>
              )}

              <div className="exec-form">
                 <div className="input-group">
                    <label className="label-text">Order Mode</label>
                    <div className="flex gap-2">
                       <button className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase border transition-all ${orderType === 'Market' ? 'bg-blue-500/10 text-blue-400 border-blue-500/40' : 'bg-transparent text-slate-500 border-[#1f2937]'}`} onClick={() => setOrderType('Market')}>Market</button>
                       <button className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase border transition-all ${orderType === 'Limit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/40' : 'bg-transparent text-slate-500 border-[#1f2937]'}`} onClick={() => setOrderType('Limit')}>Limit</button>
                    </div>
                 </div>

                 <div className="input-group">
                    <div className="flex justify-between items-center">
                       <label className="label-text">Quantity</label>
                       <span className="text-[9px] font-bold text-slate-600">Max: {balance ? (parseFloat(balance.totalAvailableBalance) / (activePrice || 1)).toFixed(3) : '--'}</span>
                    </div>
                    <div className="input-wrap">
                       <input className="input-field" value={qty} onChange={(e) => setQty(e.target.value)} />
                       <span className="text-[11px] font-bold text-slate-500 ml-2">{activeSymbol.replace('USDT', '')}</span>
                    </div>
                 </div>

                 <div className="input-group">
                    <div className="flex justify-between items-center">
                       <label className="label-text">Leverage Factor</label>
                       <span className="text-[10px] font-black text-emerald-500 font-mono">{leverage}x</span>
                    </div>
                    <div className="input-wrap">
                       <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" min="1" max="100" value={leverage} onChange={(e) => setLeverage(e.target.value)} />
                    </div>
                    <div className="flex justify-between mt-2 text-[9px] font-black text-slate-600">
                       <span className="text-emerald-500">1x Isolated</span>
                       <span>100x Cross</span>
                    </div>
                 </div>

                 <div className="mt-8">
                    <button className={`primary-btn ${activeSide === 'BUY' ? 'btn-green' : 'btn-red'} ${orderLoading ? 'opacity-50 pointer-events-none' : ''}`} onClick={handlePlaceOrder} disabled={orderLoading}>
                       {orderLoading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                       {orderLoading ? 'EXECUTING...' : `EXECUTE ${activeSide === 'BUY' ? 'LONG' : 'SHORT'}`}
                    </button>
                 </div>
              </div>

              <div className="mt-auto p-6 bg-[#030712] border-t border-[#1f2937]">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Institutional Engine Active</span>
                 </div>
                 <div className="flex justify-between text-[11px] mb-2">
                    <span className="text-slate-600 uppercase font-black tracking-widest text-[9px]">Environment</span>
                    <span className="text-white font-black">{tradingMode}</span>
                 </div>
                 <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600 uppercase font-black tracking-widest text-[9px]">Latency</span>
                    <span className="text-emerald-500 font-mono font-black">~14ms</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
