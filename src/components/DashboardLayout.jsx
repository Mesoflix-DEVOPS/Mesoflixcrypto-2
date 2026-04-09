import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

function DashboardLayout({ user, balance }) {
  return (
    <div className="dashboard-shell">
      <DashboardSidebar />
      
      <main className="dashboard-main">
        <DashboardHeader user={user} balance={balance} />
        
        <div className="dashboard-view">
          <Outlet />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
          background: #020617;
          color: #fff;
          font-family: 'Inter', sans-serif;
        }

        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0; /* Prevent flex overflow */
          background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.03) 0%, transparent 40%);
        }

        .dashboard-view {
          flex: 1;
          padding: 40px;
          overflow-y: auto;
        }

        /* Institutional Scrollbar */
        .dashboard-view::-webkit-scrollbar {
          width: 6px;
        }
        .dashboard-view::-webkit-scrollbar-track {
          background: transparent;
        }
        .dashboard-view::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .dashboard-view::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}

export default DashboardLayout;
