import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

function DashboardLayout({ user, balance }) {
  return (
    <div className="layout-shell">
      <DashboardSidebar />
      
      <main className="layout-body">
        <DashboardHeader user={user} balance={balance} />
        
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
        }

        .layout-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #0a0f1d;
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
      `}} />
    </div>
  );
}

export default DashboardLayout;
