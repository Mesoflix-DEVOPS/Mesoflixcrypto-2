import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { getApiUrl, fetchWithLogging } from '../config/api';
import createIcon from '../assets/icons/create_icon.svg';
import loginIcon from '../assets/icons/login_icon.svg';
import manageIcon from '../assets/icons/manage_icon.svg';
import arrowIcon from '../assets/icons/arrow.svg';
import arrowWhiteIcon from '../assets/icons/arrow_white.svg';
import supportImg from '../assets/images/support.png';
import graph1 from '../assets/images/small-graph1.png';
import graph2 from '../assets/images/small-graph2.png';
import graph3 from '../assets/images/small-graph3.png';
import graph4 from '../assets/images/small-graph4.png';
import graph5 from '../assets/images/small-graph5.png';

const GRAPHS = [graph1, graph2, graph3, graph4, graph5];

function Home() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch top 8 Bybit symbols
        const response = await fetchWithLogging(getApiUrl('/api/market/all-symbols'));
        if (!response.ok) throw new Error('Failed to fetch symbols');
        const allSymbols = await response.json();
        
        // Take top 8 (usually BTC, ETH, SOL etc are at the top)
        const topSymbols = allSymbols.slice(0, 8);
        
        // Fetch tickers for each
        const mappedCoins = await Promise.all(topSymbols.map(async (s, index) => {
           try {
             const tRes = await fetch(getApiUrl(`/api/market/ticker/${s.symbol}`));
             if (tRes.ok) {
               const t = await tRes.json();
               return {
                 name: s.symbol.replace('USDT', ''),
                 ticker: s.symbol,
                 price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(t.lastPrice)),
                 change: (parseFloat(t.price24hPcnt) * 100).toFixed(2) + '%',
                 positive: parseFloat(t.price24hPcnt) >= 0,
                 graph: GRAPHS[index % 5]
               };
             }
           } catch (e) {}
           return null;
        }));

        setCoins(mappedCoins.filter(c => c !== null));
      } catch (error) {
        console.warn('[HOME_SYNC] Falling back to placeholder data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // 1 minute refresh for landed users
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="home-hero-wrapper">
        <div className="header-intro flex-1 flex flex-col items-center justify-center text-center">
          <div className="inner-hero-badge mb-6" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>Bybit Institutional Platform</div>
          <h1 className="text-6xl font-black tracking-tighter text-white mb-6">Build your portfolio on <span className="text-emerald-500">Bybit Infrastructure</span></h1>
          <p className="text-lg text-slate-400 max-w-2xl mb-10">Experience the world's most robust trading engine with military-grade security and institutional-grade liquidity.</p>
          <div className="flex gap-4">
             <Link to="/sign-up" className="btn btn-base btn-g-blue-veronica text-base px-10">Open Account</Link>
             <Link to="/institutional-markets" className="btn btn-outline text-base px-10">Explore Markets</Link>
          </div>
        </div>

        <div className="bybit-launch-campaign py-24 bg-gradient-to-b from-[#0a0f1d] to-[#030712] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-[40px] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full"></div>
             <div className="flex-1 z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest mb-6 border border-orange-500/20">Official Bybit Campaign</div>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-tight">Master the markets with <br /><span className="text-orange-500">Bybit Institutional</span></h2>
                <p className="text-slate-400 text-lg mb-10 max-w-xl">Join the world's fastest growing crypto exchange through MesoflixLabs. Get exclusive access to the highest rebate tiers and institutional liquidity pools.</p>
                <div className="flex flex-wrap gap-4">
                   <a href="https://partner.bybit.com/b/aff_7_157391" target="_blank" rel="noopener noreferrer" className="btn bg-orange-500 text-black font-black px-10 py-4 rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all">Claim Welcome Bonus</a>
                   <a href="https://partner.bybit.com/b/157391" target="_blank" rel="noopener noreferrer" className="btn border border-white/10 text-white font-black px-10 py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-white/5 transition-all">Partner Registration</a>
                </div>
             </div>
             <div className="flex-shrink-0 z-10 hidden lg:block">
                <div className="w-64 h-64 bg-[#030712] border border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center shadow-2xl rotate-3">
                   <svg width="80" height="80" viewBox="0 0 200 60" className="mb-6">
                      <text x="0" y="48" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="48" fill="#F7A600">bybit</text>
                   </svg>
                   <div className="text-center">
                      <span className="block text-white font-black text-2xl">$30,000</span>
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Deposit Rewards</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="info flex items-center justify-center">
        <div className="container">
          <div className="info-content grid">
            <div className="info-item text-center bg-slate-900/40 border border-white/5 rounded-3xl p-10 hover:border-emerald-500/30 transition-all group">
              <img src={createIcon} alt="Create" className="mx-auto mb-6 opacity-80 group-hover:scale-110 transition-all" />
              <h3 className="info-item-title text-xl font-bold mb-4">Quick Onboarding</h3>
              <p className="text-base text-slate-400 mb-6">Connect your existing Bybit account in seconds and unlock advanced institutional features immediately.</p>
              <Link to="/sign-up" className="flex items-center justify-center gap-2 text-emerald-500 font-bold hover:gap-4 transition-all uppercase text-xs tracking-widest">
                Connect Now <img src={arrowIcon} className="w-4 h-4" alt="Arrow" />
              </Link>
            </div>
            <div className="info-item text-center bg-slate-900/40 border border-white/5 rounded-3xl p-10 hover:border-emerald-500/30 transition-all group">
              <img src={loginIcon} alt="Connect" className="mx-auto mb-6 opacity-80 group-hover:scale-110 transition-all" />
              <h3 className="info-item-title text-xl font-bold mb-4">Trading Terminal</h3>
              <p className="text-base text-slate-400 mb-6">Access a professional, high-density dashboard designed for millisecond trade execution and monitoring.</p>
              <Link to="/dashboard" className="flex items-center justify-center gap-2 text-emerald-500 font-bold hover:gap-4 transition-all uppercase text-xs tracking-widest">
                View Terminal <img src={arrowIcon} className="w-4 h-4" alt="Arrow" />
              </Link>
            </div>
            <div className="info-item text-center bg-slate-900/40 border border-white/5 rounded-3xl p-10 hover:border-emerald-500/30 transition-all group">
              <img src={manageIcon} alt="Manage" className="mx-auto mb-6 opacity-80 group-hover:scale-110 transition-all" />
              <h3 className="info-item-title text-xl font-bold mb-4">Asset Management</h3>
              <p className="text-base text-slate-400 mb-6">Monitor your live Bybit portfolio, track PnL curves, and manage distribution with institutional tools.</p>
              <Link to="/invest" className="flex items-center justify-center gap-2 text-emerald-500 font-bold hover:gap-4 transition-all uppercase text-xs tracking-widest">
                Manage Ledger <img src={arrowIcon} className="w-4 h-4" alt="Arrow" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="bybit-partner-strip bg-[#030712] border-y border-white/5 py-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20">
            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] opacity-60">Verified Institutional Broker Partner</span>
            <div className="flex items-center gap-3">
              <svg width="120" height="40" viewBox="0 0 200 60" className="opacity-90">
                <text x="0" y="48" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="48" fill="#F7A600">bybit</text>
              </svg>
            </div>
            <div className="flex items-center gap-4 border-l border-white/10 pl-10">
               <div className="flex flex-col">
                  <span className="text-white font-black text-lg leading-tight">$2.4B+</span>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Daily Liquidity</span>
               </div>
               <div className="flex flex-col border-l border-white/10 pl-6">
                  <span className="text-white font-black text-lg leading-tight">100K/s</span>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Matching Speed</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-32 bg-[#02040a]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-20">
             <div className="flex-1">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-8">
                   <Activity className="text-emerald-500" size={24} />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-8 leading-tight">Institutional performance for every trader.</h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-lg">Stop trading on retail delays. MesoflixLabs provides the same sub-second order routing and deep book liquidity used by professional market makers.</p>
                <Link to="/sign-up" className="btn btn-emerald-500 bg-emerald-500 text-black font-black px-10 py-4 rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all inline-block text-center">Start Trading Now</Link>
             </div>
             <div className="flex-1 w-full bg-slate-900/20 border border-white/5 rounded-[32px] md:rounded-[40px] p-1 overflow-hidden shadow-2xl">
                <div className="bg-[#0b111e] rounded-[28px] md:rounded-[32px] p-6 md:p-10">
                   <div className="flex justify-between items-center mb-10">
                      <h3 className="text-white font-bold text-lg">Market Performance</h3>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full">Top Assets</span>
                   </div>
                   <div className="space-y-6">
                      {loading ? (
                         <div className="flex justify-center p-20 animate-pulse text-slate-500">Syncing Engine...</div>
                      ) : (
                         coins.map((coin) => (
                           <div key={coin.ticker} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-4 rounded-2xl transition-all border border-transparent hover:border-white/5">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-white text-xs">
                                    {coin.name[0]}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-white font-bold">{coin.name}</span>
                                    <span className="text-slate-500 text-xs font-mono">{coin.ticker}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end">
                                 <span className="text-white font-black font-mono">{coin.price}</span>
                                 <span className={`text-xs font-bold ${coin.positive ? 'text-emerald-500' : 'text-rose-500'}`}>{coin.change}</span>
                              </div>
                           </div>
                         ))
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section className="py-32 border-t border-white/5 bg-[#030712]">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-black text-white tracking-widest uppercase mb-6">Stay synchronized</h2>
            <p className="text-slate-500 text-lg mb-12 max-w-xl mx-auto">Get institutional insights and platform updates directly from the Mesoflix Node.</p>
            <form className="max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
               <div className="flex p-2 bg-slate-900/40 border border-white/10 rounded-2xl">
                  <input type="email" placeholder="institutional_email@domain.com" className="bg-transparent border-none text-white px-6 flex-1 outline-none font-mono text-sm" />
                  <button className="bg-emerald-500 text-black font-black px-6 py-3 rounded-xl uppercase text-xs tracking-widest">Connect</button>
               </div>
            </form>
        </div>
      </section>
    </>
  );
}

export default Home;
