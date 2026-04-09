import React, { useState, useEffect } from 'react';
import { Bell, Search, User, MessageSquare, X } from 'lucide-react';

function DashboardHeader() {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Concurrent fetching for speed
        const [profileRes, notifyRes] = await Promise.all([
          fetch('/api/dashboard/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/dashboard/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (profileRes.ok) {
          const profData = await profileRes.json();
          setProfile(profData.profile);
        }
        
        if (notifyRes.ok) {
          const notifyData = await notifyRes.json();
          setNotifications(notifyData);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard header data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="header-modern">
      {/* Search Section: Desktop and Mobile Toggle */}
      <div className={`search-container ${isSearchOpen ? 'mobile-expanded' : ''}`}>
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" onClick={() => setIsSearchOpen(true)} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search markets, symbols..." 
            onFocus={() => setIsSearchOpen(true)}
          />
          {isSearchOpen && (
            <X 
              size={18} 
              className="search-close-icon" 
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen(false);
              }} 
            />
          )}
        </div>
      </div>

      {/* Meta Section: Pills and Profile */}
      <div className={`header-meta ${isSearchOpen ? 'hide-mobile' : ''}`}>
        <div className="token-pills desktop-only">
          <div className="status-pill">
            <span className="pill-label">BTC/USDT</span>
            <span className="pill-value green">$64,520.10</span>
          </div>
          <div className="status-pill">
            <span className="pill-label">Total Equity</span>
            <span className="pill-value">${profile?.equity?.toLocaleString() || '0'}</span>
          </div>
        </div>

        <div className="header-icon-group">
          <button className="icon-btn mobile-search-trigger" onClick={() => setIsSearchOpen(true)}>
            <Search size={18} />
          </button>
          <button className="icon-btn"><MessageSquare size={18} /></button>
          <button className="icon-btn">
            <Bell size={18} />
            {unreadCount > 0 && <span className="red-dot"></span>}
          </button>
        </div>
        
        <div className="profile-widget">
          <div className="profile-text desktop-only">
            <span className="profile-name">{profile?.fullName || 'Mesoflix Investor'}</span>
            <span className="profile-role">{profile?.role || 'INSTITUTIONAL'}</span>
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
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Search Styles */
        .search-container { 
          position: relative; 
          width: 320px; 
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .search-box-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon { 
          position: absolute; 
          left: 16px; 
          color: #475569; 
          cursor: pointer;
          z-index: 10;
        }
        
        .search-close-icon {
          position: absolute;
          right: 16px;
          color: #64748b;
          cursor: pointer;
          display: none;
        }

        .search-input {
          width: 100%;
          background: #060a14;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 10px 16px 10px 48px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-input:focus { border-color: #34d399; }

        /* Meta Styles */
        .header-meta { display: flex; align-items: center; gap: 24px; transition: opacity 0.3s ease; }

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
          white-space: nowrap;
        }
        .pill-label { color: #64748b; }
        .pill-value { color: #fff; }
        .pill-value.green { color: #34d399; }

        .header-icon-group { display: flex; gap: 4px; }
        .icon-btn { background: transparent; border: none; color: #64748b; padding: 8px; cursor: pointer; position: relative; display: flex; align-items: center; }
        .icon-btn:hover { color: #fff; }
        .red-dot { position: absolute; top: 8px; right: 8px; width: 6px; height: 6px; background: #ef4444; border-radius: 50%; border: 2px solid #0a0f1d; }

        .profile-widget { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .profile-text { display: flex; flex-direction: column; text-align: right; }
        .profile-name { color: #fff; font-size: 13px; font-weight: 700; }
        .profile-role { color: #64748b; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; }
        .profile-avatar { width: 36px; height: 36px; background: #10b981; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        .mobile-search-trigger { display: none; }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .header-modern { padding: 0 20px; }
          .desktop-only { display: none; }
          .search-container:not(.mobile-expanded) { width: 0; overflow: hidden; opacity: 0; pointer-events: none; }
          .mobile-search-trigger { display: flex; }
          
          .search-container.mobile-expanded {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100%;
            background: #0a0f1d;
            padding: 0 20px;
            display: flex;
            align-items: center;
            z-index: 1001;
            opacity: 1;
            pointer-events: auto;
          }
          
          .mobile-expanded .search-box-wrapper { width: 100%; }
          .mobile-expanded .search-close-icon { display: block; }
          .hide-mobile { opacity: 0; pointer-events: none; }
        }

        /* Huge Screens Interaction */
        @media (min-width: 1920px) {
          .header-modern { padding: 0 60px; max-width: 2000px; margin: 0 auto; }
          .search-container { width: 480px; }
        }
      `}} />
    </header>
  );
}

export default DashboardHeader;
