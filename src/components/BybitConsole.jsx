import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getApiUrl, fetchWithLogging } from '../config/api';

function BybitConsole() {
  const [apiKey, setApiKey] = React.useState('');
  const [apiSecret, setApiSecret] = React.useState('');
  const [isTestnet, setIsTestnet] = React.useState(false); // Default to MAINNET as requested
  const [isDemo, setIsDemo] = React.useState(false);
  const [balance, setBalance] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [managedAccount, setManagedAccount] = React.useState(null);
  const [isOnboarding, setIsOnboarding] = React.useState(false);
  const [userId, setUserId] = React.useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // 1. Load user profile
    const profile = localStorage.getItem('user_profile');
    if (profile) {
      const parsed = JSON.parse(profile);
      setUserId(parsed.id);
    }

    // 2. Check for fresh OAuth sync
    const params = new URLSearchParams(window.location.search);
    const syncError = params.get('error');
    
    if (params.get('sync') === 'true') {
      setSuccessMsg('Successfully linked with Bybit!');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (syncError === 'db_storage_failed') {
      setError('System Error: Database configuration required for institutional sync. Please contact your administrator.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (syncError) {
      setError(`Wait! Connection Failed: ${syncError.replace(/_/g, ' ')}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  useEffect(() => {
    if (userId) {
      fetchManagedAccount();
    }
  }, [userId, isTestnet, isDemo]);

  const fetchManagedAccount = async () => {
    if (!userId) return; // Safety guard
    
    try {
      const env = isDemo ? 'DEMO' : isTestnet ? 'TESTNET' : 'REAL';
      const res = await fetchWithLogging(getApiUrl(`/api/broker/account/${userId}?environment=${env}`));
      const data = await res.json();
      if (res.ok) {
        setManagedAccount(data);
      } else {
        setManagedAccount(null);
      }
    } catch (err) {
      console.error('Error fetching managed account:', err);
    }
  };

  const startOnboarding = () => {
    if (!userId) return;
    setIsOnboarding(true);
    
    // Official Broker OAuth Redirection
    window.location.href = getApiUrl(`/api/auth/bybit/authorize?userId=${userId}`);
  };

  const loginWithManagedAccount = () => {
    if (!managedAccount) return;
    
    setLoading(true);
    setError('');
    
    const { apiConfig } = managedAccount;
    // Persist session locally for the dashboard
    localStorage.setItem('bybit_test_config', JSON.stringify(apiConfig));
    setSuccessMsg('Institutional Session Active. Redirecting...');
    
    setTimeout(() => {
      navigate('/broker/api/test/dashboard');
    }, 1500);
  };

  const handleModeChange = (mode) => {
    if (mode === 'testnet') {
      setIsTestnet(true);
      setIsDemo(false);
    } else if (mode === 'demo') {
      setIsTestnet(false);
      setIsDemo(true);
    } else {
      setIsTestnet(false);
      setIsDemo(false);
    }
  };

  const checkConnection = async () => {
    if (!apiKey || !apiSecret) {
      setError('Please enter both API Key and Secret.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const apiConfig = {
      apiKey,
      apiSecret,
      isTestnet,
      isDemo,
      brokerId: 'Ef001038'
    };

    try {
      const res = await fetchWithLogging(getApiUrl('/api/bybit/balance'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType: 'UNIFIED',
          apiConfig
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Update balance display in console
        setBalance(data.result.list[0]);
        
        // Persist session locally for the dashboard
        localStorage.setItem('bybit_test_config', JSON.stringify(apiConfig));
        setSuccessMsg('Connection successful! Redirecting to dashboard...');
        
        setTimeout(() => {
          navigate('/broker/api/test/dashboard');
        }, 1500);
      } else {
        setError(data.retMsg || 'Failed to connect to Bybit.');
      }
    } catch (err) {
      setError('Network error. Ensure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (isDemo) return 'bg-teal';
    if (isTestnet) return 'bg-blue';
    return 'bg-orange';
  };

  return (
    <div className="bybit-console">
      {/* Header with Mode Toggle */}
      <div className={`console-top ${isDemo ? 'demo-mode' : isTestnet ? 'testnet-mode' : 'mainnet-mode'}`}>
        <div className="console-identity">
          <div className={`status-indicator ${getStatusColor()}`}></div>
          <div className="identity-text">
            <h2>Bybit API Console</h2>
            <p className="sub-label">SECURE ENDPOINT: V5</p>
          </div>
        </div>
        
        <div className="mode-switcher">
          <button 
            onClick={() => handleModeChange('testnet')}
            className={isTestnet ? 'active-testnet' : ''}
          >
            TESTNET
          </button>
          <button 
            onClick={() => handleModeChange('demo')}
            className={isDemo ? 'active-demo' : ''}
          >
            PAPER DEMO
          </button>
          <button 
            onClick={() => handleModeChange('real')}
            className={!isTestnet && !isDemo ? 'active-mainnet' : ''}
          >
            REAL
          </button>
        </div>
      </div>


      <div className="console-body">
        {/* Seamless / Managed Section */}
        <div className="managed-onboarding-section">
          {managedAccount ? (
            <div className="managed-status-box success">
              <div className="status-info">
                <span className="status-label">INSTITUTIONAL ACCOUNT ACTIVE</span>
                <span className="sub-uid">UID: {managedAccount.sub_uid} ({managedAccount.username})</span>
              </div>
              <button onClick={loginWithManagedAccount} className="one-click-btn">
                One-Click Login
              </button>
            </div>
          ) : (
            <div className="managed-onboarding">
              <div className="onboarding-header">
                <h3>Institutional Bybit Connectivity</h3>
                <p>Mesoflix is an official Bybit Broker Partner. Connect your account securely via OAuth.</p>
              </div>
              
              <div className="onboarding-actions">
                <button 
                  className="btn btn-g-blue-veronica btn-base text-base"
                  onClick={startOnboarding}
                  disabled={isOnboarding}
                >
                  <img src="/bybit-logo-small.svg" alt="Bybit" className="btn-icon" style={{ height: '20px', marginRight: '8px' }} />
                  {isOnboarding ? 'Redirecting to Bybit...' : 'Connect with Bybit'}
                </button>
              </div>

              <div className="onboarding-footer">
                <p>✓ No API keys manual entry required</p>
                <p>✓ Official Institutional Sub-account System</p>
                <p>✓ AES-256 Military Grade Encryption</p>
              </div>
            </div>
          )}
        </div>

        <div className="divider-text"><span>OR MANUAL ENTRY</span></div>

        {/* Credentials Form */}
        <div className="credentials-form">
          <div className="tester-input-group">
            <label>API Key</label>
            <input 
              type="text" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API Key"
            />
          </div>
          <div className="tester-input-group">
            <label>API Secret</label>
            <input 
              type="password" 
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Enter your Secret Key"
            />
          </div>
        </div>

        {/* Info/Warning Area */}
        <div className="tech-info-box">
          <div className="msg-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              Signed connection test utilizing the <span className="highlight">Referer ID</span> header to verify technical integration status with the exchange protocol.
            </p>
          </div>
          
          {!isTestnet && !isDemo && (
            <div className="mainnet-alert">
              <div className="msg-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>MANUAL VERIFICATION ACTIVE: Transactions will execute on live exchange ledger.</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button 
          onClick={checkConnection}
          disabled={loading}
          className={`tester-check-btn ${isTestnet ? 'testnet-variant' : 'mainnet-variant'}`}
        >
          {loading ? (
            <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944a11.955 11.955 0 01-8.618 3.04m17.236 0L12 2.189l-8.618.755m17.236 0a11.95 11.95 0 01-1.12 6.13M4 12a11.962 11.962 0 001.385 5.568L12 21.362l6.615-3.794A11.962 11.962 0 0020 12M12 2.944a11.952 11.952 0 01-1.12-6.13M12 2.944V21.362" />
              </svg>
              <span>Verifying Connection</span>
            </>
          )}
        </button>

        {/* Feedbacks */}
        {error && (
          <div className="feedback-box error">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="feedback-box success">
            {successMsg}
          </div>
        )}

        {balance && (
          <div className="balance-terminal">
            <h4 className="terminal-label">Account Data Stream</h4>
            <div className="terminal-grid">
              <div className="metric-card">
                <p className="label">Total Equity (USD)</p>
                <p className="value">${parseFloat(balance.totalEquity).toLocaleString()}</p>
              </div>
              <div className="metric-card">
                <p className="label">Available Margin</p>
                <p className="value green">${parseFloat(balance.totalAvailableBalance).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BybitConsole;
