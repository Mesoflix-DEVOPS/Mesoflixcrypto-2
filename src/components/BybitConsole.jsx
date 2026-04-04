import React, { useState } from 'react';

function BybitConsole() {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isTestnet, setIsTestnet] = useState(true);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const checkConnection = async () => {
    if (!apiKey || !apiSecret) {
      setError('Please enter both API Key and Secret.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    setBalance(null);

    try {
      // Use the local server or the production server
      const API_BASE_URL = 'http://localhost:3001';
      const res = await fetch(`${API_BASE_URL}/api/bybit/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType: 'UNIFIED',
          apiConfig: {
            apiKey,
            apiSecret,
            isTestnet,
            brokerId: 'Ef001038'
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setBalance(data.result.list[0]);
        setSuccessMsg('Connection successful! Signed requests are working.');
      } else {
        setError(data.retMsg || 'Failed to connect to Bybit.');
      }
    } catch (err) {
      setError('Network error. Ensure the backend server is running on http://localhost:3001');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#0a0a1a] rounded-3xl border border-[#1a1a3a] shadow-2xl overflow-hidden font-sans">
      {/* Header with Mode Toggle */}
      <div className={`p-6 flex justify-between items-center border-b border-[#1a1a3a] ${isTestnet ? 'bg-blue-900/10' : 'bg-orange-900/10'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${isTestnet ? 'bg-blue-400' : 'bg-orange-400'}`}></div>
          <div>
            <h1 className="font-bold text-lg text-white">Bybit Broker API Tester</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Broker ID: Ef001038</p>
          </div>
        </div>
        
        <div className="flex bg-[#050510] rounded-xl p-1.5 border border-[#1f1f3f]">
          <button 
            onClick={() => setIsTestnet(true)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isTestnet ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            TESTNET (DEMO)
          </button>
          <button 
            onClick={() => setIsTestnet(false)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${!isTestnet ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            MAINNET (REAL)
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Credentials Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 ml-1">API Key</label>
            <input 
              type="text" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Bybit API Key"
              className="w-full bg-[#050510] border border-[#1f1f3f] rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 ml-1">API Secret</label>
            <input 
              type="password" 
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="••••••••••••••••••••••••"
              className="w-full bg-[#050510] border border-[#1f1f3f] rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Info/Warning Area */}
        <div className="bg-[#111122] rounded-2xl p-5 border border-[#1a1a3a] space-y-3">
          <div className="flex items-start space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              This tool automatically attaches the <span className="text-white font-bold">Referer: Ef001038</span> header to verify your connectivity and broker status with the Bybit team.
            </p>
          </div>
          
          {!isTestnet && (
            <div className="pt-2 flex items-start space-x-3 border-t border-[#1a1a3a]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-[11px] text-orange-200/70 leading-relaxed font-bold">
                REAL MODE ACTIVE: Transactions will use actual funds.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          <button 
            onClick={checkConnection}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-3 ${
              loading 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : isTestnet 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40' 
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-xl shadow-orange-900/40'
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944a11.955 11.955 0 01-8.618 3.04m17.236 0L12 2.189l-8.618.755m17.236 0a11.95 11.95 0 01-1.12 6.13M4 12a11.962 11.962 0 001.385 5.568L12 21.362l6.615-3.794A11.962 11.962 0 0020 12M12 2.944a11.952 11.952 0 01-1.12-6.13M12 2.944V21.362" />
                </svg>
                <span>Check Bybit Connectivity</span>
              </>
            )}
          </button>
        </div>

        {/* Feedbacks */}
        {error && (
          <div className="text-red-400 text-xs text-center font-bold bg-red-900/10 border border-red-500/20 py-3 rounded-xl animate-bounce">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="text-emerald-400 text-xs text-center font-bold bg-emerald-900/10 border border-emerald-500/20 py-3 rounded-xl">
            {successMsg}
          </div>
        )}

        {balance && (
          <div className="bg-[#050510] rounded-2xl border border-[#1f1f3f] p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Account Snapshot (Unified)</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#0a0a1a] p-4 rounded-xl border border-[#1f1f3f]">
                <p className="text-[10px] text-gray-500 mb-1">Total Equity (USD)</p>
                <p className="text-xl font-bold text-white">${parseFloat(balance.totalEquity).toLocaleString()}</p>
              </div>
              <div className="bg-[#0a0a1a] p-4 rounded-xl border border-[#1f1f3f]">
                <p className="text-[10px] text-gray-500 mb-1">Available Margin</p>
                <p className="text-xl font-bold text-emerald-400">${parseFloat(balance.totalAvailableBalance).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BybitConsole;
