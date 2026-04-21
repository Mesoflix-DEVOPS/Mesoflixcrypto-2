import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PieChart, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Shield, 
  Zap, 
  Activity, 
  RefreshCw,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { getApiUrl, fetchWithLogging } from '../config/api';

function Invest() {
  const [balance, setBalance] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user_profile');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      fetchData(parsed.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async (userId) => {
    try {
      // Fetch REAL mode balance as default for Portfolio view
      const response = await fetchWithLogging(getApiUrl(`/api/bybit/dashboard/${userId}?environment=REAL`));
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
        setPositions(data.positions);
      }
    } catch (err) {
      console.error('Portfolio fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#02040a]">
         <div className="animate-spin text-emerald-500"><RefreshCw size={48} /></div>
      </div>
    );
  }

  // If not logged in or no keys linked
  if (!user || !balance) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900/40 border border-white/5 p-12 rounded-[40px] shadow-2xl backdrop-blur-xl">
           <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Shield className="text-emerald-500" size={40} />
           </div>
           <h1 className="text-3xl font-black text-white mb-4 tracking-tighter">Portfolio Locked</h1>
           <p className="text-slate-400 mb-10 leading-relaxed">Connect your Bybit Institutional account to view your live asset distribution, PnL performance, and trade history.</p>
           <button 
             onClick={() => navigate('/dashboard')}
             className="w-full py-4 bg-emerald-500 text-black font-black rounded-2xl uppercase tracking-widest text-sm hover:scale-105 transition-all"
           >
             Connect Bybit Now
           </button>
        </div>
      </div>
    );
  }

  const assetValue = parseFloat(balance.totalEquity);
  
  return (
    <div className="min-h-screen bg-[#02040a] p-10 text-slate-300 font-sans selection:bg-emerald-500/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
           <div>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bybit Managed Ledger</span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter">Institutional Portfolio</h1>
           </div>
           <div className="flex gap-4">
              <button className="px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Export CSV</button>
              <button className="px-6 py-3 bg-emerald-500 text-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">Sync Node</button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           <div className="lg:col-span-2 space-y-8">
              {/* Main Equity Card */}
              <div className="bg-gradient-to-br from-[#0b111e] to-[#060a14] border border-white/5 rounded-[40px] p-12 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[120px] rounded-full -mr-20 -mt-20"></div>
                 <div className="relative z-10">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block">Total Net Equity</span>
                    <div className="flex items-baseline gap-4 mb-4">
                       <span className="text-7xl font-black text-white tracking-tighter font-mono">
                         ${assetValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                       <span className="text-2xl font-black text-emerald-500 font-mono tracking-tight">+1.24%</span>
                    </div>
                    <div className="flex gap-10 mt-10">
                       <div className="flex flex-col">
                          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Available Liquid</span>
                          <span className="text-xl font-bold text-white font-mono">${parseFloat(balance.totalAvailableBalance).toLocaleString()}</span>
                       </div>
                       <div className="flex flex-col border-l border-white/5 pl-10">
                          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Unrealized PnL</span>
                          <span className="text-xl font-bold text-rose-500 font-mono">-${(assetValue * 0.02).toFixed(2)}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Positions Table */}
              <div className="bg-slate-900/20 border border-white/5 rounded-[40px] p-10">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-white tracking-tight">Active Positions</h3>
                    <Link to="/institutional-markets" className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                       Market Discovery <ArrowRight size={14} />
                    </Link>
                 </div>
                 <div className="space-y-4">
                    {positions.length > 0 ? positions.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-transparent hover:border-white/10 transition-all cursor-pointer">
                         <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm ${p.side === 'Buy' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                               {p.symbol.substring(0, 2)}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-white font-black text-lg uppercase">{p.symbol}</span>
                               <span className={`text-[10px] font-black uppercase tracking-widest ${p.side === 'Buy' ? 'text-emerald-500' : 'text-rose-500'}`}>{p.side} {p.leverage}x</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-16">
                            <div className="flex flex-col items-end">
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entry</span>
                               <span className="text-white font-bold font-mono tracking-tight">${parseFloat(p.avgPrice).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-end min-w-[120px]">
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unrealized PnL</span>
                               <span className={`text-lg font-black font-mono ${parseFloat(p.unrealisedPnl) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                 {parseFloat(p.unrealisedPnl) >= 0 ? '+' : ''}{parseFloat(p.unrealisedPnl).toFixed(2)} USDT
                               </span>
                            </div>
                         </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center text-slate-500 italic">No active institutional positions found.</div>
                    )}
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              {/* Asset Distribution */}
              <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-10">
                 <h3 className="text-lg font-black text-white tracking-tight mb-8">Asset Allocation</h3>
                 <div className="relative w-48 h-48 mx-auto mb-10">
                    <div className="absolute inset-0 border-[16px] border-emerald-500 rounded-full"></div>
                    <div className="absolute inset-0 border-[16px] border-white/5 rounded-full" style={{ clipPath: 'polygon(50% 50%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)' }}></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase">Cash</span>
                       <span className="text-2xl font-black text-white font-mono">82%</span>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-sm font-bold">USDT Liquidity</span>
                       </div>
                       <span className="font-mono text-sm">82.4%</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                          <span className="text-sm font-bold">Open Positions</span>
                       </div>
                       <span className="font-mono text-sm">17.6%</span>
                    </div>
                 </div>
              </div>

              {/* Bot Status */}
              <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-10">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-white tracking-tight">Active Algos</h3>
                    <Zap className="text-slate-600" size={20} />
                 </div>
                 <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                    <div className="flex items-center gap-4 mb-4">
                       <Activity className="text-emerald-500 animate-pulse" size={18} />
                       <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Scalper Node Active</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">Your automated scalper is currently monitoring BTC liquidity clusters on Bybit.</p>
                    <Link to="/bots" className="block text-center py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">Bot Terminal</Link>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default Invest;
