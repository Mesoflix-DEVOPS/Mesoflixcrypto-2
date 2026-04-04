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
    <div className="inner-page">
      <div className="container" style={{ maxWidth: '1000px', padding: '40px 20px' }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="inner-hero-badge">Broker Tracking Active</div>
            <h1 className="inner-hero-title" style={{ fontSize: '32px', marginTop: '10px' }}>Test Dashboard</h1>
          </div>
          <button onClick={logout} className="btn border border-slate-700 text-slate-400 text-xs px-4 py-2 rounded-lg hover:bg-slate-800 transition">
            Disconnect Session
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Sidebar / Stats */}
          <div className="space-y-6">
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-4">Account Overview</h3>
              {loading && !balance ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-8 bg-slate-800 rounded w-full"></div>
                  <div className="h-8 bg-slate-800 rounded w-3/4"></div>
                </div>
              ) : balance ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Total Equity (USD)</p>
                    <p className="text-3xl font-bold text-white">${parseFloat(balance.totalEquity).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Available Margin</p>
                    <p className="text-xl font-bold text-emerald-400">${parseFloat(balance.totalAvailableBalance).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-400 text-xs">{error || 'Data unavailable'}</p>
              )}
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-4">Tracking Configuration</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs text-left">Broker ID</span>
                  <span className="text-blue-400 text-xs font-mono font-bold">Ef001038</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs text-left">Environment</span>
                  <span className={`text-xs font-bold ${config.isTestnet ? 'text-blue-400' : 'text-orange-400'}`}>
                    {config.isTestnet ? 'TESTNET' : 'MAINNET'}
                  </span>
                </div>
                <div className="flex justify-center p-3 mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-[10px] text-emerald-400 font-bold text-center">SIGNED HEADERS ACTIVE</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-4">Verify Integration</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed mb-4">
                Place a small test order to confirm that the Bybit rebate system records the transaction under your Broker ID.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => placeTestOrder('BTCUSDT', 'Buy', '0.0001')}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all active:scale-95"
                >
                  Place Test BTC Order
                </button>
                <button 
                  onClick={() => placeTestOrder('XRPUSDT', 'Buy', '10')}
                  disabled={loading}
                  className="w-full py-3 border border-slate-700 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                >
                  Place Test XRP Order
                </button>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-[#0a0f1d] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
            <div className="bg-slate-900/50 p-4 border-b border-slate-800 flex justify-between items-center">
               <h3 className="text-slate-300 text-sm font-bold flex items-center gap-2">
                 <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                 Activity Stream (Broker Tracked)
               </h3>
               {orderLogs.length > 0 && (
                 <button onClick={() => setOrderLogs([])} className="text-[10px] text-slate-500 hover:text-slate-300 transition">Clear</button>
               )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
              {orderLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-[10px] uppercase tracking-widest font-bold">Waiting for requests...</p>
                </div>
              ) : (
                orderLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-900/80 border border-slate-800/50 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-500">{log.time}</span>
                        <span className="text-[10px] font-bold text-blue-400">{log.type}</span>
                        <span className={`text-[10px] font-bold ${log.side === 'Buy' ? 'text-emerald-400' : 'text-rose-400'}`}>{log.side} {log.symbol}</span>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 
                        log.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{log.details}</p>
                    <div className="mt-2 pt-2 border-t border-slate-800/50 flex gap-4">
                       <span className="text-[8px] text-slate-600">Header: <span className="text-slate-400">Referer:Ef001038</span></span>
                       <span className="text-[8px] text-slate-600">Ver: <span className="text-slate-400">V5</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BybitDashboard;
