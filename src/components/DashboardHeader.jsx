import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, MessageSquare, X, LogOut, Settings, CreditCard, ShieldCheck } from 'lucide-react';

function DashboardHeader() {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [marketPrice, setMarketPrice] = useState('0.00'); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [profileRes, notifyRes, msgRes] = await Promise.all([
          fetch('/api/dashboard/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/dashboard/notifications', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/dashboard/messages', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (profileRes.ok) setProfile((await profileRes.json()).profile);
        if (notifyRes.ok) setNotifications(await notifyRes.json());
        if (msgRes.ok) setMessages(await msgRes.json());
      } catch (err) {
        console.error('Header fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPrice = async () => {
      try {
        const res = await fetch('/api/market/ticker/BTCUSDT');
        if (res.ok) {
          const data = await res.json();
          setMarketPrice(parseFloat(data.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }));
        }
      } catch (err) {
        console.warn('Ticker fetch failed', err);
      }
    };

    // Initial fetch
    fetchData();
    fetchPrice();

    // Intervals
    const priceInterval = setInterval(fetchPrice, 10000); // 10s for price
    const profileInterval = setInterval(fetchData, 30000); // 30s for balance/msgs

    return () => {
      clearInterval(priceInterval);
      clearInterval(profileInterval);
    };
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  const togglePopup = (type) => {
    setActivePopup(activePopup === type ? null : type);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/sign-in';
  };

  return (
    <header className="header-modern">
      {/* Click-away overlay */}
      {activePopup && <div className="popup-overlay" onClick={() => setActivePopup(null)} />}

      <div className={`search-container ${isSearchOpen ? 'mobile-expanded' : ''}`}>
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" onClick={() => setIsSearchOpen(true)} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search markets, symbols..." 
            onFocus={() => setIsSearchOpen(true)}
          />
          {isSearchOpen && <X size={18} className="search-close-icon" onClick={() => setIsSearchOpen(false)} />}
        </div>
      </div>

      <div className={`header-meta ${isSearchOpen ? 'hide-mobile' : ''}`}>
        <div className="token-pills desktop-only">
          <div className="status-pill">
            <span className="pill-label">BTC/USDT</span>
            <span className="pill-value green">${marketPrice}</span>
          </div>
          <div className="status-pill">
            <span className="pill-label">Total Equity</span>
            <span className="pill-value">${profile?.equity?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</span>
          </div>
        </div>

        <div className="header-icon-group">
          <button className="icon-btn mobile-only" onClick={() => setIsSearchOpen(true)}><Search size={18} /></button>
          
          {/* Messages Popup Trigger */}
          <div className="popup-trigger">
            <button className={`icon-btn ${activePopup === 'msg' ? 'active' : ''}`} onClick={() => togglePopup('msg')}>
              <MessageSquare size={18} />
              {messages.length > 0 && <span className="blue-dot"></span>}
            </button>
            <div className={`popup-box ${activePopup === 'msg' ? 'show' : ''}`}>
               <div className="popup-header">Messages</div>
               <div className="popup-content">
                  {messages.length > 0 ? messages.map(m => (
                    <div className="popup-item" key={m.id}>
                      <span className="item-title">{m.subject}</span>
                      <span className="item-sub">{m.status.toUpperCase()}</span>
                    </div>
                  )) : <div className="empty-state">No new messages</div>}
               </div>
            </div>
          </div>

          {/* Notifications Popup Trigger */}
          <div className="popup-trigger">
            <button className={`icon-btn ${activePopup === 'notif' ? 'active' : ''}`} onClick={() => togglePopup('notif')}>
              <Bell size={18} />
              {unreadNotifCount > 0 && <span className="red-dot"></span>}
            </button>
            <div className={`popup-box ${activePopup === 'notif' ? 'show' : ''}`}>
               <div className="popup-header">Notifications</div>
               <div className="popup-content">
                  {notifications.length > 0 ? notifications.map(n => (
                    <div className={`popup-item ${!n.is_read ? 'unread' : ''}`} key={n.id}>
                      <span className="item-title">{n.title}</span>
                      <span className="item-desc">{n.message}</span>
                    </div>
                  )) : <div className="empty-state">All caught up</div>}
               </div>
            </div>
          </div>
        </div>
        
        {/* Profile Popup Trigger */}
        <div className="popup-trigger">
          <div className="profile-widget" onClick={() => togglePopup('profile')}>
            <div className="profile-text desktop-only">
              <span className="profile-name">{profile?.fullName || 'Mesoflix Investor'}</span>
              <span className="profile-role">{profile?.role || 'INSTITUTIONAL'}</span>
            </div>
            <div className="profile-avatar">
              <User size={18} />
            </div>
          </div>
          <div className={`popup-box right-aligned ${activePopup === 'profile' ? 'show' : ''}`}>
             <div className="popup-profile-info">
                <span className="prof-email">{profile?.email || 'N/A'}</span>
             </div>
             <div className="popup-nav">
                <button className="nav-link"><Settings size={16} /> Order Settings</button>
                <button className="nav-link"><ShieldCheck size={16} /> Security</button>
                <div className="nav-divider"></div>
                <button className="nav-link logout" onClick={handleLogout}><LogOut size={16} /> Sign Out</button>
             </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .header-modern {
          height: 72px; padding: 0 40px; display: flex; align-items: center; justify-content: space-between;
          background: #0a0f1d; border-bottom: 1px solid rgba(255, 255, 255, 0.03); position: sticky; top: 0; z-index: 1000;
        }

        .popup-overlay { position: fixed; inset: 0; z-index: 999; }
        .popup-trigger { position: relative; }

        .popup-box {
          position: absolute; top: calc(100% + 15px); left: 50%; transform: translateX(-50%) scale(0.95);
          width: 280px; background: rgba(10, 15, 29, 0.85); backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); opacity: 0; visibility: hidden;
          transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1001; pointer-events: none;
        }
        .popup-box.show { opacity: 1; visibility: visible; transform: translateX(-50%) scale(1); pointer-events: auto; }
        .popup-box.right-aligned { left: auto; right: 0; transform: scale(0.95); }
        .popup-box.right-aligned.show { transform: scale(1); }

        .popup-header { padding: 16px 20px; font-weight: 800; font-size: 13px; color: #fff; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .popup-content { max-height: 320px; overflow-y: auto; padding: 8px; }
        .popup-item { padding: 12px 14px; border-radius: 10px; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; gap: 4px; }
        .popup-item:hover { background: rgba(255, 255, 255, 0.03); }
        .popup-item.unread { background: rgba(52, 211, 153, 0.05); }
        .item-title { font-weight: 700; color: #fff; font-size: 13px; }
        .item-desc, .item-sub { color: #64748b; font-size: 11px; }
        .empty-state { padding: 30px 20px; text-align: center; color: #475569; font-size: 13px; }

        .popup-profile-info { padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .prof-email { color: #64748b; font-size: 12px; }
        .popup-nav { padding: 8px; }
        .nav-link { 
          width: 100%; padding: 10px 14px; border: none; background: transparent; color: #64748b;
          font-size: 13px; font-weight: 600; text-align: left; display: flex; align-items: center; gap: 12px;
          border-radius: 10px; cursor: pointer; transition: 0.2s;
        }
        .nav-link:hover { color: #fff; background: rgba(255, 255, 255, 0.04); }
        .nav-link.logout { color: #ef4444; }
        .nav-divider { height: 1px; background: rgba(255, 255, 255, 0.05); margin: 8px; }

        .search-container { position: relative; width: 320px; transition: 0.3s; }
        .search-box-wrapper { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 16px; color: #475569; cursor: pointer; z-index: 10; }
        .search-close-icon { position: absolute; right: 16px; color: #64748b; cursor: pointer; }
        .search-input { width: 100%; background: #060a14; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 10px 16px 10px 48px; color: #fff; font-size: 14px; outline: none; }
        .header-meta { display: flex; align-items: center; gap: 24px; transition: 0.2s; }
        .token-pills { display: flex; gap: 12px; }
        .status-pill { background: #060a14; border: 1px solid rgba(255, 255, 255, 0.03); padding: 6px 16px; border-radius: 20px; display: flex; gap: 10px; font-size: 13px; font-weight: 600; white-space: nowrap; }
        .pill-label { color: #64748b; }
        .pill-value { color: #fff; }
        .pill-value.green { color: #34d399; }
        .icon-btn { background: transparent; border: none; color: #64748b; padding: 8px; cursor: pointer; position: relative; display: flex; align-items: center; }
        .icon-btn.active, .icon-btn:hover { color: #fff; }
        .red-dot, .blue-dot { position: absolute; top: 8px; right: 8px; width: 6px; height: 6px; border-radius: 50%; border: 2px solid #0a0f1d; }
        .red-dot { background: #ef4444; }
        .blue-dot { background: #3b82f6; }
        .profile-widget { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .profile-name { color: #fff; font-size: 13px; font-weight: 700; white-space: nowrap; }
        .profile-role { color: #64748b; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-align: right; }
        .profile-avatar { width: 36px; height: 36px; background: #10b981; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        @media (max-width: 1024px) {
          .header-modern { padding: 0 20px; } .desktop-only { display: none; }
          .search-container:not(.mobile-expanded) { width: 0; overflow: hidden; opacity: 0; pointer-events: none; }
          .search-container.mobile-expanded { position: absolute; left: 0; top: 0; width: 100% !important; height: 100%; background: #0a0f1d; padding: 0 20px; display: flex; align-items: center; z-index: 1001; }
          .hide-mobile { opacity: 0; pointer-events: none; }
          .popup-box { width: 90vw; position: fixed; top: 80px; left: 5vw; transform: scale(0.95); transform-origin: top; }
        }
      `}} />
    </header>
  );
}

export default DashboardHeader;
