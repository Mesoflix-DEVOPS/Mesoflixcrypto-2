import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight
} from 'lucide-react';

import MarketTerminal from '../components/MarketTerminal';
import { getApiUrl, fetchWithLogging } from '../config/api';

/**
 * Custom Candlestick Chart Component using Lightweight Charts (CDN-loaded)
 */
function CustomTradingChart({ symbol }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();

  useEffect(() => {
    // 1. Dynamic script injection
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js';
    script.async = true;
    script.onload = initChart;
    document.body.appendChild(script);

    function initChart() {
      if (!chartContainerRef.current) return;
      
      const chartOptions = {
        layout: {
          background: { color: 'transparent' },
          textColor: '#94a3b8',
        },
        grid: {
          vertLines: { color: 'rgba(148, 163, 184, 0.05)' },
          horzLines: { color: 'rgba(148, 163, 184, 0.05)' },
        },
        crosshair: {
          mode: 0,
        },
        rightPriceScale: {
          borderColor: 'rgba(148, 163, 184, 0.1)',
        },
        timeScale: {
          borderColor: 'rgba(148, 163, 184, 0.1)',
          timeVisible: true,
        },
      };

      const chart = window.LightweightCharts.createChart(chartContainerRef.current, {
        ...chartOptions,
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#34d399',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#34d399',
        wickDownColor: '#ef4444',
      });

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      fetchHistoricalData();

      // Handle Resize
      const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    async function fetchHistoricalData() {
      try {
        const res = await fetchWithLogging(getApiUrl(`/api/market/kline/${symbol}?interval=15&limit=100`));
        if (res.ok) {
          const data = await res.json();
          const formattedData = data.list.map(item => ({
            time: parseInt(item[0]) / 1000,
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
          })).reverse();
          seriesRef.current.setData(formattedData);
          chartRef.current.timeScale().fitContent();
        }
      } catch (e) {
        console.error('Failed to fetch historical data', e);
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [symbol]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />;
}

function BybitDashboard() {
  const [activeSide, setActiveSide] = useState('BUY');
  const [activeSymbol, setActiveSymbol] = useState('BTCUSDT');
  const [activePrice, setActivePrice] = useState(0);
  const [priceColor, setPriceColor] = useState('');
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Identity Check
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
    let lastPrice = 0;
    const fetchActivePrice = async () => {
      try {
        const res = await fetchWithLogging(getApiUrl(`/api/market/ticker/${activeSymbol}`));
        if (res.ok) {
          const data = await res.json();
          const newPrice = parseFloat(data.lastPrice);
          
          if (newPrice > lastPrice) setPriceColor('price-up');
          else if (newPrice < lastPrice) setPriceColor('price-down');
          
          setActivePrice(newPrice);
          lastPrice = newPrice;

          // Clear color after pulse
          setTimeout(() => setPriceColor(''), 800);
        }
      } catch (e) {
        console.warn('Price sync failed', e);
      }
    };

    fetchActivePrice();
    const interval = setInterval(fetchActivePrice, 3000); // 3-second high-freq pulse
    return () => clearInterval(interval);
  }, [activeSymbol]);

  const handleSelectSymbol = (symbol) => {
    setActiveSymbol(symbol);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-container">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flashGreen {
          0% { color: #34d399; transform: scale(1.05); }
          100% { color: inherit; transform: scale(1); }
        }
        @keyframes flashRed {
          0% { color: #ef4444; transform: scale(1.05); }
          100% { color: inherit; transform: scale(1); }
        }
        .price-up { animation: flashGreen 0.8s ease-out; }
        .price-down { animation: flashRed 0.8s ease-out; }
      `}} />

      {/* 1. MARKET DISCOVERY ENGINE */}
      <div className="discovery-wrapper" style={{ marginBottom: '32px' }}>
        <MarketTerminal onSelectSymbol={handleSelectSymbol} />
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-left-col">
          {/* Main Chart Card */}
          <div className="main-chart-card">
            <div className="chart-toolbar">
              <div className="toolbar-left">
                <button className="toolbar-btn active">{activeSymbol} • 15m</button>
                <button className="toolbar-btn"><BarChart2 size={16} /></button>
              </div>
              <div className="toolbar-right">
                 <span className={`live-price-head ${priceColor}`}>${activePrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="chart-viewport">
              <div className="chart-info-overlay">
                <span className="chart-pair">{activeSymbol} Institutional Analytics •</span>
                <span className="chart-indicator">Proprietary Real-Mode Feed</span>
              </div>
              <div className="chart-render-area">
                <CustomTradingChart symbol={activeSymbol} />
              </div>
            </div>
          </div>

          {/* Bottom Grid for Equity and Positions */}
          <div className="bottom-info-grid">
            <div className="info-card silver-glass">
              <div className="card-header">
                <span className="card-title">Institutional Equity</span>
                <button className="dot-btn">···</button>
              </div>
              <div className="card-body">
                <div className="equity-stats">
                   <p className="total-equity-label">Total Asset Value (USDT)</p>
                   <h2 className="equity-value">
                     {balance ? `$${parseFloat(balance.totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
                   </h2>
                   <div className="equity-details flex gap-4 mt-2">
                      <div className="detail-item">
                        <p className="text-xs text-slate-500">Available</p>
                        <p className="text-sm font-bold text-emerald-400">
                          {balance ? `$${parseFloat(balance.totalAvailableBalance).toLocaleString()}` : '--'}
                        </p>
                      </div>
                      <div className="detail-item">
                        <p className="text-xs text-slate-500">Wallet</p>
                        <p className="text-sm font-bold text-slate-300">
                          {balance ? `$${parseFloat(balance.totalWalletBalance).toLocaleString()}` : '--'}
                        </p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="info-card silver-glass">
              <div className="card-header">
                <span className="card-title">Live Node Positions</span>
                <button className="dot-btn">···</button>
              </div>
              <div className="card-body">
                <div className="empty-positions">
                  <Activity size={32} className="empty-icon" />
                  <p>Monitoring signal cluster...</p>
                  <span>Your active trades will appear here in sub-second latency.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Institutional Order Panel */}
        <div className="order-sidebar">
          <div className="order-card silver-glass">
            <div className="card-header order-header">
              <span className="card-title-lg">{activeSymbol} Terminal</span>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-emerald-500">LIVE</span>
              </div>
            </div>
            
            <div className="order-tabs">
              <button 
                className={`order-tab buy ${activeSide === 'BUY' ? 'active' : ''}`}
                onClick={() => setActiveSide('BUY')}
              >
                LONG
              </button>
              <button 
                className={`order-tab sell ${activeSide === 'SELL' ? 'active' : ''}`}
                onClick={() => setActiveSide('SELL')}
              >
                SHORT
              </button>
            </div>

            <div className="order-form">
              <div className="form-group">
                <label className="form-label">Order Routing</label>
                <div className="type-toggle-group">
                  <button className="type-toggle-btn active">Limit</button>
                  <button className="type-toggle-btn">Market</button>
                  <button className="type-toggle-btn">TWAP</button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Execution Quantity ({activeSymbol.replace('USDT', '')})</label>
                <div className="number-input-wrapper">
                  <input type="text" className="form-input" defaultValue="0.1" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Fair Market Price (USDT)</label>
                <div className="price-input-wrapper">
                  <span className={`price-val font-mono ${priceColor}`}>
                    ${activePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="price-denom">USDT</span>
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-info">
                  <label className="form-label">Institutional Leverage</label>
                  <span className="label-sub">100x Max</span>
                </div>
                <input type="range" className="range-slider-themed" min="1" max="100" defaultValue="10" />
              </div>

              <div className="risk-mgmt-section">
                 <h4 className="section-subtitle">Risk Mitigation</h4>
                 <div className="risk-grid grid grid-cols-2 gap-3">
                    <div className="risk-item">
                      <span className="risk-label">TP (ROCE %)</span>
                      <div className="risk-input-box">15.0</div>
                    </div>
                    <div className="risk-item">
                      <span className="risk-label">SL (ROCE %)</span>
                      <div className="risk-input-box">5.0</div>
                    </div>
                 </div>
              </div>

              <button className={`submit-order-btn ${activeSide === 'BUY' ? 'buy' : 'sell'}`}>
                EXECUTE {activeSide === 'BUY' ? 'LONG' : 'SHORT'} SIGNAL
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-container {
          background: #0a0f1d;
          min-height: 100vh;
          padding: 24px;
          color: #94a3b8;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .live-price-head { font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 14px; transition: 0.3s; }
        .dashboard-main-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; }
        .dashboard-left-col { display: flex; flex-direction: column; gap: 24px; }

        .main-chart-card { background: #0d121f; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; min-height: 520px; display: flex; flex-direction: column; overflow: hidden; }
        .chart-toolbar { padding: 12px 20px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.03); background: #0a0f1d; }
        .toolbar-btn { background: transparent; border: none; color: #475569; padding: 4px 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .toolbar-btn.active { color: #34d399; }

        .chart-viewport { flex: 1; padding: 24px; position: relative; }
        .chart-info-overlay { margin-bottom: 20px; }
        .chart-pair { color: #fff; font-weight: 700; font-size: 16px; margin-right: 12px; }
        .chart-indicator { color: #34d399; font-size: 13px; font-weight: 600; }

        .bottom-info-grid { display: grid; grid-template-columns: 340px 1fr; gap: 24px; }
        .silver-glass { background: rgba(22, 27, 44, 0.4); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 20px; }

        .card-header { padding: 20px 24px 12px; display: flex; justify-content: space-between; align-items: center; }
        .card-title { color: #fff; font-weight: 700; font-size: 15px; }
        .card-title-lg { color: #fff; font-weight: 800; font-size: 19px; }
        .dot-btn { background: transparent; border: none; color: #475569; font-size: 20px; cursor: pointer; }

        .card-body { padding: 0 24px 24px; }
        .equity-value { font-size: 34px; font-weight: 800; color: #fff; margin: 8px 0; font-family: 'JetBrains Mono', monospace; }
        
        .empty-positions { padding: 40px 0; text-align: center; color: #475569; }
        .empty-icon { margin-bottom: 16px; opacity: 0.2; color: #34d399; margin: 0 auto 16px; }
        .empty-positions p { color: #fff; font-weight: 700; margin-bottom: 4px; }
        .empty-positions span { font-size: 12px; }

        .order-tabs { display: flex; padding: 0 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 24px; }
        .order-tab { flex: 1; border: none; background: transparent; padding: 12px; font-weight: 800; font-size: 14px; cursor: pointer; color: #475569; }
        .order-tab.buy.active { color: #34d399; border-bottom: 2px solid #34d399; }
        .order-tab.sell.active { color: #ef4444; border-bottom: 2px solid #ef4444; }

        .order-form { padding: 0 24px; display: flex; flex-direction: column; gap: 20px; }
        .type-toggle-group { display: flex; background: #0a0f1d; border-radius: 8px; padding: 4px; gap: 4px; }
        .type-toggle-btn { flex: 1; border: none; background: transparent; color: #475569; font-size: 11px; font-weight: 700; padding: 8px; border-radius: 6px; cursor: pointer; }
        .type-toggle-btn.active { background: #1e293b; color: #fff; }

        .number-input-wrapper { background: #0a0f1d; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
        .form-input { background: transparent; border: none; color: #fff; font-weight: 700; width: 100%; font-size: 15px; outline: none; }
        .price-input-wrapper { background: #0a0f1d; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; }
        
        .risk-input-box { background: #0a0f1d; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 8px; font-size: 13px; font-weight: 700; color: #fff; text-align: center; }

        .submit-order-btn { width: 100%; padding: 18px; border-radius: 12px; border: none; font-weight: 800; color: #000; cursor: pointer; transition: 0.3s; margin-top: 10px; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; }
        .submit-order-btn.buy { background: #34d399; box-shadow: 0 4px 14px rgba(52, 211, 153, 0.2); }
        .submit-order-btn.sell { background: #ef4444; color: #fff; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.2); }

        .green { color: #34d399; }
        
        @media (max-width: 1200px) {
          .dashboard-main-grid { grid-template-columns: 1fr; }
          .bottom-info-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
}

export default BybitDashboard;
