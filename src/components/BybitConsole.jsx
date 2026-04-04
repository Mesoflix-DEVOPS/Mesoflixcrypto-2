import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function BybitConsole() {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isTestnet, setIsTestnet] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();

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
      const API_BASE_URL = import.meta.env.MODE === 'development' 
        ? 'http://localhost:3001' 
        : 'https://mesoflixcrypto-2.onrender.com';
      const res = await fetch(`${API_BASE_URL}/api/bybit/balance`, {
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
