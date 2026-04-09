import React from 'react';
import { Bell, Search, User, ChevronDown, MessageSquare } from 'lucide-react';

function DashboardHeader({ user, balance }) {
  return (
    <header className="header-modern">
      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search markets, trades, symbols..." 
        />
      </div>

      <div className="header-meta">
        <div className="token-pills">
          <div className="status-pill">
            <span className="pill-label">BTC/USDT</span>
            <span className="pill-value green">$64,520.10</span>
          </div>
          <div className="status-pill">
            <span className="pill-label">Total Equity</span>
            <span className="pill-value">$0</span>
          </div>
        </div>

        <div className="header-icon-group">
          <button className="icon-btn"><MessageSquare size={18} /></button>
          <button className="icon-btn">
            <Bell size={18} />
            <span className="red-dot"></span>
          </button>
        </div>
        
        <div className="profile-widget">
          <div className="profile-text">
            <span className="profile-name">Mesoflix Investor</span>
            <span className="profile-role">INSTITUTIONAL</span>
          </div>
          <div className="profile-avatar">
            <User size={18} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .header-modern {
          height: 72px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #0a0f1d;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .search-container { position: relative; width: 320px; }
        .search-icon { position: absolute; left: 16px; top: 10px; color: #475569; }
        .search-input {
          width: 100%;
          background: #060a14;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 10px 16px 10px 48px;
          color: #fff;
          font-size: 14px;
        }

        .header-meta { display: flex; align-items: center; gap: 24px; }

        .token-pills { display: flex; gap: 12px; }
        .status-pill {
          background: #060a14;
          border: 1px solid rgba(255, 255, 255, 0.03);
          padding: 6px 16px;
          border-radius: 20px;
          display: flex;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
        }
        .pill-label { color: #64748b; }
        .pill-value { color: #fff; }

        .header-icon-group { display: flex; gap: 4px; }
        .icon-btn { background: transparent; border: none; color: #64748b; padding: 8px; cursor: pointer; position: relative; }
        .red-dot { position: absolute; top: 8px; right: 8px; width: 6px; height: 6px; background: #ef4444; border-radius: 50%; border: 2px solid #0a0f1d; }

        .profile-widget { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .profile-text { display: flex; flex-direction: column; text-align: right; }
        .profile-name { color: #fff; font-size: 13px; font-weight: 700; }
        .profile-role { color: #64748b; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; }
        .profile-avatar { width: 36px; height: 36px; background: #10b981; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
      `}} />
    </header>
  );
}

export default DashboardHeader;
