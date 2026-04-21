import React, { useState, useEffect, useRef } from 'react';
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
 * Custom Candlestick Chart Component using Lightweight Charts (Pinned Version)
 */
function CustomTradingChart({ symbol }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const resizeObserver = useRef();

  useEffect(() => {
    const scriptId = 'lightweight-charts-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js';
      script.async = true;
      document.body.appendChild(script);
    }

    const checkAndInit = () => {
      if (window.LightweightCharts && chartContainerRef.current) {
        initChart();
      } else {
        setTimeout(checkAndInit, 100);
      }
    };

    if (script.complete || window.LightweightCharts) {
      checkAndInit();
    } else {
      script.onload = checkAndInit;
    }

    function initChart() {
      if (!chartContainerRef.current) return;
      if (chartRef.current) {
        chartRef.current.remove();
      }
      
      const chartOptions = {
        layout: {
          background: { color: 'transparent' },
          textColor: '#64748b',
          fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace'
        },
        grid: {
          vertLines: { color: 'rgba(148, 163, 184, 0.03)' },
          horzLines: { color: 'rgba(148, 163, 184, 0.03)' },
        },
        crosshair: {
          mode: 0,
          vertLine: { color: '#34d399', width: 1, style: 2 },
          horzLine: { color: '#34d399', width: 1, style: 2 },
        },
        rightPriceScale: {
          borderColor: 'rgba(148, 163, 184, 0.1)',
          scaleMargins: { top: 0.2, bottom: 0.2 },
        },
        timeScale: {
          borderColor: 'rgba(148, 163, 184, 0.1)',
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: true,
        handleScale: true,
      };

      const chart = window.LightweightCharts.createChart(chartContainerRef.current, {
        ...chartOptions,
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight || 450,
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      fetchHistoricalData();

      // Setup Resize Observer
      resizeObserver.current = new ResizeObserver(entries => {
        if (entries[0].contentRect) {
          chart.applyOptions({ 
            width: entries[0].contentRect.width,
            height: entries[0].contentRect.height 
          });
        }
      });
      resizeObserver.current.observe(chartContainerRef.current);
    }

    async function fetchHistoricalData() {
      try {
        const res = await fetchWithLogging(getApiUrl(`/api/market/kline/${symbol}?interval=15&limit=150`));
        if (res.ok) {
          const data = await res.json();
          if (!data.list) return;
          const formattedData = data.list.map(item => ({
            time: parseInt(item[0]) / 1000,
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
          })).reverse();
          
          if (seriesRef.current) {
            seriesRef.current.setData(formattedData);
            chartRef.current.timeScale().fitContent();
          }
        }
      } catch (e) {
        console.error('Failed to fetch historical data', e);
      }
    }

    return () => {
      if (resizeObserver.current) resizeObserver.current.disconnect();
      if (chartRef.current) chartRef.current.remove();
    };
  }, [symbol]);

  return (
    <div className="chart-wrapper-inner" style={{ width: '100%', height: '100%', minHeight: '450px' }}>
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

function BybitDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tradingMode } = useOutletContext();
  const paramSymbol = searchParams.get('symbol');

  const [activeSide, setActiveSide] = useState('BUY');
  const [orderType, setOrderType] = useState('Market');
  const [qty, setQty] = useState('0.1');
  const [leverage, setLeverage] = useState('20');
  
  const [activeSymbol, setActiveSymbol] = useState(paramSymbol || 'BTCUSDT');
  const [tickerData, setTickerData] = useState(null);
  const [priceColor, setPriceColor] = useState('');
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);

  // Sync state if URL param changes
  useEffect(() => {
    if (paramSymbol && paramSymbol !== activeSymbol) {
      setActiveSymbol(paramSymbol);
    }
  }, [paramSymbol]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_profile');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      fetchAccountData(parsed.id);
    }
  }, [tradingMode]); // Refetch when mode changes

  const fetchAccountData = async (userId) => {
    setLoading(true);
    try {
      const res = await fetchWithLogging(getApiUrl(`/api/bybit/dashboard/${userId}?environment=${tradingMode}`));
      if (res.ok) {
        const data = await res.json();
        setBalance(data.summary);
      }
    } catch (e) {
      console.warn('Account sync failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let lastPrice = tickerData?.lastPrice || 0;
    const fetchTicker = async () => {
      try {
        const res = await fetchWithLogging(getApiUrl(`/api/market/ticker/${activeSymbol}`));
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          const newPrice = parseFloat(data.lastPrice);
          
          if (newPrice > lastPrice) setPriceColor('price-up');
          else if (newPrice < lastPrice) setPriceColor('price-down');
          
          setTickerData(data);
          lastPrice = newPrice;
          setTimeout(() => setPriceColor(''), 800);
        }
      } catch (e) {
        console.warn('Ticker sync failed', e);
      }
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 2500); 
    return () => clearInterval(interval);
  }, [activeSymbol]);

  const handleSelectSymbol = (symbol) => {
    setSearchParams({ symbol });
    setActiveSymbol(symbol);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      console.warn('[ORDER] No user profile found in state.');
      return;
    }
    
    setOrderLoading(true);
    setOrderStatus(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setOrderStatus({ success: false, msg: 'Authentication token missing. Please sign in again.' });
        setOrderLoading(false);
        return;
      }

      console.log(`%c[ORDER_REQ] Executing ${activeSide} on ${activeSymbol} (${tradingMode})`, 'color: #f59e0b; font-weight: bold;');
      
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
          price: tickerData?.lastPrice
        })
      });

      const data = await res.json();
      if (res.ok) {
        setOrderStatus({ success: true, msg: 'Order placed successfully!' });
      } else {
        setOrderStatus({ success: false, msg: data.error || 'Execution failed' });
      }
    } catch (err) {
      console.error('[ORDER_FAIL]', err);
      setOrderStatus({ success: false, msg: 'Network error during execution' });
    } finally {
      setOrderLoading(false);
      setTimeout(() => setOrderStatus(null), 4000);
      fetchAccountData(user.id);
    }
  };

  const activePrice = parseFloat(tickerData?.lastPrice || 0);

  return (
    <div className="dashboard-container">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flashGreen {
          0% { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }
          100% { border-color: rgba(255, 255, 255, 0.05); background: #0a0f1d; }
        }
        @keyframes flashRed {
          0% { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
          100% { border-color: rgba(255, 255, 255, 0.05); background: #0a0f1d; }
        }
        .price-up { color: #10b981 !important; }
        .price-down { color: #ef4444 !important; }
        
        .dashboard-container { background: #070b14; min-height: 100vh; padding: 24px; color: #94a3b8; font-family: 'Inter', sans-serif; }
        .dashboard-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
        .dashboard-left-col { display: flex; flex-direction: column; gap: 20px; }

        .panel-card { background: #0a0f1d; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; overflow: hidden; }
        .main-chart-card { min-height: 520px; display: flex; flex-direction: column; }
        .chart-header-bar { padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; background: #0a0f1d; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
        .h-pair-info { display: flex; align-items: center; gap: 12px; }
        .h-price { font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 18px; color: #fff; transition: 0.3s; }
        .h-change { font-size: 11px; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
        .h-change.up { color: #10b981; background: rgba(16, 185, 129, 0.1); }
        .h-change.down { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        
        .ticker-metrics { display: flex; gap: 24px; }
        .m-item { display: flex; flex-direction: column; gap: 2px; }
        .m-label { font-size: 10px; color: #475569; font-weight: 700; text-transform: uppercase; }
        .m-value { font-family: 'JetBrains Mono', monospace; color: #cbd5e1; font-size: 12px; font-weight: 600; }

        .chart-viewport { flex: 1; min-height: 480px; position: relative; background: #090e19; }
        
        /* Execution Sidebar - Clean Fix */
        .order-sidebar { display: flex; flex-direction: column; gap: 20px; }
        .p-section { padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
        .p-title { font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        
        .side-toggle { display: grid; grid-template-columns: 1fr 1fr; background: #050914; border-radius: 12px; padding: 4px; margin-bottom: 16px; }
        .side-btn { border: none; background: transparent; color: #64748b; padding: 10px; font-size: 12px; font-weight: 800; cursor: pointer; border-radius: 8px; transition: 0.2s; }
        .side-btn.active.buy { background: #10b981; color: #000; }
        .side-btn.active.sell { background: #ef4444; color: #fff; }

        .exec-form { display: flex; flex-direction: column; gap: 20px; }
        .input-group { display: flex; flex-direction: column; gap: 10px; }
        .i-label-row { display: flex; justify-content: space-between; align-items: center; }
        .i-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .i-sub { font-size: 10px; color: #475569; font-weight: 600; }
        
        .i-box { background: #060a14; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
        .i-box:focus-within { border-color: #10b981; background: #080d1a; }
        .i-input { background: transparent; border: none; color: #fff; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; width: 100%; outline: none; }
        .i-tag { font-size: 11px; font-weight: 800; color: #475569; }

        .exec-btn { width: 100%; padding: 18px; border-radius: 12px; border: none; font-weight: 900; font-size: 13px; text-transform: uppercase; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .exec-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .exec-btn.buy { background: #10b981; color: #000; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1); }
        .exec-btn.sell { background: #ef4444; color: #fff; box-shadow: 0 4px 20px rgba(239, 68, 68, 0.1); }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .stat-box { background: #050914; border-radius: 10px; padding: 12px; border: 1px solid rgba(255, 255, 255, 0.03); }
        .s-val { display: block; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #cbd5e1; margin-top: 4px; }

        .equity-mini-card { padding: 24px; background: #0a0f1d; }
        .eq-row { display: flex; justify-content: space-between; align-items: flex-end; }
        .eq-label { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .eq-val { color: #fff; font-size: 26px; font-weight: 800; font-family: 'JetBrains Mono', monospace; margin-top: 6px; }

        .order-status-banner { padding: 12px; border-radius: 10px; font-size: 12px; font-weight: 700; text-align: center; margin-bottom: 16px; }
        .status-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .status-fail { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

        @media (max-width: 1200px) {
          .dashboard-main-grid { grid-template-columns: 1fr; }
          .desktop-only { display: none; }
        }
      `}} />

      <div className="discovery-wrapper" style={{ marginBottom: '24px' }}>
        <MarketTerminal onSelectSymbol={handleSelectSymbol} />
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-left-col">
          <div className="panel-card main-chart-card">
            <div className="chart-header-bar">
              <div className="h-pair-info">
                <span className="font-black text-white text-lg tracking-tighter">{activeSymbol}</span>
                <div className={`h-price ${priceColor}`}>${activePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className={`h-change ${parseFloat(tickerData?.price24hPcnt) >= 0 ? 'up' : 'down'}`}>
                  {(parseFloat(tickerData?.price24hPcnt || 0) * 100).toFixed(2)}%
                </div>
              </div>
              <div className="ticker-metrics desktop-only">
                <div className="m-item">
                  <span className="m-label">24h High</span>
                  <span className="m-value">{parseFloat(tickerData?.highPrice24h || 0).toLocaleString()}</span>
                </div>
                <div className="m-item">
                  <span className="m-label">24h Low</span>
                  <span className="m-value">{parseFloat(tickerData?.lowPrice24h || 0).toLocaleString()}</span>
                </div>
                <div className="m-item">
                  <span className="m-label">24h Volume</span>
                  <span className="m-value">{(parseFloat(tickerData?.volume24h || 0) / 1e6).toFixed(2)}M</span>
                </div>
              </div>
              <div className="flex gap-2">
                 <button className="icon-btn"><Maximize2 size={16} /></button>
              </div>
            </div>
            <div className="chart-viewport">
               <CustomTradingChart symbol={activeSymbol} />
            </div>
          </div>

          <div className="panel-card equity-mini-card">
             <div className="eq-row">
                <div>
                   <span className="eq-label">Unified Node Equity ({tradingMode})</span>
                   <div className="eq-val">
                     {balance ? `$${parseFloat(balance.totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
                   </div>
                </div>
                <div className="flex gap-8 text-right">
                   <div>
                      <span className="eq-label">Available</span>
                      <div className="text-emerald-400 font-bold font-mono text-lg">
                        {balance ? `$${parseFloat(balance.totalAvailableBalance).toLocaleString()}` : '--'}
                      </div>
                   </div>
                   <div>
                      <span className="eq-label">Wallet</span>
                      <div className="text-slate-400 font-bold font-mono text-lg">
                        {balance ? `$${parseFloat(balance.totalWalletBalance).toLocaleString()}` : '--'}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="order-sidebar">
          <div className="panel-card">
            <div className="p-section">
              <div className="p-title">
                <Zap size={16} className="text-amber-400" />
                Execution Terminal
              </div>
              
              {orderStatus && (
                <div className={`order-status-banner ${orderStatus.success ? 'status-success' : 'status-fail'}`}>
                  {orderStatus.msg}
                </div>
              )}

              <div className="side-toggle">
                <button 
                  className={`side-btn ${activeSide === 'BUY' ? 'active buy' : ''}`}
                  onClick={() => setActiveSide('BUY')}
                >
                  LONG
                </button>
                <button 
                  className={`side-btn ${activeSide === 'SELL' ? 'active sell' : ''}`}
                  onClick={() => setActiveSide('SELL')}
                >
                  SHORT
                </button>
              </div>

              <div className="exec-form">
                <div className="input-group">
                   <div className="i-label-row">
                      <span className="i-label">Order Mode</span>
                      <span className="i-sub">Smart Routing</span>
                   </div>
                   <div className="side-toggle" style={{ margin: 0 }}>
                      <button 
                        className={`side-btn ${orderType === 'Limit' ? 'active buy' : ''}`} 
                        onClick={() => setOrderType('Limit')}
                        style={{ fontSize: '10px' }}
                      >
                        LIMIT
                      </button>
                      <button 
                        className={`side-btn ${orderType === 'Market' ? 'active buy' : ''}`} 
                        onClick={() => setOrderType('Market')}
                        style={{ fontSize: '10px' }}
                      >
                        MARKET
                      </button>
                   </div>
                </div>

                <div className="input-group">
                  <div className="i-label-row">
                    <span className="i-label">Quantity</span>
                    <span className="i-sub">Max: {balance ? (parseFloat(balance.totalAvailableBalance) / activePrice).toFixed(4) : '0'}</span>
                  </div>
                  <div className="i-box">
                    <input 
                      type="text" 
                      className="i-input" 
                      value={qty} 
                      onChange={(e) => setQty(e.target.value)} 
                    />
                    <span className="i-tag">{activeSymbol.replace('USDT', '')}</span>
                  </div>
                </div>

                {orderType === 'Limit' && (
                  <div className="input-group">
                    <div className="i-label-row">
                      <span className="i-label">Limit Price</span>
                      <span className="i-sub">USDT</span>
                    </div>
                    <div className="i-box">
                      <input type="text" className="i-input" defaultValue={activePrice.toFixed(2)} />
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <div className="i-label-row">
                    <span className="i-label">Leverage</span>
                    <span className="i-sub">{leverage}x Isolated</span>
                  </div>
                  <input 
                    type="range" 
                    className="range-slider-themed" 
                    min="1" 
                    max="100" 
                    value={leverage} 
                    onChange={(e) => setLeverage(e.target.value)}
                  />
                </div>

                <button 
                  className={`exec-btn ${activeSide === 'BUY' ? 'buy' : 'sell'}`}
                  onClick={handlePlaceOrder}
                  disabled={orderLoading}
                >
                  {orderLoading ? 'Executing...' : `Place ${activeSide === 'BUY' ? 'Long' : 'Short'} Order`}
                </button>
              </div>
            </div>

            <div className="p-section">
              <div className="p-title"><Activity size={16} className="text-emerald-500" /> Live Market Pulse</div>
              <div className="stats-grid">
                 <div className="stat-box">
                    <span className="m-label">Spread</span>
                    <span className="s-val text-emerald-400">0.01 (0.00%)</span>
                 </div>
                 <div className="stat-box">
                    <span className="m-label">Funding Rate</span>
                    <span className="s-val text-emerald-400">0.0100%</span>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="panel-card p-4">
             <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-blue-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Node Status</span>
             </div>
             <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Environment</span>
                <span className={tradingMode === 'REAL' ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                  {tradingMode}
                </span>
             </div>
             <div className="flex justify-between items-center text-[11px] mt-2">
                <span className="text-slate-400">Latency</span>
                <span className="text-emerald-500 font-bold">~42ms</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BybitDashboard;
