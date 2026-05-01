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
  const { tradingMode, user: contextUser, balance: contextBalance } = useOutletContext();
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

  useEffect(() => {
    if (!socket) return;

    // Subscribe to public ticker
    subscribeToTicker(activeSymbol);
    
    // Init private stream for this user
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
      console.log('[DASHBOARD] Socket Private Update:', msg.topic);
      fetchDashboard();
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
          setContextBalance(data.data.balance); // Ensure balance is updated
        }
      }
    } catch (err) { console.error('[DASHBOARD_FETCH_FAIL]', err); }
  };

  useEffect(() => {
    fetchDashboard();
    // MINIMAL POLLING (60s) - WEBSOCKETS HANDLE THE REAL-TIME UPDATES NOW
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
                    <span className="f-label mb-1">Node Equity ({tradingMode})</span>
                    <div className="f-value text-3xl text-white tracking-tight">
                      {contextBalance ? `$${parseFloat(contextBalance.totalEquity || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
                    </div>
                 </div>
                 <div className="flex gap-8">
                    <div className="flex flex-col items-end">
                       <span className="f-label mb-1">Available balance</span>
                       <span className="f-value text-xl text-emerald-400">
                         {contextBalance ? `$${parseFloat(contextBalance.totalAvailableBalance || 0).toLocaleString()}` : '$0.00'}
                       </span>
                    </div>
                    <div className="flex flex-col items-end border-l border-[#1f2937] pl-8">
                       <span className="f-label mb-1">Wallet Total</span>
                       <span className="f-value text-xl text-slate-400">
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
