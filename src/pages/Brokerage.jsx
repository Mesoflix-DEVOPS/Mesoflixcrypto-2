import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import arrowWhiteIcon from '../assets/icons/arrow_white.svg';
import BybitConsole from '../components/BybitConsole';

const brokerageFeatures = [
  { icon: '🏦', title: 'Institutional Brokerage', desc: 'Authorized Bybit Broker partner providing professional access to global liquidity and execution for institutional and retail traders.' },
  { icon: '🔒', title: 'Security First', desc: 'Secure trading architecture where user funds remain on the exchange level (Bybit), ensuring MesoflixLabs never handles or stores your capital directly.' },
  { icon: '📊', title: 'Copy Trading', desc: 'Access elite trading strategies with automated copy trading tools designed for both beginners and experienced wealth managers.' },
  { icon: '⚡', title: 'Prime Execution', desc: 'Ultra-low latency connectivity to Bybit engines, ensuring your orders are filled with minimum slippage and maximum efficiency.' },
];

const liquidityStats = [
  { label: 'Asset Pairs', value: '450+' },
  { label: 'Daily Trading Vol', value: '$12B+' },
  { label: 'Order Execution', value: '< 2ms' },
  { label: 'Uptime', value: '99.99%' },
];

const tradingTiers = [
  { tier: 'Standard Brokerage', volume: 'Join the Bybit ecosystem through our secure portal.', benefits: ['Standard Trading Fees', '24/7 Global Support', 'Full Mobile Access'] },
  { tier: 'Institutional Prime', volume: 'For high-volume traders and hedge funds.', benefits: ['Reduced Fee Tiers', 'Priority API Access', 'Dedicated Account Manager'] },
];

function Brokerage() {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const profile = localStorage.getItem('user_profile');
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }
  }, []);

  return (
    <div className="inner-page brokerage-page">
      {/* Hero */}
      <section className="page-hero-inner flex items-center justify-center text-center">
        <div className="container">
          <div className="inner-hero-badge">Official Bybit Partner</div>
          <h1 className="inner-hero-title">Premier Crypto<br /><span className="gradient-text">Brokerage Services</span></h1>
          <p className="text text-base inner-hero-desc">MesoflixLabs provides the professional bridge to the Bybit ecosystem. Trade with institutional-grade liquidity, zero-fund handling risk, and world-class execution engines.</p>
          <div className="hero-btns flex items-center justify-center">
            {userProfile ? (
              <a href="#console" className="btn btn-g-blue-veronica btn-base text-base">Go to Trading Console</a>
            ) : (
              <Link to="/sign-up" className="btn btn-g-blue-veronica btn-base text-base">Open Account</Link>
            )}
            <Link to="/support" className="btn btn-outline text-base">Broker Support</Link>
          </div>

          {/* Stats */}
          <div className="hero-stats flex items-center justify-center">
            {liquidityStats.map((stat, i) => (
              <React.Fragment key={i}>
                <div className="stat-item">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
                {i < liquidityStats.length - 1 && <div className="stat-divider" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="section-padded">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="large-title">Brokerage Ecosystem</h2>
            <p className="text text-base">A secure gateway to professional trading infrastructure</p>
          </div>
          <div className="features-grid">
            {brokerageFeatures.map((item, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{item.icon}</div>
                <h3 className="feature-card-title">{item.title}</h3>
                <p className="text text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Focus */}
      <section id="console" className="section-padded section-dark-alt">
        <div className="container">
          <div className="sc-two-content" style={{ gap: '48px', alignItems: 'flex-start' }}>
            <div className="sc-two-left">
              <h2 className="large-title">Institutional <br /><span className="gradient-text">Connectivity Hub</span></h2>
              <p className="text text-base" style={{ marginBottom: '32px' }}>Authorized Bybit Broker Program ID: Ef001038. Connect your institutional account below to begin trading.</p>
              
              <BybitConsole />
            </div>
            <div className="sc-two-right" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', padding: '32px', borderRadius: '24px' }}>
               <div className="text-center" style={{ marginBottom: '24px' }}>
                 <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>Brokerage Verification</h3>
                 <p className="text" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Official Partner Identity Verified</p>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {tradingTiers.map((tier, i) => (
                   <div key={i} style={{ padding: '16px', borderRadius: '16px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <h4 style={{ color: '#60a5fa', fontWeight: 'bold', marginBottom: '4px', fontSize: '16px' }}>{tier.tier}</h4>
                     <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>{tier.volume}</p>
                     <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       {tier.benefits.map((b, bi) => (
                         <li key={bi} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <span style={{ width: '4px', height: '4px', background: '#3b82f6', borderRadius: '50%' }}></span> {b}
                         </li>
                       ))}
                     </ul>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padded cta-section text-center">
        <div className="container">
          <h2 className="large-title">Start Your Bybit Journey</h2>
          <p className="text text-base">Connect your Bybit account to the MesoflixLabs brokerage portal today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link to="/sign-up" className="btn btn-g-blue-veronica btn-base text-base">Join the Brokerage</Link>
            <Link to="/support" className="btn btn-outline text-base flex items-center gap-2">
               Contact Institutional Support
               <img src={arrowWhiteIcon} className="w-4 h-4" alt="Arrow" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Brokerage;
