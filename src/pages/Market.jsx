import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Globe, 
  BarChart2, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { getApiUrl, fetchWithLogging } from '../config/api';

function Market() {
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovers = async () => {
      try {
        const res = await fetchWithLogging(getApiUrl('/api/market/all-symbols'));
        if (!res.ok) return;
        const all = await res.json();
        
        // Polling tickers for a sample of symbols to find gainers/losers
        // In a real app, the backend would provide a /movers endpoint
        // For now, we take a balanced set and fetch their tickers
        const sample = all.slice(0, 30);
        const results = await Promise.all(sample.map(async (s) => {
           const tRes = await fetch(getApiUrl(`/api/market/ticker/${s.symbol}`));
           if (tRes.ok) return { symbol: s.symbol, ...(await tRes.json()) };
           return null;
        }));

        const filtered = results.filter(r => r !== null);
        const sorted = [...filtered].sort((a, b) => b.price24hPcnt - a.price24hPcnt);
        
        setTopGainers(sorted.slice(0, 5));
        setTopLosers(sorted.reverse().slice(0, 5));
      } catch (err) {
        console.error('Movers fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovers();
  }, []);

  return (
    <div className="min-h-screen bg-[#02040a] p-10 text-slate-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
           <div className="flex items-center gap-2 mb-4">
              <Globe className="text-emerald-500 animate-pulse" size={16} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Intelligence</span>
           </div>
           <h1 className="text-6xl font-black text-white tracking-tighter mb-6">Market Heatmap</h1>
           <p className="text-lg text-slate-400 max-w-2xl">High-level overview of global liquidity shifts and sector performance across the Bybit derivatives ecosystem.</p>
        </div>

        {/* Sentiment Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
           <div className="lg:col-span-1 bg-slate-900/40 border border-white/5 rounded-[40px] p-10 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Node Sentiment Index</span>
              <div className="relative w-32 h-32 mb-8">
                 <div className="absolute inset-0 border-8 border-white/5 rounded-full"></div>
                 <div className="absolute inset-0 border-8 border-emerald-500 rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 70%)' }}></div>
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-black text-white">68</span>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase">Greed</span>
                 </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed uppercase font-bold tracking-tighter">Market sentiment is currently Bullish on M15 timeframes.</p>
           </div>

           <div className="lg:col-span-3 bg-slate-900/20 border border-white/5 rounded-[40px] p-10">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xl font-black text-white tracking-tight">Institutional Volume Cloud</h3>
                 <div className="flex gap-4">
                    <span className="text-[10px] font-bold text-emerald-500 px-3 py-1 bg-emerald-500/10 rounded-full uppercase">Exchange Online</span>
                 </div>
              </div>
              <div className="flex flex-wrap gap-4">
                 {['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOT', 'LINK', 'PEPE', 'BONK', 'ORDI', 'SUI', 'TIA'].map((t, idx) => (
                   <div key={t} className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer flex flex-col items-center gap-1" style={{ fontSize: `${20 - idx}px`, opacity: `${1 - (idx * 0.05)}` }}>
                      <span className="font-black text-white">{t}</span>
                      <span className="text-[9px] font-mono text-slate-500">Vol: ${(Math.random() * 500).toFixed(1)}M</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Top Gainers */}
           <div className="bg-[#0b111e] border border-white/5 rounded-[40px] p-10">
              <div className="flex items-center gap-3 mb-8">
                 <TrendingUp className="text-emerald-500" size={20} />
                 <h3 className="text-xl font-black text-white tracking-tight uppercase">Top Gainers (24h)</h3>
              </div>
              <div className="space-y-4">
                 {topGainers.map((g, i) => (
                   <Link key={i} to={`/dashboard?symbol=${g.symbol}`} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-transparent hover:border-emerald-500/20 transition-all">
                      <span className="font-black text-white uppercase">{g.symbol}</span>
                      <div className="flex items-center gap-4">
                         <span className="font-mono text-slate-400 font-bold">${parseFloat(g.lastPrice).toLocaleString()}</span>
                         <span className="text-emerald-500 font-black font-mono">+({(parseFloat(g.price24hPcnt) * 100).toFixed(2)}%)</span>
                         <ArrowUpRight className="text-emerald-500" size={16} />
                      </div>
                   </Link>
                 ))}
                 {loading && <div className="p-10 text-center animate-pulse text-slate-600 font-bold uppercase tracking-widest text-xs">Scanning liquidity...</div>}
              </div>
           </div>

           {/* Top Losers */}
           <div className="bg-[#0b111e] border border-white/5 rounded-[40px] p-10">
              <div className="flex items-center gap-3 mb-8">
                 <TrendingDown className="text-rose-500" size={20} />
                 <h3 className="text-xl font-black text-white tracking-tight uppercase">Top Losers (24h)</h3>
              </div>
              <div className="space-y-4">
                 {topLosers.map((l, i) => (
                   <Link key={i} to={`/dashboard?symbol=${l.symbol}`} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-transparent hover:border-rose-500/20 transition-all">
                      <span className="font-black text-white uppercase">{l.symbol}</span>
                      <div className="flex items-center gap-4">
                         <span className="font-mono text-slate-400 font-bold">${parseFloat(l.lastPrice).toLocaleString()}</span>
                         <span className="text-rose-500 font-black font-mono">({(parseFloat(l.price24hPcnt) * 100).toFixed(2)}%)</span>
                         <ArrowDownRight className="text-rose-500" size={16} />
                      </div>
                   </Link>
                 ))}
                 {loading && <div className="p-10 text-center animate-pulse text-slate-600 font-bold uppercase tracking-widest text-xs">Scanning liquidity...</div>}
              </div>
           </div>
        </div>

        <div className="mt-16 text-center">
           <Link to="/institutional-markets" className="inline-flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-emerald-500 hover:border-emerald-500/20 transition-all">
              Launch Discovery Hub <BarChart2 size={16} />
           </Link>
        </div>
      </div>
    </div>
  );
}

export default Market;
