import React, { useState, useEffect } from 'react';
import { Bell, Search, User, MessageSquare, X, LogOut, Settings, ShieldCheck, Menu } from 'lucide-react';
import { getApiUrl, fetchWithLogging } from '../config/api';
import { useUser } from './AuthContext';

function DashboardHeader({ onMenuClick, sidebarOpen, tradingMode, setTradingMode }) {
  const { user, balance, logout } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [marketPrice, setMarketPrice] = useState('...'); 

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [notifyRes, msgRes] = await Promise.all([
          fetchWithLogging(getApiUrl('/api/dashboard/notifications'), { headers: { 'Authorization': `Bearer ${token}` } }),
          fetchWithLogging(getApiUrl('/api/dashboard/messages'), { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (notifyRes.ok) {
          const nData = await notifyRes.json();
          setNotifications(nData.data || []);
        }

        if (msgRes.ok) {
          const mData = await msgRes.json();
          setMessages(mData.data || []);
        }
      } catch (err) {
        console.error('Header metadata fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPrice = async () => {
      try {
        const response = await fetchWithLogging(getApiUrl('/api/market/ticker/BTCUSDT'));
        if (response.ok) {
          const res = await response.json();
          const data = res.data;
          if (data && data.lastPrice) {
            setMarketPrice(parseFloat(data.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }));
          }
        }
      } catch (err) {
        console.warn('Ticker fetch failed', err);
      }
    };

    fetchMetadata();
    fetchPrice();

    const priceInterval = setInterval(fetchPrice, 10000);
    const metaInterval = setInterval(fetchMetadata, 60000); // Less frequent for metadata

    return () => {
      clearInterval(priceInterval);
      clearInterval(metaInterval);
    };
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  const togglePopup = (type) => {
    setActivePopup(activePopup === type ? null : type);
  };

  return (
    <header className="header-modern">
      {activePopup && <div className="popup-overlay" onClick={() => setActivePopup(null)} />}

      <div className="header-left">
        <button className="menu-toggle-btn mobile-only" onClick={onMenuClick}>
          <Menu size={24} />
        </button>

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
      </div>

      <div className={`header-meta ${isSearchOpen ? 'hide-mobile' : ''}`}>
        
        <div className="mode-switcher-header">
           <button 
             className={`ms-btn ${tradingMode === 'REAL' ? 'ms-real' : ''}`}
             onClick={() => setTradingMode('REAL')}
           >
             LIVE
           </button>
           <button 
             className={`ms-btn ${tradingMode === 'DEMO' ? 'ms-demo' : ''}`}
             onClick={() => setTradingMode('DEMO')}
           >
             DEMO
           </button>
        </div>
        
        <div className="token-pills desktop-only">
          <div className="status-pill">
            <span className="pill-label">BTC/USDT</span>
            <span className={`pill-value ${marketPrice !== '...' ? 'green' : ''}`}>
              ${marketPrice}
            </span>
          </div>
          <div className="status-pill">
            <span className="pill-label">Equity</span>
            <span className="pill-value blue">
              ${parseFloat(balance?.totalEquity || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <div className="popup-trigger">
            <button className={`icon-btn ${activePopup === 'msg' ? 'active' : ''}`} onClick={() => togglePopup('msg')}>
              <MessageSquare size={18} />
              {messages.length > 0 && <span className="blue-dot"></span>}
            </button>
            <div className={`popup-box ${activePopup === 'msg' ? 'show' : ''}`}>
               <div className="popup-header">Support Messages</div>
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

        <div className="popup-trigger">
          <div className="profile-widget" onClick={() => togglePopup('profile')}>
            <div className="profile-text desktop-only">
              <span className="profile-name">{user?.fullName || 'Investor'}</span>
              <span className="profile-role">INSTITUTIONAL</span>
            </div>
            <div className="profile-avatar">
              {user?.fullName?.charAt(0) || <User size={18} />}
            </div>
          </div>
          <div className={`popup-box right-aligned ${activePopup === 'profile' ? 'show' : ''}`}>
             <div className="popup-profile-info">
                <span className="prof-email">{user?.email || 'N/A'}</span>
             </div>
             <div className="popup-nav">
                <button className="nav-link"><Settings size={16} /> Settings</button>
                <button className="nav-link"><ShieldCheck size={16} /> Security</button>
                <div className="nav-divider"></div>
                <button className="nav-link logout" onClick={logout}><LogOut size={16} /> Sign Out</button>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
