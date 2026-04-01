import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      document.body.classList.add('resize-animation-stopper');
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper');
      }, 400);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="page-wrapper bg-dark">
      {/* Sticky Navbar — persists across all pages */}
      <div className="site-header">
        <div className="container w-full">
          <Navbar />
        </div>
      </div>

      {/* Page content rendered by React Router */}
      <main className="page-main">
        <Outlet />
      </main>

      {/* Footer — persists across all pages */}
      <Footer />
    </div>
  );
}

export default Layout;
