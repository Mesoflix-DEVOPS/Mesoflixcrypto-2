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
    <div className="lp-v2">
      <section className="lp-hero">
        <div className="container">
          <div className="lp-badge">Institutional-Grade Infrastructure</div>
          <h1 className="lp-title">Build your portfolio on <br /><span className="accent">Bybit Core</span></h1>
          <p className="lp-desc">Experience the world's most robust trading engine with military-grade security and institutional liquidity pools.</p>
          <div className="hero-actions">
             <Link to="/sign-up" className="c-btn primary">Open Account</Link>
             <Link to="/institutional-markets" className="c-btn secondary">Explore Markets</Link>
          </div>
        </div>
      </section>

      <section className="lp-campaign-box">
        <div className="container">
          <div className="campaign-card">
            <div className="c-left">
               <span className="c-badge">Bybit Official Promotion</span>
               <h2 className="c-title">Master the markets with <br /><span style={{ color: '#F7A600' }}>Bybit Institutional</span></h2>
               <p className="c-desc">Join the fastest growing exchange through MesoflixLabs. Get exclusive access to the highest rebate tiers and institutional liquidity.</p>
               <a href="https://partner.bybit.com/b/aff_7_157391" target="_blank" rel="noopener noreferrer" className="c-btn bybit">Claim Welcome Bonus</a>
            </div>
            <div className="desktop-only">
               <div className="promo-box">
                  <div className="promo-logo">BYBIT</div>
                  <div className="promo-val">$30,000</div>
                  <div className="promo-lbl">DEPOSIT REWARDS</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-features">
        <div className="container">
          <div className="feat-grid">
            <div className="feat-card">
              <img src={createIcon} className="f-icon" alt="Onboarding" />
              <h3 className="f-title">Quick Onboarding</h3>
              <p className="f-desc">Connect your existing Bybit account in seconds and unlock advanced features immediately.</p>
              <Link to="/sign-up" className="f-link">Connect Now <ArrowRight size={16} /></Link>
            </div>
            <div className="feat-card">
              <img src={loginIcon} className="f-icon" alt="Terminal" />
              <h3 className="f-title">Trading Terminal</h3>
              <p className="f-desc">Access a professional, high-density dashboard designed for millisecond trade execution.</p>
              <Link to="/dashboard" className="f-link">View Terminal <ArrowRight size={16} /></Link>
            </div>
            <div className="feat-card">
              <img src={manageIcon} className="f-icon" alt="Assets" />
              <h3 className="f-title">Asset Management</h3>
              <p className="f-desc">Monitor your live Bybit portfolio and track PnL curves with institutional tools.</p>
              <Link to="/invest" className="f-link">Manage Ledger <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-partner-strip">
        <div className="container">
          <div className="s-inner">
            <span className="s-label">Institutional Partner</span>
            <span className="s-logo">BYBIT</span>
            <div className="s-stat">
              <span className="s-val">$2.4B+</span>
              <span className="s-lbl">Daily Volume</span>
            </div>
            <div className="s-stat">
              <span className="s-val">100K/s</span>
              <span className="s-lbl">Match Speed</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-cta-newsletter">
        <div className="container">
          <h2 className="n-title">Stay synchronized</h2>
          <p className="n-desc">Get institutional insights and platform updates directly from the Mesoflix Node.</p>
          <div className="n-form">
            <input type="email" placeholder="institutional_email@domain.com" />
            <button>Connect</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
