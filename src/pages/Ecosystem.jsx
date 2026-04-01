import React from 'react';
import { Link } from 'react-router-dom';
import supportImg from '../assets/images/support.png';

const integrations = [
  { icon: '🔗', title: 'Bybit API', desc: 'Connect directly to Bybit\'s industry-leading trading infrastructure. Execute spot, futures, and perpetual swaps programmatically.' },
  { icon: '📡', title: 'WebSocket Feeds', desc: 'Stream real-time market data with ultra-low latency WebSocket connections for order book depth, trades, and ticker updates.' },
  { icon: '🤖', title: 'Trading Bots', desc: 'Deploy and manage automated trading strategies on Bybit with our bot framework — no server setup required.' },
  { icon: '📊', title: 'Analytics API', desc: 'Access historical data, backtesting tools, and performance analytics through our developer-friendly REST API.' },
];

const roadmapItems = [
  { quarter: 'Q1 2026', title: 'Platform Launch', desc: 'MesoflixLabs goes live with full Bybit integration, spot trading, and portfolio management.', done: true },
  { quarter: 'Q2 2026', title: 'Auto-Trading Bots', desc: 'Launch of pre-built algorithmic trading bots with customizable parameters for all user levels.', done: true },
  { quarter: 'Q3 2026', title: 'Mobile App', desc: 'Native iOS and Android apps with full trading functionality, push alerts, and biometric auth.', done: false },
  { quarter: 'Q4 2026', title: 'Copy Trading', desc: 'Follow top traders automatically — mirror their live positions with your own risk controls.', done: false },
  { quarter: 'Q1 2027', title: 'Layer-2 DeFi Bridge', desc: 'Integrate decentralized trading protocols alongside centralized Bybit liquidity.', done: false },
];

const partnerBenefits = [
  { icon: '💧', title: 'Deep Liquidity', desc: 'Access Bybit\'s $2.4 billion daily trading volume ensuring fast fills at competitive prices.' },
  { icon: '🛡️', title: 'Cold Storage Security', desc: '100% of user funds stored in hardware-backed cold wallets with multi-sig authorization.' },
  { icon: '⚡', title: 'Low Latency Engine', desc: '0.01ms order execution engine processes 100,000+ trades per second without downtime.' },
  { icon: '🌍', title: 'Global Coverage', desc: 'Available in 180+ countries with localized payment methods and language support.' },
];

function Ecosystem() {
  return (
    <div className="inner-page ecosystem-page">
      {/* Hero */}
      <section className="page-hero-inner flex items-center justify-center text-center">
        <div className="container">
          <div className="inner-hero-badge">Ecosystem</div>
          <h1 className="inner-hero-title">Built on the World's<br /><span className="gradient-text">Best Infrastructure</span></h1>
          <p className="text text-base inner-hero-desc">MesoflixLabs is an authorized Bybit broker — giving you access to institutional-grade trading tools, liquidity, and security through one seamless platform.</p>
          <div className="hero-btns flex items-center justify-center">
            <Link to="/sign-up" className="btn btn-g-blue-veronica btn-base text-base">Start Trading</Link>
            <Link to="/support" className="btn btn-outline text-base">Developer Docs</Link>
          </div>
        </div>
      </section>

      {/* Bybit Partner Banner */}
      <section className="bybit-partner-section">
        <div className="container">
          <div className="bybit-partner-card flex items-center justify-between">
            <div className="bybit-partner-left">
              <div className="bybit-partner-badge-label">Official Partner</div>
              <h2 className="bybit-partner-title">Powered by Bybit</h2>
              <p className="text text-base bybit-partner-desc">As an official Bybit registered broker, MesoflixLabs connects your account directly to one of the world's top 3 crypto exchanges — maintaining full security, compliance, and liquidity standards.</p>
              <div className="bybit-partner-features">
                {['Registered & Compliant Broker', 'Direct API Integration', 'Segregated Client Funds', 'Bybit Insurance Fund Access'].map((f, i) => (
                  <div key={i} className="bybit-feature-item flex items-center">
                    <span className="check-icon text-mint" style={{ marginRight: '12px' }}>✓</span>
                    <span className="text text-base">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bybit-partner-logo-block">
              <div className="bybit-logo-large">
                <svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="0" y="50" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="52" fill="#F7A600">bybit</text>
                </svg>
              </div>
              <div className="bybit-verified-badge">
                <span className="text-mint">✓</span> Verified Broker Partner
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Bybit Powers Us */}
      <section className="section-padded">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-badge">Infrastructure</div>
            <h2 className="large-title">Why Bybit Powers MesoflixLabs</h2>
            <p className="text text-base">We chose Bybit for its unmatched performance, security, and global reach</p>
          </div>
          <div className="features-grid">
            {partnerBenefits.map((b, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{b.icon}</div>
                <h3 className="feature-card-title">{b.title}</h3>
                <p className="text text-base">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Integrations */}
      <section className="section-padded section-dark-alt">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-badge">Developers</div>
            <h2 className="large-title">Integrate & Build</h2>
            <p className="text text-base">Powerful APIs for developers to build on top of MesoflixLabs and Bybit</p>
          </div>
          <div className="features-grid">
            {integrations.map((item, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{item.icon}</div>
                <h3 className="feature-card-title">{item.title}</h3>
                <p className="text text-base">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="code-block-preview">
            <div className="code-block-header flex items-center justify-between">
              <span className="text-lavender text-base">Quick Start — Connect API</span>
              <span className="text-gray text-base">JavaScript</span>
            </div>
            <pre className="code-content">{`import { MesoflixClient } from '@mesoflixlabs/sdk';

const client = new MesoflixClient({
  apiKey: 'YOUR_API_KEY',
  broker: 'bybit', // Powered by Bybit
});

// Place a market order
const order = await client.trade({
  symbol: 'BTCUSDT',
  side: 'buy',
  amount: 100, // USDT
});

console.log(order); // { id, status, filled, price }`}</pre>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="section-padded">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-badge">Roadmap</div>
            <h2 className="large-title">What's Coming Next</h2>
            <p className="text text-base">Our vision for the MesoflixLabs ecosystem</p>
          </div>
          <div className="roadmap-timeline">
            {roadmapItems.map((item, i) => (
              <div key={i} className={`roadmap-item ${item.done ? 'done' : 'upcoming'}`}>
                <div className="roadmap-dot" />
                <div className="roadmap-content">
                  <div className="roadmap-quarter text-lavender text-base">{item.quarter}</div>
                  <h3 className="roadmap-title">{item.title}</h3>
                  <p className="text text-base">{item.desc}</p>
                  {item.done && <span className="roadmap-done-badge">✓ Completed</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padded cta-section text-center">
        <div className="container">
          <h2 className="large-title">Be part of the MesoflixLabs ecosystem</h2>
          <p className="text text-base">Trade smarter with institutional-grade Bybit infrastructure</p>
          <Link to="/sign-up" className="btn btn-g-blue-veronica btn-base text-base">Join Now</Link>
        </div>
      </section>
    </div>
  );
}

export default Ecosystem;
