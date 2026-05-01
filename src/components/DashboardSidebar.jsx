import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Repeat2,
  Briefcase,
  LineChart,
  ClipboardList,
  Cpu,
  Settings,
  HelpCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const menuItems = [
  { name: 'Overview',    icon: LayoutDashboard, path: '/dashboard',           end: true },
  { name: 'Markets',     icon: BarChart3,        path: '/dashboard/markets' },
  { name: 'Trade',       icon: Repeat2,          path: '/dashboard/trade' },
  { name: 'Portfolio',   icon: Briefcase,        path: '/dashboard/portfolio' },
  { name: 'Analytics',   icon: LineChart,        path: '/dashboard/analytics' },
  { name: 'Orders',      icon: ClipboardList,    path: '/dashboard/orders' },
  { name: 'Bot Trading', icon: Cpu,              path: '/dashboard/bots',    badge: 'AI' },
];

const footerItems = [
  { name: 'Settings', icon: Settings, path: '/dashboard/config' },
  { name: 'Help',     icon: HelpCircle, path: '/dashboard/help' },
];

function DashboardSidebar({ isOpen, onClose, collapsed, onCollapseToggle }) {
  const handleLinkClick = () => {
    if (window.innerWidth <= 1024) onClose();
  };

  return (
      <aside className={`ds-sidebar ${isOpen ? 'ds-open' : ''} ${collapsed ? 'ds-collapsed' : ''}`}>
        {/* Logo */}
        <div className="ds-logo">
          <div className="ds-logo-icon">
            <ShieldCheck size={18} />
          </div>
          {!collapsed && <span className="ds-logo-text">Mesoflix</span>}
          <button className="ds-mobile-close" onClick={onClose} aria-label="Close sidebar">
            <X size={16} />
          </button>
        </div>

        {/* Collapse toggle — desktop only */}
        <button
          className="ds-collapse-btn"
          onClick={onCollapseToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Nav */}
        <nav className="ds-nav">
          {!collapsed && (
            <span className="ds-section-label">Navigation</span>
          )}
          {menuItems.map(({ name, icon: Icon, path, end, badge }) => (
            <NavLink
              key={path}
              to={path}
              end={!!end}
              onClick={handleLinkClick}
              className={({ isActive }) => `ds-item${isActive ? ' ds-active' : ''}`}
              title={collapsed ? name : undefined}
            >
              <span className="ds-icon"><Icon size={18} /></span>
              {!collapsed && <span className="ds-label">{name}</span>}
              {!collapsed && badge && <span className="ds-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="ds-footer">
          {footerItems.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={handleLinkClick}
              className={({ isActive }) => `ds-item${isActive ? ' ds-active' : ''}`}
              title={collapsed ? name : undefined}
            >
              <span className="ds-icon"><Icon size={18} /></span>
              {!collapsed && <span className="ds-label">{name}</span>}
            </NavLink>
          ))}
        </div>
      </aside>

  );
}

export default DashboardSidebar;
