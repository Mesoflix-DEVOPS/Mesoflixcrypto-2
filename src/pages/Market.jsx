import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import arrowWhiteIcon from '../assets/icons/arrow_white.svg';
import graph1 from '../assets/images/small-graph1.png';
import graph2 from '../assets/images/small-graph2.png';
import graph3 from '../assets/images/small-graph3.png';
import graph4 from '../assets/images/small-graph4.png';
import graph5 from '../assets/images/small-graph5.png';

const MOCK_ALL_COINS = [
  { name: 'Bitcoin', ticker: 'BTC', price: '$66,290.30', change: '+1.68%', cap: '$1.3T', vol: '$48.2B', positive: true, graph: graph1, category: 'top' },
  { name: 'Ethereum', ticker: 'ETH', price: '$3,490.30', change: '+4.25%', cap: '$419B', vol: '$21.1B', positive: true, graph: graph2, category: 'top' },
  { name: 'Cardano', ticker: 'ADA', price: '$0.58', change: '+3.43%', cap: '$20B', vol: '$1.3B', positive: true, graph: graph3, category: 'altcoin' },
  { name: 'Solana', ticker: 'SOL', price: '$188.20', change: '+9.21%', cap: '$83B', vol: '$7.9B', positive: true, graph: graph1, category: 'top' },
  { name: 'Polkadot', ticker: 'DOT', price: '$9.22', change: '+7.56%', cap: '$13B', vol: '$1.8B', positive: true, graph: graph5, category: 'top' },
  { name: 'Chainlink', ticker: 'LINK', price: '$18.86', change: '-1.34%', cap: '$11B', vol: '$920M', positive: false, graph: graph2, category: 'defi' },
  { name: 'Uniswap', ticker: 'UNI', price: '$11.44', change: '+2.87%', cap: '$6.4B', vol: '$490M', positive: true, graph: graph3, category: 'defi' },
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
  const [coins, setCoins] = useState(MOCK_ALL_COINS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    // Initial fetch to get baseline data (caps, volumes, names)
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coinlore.net/api/tickers/?start=0&limit=8');
        if (!response.ok) throw new Error('API error');
        
        const data = await response.json();
        const formattedCoins = data.data.map((coin, index) => ({
          name: coin.name,
          ticker: coin.symbol,
          price: parseFloat(coin.price_usd),
          displayPrice: `$${parseFloat(coin.price_usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: `${parseFloat(coin.percent_change_24h).toFixed(2)}%`,
          cap: `$${(parseFloat(coin.market_cap_usd) / 1e9).toFixed(1)}B`,
          vol: `$${(parseFloat(coin.volume24) / 1e6).toFixed(1)}M`,
          positive: parseFloat(coin.percent_change_24h) >= 0,
          graph: [graph1, graph2, graph3, graph4, graph5][index % 5],
          category: coin.symbol === 'BTC' || coin.symbol === 'ETH' || coin.symbol === 'SOL' ? 'top' : 'altcoin',
          flash: null
        }));
        setCoins(formattedCoins);
      } catch (err) {
        // Fallback
        setCoins(MOCK_ALL_COINS.map(c => ({...c, displayPrice: c.price, price: parseFloat(c.price.replace(/[^0-9.-]+/g,""))})));
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

    // Connect to live Binance WebSocket for real-time tick data
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCoins(prevCoins => {
        let updated = false;
        const newCoins = prevCoins.map(coin => {
          const tickerMatch = data.find(t => t.s === `${coin.ticker}USDT`);
          if (tickerMatch) {
            const newPrice = parseFloat(tickerMatch.c);
            const oldPrice = coin.price;
            
            if (newPrice !== oldPrice && !isNaN(newPrice)) {
              updated = true;
              return {
                ...coin,
                price: newPrice,
                displayPrice: `$${newPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: typeof newPrice === 'number' && newPrice < 1 ? 4 : 2 })}`,
                change: `${parseFloat(tickerMatch.P).toFixed(2)}%`,
                positive: parseFloat(tickerMatch.P) >= 0,
                flash: newPrice > oldPrice ? 'flash-up' : 'flash-down'
              };
            }
          }
          // Clear flash after 1 tick
          if (coin.flash) {
            updated = true;
            return { ...coin, flash: null };
          }
          return coin;
        });
        return updated ? newCoins : prevCoins;
      });
    };

    return () => {
      ws.close();
    };
  }, []);

  const filteredCoins = coins.filter((coin) => {
    if (activeCategory === 'All') return true;
    return coin.category && coin.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const categories = ['All', 'Top', 'Altcoin'];
  const filtered = coins.filter(c => activeCategory === 'All' || c.category === activeCategory.toLowerCase());

  return (
    <div className="inner-page market-page">
      <style>
        {`
          @keyframes flashGreen {
            0% { background-color: rgba(56, 204, 141, 0.3); color: #fff; transform: scale(1.05); }
            100% { background-color: transparent; transform: scale(1); }
          }
          @keyframes flashRed {
            0% { background-color: rgba(255, 107, 107, 0.3); color: #fff; transform: scale(1.05); }
            100% { background-color: transparent; transform: scale(1); }
          }
          .flash-up { animation: flashGreen 0.8s ease-out; border-radius: 6px; }
          .flash-down { animation: flashRed 0.8s ease-out; border-radius: 6px; }
          .price-cell { transition: color 0.2s ease, transform 0.2s ease; display: inline-block; padding: 4px 8px; }
        `}
      </style>
      
      {/* Hero */}
      <section className="page-hero-inner flex items-center justify-center text-center">
        <div className="container">
          <div className="inner-hero-badge relative overflow-hidden">
             Live Markets <div className="absolute top-0 left-0 w-full h-full bg-blue-500 opacity-20 animate-pulse"></div>
          </div>
          <h1 className="inner-hero-title">Crypto Market<br /><span className="gradient-text">At a Glance</span></h1>
          <p className="text text-base inner-hero-desc">Real-time prices, market cap, and volume data for top cryptocurrencies — fully live feed.</p>
        </div>
      </section>

      {/* Global Stats Bar */}
      <section className="market-stats-bar">
        <div className="container">
          <div className="market-stats-row flex items-center justify-between overflow-x-auto gap-8 py-4">
            {marketStats.map((s, i) => (
              <div key={i} className="market-stat-item no-wrap">
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

      {/* Coins Table */}
      <section className="section-padded section-dark-alt">
        <div className="container">
          <div className="section-header flex flex-wrap items-center justify-between gap-4">
            <h2 className="large-title flex items-center gap-3">
              All Assets
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </h2>
            <div className="market-category-tabs flex overflow-x-auto">
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
              {loading && coins.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray text-base">Connecting to live feed...</p>
                </div>
              ) : (
                <table className="table market-table">
                  <thead>
                    <tr className="table-head-row">
                      <th className="text-gray text-base text-center">#</th>
                      <th className="text-gray text-base">Asset</th>
                      <th className="text-gray text-base text-center">Price</th>
                      <th className="text-gray text-base text-center">24h %</th>
                      <th className="text-gray text-base text-center">Market Cap</th>
                      <th className="text-gray text-base text-center no-wrap">Volume (24h)</th>
                      <th className="text-gray text-base text-center hidden md:table-cell">Chart</th>
                      <th className="text-gray text-base text-center">Trade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((coin, idx) => (
                      <tr key={coin.ticker}>
                        <td className="text-gray text-base text-center">{idx + 1}</td>
                        <td className="text-lg no-wrap">
                          {coin.name} <span className="text-lavender text-base" style={{ marginLeft: '8px' }}>{coin.ticker}</span>
                        </td>
                        <td className="text-lg text-center"><span className={`price-cell ${coin.flash || ''}`}>{coin.displayPrice}</span></td>
                        <td className={`text-lg text-center ${coin.positive ? 'text-mint' : 'text-light-red'}`}>{coin.change}</td>
                        <td className="text-base text-center no-wrap">{coin.cap}</td>
                        <td className="text-base text-center no-wrap">{coin.vol}</td>
                        <td className="hidden md:table-cell">
                          <div className="flex justify-center">
                            <img src={coin.graph} className="graph-img" alt="chart" style={{ maxWidth: '100px' }} />
                          </div>
                        </td>
                        <td>
                          <div className="flex justify-center">
                            <Link to="/buy-sell" className="table-link">
                              <span className="link-text no-wrap text-base">Trade</span>
                              <img src={arrowWhiteIcon} className="link-icon" alt="Go" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
          <div className="trending-grid grid gap-8 mt-12">
            {!loading && coins.slice(0, 4).map((coin, i) => (
              <div key={i} className="trending-card">
                <div className="trending-header flex items-center justify-between mb-4">
                  <span className="trending-name font-bold text-lg">{coin.name}</span>
                  <span className="text-lavender text-base">{coin.ticker}</span>
                </div>
                <div className="trending-price text-2xl font-bold mb-2"><span className={`price-cell ${coin.flash || ''}`}>{coin.displayPrice}</span></div>
                <div className={`trending-change text-base font-semibold ${coin.positive ? 'text-mint' : 'text-light-red'}`}>{coin.change} (24h)</div>
                <div className="mt-6">
                  <img src={coin.graph} className="trending-graph w-full opacity-60" alt="chart" />
                </div>
                <Link to="/buy-sell" className="btn btn-g-blue-veronica text-base w-full" style={{ marginTop: '24px' }}>Trade Now</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Market;
