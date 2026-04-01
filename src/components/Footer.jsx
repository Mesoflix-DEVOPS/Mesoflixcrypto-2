import React from 'react';
import { Link } from 'react-router-dom';
import arrowWhiteIcon from '../assets/icons/arrow_white.svg';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        {/* Partner Badge */}
        <div className="footer-partner-badge">
          <span className="partner-label">Official Broker Partner</span>
          <div className="partner-logo-wrap">
            <svg width="90" height="28" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="45" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="48" fill="#F7A600">bybit</text>
            </svg>
          </div>
        </div>

        <div className="footer-content grid">
          <div className="footer-item">
            <p className="text text-base">MesoflixLabs, a premium crypto trading platform powered by Bybit infrastructure — making digital asset trading simple, fast, and secure.</p>
            <p className="text text-base">Sign up to get the latest in MesoflixLabs news, market updates, and more.</p>

            <form className="flex items-center" onSubmit={(e) => e.preventDefault()}>
              <div className="input-group flex items-center justify-between">
                <input type="email" className="input-control" placeholder="Email address" />
                <button type="submit" className="input-btn flex items-center justify-center">
                  <img src={arrowWhiteIcon} alt="Submit" />
                </button>
              </div>
            </form>
            <p className="text text-base">&copy; 2026 MesoflixLabs, LLC. All rights reserved.</p>
          </div>

          <div className="footer-item">
            <h4 className="footer-item-title text-gray text-base">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about" className="footer-link text-gray text-base">About Us</Link></li>
              <li><Link to="/careers" className="footer-link text-gray text-base">Careers</Link></li>
              <li><Link to="/press" className="footer-link text-gray text-base">Press</Link></li>
              <li><Link to="/news" className="footer-link text-gray text-base">News</Link></li>
              <li><Link to="/ecosystem" className="footer-link text-gray text-base">Ecosystem</Link></li>
            </ul>
          </div>

          <div className="footer-item">
            <h4 className="footer-item-title text-gray text-base">Legal</h4>
            <ul className="footer-links">
              <li><Link to="/privacy" className="footer-link text-gray text-base">Privacy Policy</Link></li>
              <li><Link to="/biometrics-privacy" className="footer-link text-gray text-base">Biometrics Privacy</Link></li>
              <li><Link to="/financial-policy" className="footer-link text-gray text-base">Financial Policy</Link></li>
              <li><Link to="/terms" className="footer-link text-gray text-base">Terms of Service</Link></li>
              <li><Link to="/trading-terms" className="footer-link text-gray text-base">Trading Terms</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
