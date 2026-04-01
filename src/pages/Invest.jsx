import React from 'react';
import { Link } from 'react-router-dom';
import supportImg from '../assets/images/support.png';

const strategies = [
  {
    icon: '🔁',
    title: 'Dollar-Cost Averaging',
    badge: 'Beginner Friendly',
    desc: 'Automatically invest a fixed amount at regular intervals — reducing the impact of volatility and building wealth systematically over time.',
    features: ['Automated recurring buys', 'Reduces timing risk', 'Suitable for all budgets'],
  },
  {
    icon: '📊',
    title: 'Portfolio Rebalancing',
    badge: 'Intermediate',
    desc: 'Maintain your target allocation by automatically buying and selling when assets drift beyond your set thresholds.',
    features: ['Custom allocation targets', 'Trigger-based rebalancing', 'Multi-asset portfolios'],
  },
  {
    icon: '⚡',
    title: 'Active Trading',
    badge: 'Advanced',
    desc: 'Take advantage of short-term market movements with full access to spot, futures, and derivatives markets via Bybit.',
    features: ['Full Bybit API access', 'Leverage up to 100x', 'Real-time order book'],
  },
];

const portfolioTools = [
  { icon: '📉', title: 'Risk Analyzer', desc: 'Assess the risk profile of your portfolio with advanced volatility and drawdown metrics.' },
  { icon: '🔔', title: 'Price Alerts', desc: 'Set intelligent alerts for price movements, breakouts, and volume spikes across any asset.' },
  { icon: '📋', title: 'Trade Journal', desc: 'Automatically log all your trades with P&L breakdowns, win rates, and performance trends.' },
  { icon: '🌐', title: 'Multi-Exchange View', desc: 'See your positions across Bybit and other connected exchanges in a single dashboard.' },
  { icon: '📆', title: 'Performance Reports', desc: 'Download detailed monthly and yearly reports for tax purposes and performance review.' },
  { icon: '🤖', title: 'Auto-Invest Bots', desc: 'Deploy pre-built trading bots on Bybit without coding — set it and let the algo do the work.' },
];

const growthStats = [
  { value: '$18B+', label: 'Assets Under Management' },
  { value: '520K+', label: 'Active Investors' },
  { value: '4.9★', label: 'User Rating' },
  { value: '47%', label: 'Average Annual Return' },
];

function Invest() {
  return (
    <div className="inner-page invest-page">
      {/* Hero */}
      <section className="page-hero-inner flex items-center justify-center text-center">
        <div className="container">
          <div className="inner-hero-badge">Investment Suite</div>
          <h1 className="inner-hero-title">Grow Your Wealth<br /><span className="gradient-text">Smarter, Faster</span></h1>
          <p className="text text-base inner-hero-desc">From automated investing to advanced portfolio tools — MesoflixLabs gives you everything you need to build long-term crypto wealth, powered by Bybit's deep liquidity.</p>
          <div className="hero-btns flex items-center justify-center">
            <Link to="/sign-up" className="btn btn-g-blue-veronica btn-base text-base">Start Investing</Link>
            <Link to="/market" className="btn btn-outline text-base">Explore Markets</Link>
          </div>
          <div className="hero-stats flex items-center justify-center">
            {growthStats.map((s, i) => (
              <React.Fragment key={i}>
                <div className="stat-item">
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
                {i < growthStats.length - 1 && <div className="stat-divider" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Strategies */}
      <section className="section-padded">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-badge">Strategies</div>
            <h2 className="large-title">Choose Your Approach</h2>
            <p className="text text-base">Whether you're a beginner or a pro, we have a strategy built for you</p>
          </div>
          <div className="strategy-cards-grid">
            {strategies.map((s, i) => (
              <div key={i} className="strategy-card">
                <div className="strategy-header flex items-center justify-between">
                  <span className="strategy-icon">{s.icon}</span>
                  <span className="strategy-badge">{s.badge}</span>
                </div>
                <h3 className="strategy-title">{s.title}</h3>
                <p className="text text-base">{s.desc}</p>
                <ul className="strategy-features">
                  {s.features.map((f, j) => (
                    <li key={j} className="strategy-feature-item flex items-center">
                      <span className="check-icon text-mint">✓</span>
                      <span className="text text-base">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/sign-up" className="btn btn-g-blue-veronica btn-base text-base strategy-cta">Get Started</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Tools */}
      <section className="section-padded section-dark-alt">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-badge">Toolbox</div>
            <h2 className="large-title">Powerful Portfolio Tools</h2>
            <p className="text text-base">Professional-grade features for serious investors</p>
          </div>
          <div className="features-grid">
            {portfolioTools.map((tool, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{tool.icon}</div>
                <h3 className="feature-card-title">{tool.title}</h3>
                <p className="text text-base">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Management */}
      <section className="section-padded">
        <div className="container">
          <div className="sc-two-content">
            <div className="sc-two-left">
              <div className="section-badge" style={{ marginBottom: '16px' }}>Risk First</div>
              <h2 className="large-title">Built-In Risk Management</h2>
              <p className="text text-base">MesoflixLabs automatically enforces risk controls to protect your capital — because smarter risk management leads to more consistent profits.</p>
              <div className="risk-features" style={{ margin: '32px 0' }}>
                {[
                  'Configurable stop-loss per trade',
                  'Daily drawdown limits',
                  'Position sizing recommendations',
                  'Margin call warnings',
                ].map((f, i) => (
                  <div key={i} className="risk-feature-item flex items-center">
                    <span className="check-icon text-mint" style={{ marginRight: '12px' }}>✓</span>
                    <span className="text text-base">{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/sign-up" className="btn btn-base btn-white text-base">Protect My Portfolio</Link>
            </div>
            <div className="sc-two-right">
              <img src={supportImg} alt="Risk Management" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padded cta-section text-center">
        <div className="container">
          <h2 className="large-title">Start growing your crypto portfolio today</h2>
          <p className="text text-base">Join 520,000+ investors who trust MesoflixLabs with their digital assets</p>
          <Link to="/sign-up" className="btn btn-g-blue-veronica btn-base text-base">Open an Account — Free</Link>
        </div>
      </section>
    </div>
  );
}

export default Invest;
