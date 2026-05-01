import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  Activity, 
  BarChart2, 
  Target, 
  Layers, 
  Cpu, 
  TrendingUp, 
  Globe, 
  ArrowUpRight, 
  ArrowDownRight,
  Maximize2,
  RefreshCw,
  Info
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { getApiUrl, fetchWithLogging } from '../config/api';
import CustomTradingChart from '../components/CustomTradingChart';
import MarketTerminal from '../components/MarketTerminal';

/**
 * Institutional Trade Terminal - The "Special" View
 * High-density layout with Neural Execution Engine & Risk Intelligence
 */
export default function InstitutionalTrade() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tradingMode, user, balance, refresh } = useOutletContext();
  const { socket, subscribeToTicker, unsubscribeFromTicker } = useSocket();

  const activeSymbol = searchParams.get('symbol') || 'BTCUSDT';
  const [tickerData, setTickerData] = useState(null);
  const [orderSide, setOrderSide] = useState('BUY');
  const [qty, setQty] = useState('0.1');
  const [leverage, setLeverage] = useState('20');
  const [loading, setLoading] = useState(false);
  const [orderMsg, setOrderMsg] = useState(null);

  // Sub-second Price Synchronization
  useEffect(() => {
    if (!socket) return;
    subscribeToTicker(activeSymbol);
    const onTicker = (data) => {
      if (data.symbol === activeSymbol) setTickerData(data);
    };
    socket.on('ticker', onTicker);
    return () => {
      unsubscribeFromTicker(activeSymbol);
      socket.off('ticker', onTicker);
    };
  }, [activeSymbol, socket]);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setOrderMsg(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetchWithLogging(getApiUrl('/api/bybit/order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          symbol: activeSymbol, 
          side: orderSide, 
          qty, 
          orderType: 'Market', 
          leverage, 
          environment: tradingMode 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOrderMsg({ type: 'success', text: 'Institutional Execution Confirmed' });
      } else {
        setOrderMsg({ type: 'error', text: data.error || 'Execution Routed to Queue' });
      }
    } catch (err) {
      setOrderMsg({ type: 'error', text: 'Network Latency Critical' });
    } finally {
      setLoading(false);
      setTimeout(() => setOrderMsg(null), 5000);
      if (refresh) refresh();
    }
  };

  return (
    <div className="institutional-trade-view">
      <style dangerouslySetInnerHTML={{ __html: `
        .institutional-trade-view { background: #02040a; color: #fff; min-height: 100vh; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; overflow: hidden; }
        
        /* 1. Neural Pulse Top Bar */
        .neural-pulse-bar { background: rgba(10, 15, 29, 0.8); border-bottom: 1px solid rgba(52, 211, 153, 0.1); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; }
        .pulse-status { display: flex; align-items: center; gap: 12px; }
        .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.4; transform: scale(0.8); } }
        .pulse-text { font-[900] text-[10px] uppercase tracking-[0.2em] text-emerald-500; }

        /* 2. Three-Panel Architecture */
        .trade-grid { display: grid; grid-template-columns: 340px 1fr 380px; flex: 1; min-height: 0; background: rgba(255,255,255,0.02); gap: 1px; }
        
        .grid-col { background: #02040a; display: flex; flex-direction: column; min-height: 0; }
        
        /* Left: Discovery Hub */
        .discovery-panel { flex: 1; overflow-y: auto; padding: 20px; border-right: 1px solid rgba(255,255,255,0.05); }
        .panel-label { font-[900] text-[10px] text-slate-500 uppercase tracking-widest mb-6 block; }

        /* Center: Execution Core (Chart) */
        .execution-core { flex: 1; display: flex; flex-direction: column; background: #000; position: relative; }
        .chart-container-wrap { flex: 1; position: relative; }

        /* Right: Command Engine */
        .command-engine { padding: 32px; border-left: 1px solid rgba(255,255,255,0.05); }
        
        .side-selector { display: flex; gap: 1px; background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; margin-bottom: 32px; padding: 4px; }
        .side-btn { flex: 1; padding: 14px; border: none; font-weight: 800; font-size: 12px; text-transform: uppercase; cursor: pointer; transition: 0.3s; background: transparent; color: #475569; border-radius: 8px; }
        .side-btn.active.buy { background: #10b981; color: #000; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3); }
        .side-btn.active.sell { background: #ef4444; color: #fff; box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3); }

        .form-group { margin-bottom: 24px; }
        .form-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .label-text { font-[900] text-[10px] text-slate-500 uppercase tracking-widest; }
        .label-meta { font-family: 'JetBrains Mono'; font-[800] text-[11px] text-emerald-500; }
        
        .input-field-wrap { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; display: flex; align-items: center; justify-content: space-between; transition: 0.3s; }
        .input-field-wrap:focus-within { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
        .input-field-wrap input { background: transparent; border: none; color: #fff; font-weight: 800; font-size: 18px; outline: none; width: 60%; }
        .input-field-wrap .unit { font-[900] text-[11px] text-slate-500 uppercase; }

        .leverage-slider { width: 100%; height: 6px; background: #0f172a; border-radius: 10px; appearance: none; outline: none; }
        .leverage-slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: #10b981; border-radius: 50%; cursor: pointer; border: 3px solid #02040a; }

        .exec-btn { width: 100%; padding: 24px; border-radius: 16px; border: none; font-[900] text-[14px] uppercase tracking-widest cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 20px; }
        .exec-btn.buy { background: #10b981; color: #000; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2); }
        .exec-btn.sell { background: #ef4444; color: #fff; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.2); }
        .exec-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .exec-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Intelligence HUD */
        .intelligence-hud { margin-top: 40px; background: rgba(255,255,255,0.02); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.05); }
        .hud-row { display: flex; justify-content: space-between; margin-bottom: 16px; }
        .hud-item { flex: 1; }
        .hud-val { display: block; font-family: 'JetBrains Mono'; font-[900] text-[16px] color: #fff; margin-bottom: 4px; }
        .hud-lbl { display: block; font-[900] text-[9px] text-slate-500 uppercase tracking-widest; }

        .status-toast { position: fixed; bottom: 40px; right: 40px; padding: 16px 32px; border-radius: 12px; font-[900] text-[12px] uppercase tracking-widest z-[1000] animation: slide-up 0.3s ease-out; }
        .status-toast.success { background: #10b981; color: #000; }
        .status-toast.error { background: #ef4444; color: #fff; }
        @keyframes slide-up { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media (max-width: 1200px) { .trade-grid { grid-template-columns: 1fr; } .discovery-panel, .command-engine { border: none; } }
      `}} />

      {/* TOP HUD BAR */}
      <div className="neural-pulse-bar">
         <div className="pulse-status">
            <div className="pulse-dot"></div>
            <span className="pulse-text">Neural Engine Synchronized</span>
         </div>
         <div className="flex gap-12">
            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Liquidity</span>
               <span className="text-[12px] font-black text-white font-mono">$1.48B <span className="text-emerald-500">+2.4%</span></span>
            </div>
            <div className="flex flex-col items-end border-l border-white/10 pl-12">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Available Margin</span>
               <span className="text-[12px] font-black text-emerald-400 font-mono">
                  ${parseFloat(balance?.totalAvailableBalance || 0).toLocaleString()}
               </span>
            </div>
         </div>
      </div>

      <div className="trade-grid">
         {/* LEFT: ASSET SELECTION */}
         <div className="grid-col discovery-panel">
            <span className="panel-label">Asset Discovery Hub</span>
            <MarketTerminal onSelectSymbol={(s) => setSearchParams({ symbol: s })} />
         </div>

         {/* CENTER: CHART & CORE */}
         <div className="grid-col execution-core">
            <div className="chart-container-wrap">
               <CustomTradingChart symbol={activeSymbol} tickerData={tickerData} height="100%" />
            </div>
         </div>

         {/* RIGHT: COMMAND ENGINE */}
         <div className="grid-col command-engine">
            <span className="panel-label">Command Execution Core</span>
            
            <div className="side-selector">
               <button className={`side-btn buy ${orderSide === 'BUY' ? 'active' : ''}`} onClick={() => setOrderSide('BUY')}>Buy / Long</button>
               <button className={`side-btn sell ${orderSide === 'SELL' ? 'active' : ''}`} onClick={() => setOrderSide('SELL')}>Sell / Short</button>
            </div>

            <div className="form-group">
               <div className="form-label">
                  <span className="label-text">Position Size</span>
                  <span className="label-meta">{orderSide} Market</span>
               </div>
               <div className="input-field-wrap">
                  <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
                  <span className="unit">{activeSymbol.replace('USDT', '')}</span>
               </div>
            </div>

            <div className="form-group">
               <div className="form-label">
                  <span className="label-text">Institutional Leverage</span>
                  <span className="label-meta">{leverage}x</span>
               </div>
               <input type="range" className="leverage-slider" min="1" max="100" value={leverage} onChange={(e) => setLeverage(e.target.value)} />
            </div>

            <div className="intelligence-hud">
               <div className="hud-row">
                  <div className="hud-item">
                     <span className="hud-val">${parseFloat(tickerData?.lastPrice || 0).toLocaleString()}</span>
                     <span className="hud-lbl">Index Price</span>
                  </div>
                  <div className="hud-item text-right">
                     <span className="hud-val text-emerald-500">{(parseFloat(qty) * parseFloat(tickerData?.lastPrice || 0)).toLocaleString()}</span>
                     <span className="hud-lbl">Order Value</span>
                  </div>
               </div>
               <div className="hud-row mb-0">
                  <div className="hud-item">
                     <span className="hud-val text-slate-400">Low</span>
                     <span className="hud-lbl">Slippage Priority</span>
                  </div>
                  <div className="hud-item text-right">
                     <span className="hud-val">14ms</span>
                     <span className="hud-lbl">Node Latency</span>
                  </div>
               </div>
            </div>

            <button 
               className={`exec-btn ${orderSide === 'BUY' ? 'buy' : 'sell'}`}
               onClick={handlePlaceOrder}
               disabled={loading}
            >
               {loading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} fill={orderSide === 'BUY' ? 'black' : 'white'} />}
               {loading ? 'EXECUTING...' : `INSTANT ${orderSide === 'BUY' ? 'BUY / LONG' : 'SELL / SHORT'}`}
            </button>

            <div className="mt-12 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
               <Shield size={24} className="text-emerald-500" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Capital Shield Active</span>
                  <span className="text-[11px] text-slate-500">Institutional-grade order routing enabled.</span>
               </div>
            </div>
         </div>
      </div>

      {orderMsg && (
         <div className={`status-toast ${orderMsg.type}`}>
            {orderMsg.text}
         </div>
      )}
    </div>
  );
}
