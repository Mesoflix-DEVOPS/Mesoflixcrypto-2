import React, { useState } from 'react';

function BybitConsole() {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isTestnet, setIsTestnet] = useState(false);
  const [isDemo, setIsDemo] = useState(true);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkConnection = async () => {
    if (!apiKey || !apiSecret) {
      setError('Please enter both API Key and Secret.');
      return;
    }

    setLoading(true);
    setError('');
    setBalance(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE_URL}/api/bybit/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType: 'UNIFIED',
          apiConfig: {
            apiKey,
            apiSecret,
            isTestnet,
            isDemo,
            brokerId: 'Ef001038'
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setBalance(data.result.list[0]);
      } else {
        setError(data.retMsg || 'Failed to connect to Bybit.');
      }
    } catch (err) {
      setError('Network error. Check if the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a1a] rounded-2xl border border-[#1a1a3a] shadow-xl overflow-hidden">
      {/* Header with Mode Toggle */}
      <div className={`p-4 flex justify-between items-center border-b border-[#1a1a3a] ${isTestnet ? 'bg-blue-900/10' : isDemo ? 'bg-emerald-900/10' : 'bg-orange-900/10'}`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isTestnet ? 'bg-blue-400' : isDemo ? 'bg-emerald-400' : 'bg-orange-400'}`}></div>
          <h3 className="font-bold text-sm text-white">Bybit Management Console</h3>
        </div>
        
        <div className="flex bg-[#050510] rounded-lg p-1 border border-[#1f1f3f]">
          <button 
            onClick={() => { setIsTestnet(true); setIsDemo(false); }}
            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${isTestnet ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            TESTNET
          </button>
          <button 
            onClick={() => { setIsTestnet(false); setIsDemo(true); }}
            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${isDemo ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            DEMO
          </button>
          <button 
            onClick={() => { setIsTestnet(false); setIsDemo(false); }}
            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${!isTestnet && !isDemo ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            REAL
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5 ml-1">API Key</label>
            <input 
              type="text" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Bybit API Key"
              className="w-full bg-[#050510] border border-[#1f1f3f] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5 ml-1">API Secret</label>
            <input 
              type="password" 
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full bg-[#050510] border border-[#1f1f3f] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Warning for Real Mode */}
        {!isTestnet && (
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-3 flex items-start space-x-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-[11px] text-orange-200/70 leading-relaxed">
              <span className="font-bold text-orange-400">WARNING:</span> Real mode uses actual funds. Ensure your API keys have appropriate permissions and restrictions.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          <button 
            onClick={checkConnection}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
              loading 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : isTestnet 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30' 
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/30'
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Check Connection</span>
              </>
            )}
          </button>
        </div>

        {/* Result Area */}
        {error && (
          <div className="text-red-400 text-xs text-center font-medium bg-red-900/10 border border-red-500/20 py-2 rounded-lg">
            {error}
          </div>
        )}

        {balance && (
          <div className="bg-[#050510] rounded-xl border border-[#1f1f3f] p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Wallet Information (Unified)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Total Equity</p>
                <p className="text-lg font-bold text-white">${parseFloat(balance.totalEquity).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Available Margin</p>
                <p className="text-lg font-bold text-emerald-400">${parseFloat(balance.totalAvailableBalance).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BybitConsole;
