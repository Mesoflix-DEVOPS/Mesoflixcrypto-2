import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Repeat, 
  Briefcase, 
  BarChart, 
  ListTodo, 
  Cpu, 
  Settings, 
  HelpCircle,
  X 
} from 'lucide-react';

function DashboardSidebar({ isOpen, onClose }) {
  const menuItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/dashboard' },
    { name: 'Markets', icon: <BarChart3 size={20} />, path: '/dashboard/markets' },
    { name: 'Trade', icon: <Repeat size={20} />, path: '/dashboard/trade' },
    { name: 'Portfolio', icon: <Briefcase size={20} />, path: '/dashboard/portfolio' },
    { name: 'Analytics', icon: <BarChart size={20} />, path: '/dashboard/analytics' },
    { name: 'Orders', icon: <ListTodo size={20} />, path: '/dashboard/orders' },
    { name: 'Bot Trading', icon: <Cpu size={20} />, path: '/dashboard/bots', ai: true },
    { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/config', badge: '9' },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth <= 1024) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
         <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 4L12 12L20 4V20L12 12L4 20V4Z" fill="#34d399" />
            </svg>
         </div>
         <span className="logo-text">Mesoflix</span>
         <button className="mobile-close-btn mobile-only" onClick={onClose}>
           <X size={20} />
         </button>
      </div>

      <nav className="sidebar-links">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={handleLinkClick}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span className="item-icon">{item.icon}</span>
            <span className="item-name">{item.name}</span>
            {item.ai && <span className="ai-badge">AI</span>}
            {item.badge && <span className="num-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/dashboard/settings" onClick={handleLinkClick} className="sidebar-item">
          <span className="item-icon"><Settings size={20} /></span>
          <span className="item-name">Settings</span>
        </NavLink>
        <NavLink to="/dashboard/help" onClick={handleLinkClick} className="sidebar-item">
          <span className="item-icon"><HelpCircle size={20} /></span>
          <span className="item-name">Help</span>
        </NavLink>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-container {
          width: 260px;
          background: #060a14;
          height: 100vh;
          border-right: 1px solid rgba(255, 255, 255, 0.03);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          padding: 24px 0;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1050;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 24px 32px;
        }
        .logo-text { color: #fff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }

        .mobile-close-btn {
          margin-left: auto; background: transparent; border: none; color: #64748b; cursor: pointer;
        }

        .sidebar-links { flex: 1; padding: 0 16px; display: flex; flex-direction: column; gap: 8px; }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #64748b;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: 0.2s;
        }

        .sidebar-item:hover { color: #fff; background: rgba(255, 255, 255, 0.02); }
        .sidebar-item.active { color: #fff; background: rgba(255, 255, 255, 0.05); }
        .sidebar-item.active .item-icon { color: #34d399; }

        .ai-badge {
          background: rgba(52, 211, 153, 0.1);
          color: #34d399;
          font-size: 9px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: auto;
        }

        .num-badge {
          background: #34d399;
          color: #000;
          font-size: 10px;
          font-weight: 900;
          padding: 1px 6px;
          border-radius: 10px;
          margin-left: auto;
        }

        .sidebar-footer { padding: 16px; border-top: 1px solid rgba(255, 255, 255, 0.03); margin-top: auto; }

        @media (max-width: 1024px) {
          .sidebar-container {
            position: fixed;
            left: -260px;
            box-shadow: 20px 0 50px rgba(0,0,0,0.5);
          }
          .sidebar-container.open {
            left: 0;
          }
          .mobile-only { display: block; }
        }

        @media (min-width: 1025px) {
          .mobile-only { display: none; }
        }
      `}} />
    </aside>
  );
}

export default DashboardSidebar;
