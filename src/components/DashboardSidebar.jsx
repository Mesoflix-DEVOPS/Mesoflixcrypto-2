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
    <>
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

      <style>{`
        .ds-sidebar {
          width: 240px;
          min-height: 100vh;
          background: #060c1a;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1);
          position: relative;
          z-index: 1050;
        }
        .ds-sidebar.ds-collapsed { width: 64px; }

        /* Mobile: hidden off-screen */
        @media (max-width: 1024px) {
          .ds-sidebar {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
          }
          .ds-sidebar.ds-open { transform: translateX(0); }
          .ds-collapse-btn { display: none; }
        }

        .ds-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 16px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .ds-logo-icon {
          width: 32px; height: 32px;
          background: rgba(16,185,129,0.15);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #10b981;
          flex-shrink: 0;
        }
        .ds-logo-text {
          font-weight: 900; font-size: 15px; color: #fff; letter-spacing: -0.02em; flex: 1;
        }
        .ds-mobile-close {
          background: none; border: none; color: #64748b; cursor: pointer; margin-left: auto;
          display: none;
        }
        @media (max-width: 1024px) { .ds-mobile-close { display: flex; } }

        .ds-collapse-btn {
          position: absolute;
          right: -12px;
          top: 72px;
          width: 24px; height: 24px;
          background: #10b981;
          color: #000;
          border: none;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 2px 10px rgba(16,185,129,0.4);
          transition: transform 0.2s;
        }
        .ds-collapse-btn:hover { transform: scale(1.15); }

        .ds-section-label {
          display: block;
          font-size: 9px; font-weight: 900; text-transform: uppercase;
          letter-spacing: 0.15em; color: #334155;
          padding: 16px 16px 8px;
        }

        .ds-nav { flex: 1; padding: 8px 0; overflow-y: auto; }
        .ds-footer { padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.05); }

        .ds-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 16px;
          color: #64748b;
          text-decoration: none;
          border-radius: 0;
          transition: all 0.2s;
          border-left: 2px solid transparent;
          font-size: 13px; font-weight: 600;
          position: relative;
        }
        .ds-item:hover { color: #fff; background: rgba(255,255,255,0.04); }
        .ds-item.ds-active {
          color: #10b981;
          background: rgba(16,185,129,0.08);
          border-left-color: #10b981;
        }
        .ds-icon { display: flex; align-items: center; flex-shrink: 0; }
        .ds-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ds-badge {
          background: #10b981; color: #000;
          font-size: 8px; font-weight: 900;
          padding: 2px 6px; border-radius: 20px;
          letter-spacing: 0.05em;
        }

        /* Collapsed state tooltips */
        .ds-collapsed .ds-item { padding: 12px 0; justify-content: center; }
        .ds-collapsed .ds-section-label { display: none; }
      `}</style>
    </>
  );
}

export default DashboardSidebar;
