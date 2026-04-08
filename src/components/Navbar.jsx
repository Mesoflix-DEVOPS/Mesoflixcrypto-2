import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import siteIcon from '../assets/icons/site_icon.svg';
import menuIcon from '../assets/icons/menu_icon.svg';
import closeIcon from '../assets/icons/close.svg';

function Navbar() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();

  // Close nav on route change
  useEffect(() => {
    setIsNavOpen(false);
  }, [location]);

  // Prevent scroll when nav open on mobile
  useEffect(() => {
    document.body.style.overflow = isNavOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isNavOpen]);

  return (
    <nav className="navbar flex items-center justify-between">
      <div className="brand-and-toggler flex items-center justify-between w-full">
        <NavLink to="/" className="navbar-brand flex items-center">
          <img src={siteIcon} alt="MesoflixLabs" />
          <span className="brand-text">MesoflixLabs</span>
        </NavLink>
        <button type="button" className="navbar-show-btn" onClick={() => setIsNavOpen(true)} aria-label="Open menu">
          <img src={menuIcon} alt="Menu" />
        </button>
      </div>

      <div className={`navbar-list-wrapper flex items-center ${isNavOpen ? 'show' : ''}`}>
        <ul className="nav-list flex items-center">
          <button type="button" className="navbar-hide-btn" onClick={() => setIsNavOpen(false)} aria-label="Close menu">
            <img src={closeIcon} alt="Close" />
          </button>
          <li className="nav-item">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link text-base no-wrap${isActive ? ' active' : ''}`}>Dashboard</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/invest" className={({ isActive }) => `nav-link text-base no-wrap${isActive ? ' active' : ''}`}>Invest</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/market" className={({ isActive }) => `nav-link text-base no-wrap${isActive ? ' active' : ''}`}>Market</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/ecosystem" className={({ isActive }) => `nav-link text-base no-wrap${isActive ? ' active' : ''}`}>Ecosystem</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/support" className={({ isActive }) => `nav-link text-base no-wrap${isActive ? ' active' : ''}`}>Support</NavLink>
          </li>
        </ul>

        <div className="sign-btns flex items-center" style={{ gap: '12px' }}>
          <NavLink to="/sign-in" className="btn text-base flex items-center justify-center" style={{ gap: '8px' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Sign in
          </NavLink>
          <NavLink to="/sign-up" className="btn btn-g-blue-veronica text-base flex items-center justify-center" style={{ gap: '8px' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            Sign up
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
