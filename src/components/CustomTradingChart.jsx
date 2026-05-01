import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, TrendingUp, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../config/api';

// Reusable Institutional Trading Chart Component
export default function CustomTradingChart({ symbol, tickerData, height = "600px" }) {
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

  // Helper for logging/fetching
  const fetchWithLogging = async (url) => {
    try {
      const res = await fetch(url);
      return res;
    } catch (e) {
      console.error('[CHART_FETCH_ERROR]', e);
      return { ok: false };
    }
  };

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
      
      // Clean up previous instance explicitly before re-creating
      if (chartInstance.current) { 
        try { chartInstance.current.remove(); } catch (e) {}
        chartInstance.current = null;
        seriesInstance.current = null;
      }

      // Small delay to ensure DOM container is clear
      await new Promise(r => setTimeout(r, 50));
      if (!isMounted || !chartContainerRef.current) return;

      setIsInitializing(true);
      try {
        const chart = LWCharts.createChart(chartContainerRef.current, {
          layout: { background: { color: '#02040a' }, textColor: '#64748b', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" },
          grid: { vertLines: { color: '#0f172a' }, horzLines: { color: '#0f172a' } },
          crosshair: { mode: 0, vertLine: { color: '#3b82f6', width: 0.5, style: 2 }, horzLine: { color: '#3b82f6', width: 0.5, style: 2 } },
          rightPriceScale: { borderColor: '#1e293b', scaleMargins: { top: 0.1, bottom: 0.1 }, autoScale: true, alignLabels: true },
          timeScale: { borderColor: '#1e293b', barSpacing: 10, timeVisible: true, secondsVisible: false, shiftVisibleRangeOnNewBar: true },
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
            scaleMargins: { top: 0.7, bottom: 0 },
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
            if (data && data.list && seriesInstance.current && chartInstance.current) {
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
    return () => { isMounted = false; if (resizeObserver.current) resizeObserver.current.disconnect(); if (chartInstance.current) { try { chartInstance.current.remove(); chartInstance.current = null; seriesInstance.current = null; } catch (e) {} } };
  }, [symbol, interval]);

  useEffect(() => {
    if (tickerData && seriesInstance.current && chartInstance.current && lastCandleRef.current) {
      const price = parseFloat(tickerData.lastPrice);
      const now = Date.now() / 1000;
      const lastCandle = lastCandleRef.current;
      
      // Determine if we need a new candle based on interval
      const intervalMinutes = interval === 'D' ? 1440 : parseInt(interval);
      const candleStartTime = Math.floor(now / (intervalMinutes * 60)) * (intervalMinutes * 60);
      
      try {
        if (candleStartTime > lastCandle.time) {
          // Create new candle
          const newCandle = {
            time: candleStartTime,
            open: price,
            high: price,
            low: price,
            close: price
          };
          seriesInstance.current.update(newCandle);
          lastCandleRef.current = newCandle;
        } else {
          // Update current candle
          const updatedCandle = {
            ...lastCandle,
            high: Math.max(lastCandle.high, price),
            low: Math.min(lastCandle.low, price),
            close: price
          };
          seriesInstance.current.update(updatedCandle);
          lastCandleRef.current = updatedCandle;
        }
      } catch (e) {
        console.warn('[CHART_UPDATE_SKIPPED]', e);
      }
    }
  }, [tickerData]);

  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    
    // Use requestAnimationFrame for smoother transition
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (chartInstance.current && chartContainerRef.current) {
          chartInstance.current.applyOptions({ 
            width: chartContainerRef.current.clientWidth, 
            height: chartContainerRef.current.clientHeight 
          });
          chartInstance.current.timeScale().fitContent();
        }
      }, 150);
    });
  };

  return (
    <div className={`trading-chart-component ${isFullscreen ? 'fullscreen' : ''}`} style={!isFullscreen ? { height } : {}}>
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

      <div className="chart-toolbar-wrap">
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
          
          {isFullscreen && (
            <div className="fullscreen-execution-bar">
              <button className="fs-buy-btn">BUY / LONG</button>
              <button className="fs-sell-btn" style={{ marginLeft: 8 }}>SELL / SHORT</button>
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            <button onClick={() => setShowIndicators(!showIndicators)} className={`tool-btn ${showIndicators ? 'active' : ''}`}>
              <TrendingUp size={12} /> INDICATORS
            </button>
            <button onClick={toggleFullscreen} className="tool-btn">
              <Maximize2 size={12} /> {isFullscreen ? 'CLOSE' : 'FULL'}
            </button>
          </div>
        </div>
      </div>

      <div className="chart-canvas-container">
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
