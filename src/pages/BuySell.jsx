import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import arrowIcon from '../assets/icons/arrow.svg';
import arrowWhiteIcon from '../assets/icons/arrow_white.svg';
import graph1 from '../assets/images/small-graph1.png';
import graph2 from '../assets/images/small-graph2.png';
import graph3 from '../assets/images/small-graph3.png';
import graph4 from '../assets/images/small-graph4.png';
import graph5 from '../assets/images/small-graph5.png';

const coins = [
  { name: 'Bitcoin', ticker: 'BTC', price: '$56,290.30', change: '+1.68%', positive: true, graph: graph1 },
  { name: 'Ethereum', ticker: 'ETH', price: '$7,290.30', change: '+4.25%', positive: true, graph: graph2 },
  { name: 'Cardano', ticker: 'ADA', price: '$1.80', change: '+3.43%', positive: true, graph: graph3 },
  { name: 'Wax', ticker: 'WAXP', price: '$0.97', change: '-2.62%', positive: false, graph: graph4 },
  { name: 'Polkadot', ticker: 'DOT', price: '$42.22', change: '+7.56%', positive: true, graph: graph5 },
];

const orderTypes = [
  { icon: '⚡', title: 'Market Order', desc: 'Buy or sell instantly at the current best available price. Perfect for quick entries and exits.' },
  { icon: '🎯', title: 'Limit Order', desc: 'Set your price and trade only when the market hits it. Full control over your entry and exit points.' },
  { icon: '🛡️', title: 'Stop Loss', desc: 'Protect your capital with automated sell orders triggered when an asset drops to your set price.' },
  { icon: '📈', title: 'Take Profit', desc: 'Lock in gains automatically when the market reaches your target price without watching the screen.' },
];

const feeStructure = [
  { tier: 'Standard', volume: '< $50,000/month', maker: '0.10%', taker: '0.10%', benefit: 'Full access to all trading pairs' },
  { tier: 'Pro', volume: '$50k – $500k/month', maker: '0.08%', taker: '0.09%', benefit: 'Advanced charting + API access' },
  { tier: 'Elite', volume: '> $500,000/month', maker: '0.05%', taker: '0.07%', benefit: 'Dedicated account manager' },
];

