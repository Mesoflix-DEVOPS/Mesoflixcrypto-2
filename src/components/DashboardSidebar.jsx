import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  SwitchCamera, 
  Briefcase, 
  PieChart, 
  ListOrdered, 
  Settings, 
  HelpCircle,
  Cpu
} from 'lucide-react';

function DashboardSidebar() {
  const menuItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/dashboard' },
    { name: 'Markets', icon: <BarChart3 size={20} />, path: '/dashboard/markets' },
    { name: 'Trade', icon: <SwitchCamera size={20} />, path: '/dashboard/trade' },
    { name: 'Portfolio', icon: <Briefcase size={20} />, path: '/dashboard/portfolio' },
    { name: 'Analytics', icon: <PieChart size={20} />, path: '/dashboard/analytics' },
    { name: 'Orders', icon: <ListOrdered size={20} />, path: '/dashboard/orders' },
    { name: 'Bot Trading', icon: <Cpu size={20} />, path: '/dashboard/bots', highlight: true },
    { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/config', badge: '9' },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
           <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
             <path d="M4 4L16 16L28 4V28L16 16L4 28V4Z" fill="#34d399" />
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
              {item.badge && <span className="item-badge">{item.badge}</span>}
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
            <span className="nav-text">Help</span>
          </NavLink>
        </div>
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-sidebar {
          width: 240px;
          height: 100vh;
          background: #0d1117;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 20px 0;
        }

        .sidebar-brand {
          padding: 10px 24px 30px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-name {
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0 16px;
          gap: 10px;
        }

        .nav-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-section.bottom {
          margin-top: auto;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          padding-top: 20px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-item:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.02);
        }

        .nav-item.active {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
        }

        .nav-item.active .nav-icon {
          color: #34d399;
        }

        .nav-item.highlight .nav-icon {
          color: #34d399;
        }

        .item-badge {
           background: #34d399;
           color: #000;
           font-size: 10px;
           font-weight: 900;
           padding: 2px 7px;
           border-radius: 6px;
           margin-left: auto;
        }

        .beta-badge {
          font-size: 9px;
          background: rgba(52, 211, 153, 0.1);
          color: #34d399;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: auto;
          font-weight: 800;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
      `}} />
    </aside>
  );
}

export default DashboardSidebar;
