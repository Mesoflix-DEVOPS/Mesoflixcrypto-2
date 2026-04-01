import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import arrowWhiteIcon from '../assets/icons/arrow_white.svg';
import graph1 from '../assets/images/small-graph1.png';
import graph2 from '../assets/images/small-graph2.png';
import graph3 from '../assets/images/small-graph3.png';
import graph4 from '../assets/images/small-graph4.png';
import graph5 from '../assets/images/small-graph5.png';

const allCoins = [
  { name: 'Bitcoin', ticker: 'BTC', price: '$56,290.30', change: '+1.68%', cap: '$1.09T', vol: '$48.2B', positive: true, graph: graph1, category: 'top' },
  { name: 'Ethereum', ticker: 'ETH', price: '$7,290.30', change: '+4.25%', cap: '$875B', vol: '$31.1B', positive: true, graph: graph2, category: 'top' },
  { name: 'Cardano', ticker: 'ADA', price: '$1.80', change: '+3.43%', cap: '$63B', vol: '$4.3B', positive: true, graph: graph3, category: 'altcoin' },
  { name: 'Wax', ticker: 'WAXP', price: '$0.97', change: '-2.62%', cap: '$2.1B', vol: '$320M', positive: false, graph: graph4, category: 'altcoin' },
  { name: 'Polkadot', ticker: 'DOT', price: '$42.22', change: '+7.56%', cap: '$52B', vol: '$5.8B', positive: true, graph: graph5, category: 'top' },
  { name: 'Solana', ticker: 'SOL', price: '$188.40', change: '+9.21%', cap: '$83B', vol: '$7.9B', positive: true, graph: graph1, category: 'top' },
  { name: 'Chainlink', ticker: 'LINK', price: '$24.86', change: '-1.34%', cap: '$14B', vol: '$1.2B', positive: false, graph: graph2, category: 'defi' },
  { name: 'Uniswap', ticker: 'UNI', price: '$12.44', change: '+2.87%', cap: '$9.4B', vol: '$890M', positive: true, graph: graph3, category: 'defi' },
];

const categories = ['All', 'Top', 'DeFi', 'Altcoin'];

const marketSentiment = [
  { label: 'Bullish', pct: 67 },
  { label: 'Neutral', pct: 18 },
  { label: 'Bearish', pct: 15 },
];

const marketStats = [
  { label: 'Global Market Cap', value: '$2.43T', change: '+3.4%', positive: true },
  { label: '24h Volume', value: '$148B', change: '+12.1%', positive: true },
  { label: 'BTC Dominance', value: '44.8%', change: '-0.6%', positive: false },
  { label: 'Active Coins', value: '22,894', change: '+124', positive: true },
];

function Market() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortField, setSortField] = useState('cap');

  const filtered = allCoins.filter(c => activeCategory === 'All' || c.category === activeCategory.toLowerCase());

  return (
    <div className="inner-page market-page">
      {/* Hero */}
      <section className="page-hero-inner flex items-center justify-center text-center">
        <div className="container">
          <div className="inner-hero-badge">Live Markets</div>
          <h1 className="inner-hero-title">Crypto Market<br /><span className="gradient-text">At a Glance</span></h1>
          <p className="text text-base inner-hero-desc">Real-time prices, market cap, and volume data for 300+ cryptocurrencies — all in one place.</p>
        </div>
      </section>

      {/* Global Stats Bar */}
      <section className="market-stats-bar">
        <div className="container">
          <div className="market-stats-row flex items-center justify-between">
            {marketStats.map((s, i) => (
              <div key={i} className="market-stat-item">
                <span className="market-stat-label text-gray text-base">{s.label}</span>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <span className="market-stat-value">{s.value}</span>
                  <span className={`market-stat-change text-base ${s.positive ? 'text-mint' : 'text-light-red'}`}>{s.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Sentiment */}
      <section className="section-padded">
        <div className="container">
          <div className="market-sentiment-wrap">
            <div className="market-sentiment-header flex items-center justify-between">
              <h2 className="large-title">Market Sentiment</h2>
              <div className="sentiment-indicator text-mint">🟢 Fear & Greed: 72 — Greed</div>
            </div>
            <div className="sentiment-bars">
              {marketSentiment.map((s, i) => (
                <div key={i} className="sentiment-row flex items-center">
                  <span className="sentiment-label text text-base">{s.label}</span>
                  <div className="sentiment-bar-track flex-1">
                    <div
                      className={`sentiment-bar-fill ${i === 0 ? 'fill-mint' : i === 1 ? 'fill-lavender' : 'fill-red'}`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <span className="sentiment-pct text text-base">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coins Table */}
      <section className="section-padded section-dark-alt">
        <div className="container">
          <div className="section-header flex items-center justify-between">
            <h2 className="large-title">All Assets</h2>
            <div className="market-category-tabs flex">
              {categories.map(c => (
                <button
                  key={c}
                  className={`market-cat-tab text-base ${activeCategory === c ? 'active' : ''}`}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="data-table-wrapper">
            <div className="data-table">
              <table className="table market-table">
                <thead>
                  <tr className="table-head-row market-row grid">
                    <th className="flex items-center text-gray text-base">#</th>
                    <th className="flex items-center text-gray text-base">Asset</th>
                    <th className="flex items-center text-gray text-base">Price</th>
                    <th className="flex items-center text-gray text-base">24h %</th>
                    <th className="flex items-center text-gray text-base">Market Cap</th>
                    <th className="flex items-center text-gray text-base">Volume</th>
                    <th className="flex items-center text-gray text-base">Chart</th>
                    <th className="flex items-center text-gray text-base">Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((coin, idx) => (
                    <tr key={coin.ticker} className="market-row grid">
                      <td className="flex items-center justify-center text-gray text-base">{idx + 1}</td>
                      <td className="flex items-center text-lg">{coin.name} <span className="text-lavender text-base" style={{ marginLeft: '8px' }}>{coin.ticker}</span></td>
                      <td className="flex items-center justify-center text-lg">{coin.price}</td>
                      <td className={`flex items-center justify-center text-lg ${coin.positive ? 'text-mint' : 'text-light-red'}`}>{coin.change}</td>
                      <td className="flex items-center justify-center text-base">{coin.cap}</td>
                      <td className="flex items-center justify-center text-base">{coin.vol}</td>
                      <td className="flex items-center justify-center">
                        <img src={coin.graph} className="graph-img" alt="chart" />
                      </td>
                      <td className="flex items-center justify-center">
                        <Link to="/buy-sell" className="table-link flex items-center">
                          <span className="link-text no-wrap text-base">Trade</span>
                          <img src={arrowWhiteIcon} className="link-icon" alt="Go" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="section-padded">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="large-title">🔥 Trending Now</h2>
            <p className="text text-base">Most watched assets in the last 24 hours</p>
          </div>
          <div className="trending-grid">
            {allCoins.filter(c => c.positive).slice(0, 4).map((coin, i) => (
              <div key={i} className="trending-card">
                <div className="trending-header flex items-center justify-between">
                  <span className="trending-name">{coin.name}</span>
                  <span className="text-lavender text-base">{coin.ticker}</span>
                </div>
                <div className="trending-price">{coin.price}</div>
                <div className={`trending-change text-base ${coin.positive ? 'text-mint' : 'text-light-red'}`}>{coin.change} (24h)</div>
                <img src={coin.graph} className="trending-graph" alt="chart" />
                <Link to="/buy-sell" className="btn btn-g-blue-veronica text-base w-full" style={{ marginTop: '16px' }}>Trade Now</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Market;
