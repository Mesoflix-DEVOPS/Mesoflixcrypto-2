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
import CustomTradingChart from '../components/CustomTradingChart';

import { useSocket } from '../context/SocketContext';

export default function BybitDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tradingMode, user: contextUser, balance: contextBalance, refresh: refreshProfile } = useOutletContext();
  const { socket, subscribeToTicker, unsubscribeFromTicker, initPrivateStream } = useSocket();

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

  // Throttled refresh to prevent proxy spikes
  const lastRefresh = useRef(0);
  const fetchDashboardThrottled = () => {
    const now = Date.now();
    if (now - lastRefresh.current < 5000) return; // Max once per 5 seconds
    lastRefresh.current = now;
    fetchDashboard();
  };

  useEffect(() => {
    if (!socket) return;

    subscribeToTicker(activeSymbol);
    if (contextUser?.id) {
      initPrivateStream(contextUser.id, tradingMode);
    }

    const onTicker = (data) => {
      if (data.symbol === activeSymbol) {
        setTickerData(data);
        const price = parseFloat(data.lastPrice);
        if (price > 0) setActivePrice(price);
      }
    };

    const onPrivateData = (msg) => {
      // ONLY REFRESH FOR CRITICAL CHANGES (Wallet/Execution)
      // Ignore 'position' topic which ticks every second for PnL changes
      if (msg.topic === 'wallet' || msg.topic === 'execution' || msg.topic === 'order') {
        console.log('[DASHBOARD] Critical Private Update:', msg.topic);
        fetchDashboardThrottled();
      }
    };

    socket.on('ticker', onTicker);
    socket.on('private_data', onPrivateData);

    return () => {
      unsubscribeFromTicker(activeSymbol);
      socket.off('ticker', onTicker);
      socket.off('private_data', onPrivateData);
    };
  }, [activeSymbol, contextUser, tradingMode, socket]);

  // Fetch Dashboard Aggregated Data (Balances/Positions)
  const fetchDashboard = async () => {
    if (!contextUser?.id) return;
    try {
      const res = await fetchWithLogging(getApiUrl(`/api/bybit/dashboard/${contextUser.id}?environment=${tradingMode}`));
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setPositions(data.data.positions || []);
          setHistory(data.data.history || []);
          // Use global refresh for balance consistency
          if (refreshProfile) refreshProfile();
        }
      }
    } catch (err) { console.error('[DASHBOARD_FETCH_FAIL]', err); }
  };

  useEffect(() => {
    fetchDashboard();
    // POLLING: 60s is enough as safety, WS handles the rest
    const timer = setInterval(fetchDashboard, 60000); 
    return () => clearInterval(timer);
  }, [contextUser, tradingMode]);

  const handleSelectSymbol = (symbol) => {
    setActiveSymbol(symbol);
    setSearchParams({ symbol });
  };

  useEffect(() => {
    if (contextUser) fetchDashboard();
  }, [contextUser, tradingMode]);

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
      if (contextUser) fetchDashboard(); 
    }
  };

  const priceColor = parseFloat(tickerData?.price24hPcnt) >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="bybit-dashboard-container">
      {/* 1. TOP MARKET PULSE TICKER */}
      <div className="market-pulse-ticker">
         <div className="ticker-inner">
            {[...positions, ...history.slice(0,5)].map((item, i) => (
               <div key={i} className={`ticker-item ${parseFloat(item.realizedPnl || 0) >= 0 ? 'up' : 'down'}`}>
                  <span className="t-symbol">{item.symbol}</span>
                  <span className="t-price">${parseFloat(item.avgPrice || item.entryPrice || 0).toLocaleString()}</span>
                  <span className="t-change">{parseFloat(item.realizedPnl || 0) >= 0 ? '+' : ''}{parseFloat(item.realizedPnl || 0).toFixed(2)}</span>
               </div>
            ))}
            {/* Fallback items if empty */}
            {positions.length === 0 && ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT'].map(s => (
               <div key={s} className="ticker-item up">
                  <span className="t-symbol">{s}</span>
                  <span className="t-price">LIVE FEED</span>
                  <span className="t-change">+0.00%</span>
               </div>
            ))}
         </div>
      </div>

      <div className="terminal-grid">
         {/* COLUMN 1: DISCOVERY */}
         <div className="term-col col-left">
            <div className="term-panel market-explorer-panel">
               <div className="panel-header">
                  <span className="p-title">Institutional Discovery</span>
                  <Globe size={12} className="p-action" />
               </div>
               <MarketTerminal onSelectSymbol={handleSelectSymbol} />
            </div>
         </div>

         {/* COLUMN 2: EXECUTION FOCUS */}
         <div className="term-col col-center">
            <div className="term-panel chart-panel">
               <div className="panel-header">
                  <div className="flex items-center gap-3">
                     <span className="p-title">High-Frequency Feed</span>
                     <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded uppercase font-black">Stable</span>
                  </div>
                  <Maximize2 size={12} className="p-action" />
               </div>
               <CustomTradingChart symbol={activeSymbol} tickerData={tickerData} height="100%" />
            </div>

            <div className="equity-footer">
               <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                     <span className="f-label mb-1">Total Vault Equity ({tradingMode})</span>
                     <div className="f-value text-3xl text-white tracking-tight">
                        {contextBalance ? `$${parseFloat(contextBalance.totalEquity || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
                     </div>
                  </div>
                  <div className="flex gap-8">
                     <div className="flex flex-col items-end">
                        <span className="f-label mb-1">Available Margin</span>
                        <span className="f-value text-xl text-emerald-400">
                           {contextBalance ? `$${parseFloat(contextBalance.totalAvailableBalance || 0).toLocaleString()}` : '$0.00'}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* COLUMN 3: CONTROL & RISK */}
         <div className="term-col col-right">
            <div className="term-panel order-entry-panel">
               <div className="panel-header">
                  <span className="p-title">Order Management</span>
                  <Zap size={12} className="p-action" />
               </div>

               <div className="exec-tabs">
                  <button className={`tab-trigger buy ${activeSide === 'BUY' ? 'active' : ''}`} onClick={() => setActiveSide('BUY')}>Buy / Long</button>
                  <button className={`tab-trigger sell ${activeSide === 'SELL' ? 'active' : ''}`} onClick={() => setActiveSide('SELL')}>Sell / Short</button>
               </div>

               {orderStatus && (
                 <div className={`mx-4 mb-4 p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-wider ${orderStatus.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {orderStatus.msg}
                  </div>
               )}

               <div className="input-row">
                  <div className="input-item px-4">
                     <label className="i-label">Execution Type</label>
                     <div className="mode-selector">
                        <button className={`mode-btn ${orderType === 'Market' ? 'active' : ''}`} onClick={() => setOrderType('Market')}>Market</button>
                        <button className={`mode-btn ${orderType === 'Limit' ? 'active' : ''}`} onClick={() => setOrderType('Limit')}>Limit</button>
                     </div>
                  </div>

                  <div className="input-item px-4">
                     <label className="i-label">Order Quantity</label>
                     <div className="i-wrap">
                        <input placeholder="0.000" value={qty} onChange={(e) => setQty(e.target.value)} />
                        <span className="unit">{activeSymbol.replace('USDT', '')}</span>
                     </div>
                  </div>

                  <div className="input-item px-4">
                     <div className="flex justify-between mb-2">
                        <label className="i-label">Leverage multiplier</label>
                        <span className="text-[11px] font-black text-emerald-400 font-mono">{leverage}x</span>
                     </div>
                     <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" min="1" max="100" value={leverage} onChange={(e) => setLeverage(e.target.value)} />
                  </div>
               </div>

               <button className={`action-btn ${activeSide === 'BUY' ? 'long' : 'short'} ${orderLoading ? 'opacity-50' : ''}`} onClick={handlePlaceOrder} disabled={orderLoading}>
                  {orderLoading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                  {orderLoading ? 'EXECUTING...' : `${activeSide === 'BUY' ? 'INSTANT BUY' : 'INSTANT SELL'}`}
               </button>

               <div className="exec-engine-footer">
                  <div className="engine-status">
                     <div className="dot"></div>
                     <span className="label">Institutional Engine Active</span>
                  </div>
               </div>
            </div>

            <div className="term-panel risk-hud-panel">
               <div className="panel-header">
                  <span className="p-title">Risk Intelligence HUD</span>
                  <Info size={12} className="p-action" />
               </div>
               <div className="hud-content">
                  <div className="hud-metric safety">
                     <div className="flex justify-between mb-2">
                        <span className="m-label">Account Safety Buffer</span>
                        <span className="text-[10px] font-black text-white">94%</span>
                     </div>
                     <div className="progress-bg">
                        <div className="progress-fill" style={{ width: '94%' }}></div>
                     </div>
                  </div>
                  <div className="hud-metric power">
                     <div className="flex justify-between mb-2">
                        <span className="m-label">Deployed Buying Power</span>
                        <span className="text-[10px] font-black text-white">
                           {contextBalance ? (($((parseFloat(contextBalance.totalUsedMargin || 0) / parseFloat(contextBalance.totalEquity || 1)) * 100)).toFixed(1) + '%') : '0%'}
                        </span>
                     </div>
                     <div className="progress-bg">
                        <div className="progress-fill" style={{ width: contextBalance ? `${(parseFloat(contextBalance.totalUsedMargin || 0) / parseFloat(contextBalance.totalEquity || 1)) * 100}%` : '0%' }}></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
