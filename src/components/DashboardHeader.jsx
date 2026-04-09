import React from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';

function DashboardHeader({ user, balance }) {
  return (
    <header className="dashboard-header-modern">
      <div className="header-left">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search markets, trades, symbols..." />
        </div>
      </div>

      <div className="header-right">
        <div className="global-stats">
          <div className="stat-pill">
            <span className="label">BTC/USDT</span>
            <span className="value green">$64,520.10</span>
          </div>
          <div className="stat-pill">
            <span className="label">Total Equity</span>
            <span className="value">${balance ? parseFloat(balance.totalEquity).toLocaleString() : '---'}</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="icon-btn">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>
          
          <div className="user-profile">
            <div className="avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <span className="username">{user?.full_name || 'Trader'}</span>
              <span className="role">Institutional</span>
            </div>
            <ChevronDown size={16} className="chevron" />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-header-modern {
          height: 80px;
          padding: 0 40px;
          background: rgba(10, 15, 29, 0.6);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .header-left {
          flex: 1;
        }

        .search-bar {
          max-width: 400px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          color: #64748b;
        }

        .search-bar input {
          width: 100%;
          padding: 10px 16px 10px 48px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .search-bar input:focus {
          outline: none;
          border-color: rgba(52, 211, 153, 0.5);
          background: rgba(255, 255, 255, 0.05);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .global-stats {
          display: flex;
          gap: 16px;
        }

        .stat-pill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 6px 16px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
        }

        .stat-pill .label {
          color: #64748b;
          font-weight: 600;
        }

        .stat-pill .value {
          color: #fff;
          font-weight: 700;
        }

        .stat-pill .value.green {
          color: #34d399;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .icon-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .icon-btn:hover {
          color: #fff;
        }

        .notification-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid #0a0f1d;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .user-profile:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .username {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        .role {
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .chevron {
          color: #64748b;
          margin-left: 4px;
        }
      `}} />
    </header>
  );
}

export default DashboardHeader;
