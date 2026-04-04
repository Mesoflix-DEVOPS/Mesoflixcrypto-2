import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BybitDashboard() {
  const [config, setConfig] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderLogs, setOrderLogs] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:3001' 
    : 'https://mesoflixcrypto-2.onrender.com';

  useEffect(() => {
    const savedConfig = localStorage.getItem('bybit_test_config');
    if (!savedConfig) {
      navigate('/broker/api/test');
      return;
    }
    const parsedConfig = JSON.parse(savedConfig);
    setConfig(parsedConfig);
    fetchBalance(parsedConfig);
  }, []);

  const fetchBalance = async (apiConfig) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bybit/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType: 'UNIFIED', apiConfig })
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.result.list[0]);
      } else {
        setError(data.retMsg || 'Failed to fetch balance');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const placeTestOrder = async (symbol, side, qty) => {
    if (!config) return;
    setLoading(true);
    setError('');
    
    const logId = Date.now();
    const newLog = {
      id: logId,
      time: new Date().toLocaleTimeString(),
      type: 'PLACE_ORDER',
      symbol,
      side,
      status: 'PENDING',
      details: 'Sending signed request...'
    };
    
    setOrderLogs(prev => [newLog, ...prev]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bybit/test-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          side,
          qty,
          category: 'spot',
          apiConfig: config
        })
      });
      const data = await res.json();
      
      setOrderLogs(prev => prev.map(log => 
        log.id === logId 
          ? { ...log, status: res.ok ? 'SUCCESS' : 'FAILED', details: data.retMsg || (res.ok ? 'Order placed successfully' : 'Unknown error') }
          : log
      ));

      if (res.ok) {
        fetchBalance(config); // Refresh balance
      }
    } catch (err) {
      setOrderLogs(prev => prev.map(log => 
        log.id === logId ? { ...log, status: 'ERROR', details: 'Network error' } : log
      ));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bybit_test_config');
    navigate('/broker/api/test');
  };

  if (!config) return null;

  return (
    <div className="bybit-dashboard-page">
      <div className="dashboard-container">
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="header-main">
            <div className="tracking-badge">
              <span>Broker Tracking Active</span>
            </div>
            <h1>Institutional Trading Dashboard</h1>
          </div>
          <button onClick={logout} className="btn-disconnect">
            Disconnect Session
          </button>
        </header>

        <div className="dashboard-grid">
          {/* Sidebar / Stats */}
          <aside className="dashboard-sidebar">
            <div className="stats-card">
              <span className="card-label">Account Overview</span>
              {loading && !balance ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-8 bg-slate-800 rounded w-full"></div>
                  <div className="h-8 bg-slate-800 rounded w-3/4"></div>
                </div>
              ) : balance ? (
                <div className="metric-group">
                  <div className="metric-item">
                    <p>Total Equity (USD)</p>
                    <div className="value">${parseFloat(balance.totalEquity).toLocaleString()}</div>
                  </div>
                  <div className="metric-item">
                    <p>Available Margin</p>
                    <div className="value green">${parseFloat(balance.totalAvailableBalance).toLocaleString()}</div>
                  </div>
                </div>
              ) : (
                <p className="text-red-400 text-xs">{error || 'Data unavailable'}</p>
              )}
            </div>

            <div className="stats-card">
              <span className="card-label">Tracking Configuration</span>
              <div className="config-list">
                <div className="config-item">
                  <span className="key">Broker ID</span>
                  <span className="val blue">Ef001038</span>
                </div>
                <div className="config-item">
                  <span className="key">Environment</span>
                  <span className={`val ${config.isTestnet ? 'blue' : 'orange'}`}>
                    {config.isTestnet ? 'TESTNET' : 'MAINNET'}
                  </span>
                </div>
              </div>
            </div>

            <div className="stats-card">
              <span className="card-label">Verify Integration</span>
              <div className="verify-actions">
                <p className="verify-desc">
                  Place a small test order to confirm that the Bybit rebate system records the transaction under your Broker ID.
                </p>
                <div className="action-buttons">
                  <button 
                    onClick={() => placeTestOrder('BTCUSDT', 'Buy', '0.0001')}
                    disabled={loading}
                    className="primary"
                  >
                    Place Test BTC Order
                  </button>
                  <button 
                    onClick={() => placeTestOrder('XRPUSDT', 'Buy', '10')}
                    disabled={loading}
                    className="secondary"
                  >
                    Place Test XRP Order
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Activity Feed */}
          <section className="activity-feed">
            <div className="feed-header">
               <h3>
                 <div className="pulse-indicator"></div>
                 Activity Stream (Broker Tracked)
               </h3>
               {orderLogs.length > 0 && (
                 <button onClick={() => setOrderLogs([])} className="btn-clear">Clear History</button>
               )}
            </div>
            <div className="feed-content">
              {orderLogs.length === 0 ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p>Awaiting Broker Requests...</p>
                </div>
              ) : (
                orderLogs.map(log => (
                  <div key={log.id} className="log-entry">
                    <div className="entry-top">
                      <div className="info">
                        <span className="time">{log.time}</span>
                        <span className="type">{log.type}</span>
                        <span className={`target ${log.side === 'Buy' ? 'side-buy' : 'side-sell'}`}>
                           {log.side} {log.symbol}
                        </span>
                      </div>
                      <div className={`status-pill ${log.status.toLowerCase()}`}>
                        {log.status}
                      </div>
                    </div>
                    <p className="entry-details">{log.details}</p>
                    <div className="entry-footer">
                       <div className="tag">Header: <span>Referer:Ef001038</span></div>
                       <div className="tag">Protocol: <span>V5</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default BybitDashboard;

