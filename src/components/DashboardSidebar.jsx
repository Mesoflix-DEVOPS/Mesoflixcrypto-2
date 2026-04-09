import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Wallet, 
  History, 
  Bot, 
  Settings, 
  HelpCircle 
} from 'lucide-react';

function DashboardSidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Markets', icon: <BarChart3 size={20} />, path: '/dashboard/markets' },
    { name: 'Positions', icon: <Wallet size={20} />, path: '/dashboard/positions' },
    { name: 'Trade History', icon: <History size={20} />, path: '/dashboard/history' },
    { name: 'Bot Trading', icon: <Bot size={20} />, path: '/dashboard/bots', highlight: true },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#34d399" />
            <path d="M2 17L12 22L22 17" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="brand-name">Mesoflix</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
              {item.highlight && <span className="beta-badge">AI</span>}
            </NavLink>
          ))}
        </div>

        <div className="nav-section bottom">
          <NavLink to="/dashboard/settings" className="nav-item">
            <span className="nav-icon"><Settings size={20} /></span>
            <span className="nav-text">Settings</span>
          </NavLink>
          <NavLink to="/dashboard/support" className="nav-item">
            <span className="nav-icon"><HelpCircle size={20} /></span>
            <span className="nav-text">Support</span>
          </NavLink>
        </div>
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-sidebar {
          width: 260px;
          height: 100vh;
          background: #0a0f1d;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .sidebar-brand {
          padding: 32px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-name {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.025em;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0 12px 24px;
          gap: 32px;
        }

        .nav-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-section.bottom {
          margin-top: auto;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 24px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-item.active {
          color: #34d399;
          background: rgba(16, 185, 129, 0.1);
        }

        .nav-item.highlight {
          position: relative;
        }

        .beta-badge {
          font-size: 9px;
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          padding: 2px 6px;
          border-radius: 6px;
          margin-left: auto;
          font-weight: 700;
          text-transform: uppercase;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
        }

        .nav-item.active .nav-icon {
          opacity: 1;
        }
      `}} />
    </aside>
  );
}

export default DashboardSidebar;
