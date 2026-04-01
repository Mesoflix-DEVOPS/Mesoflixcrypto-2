import React from 'react';
import { Link } from 'react-router-dom';
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

const coins = [
  { name: 'Bitcoin', ticker: 'BTC', price: '$56,290.30', change: '+1.68%', positive: true, graph: graph1 },
  { name: 'Ethereum', ticker: 'ETH', price: '$7,290.30', change: '+4.25%', positive: true, graph: graph2 },
  { name: 'Cardano', ticker: 'ADA', price: '$1.80', change: '+3.43%', positive: true, graph: graph3 },
  { name: 'Wax', ticker: 'WAXP', price: '$0.97', change: '-2.62%', positive: false, graph: graph4 },
  { name: 'Polkadot', ticker: 'DOT', price: '$42.22', change: '+7.56%', positive: true, graph: graph5 },
];

function Home() {
  return (
    <>
      {/* Hero Header */}
      <div className="home-hero-wrapper">
        <div className="header-intro flex-1 flex flex-col items-center justify-center text-center">
          <h1>We make trading crypto clear and simple</h1>
          <Link to="/buy-sell" className="btn btn-base btn-g-blue-veronica text-base">Get Started</Link>
        </div>

        {/* Info Cards */}
        <div className="info flex items-center justify-center">
          <div className="container">
            <div className="info-content grid">
              <div className="info-item text-center">
                <img src={createIcon} alt="Create" />
                <h3 className="info-item-title">Account Setup</h3>
                <p className="text-base text info-item-text">Create your MesoflixLabs account and verify your identity in minutes to start trading.</p>
                <Link to="/buy-sell" className="flex-inline items-center btn-link">
                  <span className="link-text text-lavender text text-base">Get Started</span>
                  <img src={arrowIcon} className="link-icon" alt="Arrow" />
                </Link>
              </div>
              <div className="info-item text-center">
                <img src={loginIcon} alt="Connect" />
                <h3 className="info-item-title">Secure Login</h3>
                <p className="text-base text info-item-text">Access your high-frequency trading dashboard with military-grade security and encryption.</p>
                <Link to="/sign-in" className="flex-inline items-center btn-link">
                  <span className="link-text text-lavender text text-base">Go to Dashboard</span>
                  <img src={arrowIcon} className="link-icon" alt="Arrow" />
                </Link>
              </div>
              <div className="info-item text-center">
                <img src={manageIcon} alt="Manage" />
                <h3 className="info-item-title">Portfolio Control</h3>
                <p className="text-base text info-item-text">Manage your trades, monitor market movements, and optimize your crypto strategy effortlessly.</p>
                <Link to="/invest" className="flex-inline items-center btn-link">
                  <span className="link-text text-lavender text text-base">Manage Portfolio</span>
                  <img src={arrowIcon} className="link-icon" alt="Arrow" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bybit Partner Strip */}
      <div className="bybit-partner-strip flex items-center justify-center">
        <div className="container">
          <div className="partner-strip-inner flex items-center justify-center">
            <span className="partner-strip-label text-gray text-base">Official Broker Partner of</span>
            <div className="bybit-strip-logo">
              <svg width="80" height="28" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="48" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="48" fill="#F7A600">bybit</text>
              </svg>
            </div>
            <span className="partner-strip-verified flex items-center">
              <span className="text-mint" style={{ marginRight: '4px' }}>✓</span>
              <span className="text-gray text-base">Verified & Regulated</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sections */}
      <section className="page-sc-one flex items-center justify-center">
        <div className="container">
          <div className="sc-one-content text-center">
            <div className="title-wrapper">
              <h2 className="large-title">A crypto trading platform that invests in you.</h2>
              <p className="text text-base">Experience the next generation of digital asset management with MesoflixLabs. We provide the tools and security you need to excel in the crypto markets.</p>
              <Link to="/buy-sell" className="btn btn-base btn-g-blue-veronica text-base">Start Trading</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-sc-two flex items-center">
        <div className="container">
          <div className="sc-two-content">
            <div className="sc-two-left">
              <img src={supportImg} alt="Support" />
            </div>
            <div className="sc-two-right">
              <h2 className="large-title">24/7 access to professional trading support</h2>
              <p className="text text-base">Our team of experts is always available to help you navigate the complexities of the crypto market, ensuring you never miss an opportunity.</p>
              <Link to="/support" className="btn btn-base btn-white text-base">Contact Support</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-sc-fees flex items-center">
        <div className="container">
          <div className="sc-fees-content text-center">
            <div className="title-wrapper">
              <h2 className="large-title">Trade with the lowest fees in the industry</h2>
              <p className="text text-base">MesoflixLabs offers competitive fee structures and transparent pricing for all your cryptocurrency transactions.</p>
              <Link to="/buy-sell" className="flex-inline items-center btn-link">
                <span className="link-text text-lavender text text-base">View Fee Schedule</span>
                <img src={arrowIcon} className="link-icon" alt="Arrow" />
              </Link>
            </div>
            <div className="data-table-wrapper">
              <div className="data-table">
                <table className="table">
                  <tbody>
                    {coins.map((coin) => (
                      <tr key={coin.ticker} className="grid">
                        <td className="flex items-center justify-center text-lg">{coin.name}</td>
                        <td className="flex items-center justify-center text-lavender text-lg">{coin.ticker}</td>
                        <td className="flex items-center justify-center text-lg">{coin.price}</td>
                        <td className={`flex items-center justify-center text-lg ${coin.positive ? 'text-mint' : 'text-light-red'}`}>{coin.change}</td>
                        <td className="flex items-center justify-center">
                          <img src={coin.graph} className="graph-img" alt="Graph" />
                        </td>
                        <td className="flex items-center justify-center">
                          <Link to="/buy-sell" className="table-link flex items-center">
                            <span className="link-text no-wrap text-base">Trade Now</span>
                            <img src={arrowWhiteIcon} className="link-icon" alt="Arrow" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-sc-invest flex items-center">
        <div className="container">
          <div className="sc-two-content">
            <div className="sc-two-left">
              <h2 className="large-title">Take your first step into safe, secure crypto trading</h2>
              <p className="text text-base">MesoflixLabs provides a secure environment for all your digital asset trades. Join thousands of traders who trust us with their crypto journey.</p>
              <Link to="/sign-up" className="btn btn-base btn-white text-base">Open Account</Link>
            </div>
            <div className="sc-two-right">
              <img src={supportImg} alt="Secure Trading" />
            </div>
          </div>
        </div>
      </section>

      <section className="page-sc-subscribe">
        <div className="container">
          <div className="sc-subscribe-content text-center">
            <h2 className="large-title">Stay updated with MesoflixLabs</h2>
            <p className="text text-base">Receive the latest market insights and platform updates. Unsubscribe at any time. <span className="text-white">Privacy policy</span></p>
            <form className="flex items-center justify-center" onSubmit={(e) => e.preventDefault()}>
              <div className="input-group flex items-center justify-between">
                <input type="email" className="input-control" placeholder="Email Address" />
                <button type="submit" className="input-btn flex items-center justify-center">
                  <img src={arrowWhiteIcon} alt="Submit" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
