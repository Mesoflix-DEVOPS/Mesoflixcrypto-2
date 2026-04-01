import React from 'react';
import { Link } from 'react-router-dom';
import arrowWhiteIcon from '../assets/icons/arrow_white.svg';

const brokerageFeatures = [
  { icon: '🏦', title: 'Institutional Brokerage', desc: 'Authorized Bitget Broker partner providing professional access to global liquidity and execution for institutional and retail traders.' },
  { icon: '🔒', title: 'Security First', desc: 'Secure trading architecture where user funds remain on the exchange level (Bitget), ensuring MesoflixLabs never handles or stores your capital directly.' },
  { icon: '📊', title: 'Copy Trading', desc: 'Access elite trading strategies with automated copy trading tools designed for both beginners and experienced wealth managers.' },
  { icon: '⚡', title: 'Prime Execution', desc: 'Ultra-low latency connectivity to Bitget engines, ensuring your orders are filled with minimum slippage and maximum efficiency.' },
];

const liquidityStats = [
  { label: 'Asset Pairs', value: '450+' },
  { label: 'Daily Trading Vol', value: '$12B+' },
  { label: 'Order Execution', value: '< 2ms' },
  { label: 'Uptime', value: '99.99%' },
];

const tradingTiers = [
  { tier: 'Standard Brokerage', volume: 'Join the Bitget ecosystem through our secure portal.', benefits: ['Standard Trading Fees', '24/7 Global Support', 'Full Mobile Access'] },
  { tier: 'Institutional Prime', volume: 'For high-volume traders and hedge funds.', benefits: ['Reduced Fee Tiers', 'Priority API Access', 'Dedicated Account Manager'] },
];

function Brokerage() {
  return (
    <div className="inner-page brokerage-page">
      {/* Hero */}
      <section className="page-hero-inner flex items-center justify-center text-center">
        <div className="container">
          <div className="inner-hero-badge">Official Bitget Partner</div>
          <h1 className="inner-hero-title">Premier Crypto<br /><span className="gradient-text">Brokerage Services</span></h1>
          <p className="text text-base inner-hero-desc">MesoflixLabs provides the professional bridge to the Bitget ecosystem. Trade with institutional-grade liquidity, zero-fund handling risk, and world-class execution engines.</p>
          <div className="hero-btns flex items-center justify-center">
            <a href="https://www.bitget.com" target="_blank" rel="noopener noreferrer" className="btn btn-g-blue-veronica btn-base text-base">Register with Bitget</a>
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
      <section className="section-padded section-dark-alt">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="large-title">Designed for <br /><span className="gradient-text">Institutional Grade</span></h2>
              <p className="text text-base mb-8">As an authorized broker, we specialize in providing professional traders with the tools they need to scale. Our infrastructure is built to handle the highest demands of modern trading without compromising on safety or transparency.</p>
              <ul className="check-list">
                <li className="flex items-start gap-3 mb-4">
                  <div className="check-icon">✓</div>
                  <p className="text text-sm">Direct market access to Bitget spot and futures liquidity.</p>
                </li>
                <li className="flex items-start gap-3 mb-4">
                  <div className="check-icon">✓</div>
                  <p className="text text-sm">Zero-fund custody risk — your funds stay in your exchange wallet.</p>
                </li>
                <li className="flex items-start gap-3 mb-4">
                  <div className="check-icon">✓</div>
                  <p className="text text-sm">Dedicated institutional support for high-volume brokerage clients.</p>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 bg-slate-900 border border-slate-800 p-8 rounded-3xl">
               <div className="text-center mb-6">
                 <h3 className="text-xl font-bold">Partnership Verified</h3>
                 <p className="text-xs text-slate-500 mt-1">Institutional Broker Program ID: MS-FLX-2026</p>
               </div>
               <div className="space-y-4">
                 {tradingTiers.map((tier, i) => (
                   <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                     <h4 className="text-blue-400 font-bold">{tier.tier}</h4>
                     <p className="text-xs text-slate-400 mt-1 mb-3">{tier.volume}</p>
                     <ul className="grid grid-cols-1 gap-2">
                       {tier.benefits.map((b, bi) => (
                         <li key={bi} className="text-[10px] text-slate-300 flex items-center gap-2">
                           <span className="w-1 h-1 bg-blue-500 rounded-full"></span> {b}
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
          <h2 className="large-title">Start Your Institutional Journey</h2>
          <p className="text text-base">Connect your Bitget account to the MesoflixLabs brokerage portal today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a href="https://www.bitget.com" target="_blank" rel="noopener noreferrer" className="btn btn-g-blue-veronica btn-base text-base">Join the Brokerage</a>
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
