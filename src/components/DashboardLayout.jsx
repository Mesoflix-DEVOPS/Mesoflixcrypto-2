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

    </div>
  );
}

export default DashboardLayout;
