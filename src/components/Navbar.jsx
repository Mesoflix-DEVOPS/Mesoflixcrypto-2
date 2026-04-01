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
            <NavLink to="/brokerage" className={({ isActive }) => `nav-link text-base no-wrap${isActive ? ' active' : ''}`}>Brokerage</NavLink>
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

        <div className="sign-btns flex items-center">
          <NavLink to="/sign-in" className="btn text-base">Sign in</NavLink>
          <NavLink to="/sign-up" className="btn btn-g-blue-veronica text-base">Sign up</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
