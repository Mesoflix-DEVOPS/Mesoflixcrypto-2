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
        const response = await fetchWithLogging(getApiUrl('/api/market/all-symbols'));
        if (!response.ok) throw new Error('Failed to fetch symbols');
        const allSymbols = await response.json();
        const topSymbols = allSymbols.slice(0, 8);
        
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
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="home-hero-wrapper">
        <div className="header-intro flex flex-col items-center justify-center text-center p-10">
          <div className="inner-hero-badge mb-6" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>Bybit Institutional Platform</div>
          <h1 className="text-white mb-6 font-black tracking-tighter" style={{ fontSize: 'clamp(32px, 5vw, 72px)', lineHeight: '1.1' }}>Build your portfolio on <br /><span className="text-emerald-500">Bybit Infrastructure</span></h1>
          <p className="text-slate-400 mb-10 mx-auto" style={{ maxWidth: '600px', fontSize: '18px' }}>Experience the world's most robust trading engine with military-grade security and institutional-grade liquidity.</p>
          <div className="flex gap-4 justify-center">
             <Link to="/sign-up" className="btn grad-blue-veronica px-10 py-4 rounded-xl text-white font-bold uppercase text-xs">Open Account</Link>
             <Link to="/institutional-markets" className="btn border-white-5 px-10 py-4 rounded-xl text-white font-bold uppercase text-xs hover:bg-white/5 transition-all">Explore Markets</Link>
          </div>
        </div>

        <div className="bybit-launch-campaign p-10" style={{ marginTop: '80px' }}>
          <div className="container">
            <div className="bg-slate-900 border-white-5 rounded-3xl p-10 flex items-center gap-12 relative overflow-hidden" style={{ background: 'linear-gradient(to right, rgba(247, 166, 0, 0.1), transparent)' }}>
              <div className="flex-1">
                <div className="inline-block px-4 py-1.5 rounded-full text-emerald-500 font-black uppercase tracking-widest mb-6 border border-emerald-500/20" style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.1)' }}>Official Bybit Campaign</div>
                <h2 className="text-4xl font-black text-white tracking-tighter mb-6 leading-tight">Master the markets with <br /><span style={{ color: '#F7A600' }}>Bybit Institutional</span></h2>
                <p className="text-slate-500 mb-10" style={{ maxWidth: '500px' }}>Join the world's fastest growing crypto exchange through MesoflixLabs. Get exclusive access to the highest rebate tiers and institutional liquidity pools.</p>
                <div className="flex flex-wrap gap-4">
                  <a href="https://partner.bybit.com/b/aff_7_157391" target="_blank" rel="noopener noreferrer" className="btn px-10 py-4 rounded-xl text-black font-black uppercase tracking-widest hover:scale-105 transition-all" style={{ background: '#F7A600', fontSize: '11px' }}>Claim Welcome Bonus</a>
                </div>
              </div>
              <div className="desktop-only">
                <div className="bg-dark border-white-5 rounded-3xl p-10 flex flex-col items-center justify-center shadow-2xl" style={{ width: '240px', height: '240px' }}>
                  <div style={{ fontFamily: 'Arial Black', fontSize: '40px', color: '#F7A600', marginBottom: '20px' }}>bybit</div>
                  <div className="text-center">
                    <span className="block text-white font-black text-2xl">$30,000</span>
                    <span className="text-slate-500 font-bold tracking-widest uppercase" style={{ fontSize: '10px' }}>Deposit Rewards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="info p-10">
          <div className="container">
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              <div className="text-center bg-slate-900 border-white-5 rounded-3xl p-10 hover:border-emerald-500/30 transition-all">
                <img src={createIcon} alt="Create" className="mb-6 opacity-80" style={{ margin: '0 auto 24px' }} />
                <h3 className="text-white font-bold mb-4" style={{ fontSize: '20px' }}>Quick Onboarding</h3>
                <p className="text-slate-500 mb-6">Connect your existing Bybit account in seconds and unlock advanced institutional features immediately.</p>
                <Link to="/sign-up" className="flex items-center justify-center gap-2 text-emerald-500 font-bold uppercase tracking-widest" style={{ fontSize: '11px' }}>
                  Connect Now <img src={arrowIcon} className="w-4 h-4" alt="Arrow" />
                </Link>
              </div>
              <div className="text-center bg-slate-900 border-white-5 rounded-3xl p-10 hover:border-emerald-500/30 transition-all">
                <img src={loginIcon} alt="Connect" className="mb-6 opacity-80" style={{ margin: '0 auto 24px' }} />
                <h3 className="text-white font-bold mb-4" style={{ fontSize: '20px' }}>Trading Terminal</h3>
                <p className="text-slate-500 mb-6">Access a professional, high-density dashboard designed for millisecond trade execution and monitoring.</p>
                <Link to="/dashboard" className="flex items-center justify-center gap-2 text-emerald-500 font-bold uppercase tracking-widest" style={{ fontSize: '11px' }}>
                  View Terminal <img src={arrowIcon} className="w-4 h-4" alt="Arrow" />
                </Link>
              </div>
              <div className="text-center bg-slate-900 border-white-5 rounded-3xl p-10 hover:border-emerald-500/30 transition-all">
                <img src={manageIcon} alt="Manage" className="mb-6 opacity-80" style={{ margin: '0 auto 24px' }} />
                <h3 className="text-white font-bold mb-4" style={{ fontSize: '20px' }}>Asset Management</h3>
                <p className="text-slate-500 mb-6">Monitor your live Bybit portfolio, track PnL curves, and manage distribution with institutional tools.</p>
                <Link to="/invest" className="flex items-center justify-center gap-2 text-emerald-500 font-bold uppercase tracking-widest" style={{ fontSize: '11px' }}>
                  Manage Ledger <img src={arrowIcon} className="w-4 h-4" alt="Arrow" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bybit-partner-strip p-10" style={{ background: '#02040a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <span className="text-slate-500 font-bold uppercase tracking-widest" style={{ fontSize: '10px' }}>Verified Institutional Broker Partner</span>
            <div style={{ fontFamily: 'Arial Black', fontSize: '32px', color: '#F7A600' }}>bybit</div>
            <div className="flex gap-8 border-white-5" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '40px' }}>
              <div className="flex flex-col">
                <span className="text-white font-black text-xl">$2.4B+</span>
                <span className="text-slate-500 font-bold uppercase tracking-tighter" style={{ fontSize: '10px' }}>Daily Liquidity</span>
              </div>
              <div className="flex flex-col border-white-5" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
                <span className="text-white font-black text-xl">100K/s</span>
                <span className="text-slate-500 font-bold uppercase tracking-tighter" style={{ fontSize: '10px' }}>Matching Speed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="p-10" style={{ padding: '120px 0' }}>
        <div className="container">
          <div className="flex items-center gap-20 flex-wrap">
            <div className="flex-1" style={{ minWidth: '320px' }}>
              <div className="p-4 bg-emerald-500 rounded-xl flex items-center justify-center mb-8" style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)' }}>
                <Activity className="text-emerald-500" size={24} />
              </div>
              <h2 className="text-white font-black tracking-tighter mb-8" style={{ fontSize: '48px', lineHeight: '1.1' }}>Institutional performance for every trader.</h2>
              <p className="text-slate-400 mb-10" style={{ fontSize: '18px', lineHeight: '1.6' }}>Stop trading on retail delays. MesoflixLabs provides the same sub-second order routing and deep book liquidity used by professional market makers.</p>
              <Link to="/sign-up" className="btn bg-emerald-500 text-black font-black px-10 py-5 rounded-xl uppercase tracking-widest hover:scale-105 transition-all" style={{ fontSize: '11px' }}>Start Trading Now</Link>
            </div>
            <div className="flex-1 w-full bg-slate-900 border-white-5 rounded-3xl p-1 overflow-hidden shadow-2xl" style={{ minWidth: '320px' }}>
              <div className="p-10" style={{ background: '#0b111e' }}>
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-white font-bold text-lg">Market Performance</h3>
                  <span className="text-slate-500 font-black uppercase tracking-widest px-3 py-1 bg-white-5 rounded-full" style={{ fontSize: '10px' }}>Top Assets</span>
                </div>
                <div className="flex flex-col gap-6">
                  {loading ? (
                    <div className="text-center p-10 animate-pulse text-slate-500 font-bold">Syncing Engine...</div>
                  ) : (
                    coins.map((coin) => (
                      <div key={coin.ticker} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white-5 transition-all cursor-pointer">
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
                          <span className={`font-bold ${coin.positive ? 'text-emerald-500' : 'text-rose-500'}`} style={{ fontSize: '12px' }}>{coin.change}</span>
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

      <section className="p-10 text-center" style={{ padding: '120px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <h2 className="text-white font-black tracking-widest uppercase mb-6" style={{ fontSize: '32px' }}>Stay synchronized</h2>
          <p className="text-slate-500 mb-12 mx-auto" style={{ fontSize: '18px', maxWidth: '600px' }}>Get institutional insights and platform updates directly from the Mesoflix Node.</p>
          <form className="mx-auto" style={{ maxWidth: '480px' }} onSubmit={(e) => e.preventDefault()}>
            <div className="flex p-2 bg-slate-900 border-white-5 rounded-2xl">
              <input type="email" placeholder="institutional_email@domain.com" className="bg-transparent text-white px-6 flex-1 border-none outline-none font-mono text-sm" />
              <button className="bg-emerald-500 text-black font-black px-8 py-3 rounded-xl uppercase tracking-widest" style={{ fontSize: '11px' }}>Connect</button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default Home;
