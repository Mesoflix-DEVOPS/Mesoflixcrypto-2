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
import { io } from 'socket.io-client';

import MarketTerminal from '../components/MarketTerminal';
import { getApiUrl, fetchWithLogging } from '../config/api';

/**
 * Institutional Terminal Chart Engine
 */
function CustomTradingChart({ symbol, tickerData }) {
  const chartContainerRef = useRef();
  const chartInstance = useRef(null);
  const seriesInstance = useRef(null);
  const volumeSeriesInstance = useRef(null);
  const ema20Instance = useRef(null);
  const ema50Instance = useRef(null);
  const resizeObserver = useRef(null);
  const lastCandleRef = useRef(null);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [interval, setInterval] = useState('15'); 
  const [showIndicators, setShowIndicators] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      });
    };

    const init = async () => {
      const LWCharts = await loadScript();
      if (!isMounted || !chartContainerRef.current) return;
      if (chartInstance.current) { chartInstance.current.remove(); chartInstance.current = null; }

      setIsInitializing(true);
      try {
        const chart = LWCharts.createChart(chartContainerRef.current, {
          layout: { background: { color: '#030712' }, textColor: '#64748b', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" },
          grid: { vertLines: { color: '#0f172a' }, horzLines: { color: '#0f172a' } },
          crosshair: { mode: 0, vertLine: { color: '#3b82f6', width: 0.5, style: 2 }, horzLine: { color: '#3b82f6', width: 0.5, style: 2 } },
          rightPriceScale: { borderColor: '#1e293b', scaleMargins: { top: 0.2, bottom: 0.2 }, autoScale: true },
          timeScale: { borderColor: '#1e293b', barSpacing: 10, timeVisible: true, secondsVisible: false },
          handleScroll: true,
          handleScale: true,
        });

        const candleSeries = chart.addCandlestickSeries({
          upColor: '#10b981', downColor: '#ef4444', borderVisible: false, wickUpColor: '#10b981', wickDownColor: '#ef4444',
          priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
        });

        const volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: { type: 'volume' },
            priceScaleId: '', 
        });
        
        volumeSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
        });

        const ema20 = chart.addLineSeries({ color: '#3b82f6', lineWidth: 1, title: 'EMA 20', visible: showIndicators });
        const ema50 = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1, title: 'EMA 50', visible: showIndicators });

        chartInstance.current = chart;
        seriesInstance.current = candleSeries;
        volumeSeriesInstance.current = volumeSeries;
        ema20Instance.current = ema20;
        ema50Instance.current = ema50;

        resizeObserver.current = new ResizeObserver(() => {
           if (chartInstance.current && chartContainerRef.current) {
             chartInstance.current.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
           }
        });
        resizeObserver.current.observe(chartContainerRef.current);

        // FETCHING 500 CANDLES AS REQUESTED
        const response = await fetchWithLogging(getApiUrl(`/api/market/kline/${symbol}?interval=${interval}&limit=500`));
        if (response.ok && isMounted) {
            const res = await response.json();
            const data = res.data;
            if (data && data.list && seriesInstance.current) {
                const formatted = data.list.map(item => ({
                    time: parseInt(item[0]) / 1000,
                    open: parseFloat(item[1]),
                    high: parseFloat(item[2]),
                    low: parseFloat(item[3]),
                    close: parseFloat(item[4]),
                })).reverse();
                
                const volumeData = data.list.map(item => ({
                    time: parseInt(item[0]) / 1000,
                    value: parseFloat(item[5]),
                    color: parseFloat(item[4]) >= parseFloat(item[1]) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                })).reverse();

                seriesInstance.current.setData(formatted);
                volumeSeriesInstance.current.setData(volumeData);
                
                const calculateEMA = (data, period) => {
                  if (data.length < period) return [];
                  const k = 2 / (period + 1);
                  let emaData = [];
                  let prevEma = data[0].close;
                  data.forEach((d, i) => {
                    const ema = (d.close - prevEma) * k + prevEma;
                    emaData.push({ time: d.time, value: ema });
                    prevEma = ema;
                  });
                  return emaData;
                };

                ema20Instance.current.setData(calculateEMA(formatted, 20));
                ema50Instance.current.setData(calculateEMA(formatted, 50));
                
                lastCandleRef.current = formatted[formatted.length - 1];
                chart.timeScale().fitContent();
            }
        }
      } catch (err) { console.error('[CHART_INIT_FAIL]', err); } finally { if (isMounted) setIsInitializing(false); }
    };
    init();
    return () => { isMounted = false; if (resizeObserver.current) resizeObserver.current.disconnect(); if (chartInstance.current) { try { chartInstance.current.remove(); } catch (e) {} } };
  }, [symbol, interval]);

  useEffect(() => {
    if (tickerData && seriesInstance.current && lastCandleRef.current) {
      const price = parseFloat(tickerData.lastPrice);
      const lastCandle = lastCandleRef.current;
      
      const updatedCandle = {
        ...lastCandle,
        high: Math.max(lastCandle.high, price),
        low: Math.min(lastCandle.low, price),
        close: price
      };
      
      seriesInstance.current.update(updatedCandle);
      lastCandleRef.current = updatedCandle;
    }
  }, [tickerData]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (chartInstance.current && chartContainerRef.current) {
        chartInstance.current.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
      }
    }, 100);
  };

  return (
    <div className={`box-panel chart-section ${isFullscreen ? 'fixed inset-0 z-[9999] !h-screen !w-screen rounded-none' : ''}`}>
      <div className="chart-header">
        <div className="flex items-center gap-4">
          <div className="symbol-badge">{symbol}</div>
          <div className="price-display">
            <span className={`main-price ${parseFloat(tickerData?.price24hPcnt) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${parseFloat(tickerData?.lastPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className={`change-pct ${parseFloat(tickerData?.price24hPcnt) >= 0 ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
              {parseFloat(tickerData?.price24hPcnt || 0) >= 0 ? '▲' : '▼'} {(parseFloat(tickerData?.price24hPcnt || 0) * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="metrics-grid hidden md:flex">
          <div className="metric-card high">
            <span className="m-label">24h High</span>
            <span className="m-value">${parseFloat(tickerData?.highPrice24h || 0).toLocaleString()}</span>
          </div>
          <div className="metric-card low">
            <span className="m-label">24h Low</span>
            <span className="m-value">${parseFloat(tickerData?.lowPrice24h || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="chart-toolbar">
        <div className="tf-group">
          {['1', '5', '15', '60', '240', 'D'].map(tf => (
            <button 
              key={tf}
              onClick={() => setInterval(tf)}
              className={interval === tf ? 'active' : ''}
            >
              {tf === '60' ? '1H' : tf === '240' ? '4H' : tf === 'D' ? '1D' : `${tf}m`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowIndicators(!showIndicators)} className={`tool-btn ${showIndicators ? 'active' : ''}`}>
             <TrendingUp size={12} /> INDICATORS
          </button>
          <button onClick={toggleFullscreen} className="tool-btn">
             <Maximize2 size={12} /> {isFullscreen ? 'CLOSE' : 'FULL'}
          </button>
        </div>
      </div>

      <div className="chart-box">
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#030712]/90 z-20">
             <RefreshCw className="animate-spin text-emerald-500" size={18} />
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}

export default function BybitDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tradingMode, user: contextUser, balance: contextBalance } = useOutletContext();
  const paramSymbol = searchParams.get('symbol') || 'BTCUSDT';
  
  const [activeSymbol, setActiveSymbol] = useState(paramSymbol);
  const [activePrice, setActivePrice] = useState(0);
  const [tickerData, setTickerData] = useState(null);
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

  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to Institutional Socket
    const socketUrl = getApiUrl('').replace('/api', '');
    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('[SOCKET] Connected to Live Feed');
      socketRef.current.emit('subscribe', [activeSymbol]);
    });

    socketRef.current.on('ticker', (data) => {
      // Only update if symbol matches
      if (data.symbol === activeSymbol) {
        setTickerData(data);
        const price = parseFloat(data.lastPrice);
        if (price > 0) setActivePrice(price);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe', [activeSymbol]);
        socketRef.current.disconnect();
      }
    };
  }, [activeSymbol]);

  const fetchAccountData = useCallback(async (userId) => {
    try {
      const response = await fetchWithLogging(getApiUrl(`/api/bybit/dashboard/${userId}?environment=${tradingMode}`));
      if (response.ok) {
        const data = await response.json();
        setPositions(data.data.positions || []);
        setHistory(data.data.history || []);
      }
    } catch (err) { 
      console.error('Account refresh failed', err); 
    } finally { 
      setLoading(false); 
    }
  }, [tradingMode]);

  const handleSelectSymbol = (symbol) => {
    setActiveSymbol(symbol);
    setSearchParams({ symbol });
  };

  useEffect(() => {
    if (contextUser) fetchAccountData(contextUser.id);
  }, [contextUser, fetchAccountData, tradingMode]);

  useEffect(() => {
    if (paramSymbol && paramSymbol !== activeSymbol) {
      setActiveSymbol(paramSymbol);
    }
  }, [paramSymbol, activeSymbol]);

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
      if (res.ok) {
        setOrderStatus({ success: true, msg: 'Order Complete' });
      } else {
        // Extract string message from error object to prevent React crash
        const errorMsg = typeof data.error === 'object' 
          ? (data.error.message + (data.error.details ? `: ${data.error.details}` : '') || JSON.stringify(data.error)) 
          : (data.error || 'Execution Fail');
        setOrderStatus({ success: false, msg: errorMsg });
      }
    } catch (err) { 
      setOrderStatus({ success: false, msg: 'Network/Auth Error' }); 
    } finally { 
      setOrderLoading(false); 
      setTimeout(() => setOrderStatus(null), 4000); 
      if (contextUser) fetchAccountData(contextUser.id); 
    }
  };

  const priceColor = parseFloat(tickerData?.price24hPcnt) >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="bybit-dashboard-container">
      <MarketTerminal onSelectSymbol={handleSelectSymbol} />
      
      <div className="main-scaffold">
        <div className="col-left">
           <CustomTradingChart symbol={activeSymbol} tickerData={tickerData} />

           <div className="equity-footer">
              <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-1">Node Equity ({tradingMode})</span>
                    <div className="text-3xl font-black text-white tracking-tight font-mono">
                      {contextBalance ? `$${parseFloat(contextBalance.totalEquity || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
                    </div>
                 </div>
                 <div className="flex gap-8">
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] uppercase font-bold text-slate-600 mb-1">Available balance</span>
                       <span className="text-xl font-black text-emerald-400 font-mono">
                         {contextBalance ? `$${parseFloat(contextBalance.totalAvailableBalance || 0).toLocaleString()}` : '$0.00'}
                       </span>
                    </div>
                    <div className="flex flex-col items-end border-l border-[#1f2937] pl-8">
                       <span className="text-[10px] uppercase font-bold text-slate-600 mb-1">Wallet Total</span>
                       <span className="text-xl font-black text-slate-400 font-mono">
                         {contextBalance ? `$${parseFloat(contextBalance.totalWalletBalance || 0).toLocaleString()}` : '$0.00'}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="col-right">
           <div className="box-panel trade-panel shadow-2xl">
              <div className="exec-header">
                <span className="title">Trade Execution</span>
              </div>

              <div className="exec-tabs">
                 <button className={`tab-trigger buy ${activeSide === 'BUY' ? 'active' : ''}`} onClick={() => setActiveSide('BUY')}>Long</button>
                 <button className={`tab-trigger sell ${activeSide === 'SELL' ? 'active' : ''}`} onClick={() => setActiveSide('SELL')}>Short</button>
              </div>

              {orderStatus && (
                <div className={`mx-4 mb-4 p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-wider ${orderStatus.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                   {orderStatus.msg}
                 </div>
              )}

              <div className="input-row">
                 <div className="input-item">
                    <label className="i-label">Order Type</label>
                    <div className="mode-selector">
                       <button className={`mode-btn ${orderType === 'Market' ? 'active' : ''}`} onClick={() => setOrderType('Market')}>Market</button>
                       <button className={`mode-btn ${orderType === 'Limit' ? 'active' : ''}`} onClick={() => setOrderType('Limit')}>Limit</button>
                    </div>
                 </div>

                 <div className="input-item">
                    <label className="i-label">Position Size</label>
                    <div className="i-wrap">
                       <input placeholder="0.000" value={qty} onChange={(e) => setQty(e.target.value)} />
                       <span className="unit">{activeSymbol.replace('USDT', '')}</span>
                    </div>
                 </div>

                 <div className="input-item">
                    <div className="flex justify-between mb-2">
                       <label className="i-label">Leverage Factor</label>
                       <span className="text-[11px] font-black text-emerald-400 font-mono">{leverage}x</span>
                    </div>
                    <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" min="1" max="100" value={leverage} onChange={(e) => setLeverage(e.target.value)} />
                 </div>
              </div>

              <button className={`action-btn ${activeSide === 'BUY' ? 'long' : 'short'} ${orderLoading ? 'opacity-50' : ''}`} onClick={handlePlaceOrder} disabled={orderLoading}>
                 {orderLoading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                 {orderLoading ? 'EXECUTING...' : `OPEN ${activeSide === 'BUY' ? 'LONG' : 'SHORT'} POSITION`}
              </button>

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