function BuySell() {
  const [activeTab, setActiveTab] = useState('buy');

  return (
    <div className="inner-page buy-sell-page">
      {/* Hero */}
      <section className="page-hero-inner flex items-center justify-center text-center">
        <div className="container">
          <div className="inner-hero-badge">Trading Platform</div>
          <h1 className="inner-hero-title">Buy & Sell Crypto<br /><span className="gradient-text">with Confidence</span></h1>
          <p className="text text-base inner-hero-desc">Trade 300+ cryptocurrencies with competitive fees, deep liquidity, and lightning-fast execution — powered by Bybit infrastructure.</p>
          <div className="hero-btns flex items-center justify-center">
            <a href="#quick-trade" className="btn btn-g-blue-veronica btn-base text-base">Start Trading</a>
            <Link to="/market" className="btn btn-outline text-base">View Markets</Link>
          </div>

          {/* Stats */}
          <div className="hero-stats flex items-center justify-center">
            <div className="stat-item">
              <span className="stat-value">300+</span>
              <span className="stat-label">Crypto Assets</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">$2.4B</span>
              <span className="stat-label">Daily Volume</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">0.1%</span>
              <span className="stat-label">Trading Fee</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Trade Widget */}
      <section id="quick-trade" className="section-padded">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="large-title">Quick Trade</h2>
            <p className="text text-base">Execute trades instantly across our platform</p>
          </div>
          <div className="trade-widget">
            <div className="trade-tabs flex">
              <button className={`trade-tab ${activeTab === 'buy' ? 'active-buy' : ''}`} onClick={() => setActiveTab('buy')}>Buy</button>
              <button className={`trade-tab ${activeTab === 'sell' ? 'active-sell' : ''}`} onClick={() => setActiveTab('sell')}>Sell</button>
            </div>
            <div className="trade-form">
              <div className="trade-input-group">
                <label className="trade-label">You Pay</label>
                <div className="trade-input-wrap flex items-center justify-between">
                  <input type="number" placeholder="0.00" className="trade-input" defaultValue="" />
                  <select className="trade-select">
                    <option>USDT</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>
              <div className="trade-swap-icon flex items-center justify-center">⇅</div>
              <div className="trade-input-group">
                <label className="trade-label">You Receive</label>
                <div className="trade-input-wrap flex items-center justify-between">
                  <input type="number" placeholder="0.00" className="trade-input" defaultValue="" />
                  <select className="trade-select">
                    <option>BTC</option>
                    <option>ETH</option>
                    <option>ADA</option>
                    <option>DOT</option>
                  </select>
                </div>
              </div>
              <div className="trade-info flex items-center justify-between">
                <span className="text text-base">Rate</span>
                <span className="text-lavender text-base">1 BTC ≈ 56,290.30 USDT</span>
              </div>
              <button className={`btn btn-base w-full ${activeTab === 'buy' ? 'btn-g-blue-veronica' : 'btn-red'}`}>
                {activeTab === 'buy' ? 'Buy Now' : 'Sell Now'}
              </button>
              <p className="trade-disclaimer text text-base">Powered by Bybit liquidity engine</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Prices */}
      <section className="section-padded section-dark-alt">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="large-title">Live Market Prices</h2>
            <p className="text text-base">Real-time data from global exchanges</p>
          </div>
          <div className="data-table-wrapper">
            <div className="data-table">
              <table className="table">
                <thead>
                  <tr className="table-head-row grid">
                    <th className="flex items-center text-gray text-base">Asset</th>
                    <th className="flex items-center text-gray text-base">Symbol</th>
                    <th className="flex items-center text-gray text-base">Price</th>
                    <th className="flex items-center text-gray text-base">24h Change</th>
                    <th className="flex items-center text-gray text-base">Chart</th>
                    <th className="flex items-center text-gray text-base">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coins.map((coin) => (
                    <tr key={coin.ticker} className="grid">
                      <td className="flex items-center justify-center text-lg">{coin.name}</td>
                      <td className="flex items-center justify-center text-lavender text-lg">{coin.ticker}</td>
                      <td className="flex items-center justify-center text-lg">{coin.price}</td>
                      <td className={`flex items-center justify-center text-lg ${coin.positive ? 'text-mint' : 'text-light-red'}`}>{coin.change}</td>
                      <td className="flex items-center justify-center">
                        <img src={coin.graph} className="graph-img" alt="Chart" />
                      </td>
                      <td className="flex items-center justify-center">
                        <a href="#quick-trade" className="table-link flex items-center">
                          <span className="link-text no-wrap text-base">Trade Now</span>
                          <img src={arrowWhiteIcon} className="link-icon" alt="Arrow" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Order Types */}
      <section className="section-padded">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="large-title">Order Types</h2>
            <p className="text text-base">Professional tools for every trading strategy</p>
          </div>
          <div className="features-grid">
            {orderTypes.map((item, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{item.icon}</div>
                <h3 className="feature-card-title">{item.title}</h3>
                <p className="text text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Structure */}
      <section className="section-padded section-dark-alt">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="large-title">Transparent Fee Structure</h2>
            <p className="text text-base">No hidden costs — know exactly what you pay</p>
          </div>
          <div className="fee-table-wrap">
            {feeStructure.map((tier, i) => (
              <div key={i} className={`fee-row flex items-center justify-between ${i === 1 ? 'fee-row-featured' : ''}`}>
                <div className="fee-tier">
                  <span className="fee-tier-name">{tier.tier}</span>
                  {i === 1 && <span className="fee-badge-popular">Most Popular</span>}
                </div>
                <div className="fee-volume text text-base">{tier.volume}</div>
                <div className="fee-rates flex">
                  <div className="fee-rate-item">
                    <span className="fee-rate-label text-gray text-base">Maker</span>
                    <span className="fee-rate-value text-mint">{tier.maker}</span>
                  </div>
                  <div className="fee-rate-item">
                    <span className="fee-rate-label text-gray text-base">Taker</span>
                    <span className="fee-rate-value text-lavender">{tier.taker}</span>
                  </div>
                </div>
                <div className="fee-benefit text text-base">{tier.benefit}</div>
                <a href="#quick-trade" className="btn btn-g-blue-veronica text-base">Get Started</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padded cta-section text-center">
        <div className="container">
          <h2 className="large-title">Ready to start trading?</h2>
          <p className="text text-base">Join over 500,000 traders on MesoflixLabs today</p>
          <Link to="/sign-up" className="btn btn-g-blue-veronica btn-base text-base">Create Free Account</Link>
        </div>
      </section>
    </div>
  );
}

export default BuySell;
