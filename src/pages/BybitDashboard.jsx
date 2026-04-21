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
          layout: { background: { color: '#030712' }, textColor: '#94a3b8', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" },
          grid: { vertLines: { color: '#111827' }, horzLines: { color: '#111827' } },
          crosshair: { mode: 0, vertLine: { color: '#10b981', width: 0.5, style: 2 }, horzLine: { color: '#10b981', width: 0.5, style: 2 } },
          rightPriceScale: { borderColor: '#1f2937' },
          timeScale: { borderColor: '#1f2937' },
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
    <div className="relative w-full h-full bg-[#030712] border border-[#1f2937] rounded-xl overflow-hidden">
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#030712]/80 z-20">
           <RefreshCw className="animate-spin text-emerald-500" size={20} />
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
        setOrderStatus({ success: false, msg: 'Please log in to trade.' });
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
      else setOrderStatus({ success: false, msg: data.error || 'Check Settings' });
    } catch (err) { setOrderStatus({ success: false, msg: 'Auth Error' }); } finally { setOrderLoading(false); setTimeout(() => setOrderStatus(null), 4000); fetchAccountData(user.id); }
  };

  const priceColor = parseFloat(tickerData?.price24hPcnt) >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="p-4 bg-[#02040a] min-h-screen text-slate-400 font-sans selection:bg-emerald-500/30 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .main-scaffold { display: grid; grid-template-columns: 1fr 320px; gap: 16px; height: calc(100vh - 150px); max-height: calc(100vh - 150px); overflow: hidden; }
        .col-left { display: flex; flex-direction: column; gap: 16px; height: 100%; min-width: 0; }
        .col-right { width: 320px; height: 100%; flex-shrink: 0; }
        
        .box-panel { background: #0b0f1a; border: 1px solid #1f2937; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
        .chart-section { flex: 1; display: flex; flex-direction: column; min-height: 0; }
        
        /* Institutional Terminal Styles - No Glow */
        .exec-tabs { display: flex; padding: 4px; background: #030712; border-radius: 8px; margin: 12px; }
        .tab-trigger { flex: 1; padding: 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; border: none; background: transparent; cursor: pointer; transition: 0.15s; }
        .tab-buy.active { background: #10b981; color: #000; }
        .tab-sell.active { background: #ef4444; color: #fff; }
        
        .exec-form { padding: 0 12px 12px 12px; display: flex; flex-direction: column; gap: 16px; flex: 1; }
        .input-wrap { background: #030712; border: 1px solid #1f2937; border-radius: 8px; padding: 0 12px; height: 48px; display: flex; align-items: center; }
        .input-field { background: transparent; border: none; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 14px; width: 100%; outline: none; }
        .label-text { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; block; }
        
        .primary-btn { width: 100%; padding: 16px; border-radius: 8px; font-weight: 900; font-size: 13px; text-transform: uppercase; cursor: pointer; border: none; transition: 0.1s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-green { background: #10b981; color: #000; }
        .btn-red { background: #ef4444; color: #fff; }
        .primary-btn:active { transform: scale(0.98); }

        .equity-footer { padding: 16px 20px; background: #0b0f1a; border: 1px solid #1f2937; border-radius: 12px; flex-shrink: 0; }
      `}} />

      <div className="mb-4">
        <MarketTerminal onSelectSymbol={handleSelectSymbol} />
      </div>
      
      <div className="main-scaffold">
        <div className="col-left">
           <div className="box-panel chart-section">
              <div className="px-5 py-4 border-b border-[#1f2937] flex justify-between items-center bg-[#0b0f1a]">
                 <div className="flex items-center gap-6">
                    <span className="text-xl font-black text-white uppercase tracking-tighter">{activeSymbol}</span>
                    <span className={`text-xl font-mono font-black ${priceColor}`}>${activePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${parseFloat(tickerData?.price24hPcnt) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                       {(parseFloat(tickerData?.price24hPcnt || 0) * 100).toFixed(2)}%
                    </span>
                 </div>
                 <div className="flex gap-8">
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] font-bold text-slate-500 uppercase">24h High</span>
                       <span className="text-[12px] font-bold text-slate-300 font-mono">${parseFloat(tickerData?.highPrice24h || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] font-bold text-slate-500 uppercase">24h Low</span>
                       <span className="text-[12px] font-bold text-slate-300 font-mono">${parseFloat(tickerData?.lowPrice24h || 0).toLocaleString()}</span>
                    </div>
                 </div>
              </div>
              <div className="flex-1 p-2">
                 <CustomTradingChart symbol={activeSymbol} />
              </div>
           </div>

           <div className="equity-footer shadow-lg">
              <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-1">Account Equity ({tradingMode})</span>
                    <div className="text-3xl font-black text-white tracking-tight font-mono">
                      {balance ? `$${parseFloat(balance.totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
                    </div>
                 </div>
                 <div className="flex gap-12">
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] lowercase font-bold text-slate-600 mb-1">Available Liquidity</span>
                       <span className="text-xl font-black text-emerald-400 font-mono">
                         {balance ? `$${parseFloat(balance.totalAvailableBalance).toLocaleString()}` : '--'}
                       </span>
                    </div>
                    <div className="flex flex-col items-end border-l border-[#1f2937] pl-12">
                       <span className="text-[10px] lowercase font-bold text-slate-600 mb-1">Wallet Total</span>
                       <span className="text-xl font-black text-slate-400 font-mono">
                         {balance ? `$${parseFloat(balance.totalWalletBalance).toLocaleString()}` : '--'}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="col-right">
           <div className="box-panel h-full">
              <div className="exec-tabs">
                 <button className={`tab-trigger tab-buy ${activeSide === 'BUY' ? 'active' : ''}`} onClick={() => setActiveSide('BUY')}>Long</button>
                 <button className={`tab-trigger tab-sell ${activeSide === 'SELL' ? 'active' : ''}`} onClick={() => setActiveSide('SELL')}>Short</button>
              </div>

              {orderStatus && (
                <div className={`mx-3 mb-4 p-3 rounded-lg text-center text-[10px] font-bold uppercase ${orderStatus.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                   {orderStatus.msg}
                </div>
              )}

              <div className="exec-form">
                 <div>
                    <label className="label-text">Execution Mode</label>
                    <div className="flex gap-2">
                       <button className={`flex-1 p-2 rounded-md text-[10px] font-bold uppercase transition-all ${orderType === 'Market' ? 'bg-[#1f2937] text-white' : 'text-slate-500'}`} onClick={() => setOrderType('Market')}>Market</button>
                       <button className={`flex-1 p-2 rounded-md text-[10px] font-bold uppercase transition-all ${orderType === 'Limit' ? 'bg-[#1f2937] text-white' : 'text-slate-500'}`} onClick={() => setOrderType('Limit')}>Limit</button>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between items-center mb-1.5">
                       <label className="label-text mb-0">Quantity</label>
                       <span className="text-[9px] font-bold text-slate-600">Max: {balance ? (parseFloat(balance.totalAvailableBalance) / (activePrice || 1)).toFixed(3) : '--'}</span>
                    </div>
                    <div className="input-wrap">
                       <input className="input-field" value={qty} onChange={(e) => setQty(e.target.value)} />
                       <span className="text-[11px] font-bold text-slate-500 ml-2">{activeSymbol.replace('USDT', '')}</span>
                    </div>
                 </div>

                 <div>
                    <label className="label-text">Leverage Engine</label>
                    <input type="range" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" min="1" max="100" value={leverage} onChange={(e) => setLeverage(e.target.value)} />
                    <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-600">
                       <span className="text-emerald-500">{leverage}x Isolated</span>
                       <span>100x</span>
                    </div>
                 </div>

                 <button className={`primary-btn mt-auto ${activeSide === 'BUY' ? 'btn-green' : 'btn-red'} ${orderLoading ? 'opacity-50' : ''}`} onClick={handlePlaceOrder} disabled={orderLoading}>
                    {orderLoading ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                    {orderLoading ? 'Transmitting' : `Confirm ${activeSide === 'BUY' ? 'Long' : 'Short'}`}
                 </button>
              </div>

              <div className="p-4 bg-[#030712] border-t border-[#1f2937]">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_4px_#34d399]"></div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Core Status: Active</span>
                 </div>
                 <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Environment</span>
                    <span className="text-slate-400 font-bold">{tradingMode}</span>
                 </div>
                 <div className="flex justify-between text-[11px] mt-1">
                    <span className="text-slate-600">Node Speed</span>
                    <span className="text-emerald-500 font-mono">~18ms</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
