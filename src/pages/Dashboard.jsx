import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [brokerAccount, setBrokerAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncSuccess, setSyncSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Get user from localStorage
    const savedUser = localStorage.getItem('user_profile');
    if (!savedUser) {
      navigate('/sign-in');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    // 2. Check for sync status in URL
    if (searchParams.get('sync') === 'true') {
      setSyncSuccess(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(`Connection Error: ${urlError.replace(/_/g, ' ')}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const API_BASE_URL = import.meta.env.MODE === 'development' 
      ? 'http://localhost:3001' 
      : 'https://mesoflixcrypto-2.onrender.com';

    fetchDashboardData(parsedUser.id, API_BASE_URL);
  }, [searchParams, navigate]);

  const fetchDashboardData = async (userId, API_BASE_URL) => {
    setLoading(true);
    try {
      // 1. Fetch Broker Account Info
      const accountRes = await fetch(`${API_BASE_URL}/api/broker/account/${userId}`);
      
      if (accountRes.status === 404) {
        // Normal state: user exists but no Bybit link yet
        setBrokerAccount(null);
        setLoading(false);
        return;
      }

      const accountData = await accountRes.json();
      if (accountRes.ok && accountData.success) {
        setBrokerAccount(accountData);
        
        // 2. Fetch Balance if connected
        const balanceRes = await fetch(`${API_BASE_URL}/api/bybit/balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            accountType: 'UNIFIED', 
            apiConfig: accountData.apiConfig 
          })
        });
        const balanceData = await balanceRes.json();
        if (balanceRes.ok && balanceData.result) {
          setBalance(balanceData.result.list[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectBybit = () => {
    if (!user) return;
    window.location.href = `/api/auth/bybit/authorize?userId=${user.id}`;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#020617',
      color: '#f8fafc',
      padding: '40px 24px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              Trading <span style={{ color: '#38bdf8' }}>Dashboard</span>
            </h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>Manage your institutional connections and live balances.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <div style={{ 
               padding: '8px 16px', 
               background: 'rgba(56, 189, 248, 0.1)', 
               border: '1px solid rgba(56, 189, 248, 0.2)', 
               borderRadius: '12px',
               fontSize: '14px',
               color: '#38bdf8',
               fontWeight: '600'
             }}>
               Institutional Node
             </div>
          </div>
        </header>

        {syncSuccess && (
          <div style={{ 
            padding: '16px 24px', 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            color: '#34d399', 
            borderRadius: '16px', 
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Account synchronized successfully with Bybit.
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '16px 24px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            color: '#ef4444', 
            borderRadius: '16px', 
            marginBottom: '32px',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
          
          {/* Connection Status Card */}
          <div style={{ 
            background: 'rgba(15, 23, 42, 0.6)', 
            backdropFilter: 'blur(12px)', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            borderRadius: '24px', 
            padding: '32px' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: brokerAccount ? '#10b981' : '#64748b', boxShadow: brokerAccount ? '0 0 12px #10b981' : 'none' }}></div>
              Exchange Connectivity
            </h3>
            
            {brokerAccount ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Connected UID</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>{brokerAccount.sub_uid}</p>
                </div>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Exchange Provider</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#f7a600' }}>Bybit</span> Institutional
                  </p>
                </div>
                <button 
                  onClick={handleConnectBybit}
                  style={{ 
                    marginTop: '8px',
                    padding: '14px',
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    borderRadius: '12px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                  Reconnect Exchange
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.05)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
                }}>
                  <svg style={{ width: '32px', height: '32px', color: '#38bdf8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <p style={{ color: '#94a3b8', marginBottom: '32px' }}>No exchange account connected to your profile.</p>
                <button 
                  onClick={handleConnectBybit}
                  style={{ 
                    padding: '16px 32px', 
                    background: '#38bdf8', 
                    color: '#020617', 
                    border: 'none', 
                    borderRadius: '14px', 
                    fontWeight: '700', 
                    fontSize: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(56, 189, 248, 0.3)'
                  }}
                >
                  Connect Bybit Account
                </button>
              </div>
            )}
          </div>

          {/* Balance Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.6)', 
              backdropFilter: 'blur(12px)', 
              border: '1px solid rgba(255, 255, 255, 0.05)', 
              borderRadius: '24px', 
              padding: '32px',
              flex: 1
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Asset Overview</h3>
              
              {loading ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', opacity: 0.5 }}>
                   <div style={{ height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }}></div>
                   <div style={{ height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }}></div>
                </div>
              ) : balance ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Total Equity (USDT)</p>
                    <p style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.03em' }}>
                      ${parseFloat(balance.totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Available Balance</p>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: '#34d399' }}>
                        ${parseFloat(balance.totalAvailableBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Account Wallet</p>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>
                        ${parseFloat(balance.totalWalletBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ color: '#64748b' }}>Connect your exchange to view live balances.</p>
                </div>
              )}
            </div>

            {/* Sync Status / Diagnostics */}
            <div style={{ 
              background: 'rgba(7, 10, 20, 0.4)', 
              border: '1px solid rgba(56, 189, 248, 0.1)', 
              borderRadius: '24px', 
              padding: '24px' 
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Technical Synchronization Status
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Relay Handshake', status: 'Success', detail: 'OAuth Callback Verified' },
                  { label: 'Token Exchange', status: brokerAccount ? 'Success' : 'Pending', detail: 'Bearer Token Retrieved' },
                  { label: 'Resource Access', status: brokerAccount ? 'Success' : 'Pending', detail: 'OpenAPI Credentials Fetched' },
                  { label: 'Database Storage', status: brokerAccount ? 'Success' : 'Pending', detail: 'Encrypted Keys Committed' }
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: step.status === 'Success' ? '#10b981' : '#475569' }}></div>
                      <span style={{ color: '#94a3b8' }}>{step.label}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: step.status === 'Success' ? '#34d399' : '#64748b', fontWeight: '600', marginRight: '8px' }}>{step.status}</span>
                      <span style={{ color: '#475569', fontSize: '11px' }}>({step.detail})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}} />
    </div>
  );
}

export default Dashboard;
