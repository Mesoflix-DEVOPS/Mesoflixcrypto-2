import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useUser } from './AuthContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

function DashboardLayout() {
  const { user, balance, refresh } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tradingMode, setTradingMode] = useState('REAL');

  const toggleSidebar = () => setSidebarOpen(v => !v);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCollapse = () => setSidebarCollapsed(v => !v);

  return (
    <div className="dl-shell">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="dl-backdrop" onClick={closeSidebar} />
      )}

      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        collapsed={sidebarCollapsed}
        onCollapseToggle={toggleCollapse}
      />

      <main className="dl-body">
        <DashboardHeader
          onMenuClick={toggleSidebar}
          sidebarOpen={sidebarOpen}
          tradingMode={tradingMode}
          setTradingMode={setTradingMode}
        />
        <section className="dl-content">
          <Outlet context={{ tradingMode, setTradingMode, user, balance, refresh }} />
        </section>
      </main>

      <style>{`
        .dl-shell {
          display: flex;
          min-height: 100vh;
          background: #07111f;
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          position: relative;
        }
        .dl-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(6px);
          z-index: 1040;
        }
        .dl-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #07111f;
          height: 100vh;
        }
        .dl-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        }
        .dl-content::-webkit-scrollbar { width: 4px; }
        .dl-content::-webkit-scrollbar-track { background: transparent; }
        .dl-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .dl-content::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  );
}

export default DashboardLayout;
