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
          <ShieldCheck size={20} className="text-emerald-400" />
        </div>
        <span className="logo-text">Mesoflix</span>
        <button className="mobile-close-btn" onClick={onClose}>
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
            end={item.path === '/dashboard'}
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
          <span className="item-name">Profile Config</span>
        </NavLink>
        <NavLink to="/dashboard/help" onClick={handleLinkClick} className="sidebar-item">
          <span className="item-icon"><HelpCircle size={20} /></span>
          <span className="item-name">Support Desk</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
