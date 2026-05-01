import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { getApiUrl, fetchWithLogging } from '../config/api';
import createIcon from '../assets/icons/create_icon.svg';
import loginIcon from '../assets/icons/login_icon.svg';
import manageIcon from '../assets/icons/manage_icon.svg';
import arrowIcon from '../assets/icons/arrow.svg';

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
        
        const mappedCoins = await Promise.all(topSymbols.map(async (s) => {
           try {
             const tRes = await fetch(getApiUrl(`/api/market/ticker/${s.symbol}`));
             if (tRes.ok) {
               const t = await tRes.json();
               return {
                 name: s.symbol.replace('USDT', ''),
                 ticker: s.symbol,
                 price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(t.lastPrice)),
                 change: (parseFloat(t.price24hPcnt) * 100).toFixed(2) + '%',
                 positive: parseFloat(t.price24hPcnt) >= 0
               };
             }
           } catch (e) {}
           return null;
        }));
        setCoins(mappedCoins.filter(c => c !== null));
      } catch (error) {
        console.warn('[HOME_SYNC] Sync error:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  return (
    <div className="premium-page-wrap">
      <section className="premium-hero">
        <div className="container">
          <div className="hero-badge">Institutional-Grade Infrastructure</div>
          <h1 className="hero-title">Build your portfolio on <br /><span>Bybit Core</span></h1>
          <p style={{ fontSize: '20px', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 56px', lineHeight: '1.6' }}>
            Experience the world's most robust trading engine with military-grade security and institutional liquidity pools.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
             <Link to="/sign-up" className="job-btn" style={{ padding: '18px 48px' }}>Open Account</Link>
             <Link to="/institutional-markets" style={{ color: '#fff', fontWeight: '800', textDecoration: 'none', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Explore Markets</Link>
          </div>
        </div>
      </section>

      <section className="premium-section">
        <div className="container">
          <div style={{ background: 'linear-gradient(165deg, rgba(247, 166, 0, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(247, 166, 0, 0.2)', borderRadius: '40px', padding: '80px', display: 'flex', alignItems: 'center', gap: '80px' }}>
            <div style={{ flex: 1 }}>
               <span style={{ background: 'rgba(247, 166, 0, 0.1)', color: '#F7A600', padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(247, 166, 0, 0.2)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '32px', display: 'inline-block' }}>Bybit Official Promotion</span>
               <h2 style={{ fontSize: '48px', fontWeight: '950', color: '#fff', marginBottom: '24px', lineHeight: '1.1' }}>Master the markets with <br /><span style={{ color: '#F7A600' }}>Bybit Institutional</span></h2>
               <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '48px', lineHeight: '1.6', maxWidth: '580px' }}>Join the fastest growing exchange through MesoflixLabs. Get exclusive access to the highest rebate tiers and institutional liquidity.</p>
               <a href="https://partner.bybit.com/b/aff_7_157391" target="_blank" rel="noopener noreferrer" className="job-btn" style={{ background: '#F7A600' }}>Claim Welcome Bonus</a>
            </div>
            <div className="desktop-only" style={{ flex: 1 }}>
               <div style={{ background: '#000', border: '1px solid rgba(247, 166, 0, 0.3)', borderRadius: '32px', padding: '48px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#F7A600', marginBottom: '12px' }}>BYBIT</div>
                  <div style={{ fontSize: '48px', fontWeight: '950', color: '#fff' }}>$30,000</div>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>DEPOSIT REWARDS</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="premium-section">
        <div className="container">
          <div className="premium-card-grid">
            <div className="premium-card">
              <img src={createIcon} style={{ height: '48px', marginBottom: '24px' }} alt="Onboarding" />
              <h3 className="card-title">Quick Onboarding</h3>
              <p className="card-text">Connect your existing Bybit account in seconds and unlock advanced features immediately.</p>
              <Link to="/sign-up" style={{ color: '#10b981', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>Connect Now <ArrowRight size={16} /></Link>
            </div>
            <div className="premium-card">
              <img src={loginIcon} style={{ height: '48px', marginBottom: '24px' }} alt="Terminal" />
              <h3 className="card-title">Trading Terminal</h3>
              <p className="card-text">Access a professional, high-density dashboard designed for millisecond trade execution.</p>
              <Link to="/dashboard" style={{ color: '#10b981', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>View Terminal <ArrowRight size={16} /></Link>
            </div>
            <div className="premium-card">
              <img src={manageIcon} style={{ height: '48px', marginBottom: '24px' }} alt="Assets" />
              <h3 className="card-title">Asset Management</h3>
              <p className="card-text">Monitor your live Bybit portfolio and track PnL curves with institutional tools.</p>
              <Link to="/invest" style={{ color: '#10b981', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>Manage Ledger <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#000', padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '80px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.25em' }}>Institutional Partner</span>
            <span style={{ fontSize: '42px', fontWeight: '950', color: '#F7A600', letterSpacing: '0.1em' }}>BYBIT</span>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '48px' }}>
              <span style={{ fontSize: '32px', fontWeight: '950', color: '#fff', display: 'block', lineHeight: '1' }}>$2.4B+</span>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Daily Volume</span>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '48px' }}>
              <span style={{ fontSize: '32px', fontWeight: '950', color: '#fff', display: 'block', lineHeight: '1' }}>100K/s</span>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Match Speed</span>
            </div>
          </div>
        </div>
      </section>

      <section className="premium-section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '56px', fontWeight: '950', color: '#fff', marginBottom: '24px' }}>Stay synchronized</h2>
          <p style={{ color: '#94a3b8', fontSize: '20px', marginBottom: '56px', maxWidth: '650px', margin: '0 auto 56px' }}>Get institutional insights and platform updates directly from the Mesoflix Node.</p>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '10px', display: 'flex' }}>
            <input type="email" placeholder="institutional_email@domain.com" style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 32px', color: '#fff', outline: 'none' }} />
            <button className="job-btn">Connect</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
