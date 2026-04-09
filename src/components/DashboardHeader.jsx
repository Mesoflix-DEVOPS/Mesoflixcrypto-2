import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, MessageSquare, X, LogOut, Settings, CreditCard, ShieldCheck } from 'lucide-react';
import { getApiUrl } from '../config/api';

function DashboardHeader() {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [marketPrice, setMarketPrice] = useState('...'); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [profileRes, notifyRes, msgRes] = await Promise.all([
          fetch(getApiUrl('/api/dashboard/profile'), { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(getApiUrl('/api/dashboard/notifications'), { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(getApiUrl('/api/dashboard/messages'), { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (profileRes.ok && profileRes.headers.get('content-type')?.includes('application/json')) {
          const profData = await profileRes.json();
          setProfile(profData.profile);
        }
        
        if (notifyRes.ok && notifyRes.headers.get('content-type')?.includes('application/json')) {
          setNotifications(await notifyRes.json());
        }

        if (msgRes.ok && msgRes.headers.get('content-type')?.includes('application/json')) {
          setMessages(await msgRes.json());
        }
      } catch (err) {
        console.error('Header fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPrice = async () => {
      try {
        const res = await fetch(getApiUrl('/api/market/ticker/BTCUSDT'));
        const contentType = res.headers.get('content-type');
        
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.lastPrice) {
            setMarketPrice(parseFloat(data.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }));
          }
        } else {
           console.warn('[TICKER_API_ERROR] Expected JSON but received:', contentType);
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

      {/* SEARCH SECTION */}
      <div className={`search-container ${isSearchOpen ? 'mobile-expanded' : ''}`}>
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" onClick={() => setIsSearchOpen(true)} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search symbols..." 
            onFocus={() => setIsSearchOpen(true)}
          />
          {isSearchOpen && <X size={18} className="search-close-icon" onClick={() => setIsSearchOpen(false)} />}
        </div>
      </div>

      {/* META SECTION (Pills, Icons, Profile) */}
      <div className={`header-meta ${isSearchOpen ? 'hide-mobile' : ''}`}>
        
        {/* Market Pills */}
        <div className="token-pills desktop-only">
          <div className="status-pill">
            <span className="pill-label">BTC/USDT</span>
            <span className={`pill-value ${marketPrice !== '...' ? 'green' : ''}`}>
              ${marketPrice}
            </span>
          </div>
          <div className="status-pill">
            <span className="pill-label">Total Equity</span>
            <span className="pill-value">
              ${profile?.equity?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </span>
          </div>
        </div>

        {/* Action Group */}
        <div className="header-actions">
          <button className="icon-btn mobile-only" onClick={() => setIsSearchOpen(true)}>
            <Search size={18} />
          </button>
          
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
        
        <div className="nav-divider-v desktop-only"></div>

        {/* Profile Trigger */}
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
          height: 72px; padding: 0 32px; display: flex; align-items: center; justify-content: space-between;
          background: #0a0f1d; border-bottom: 1px solid rgba(255, 255, 255, 0.03); position: sticky; top: 0; z-index: 1000;
        }

        .popup-overlay { position: fixed; inset: 0; z-index: 999; }
        .popup-trigger { position: relative; display: flex; align-items: center; }

        .search-container { position: relative; width: 280px; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .search-box-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
        .search-icon { position: absolute; left: 14px; color: #475569; cursor: pointer; z-index: 10; }
        .search-close-icon { position: absolute; right: 14px; color: #64748b; cursor: pointer; }
        .search-input { width: 100%; background: #060a14; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 10px 14px 10px 42px; color: #fff; font-size: 13px; outline: none; transition: 0.2s; }
        .search-input:focus { border-color: #10b981; background: #080d1a; }

        .header-meta { display: flex; align-items: center; gap: 24px; transition: 0.2s; height: 100%; }
        .token-pills { display: flex; gap: 10px; }
        .status-pill { background: #060a14; border: 1px solid rgba(255, 255, 255, 0.03); padding: 8px 14px; border-radius: 12px; display: flex; gap: 10px; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .pill-label { color: #64748b; }
        .pill-value { color: #fff; }
        .pill-value.green { color: #10b981; }

        .header-actions { display: flex; align-items: center; gap: 8px; }
        .icon-btn { background: transparent; border: none; color: #64748b; padding: 10px; cursor: pointer; position: relative; display: flex; align-items: center; border-radius: 10px; transition: 0.2s; }
        .icon-btn:hover, .icon-btn.active { color: #fff; background: rgba(255, 255, 255, 0.03); }
        .red-dot, .blue-dot { position: absolute; top: 10px; right: 10px; width: 6px; height: 6px; border-radius: 50%; border: 2px solid #0a0f1d; }
        .red-dot { background: #ef4444; }
        .blue-dot { background: #3b82f6; }

        .nav-divider-v { width: 1px; height: 32px; background: rgba(255, 255, 255, 0.05); margin: 0 4px; }

        .profile-widget { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 6px; border-radius: 10px; transition: 0.2s; }
        .profile-widget:hover { background: rgba(255, 255, 255, 0.03); }
        .profile-text { display: flex; flex-direction: column; text-align: right; }
        .profile-name { color: #fff; font-size: 13px; font-weight: 700; margin-bottom: 2px; }
        .profile-role { color: #64748b; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; opacity: 0.8; }
        .profile-avatar { width: 36px; height: 36px; background: #10b981; color: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; }

        /* Popup Styles */
        .popup-box {
          position: absolute; top: calc(100% + 15px); left: 50%; transform: translateX(-50%) scale(0.95);
          width: 300px; background: rgba(10, 15, 29, 0.95); backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6); opacity: 0; visibility: hidden;
          transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1001; pointer-events: none;
        }
        .popup-box.show { opacity: 1; visibility: visible; transform: translateX(-50%) scale(1); pointer-events: auto; }
        .popup-box.right-aligned { left: auto; right: 0; transform: scale(0.95); }
        .popup-box.right-aligned.show { transform: scale(1); }

        .popup-header { padding: 18px 20px; font-weight: 800; font-size: 13px; color: #fff; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .popup-content { max-height: 380px; overflow-y: auto; padding: 10px; }
        .popup-item { padding: 14px; border-radius: 12px; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; gap: 4px; }
        .popup-item:hover { background: rgba(255, 255, 255, 0.04); }
        .popup-item.unread { background: rgba(16, 185, 129, 0.05); }
        .item-title { font-weight: 700; color: #fff; font-size: 13px; }
        .item-desc, .item-sub { color: #64748b; font-size: 11px; line-height: 1.4; }
        .empty-state { padding: 40px 20px; text-align: center; color: #475569; font-size: 13px; }

        .popup-profile-info { padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .prof-email { color: #64748b; font-size: 12px; }
        .popup-nav { padding: 10px; }
        .nav-link { 
          width: 100%; padding: 12px 14px; border: none; background: transparent; color: #cbd5e1;
          font-size: 13px; font-weight: 600; text-align: left; display: flex; align-items: center; gap: 12px;
          border-radius: 10px; cursor: pointer; transition: 0.2s;
        }
        .nav-link:hover { color: #fff; background: rgba(255, 255, 255, 0.06); }
        .nav-link.logout { color: #ef4444; }
        .nav-divider { height: 1px; background: rgba(255, 255, 255, 0.05); margin: 10px; }

        @media (max-width: 1024px) {
          .header-modern { padding: 0 16px; } .desktop-only { display: none; }
          .search-container:not(.mobile-expanded) { width: 0; overflow: hidden; opacity: 0; pointer-events: none; }
          .search-container.mobile-expanded { position: absolute; left: 0; top: 0; width: 100% !important; height: 100%; background: #0a0f1d; padding: 0 16px; display: flex; align-items: center; z-index: 1001; }
          .mobile-expanded .search-box-wrapper { width: 100%; }
          .hide-mobile { opacity: 0; pointer-events: none; }
          .popup-box { width: calc(100vw - 32px); position: fixed; top: 80px; left: 16px; transform: scale(0.95); transform-origin: top; }
        }
      `}} />
    </header>
  );
}

export default DashboardHeader;
