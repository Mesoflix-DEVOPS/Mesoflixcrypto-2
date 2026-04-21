import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const paramSymbol = searchParams.get('symbol');

  const [activeSide, setActiveSide] = useState('BUY');
  const [activeSymbol, setActiveSymbol] = useState(paramSymbol || 'BTCUSDT');
  const [tickerData, setTickerData] = useState(null);
  const [priceColor, setPriceColor] = useState('');
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const fetchAccountData = async (userId) => {
    try {
      const res = await fetchWithLogging(getApiUrl(`/api/bybit/dashboard/${userId}`));
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
        .price-up { animation: flashGreen 0.8s ease-out; color: #10b981 !important; }
        .price-down { animation: flashRed 0.8s ease-out; color: #ef4444 !important; }
        
        .dashboard-container { background: #070b14; min-height: 100vh; padding: 24px; color: #94a3b8; font-family: 'Inter', sans-serif; }
        .dashboard-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
        .dashboard-left-col { display: flex; flex-direction: column; gap: 20px; }

        /* Terminal Chart UI */
        .main-chart-card { background: #0a0f1d; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
        .chart-header-bar { padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; background: #0a0f1d; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
        .h-pair-info { display: flex; align-items: center; gap: 12px; }
        .h-price { font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 18px; color: #fff; }
        .h-change { font-size: 11px; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
        .h-change.up { color: #10b981; background: rgba(16, 185, 129, 0.1); }
        .h-change.down { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        
        .ticker-metrics { display: flex; gap: 24px; }
        .m-item { display: flex; flex-direction: column; gap: 2px; }
        .m-label { font-size: 10px; color: #475569; font-weight: 700; text-transform: uppercase; }
        .m-value { font-family: 'JetBrains Mono', monospace; color: #cbd5e1; font-size: 12px; font-weight: 600; }

        .chart-viewport { flex: 1; min-height: 480px; position: relative; background: #090e19; }
        
        /* Execution Sidebar */
        .order-sidebar { display: flex; flex-direction: column; gap: 20px; }
        .panel-card { background: #0a0f1d; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; overflow: hidden; }
        .p-section { padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
        .p-title { font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        
        .side-toggle { display: grid; grid-template-columns: 1fr 1fr; background: #04080f; border-radius: 12px; padding: 4px; margin-bottom: 16px; }
        .side-btn { border: none; background: transparent; color: #64748b; padding: 10px; font-size: 12px; font-weight: 800; cursor: pointer; border-radius: 8px; transition: 0.2s; }
        .side-btn.active.buy { background: #10b981; color: #000; }
        .side-btn.active.sell { background: #ef4444; color: #fff; }

        .exec-form { display: flex; flex-direction: column; gap: 16px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .i-label { font-size: 11px; font-weight: 700; color: #475569; display: flex; justify-content: space-between; }
        .i-wrap { background: #04080f; border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
        .i-field { background: transparent; border: none; color: #fff; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; width: 100%; outline: none; }
        .i-unit { font-size: 11px; font-weight: 800; color: #475569; }

        .exec-btn { width: 100%; padding: 16px; border-radius: 12px; border: none; font-weight: 900; font-size: 13px; text-transform: uppercase; cursor: pointer; transition: 0.3s; margin-top: 8px; }
        .exec-btn.buy { background: #10b981; color: #000; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); }
        .exec-btn.sell { background: #ef4444; color: #fff; box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15); }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .stat-box { background: #04080f; border-radius: 10px; padding: 12px; border: 1px solid rgba(255, 255, 255, 0.02); }
        .s-val { display: block; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #cbd5e1; margin-top: 4px; }

        .equity-mini-card { padding: 20px; background: linear-gradient(135deg, #0a0f1d 0%, #060a14 100%); }
        .eq-label { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .eq-val { color: #fff; font-size: 24px; font-weight: 800; font-family: 'JetBrains Mono', monospace; margin-top: 4px; }

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
          <div className="main-chart-card">
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
             <div className="flex justify-between items-start">
                <div>
                   <span className="eq-label">Consolidated Institutional Equity</span>
                   <div className="eq-val">
                     {balance ? `$${parseFloat(balance.totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
                   </div>
                </div>
                <div className="flex gap-4 text-right">
                   <div>
                      <span className="eq-label">Available</span>
                      <div className="text-emerald-400 font-bold font-mono">
                        {balance ? `$${parseFloat(balance.totalAvailableBalance).toLocaleString()}` : '--'}
                      </div>
                   </div>
                   <div>
                      <span className="eq-label">Wallet</span>
                      <div className="text-slate-400 font-bold font-mono">
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
                   <div className="i-label">Order Mode <span>Institutional Routing</span></div>
                   <div className="side-toggle" style={{ margin: 0 }}>
                      <button className="side-btn active buy" style={{ background: '#1e293b', color: '#fff', fontSize: '10px' }}>LIMIT</button>
                      <button className="side-btn" style={{ fontSize: '10px' }}>MARKET</button>
                   </div>
                </div>

                <div className="input-group">
                  <div className="i-label">Size <span>Available: {balance ? parseFloat(balance.totalAvailableBalance).toFixed(2) : '0.00'} USDT</span></div>
                  <div className="i-wrap">
                    <input type="text" className="i-field" defaultValue="0.1000" />
                    <span className="i-unit">{activeSymbol.replace('USDT', '')}</span>
                  </div>
                </div>

                <div className="input-group">
                  <div className="i-label">Price <span>Current Market</span></div>
                  <div className="i-wrap">
                    <input type="text" className="i-field" value={activePrice.toFixed(2)} readOnly />
                    <span className="i-unit">USDT</span>
                  </div>
                </div>

                <div className="input-group">
                  <div className="i-label">Leverage <span>100x Isolated</span></div>
                  <input type="range" className="range-slider-themed" min="1" max="100" defaultValue="20" />
                </div>

                <button className={`exec-btn ${activeSide === 'BUY' ? 'buy' : 'sell'}`}>
                   Place {activeSide === 'BUY' ? 'Long' : 'Short'} Order
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
                    <span className="m-label">Open Interest</span>
                    <span className="s-val">842.5M</span>
                 </div>
                 <div className="stat-box">
                    <span className="m-label">Funding Rate</span>
                    <span className="s-val text-emerald-400">0.0100%</span>
                 </div>
                 <div className="stat-box">
                    <span className="m-label">Liquidation</span>
                    <span className="s-val text-rose-500">$1.2M (Short)</span>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="panel-card p-4">
             <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-blue-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Network Status</span>
             </div>
             <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Bybit V5 Mainnet</span>
                <span className="text-emerald-500 font-bold">CONNECTED</span>
             </div>
             <div className="flex justify-between items-center text-[11px] mt-2">
                <span className="text-slate-400">Node Latency</span>
                <span className="text-emerald-500 font-bold">~42ms</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BybitDashboard;
