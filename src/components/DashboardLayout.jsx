import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

function DashboardLayout({ user, balance }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout-shell">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}

      <DashboardSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <main className="layout-body">
        <DashboardHeader 
          user={user} 
          balance={balance} 
          onMenuClick={toggleSidebar} 
          sidebarOpen={sidebarOpen}
        />
        
        <section className="layout-content">
          <Outlet />
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .layout-shell {
          display: flex;
          min-height: 100vh;
          background: #060a14;
          color: #fff;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1040;
          display: none;
        }

        .layout-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #0a0f1d;
          height: 100vh;
        }

        .layout-content {
          flex: 1;
          overflow-y: auto;
          position: relative;
        }

        /* Institutional Dark Scrollbar */
        .layout-content::-webkit-scrollbar {
          width: 5px;
        }
        .layout-content::-webkit-scrollbar-track {
          background: #0a0f1d;
        }
        .layout-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .layout-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 1024px) {
          .sidebar-backdrop {
            display: block;
          }
        }
      `}} />
    </div>
  );
}

export default DashboardLayout;
