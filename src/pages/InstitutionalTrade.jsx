import React, { useState, useEffect } from 'react';
import { Activity, Shield, Zap, TrendingUp, Search, Info } from 'lucide-react';
import CustomTradingChart from '../components/CustomTradingChart';
import { useSocket } from '../context/SocketContext';
import { getApiUrl, fetchWithLogging } from '../config/api';

function InstitutionalTrade() {
  const { tickers } = useSocket();
  const [activeSymbol, setActiveSymbol] = useState('BTCUSDT');
  const [balance, setBalance] = useState({ equity: '0.00', available: '0.00' });
  const [orderType, setOrderType] = useState('market');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetchWithLogging(getApiUrl('/api/bybit/dashboard/balance'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBalance({
            equity: data.data?.totalEquity || '0.00',
            available: data.data?.totalAvailableBalance || '0.00'
          });
        }
      } catch (e) {}
    };
    fetchBalance();
  }, []);

  const currentTicker = tickers[activeSymbol] || { lastPrice: '0.00', price24hPcnt: '0' };

  return (
    <div className="trade-terminal-v2">
      <div className="terminal-grid">
        {/* Left: Market Discovery */}
        <div className="panel">
          <div className="p-header">
             <span className="p-title">Market Discovery</span>
             <Search size={14} color="#475569" />
          </div>
          <div className="p-body ticker-list">
             {Object.entries(tickers).slice(0, 20).map(([symbol, data]) => (
                <div 
                   key={symbol} 
                   className={`t-row ${activeSymbol === symbol ? 'active' : ''}`}
                   onClick={() => setActiveSymbol(symbol)}
                >
                   <div className="t-left">
                      <span className="t-sym">{symbol}</span>
                   </div>
                   <div className="t-right" style={{ textAlign: 'right' }}>
                      <span className="t-prc">${parseFloat(data.lastPrice).toLocaleString()}</span>
                      <span className={`t-chg ${parseFloat(data.price24hPcnt) >= 0 ? 'pos' : 'neg'}`}>
                         {(parseFloat(data.price24hPcnt) * 100).toFixed(2)}%
                      </span>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* Center: Charting Engine */}
        <div className="panel" style={{ borderLeft: '1px solid #1a1b23', borderRight: '1px solid #1a1b23' }}>
           <div className="p-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <span className="p-title" style={{ fontSize: '14px', color: '#fff' }}>{activeSymbol}</span>
                 <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '800' }}>${parseFloat(currentTicker.lastPrice).toLocaleString()}</span>
              </div>
              <Activity size={14} color="#10b981" />
           </div>
           <div className="p-body" style={{ background: '#000' }}>
              <CustomTradingChart symbol={activeSymbol} height="100%" />
           </div>
        </div>

        {/* Right: Execution Engine */}
        <div className="panel">
           <div className="p-header">
              <span className="p-title">Neural Execution</span>
              <Shield size={14} color="#F7A600" />
           </div>
           <div className="p-body execution-engine">
              <div className="exec-tabs">
                 <button className={orderType === 'market' ? 'active' : ''} onClick={() => setOrderType('market')}>Market</button>
                 <button className={orderType === 'limit' ? 'active' : ''} onClick={() => setOrderType('limit')}>Limit</button>
              </div>

              <div className="input-group">
                 <label>Order Value (USDT)</label>
                 <div className="i-wrap">
                    <input 
                       type="number" 
                       placeholder="0.00" 
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                    />
                    <span>MAX</span>
                 </div>
              </div>

              <div style={{ marginTop: '20px', padding: '16px', background: '#0a0b0f', borderRadius: '12px', border: '1px solid #1a1b23' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#475569' }}>Available Margin</span>
                    <span style={{ fontSize: '10px', color: '#fff' }}>${parseFloat(balance.available).toLocaleString()}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', color: '#475569' }}>Est. Liquidation</span>
                    <span style={{ fontSize: '10px', color: '#ef4444' }}>- -</span>
                 </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                 <button className="exec-btn buy">Long / Buy</button>
                 <button className="exec-btn sell">Short / Sell</button>
              </div>

              <div style={{ marginTop: '40px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Shield size={12} color="#10b981" />
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '800' }}>CAPITAL SHIELD ACTIVE</span>
                 </div>
                 <p style={{ fontSize: '10px', color: '#475569', lineHeight: '1.5' }}>
                    Mesoflix Neural Engine is monitoring this position. Liquidity is routed through Bybit UTA pool.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default InstitutionalTrade;
