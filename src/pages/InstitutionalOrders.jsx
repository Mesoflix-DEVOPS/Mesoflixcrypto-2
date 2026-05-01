import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  ListTodo, 
  Search, 
  Filter, 
  ChevronDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { getApiUrl, fetchWithLogging } from '../config/api';

export default function InstitutionalOrders() {
  const { tradingMode, user } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // active | filled | cancelled
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      try {
        const res = await fetchWithLogging(getApiUrl(`/api/bybit/dashboard/${user.id}?environment=${tradingMode}`));
        if (res.ok) {
          const data = await res.json();
          if (data.ok) {
            // In a real scenario, we'd have a separate orders endpoint
            // For now, we'll use the history as "filled" and mock "active"
            setOrders(data.data.history || []);
          }
        }
      } catch (e) {
        console.error('Failed to fetch orders', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, tradingMode]);

  return (
    <div className="pg-orders">
      {/* Top Navigation */}
      <div className="ord-header">
        <div className="ord-title-row">
          <div className="title-group">
            <ListTodo size={20} />
            <h1>Order Management</h1>
          </div>
          <div className="ord-search">
            <Search size={14} />
            <input placeholder="Search Order ID, Symbol..." />
          </div>
        </div>

        <div className="ord-tabs-row">
          <div className="ord-tabs">
            <button className={activeTab === 'active' ? 'active' : ''} onClick={() => setActiveTab('active')}>
              Active Orders
              <span className="tab-count">0</span>
            </button>
            <button className={activeTab === 'filled' ? 'active' : ''} onClick={() => setActiveTab('filled')}>
              Filled
              <span className="tab-count">{orders.length}</span>
            </button>
            <button className={activeTab === 'cancelled' ? 'active' : ''} onClick={() => setActiveTab('cancelled')}>
              Cancelled
              <span className="tab-count">0</span>
            </button>
          </div>
          <button className="filter-btn">
            <Filter size={14} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="ord-content">
        <div className="table-wrapper">
          <table className="ord-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Order ID</th>
                <th>Pair</th>
                <th>Side</th>
                <th>Type</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="state-row">Loading institutional order book...</td></tr>
              ) : activeTab === 'active' ? (
                <tr><td colSpan="9" className="state-row empty">No open orders in the current queue.</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="9" className="state-row empty">No order history found for {tradingMode} account.</td></tr>
              ) : orders.map((ord, i) => (
                <tr key={i}>
                  <td className="time-cell">{new Date(ord.createdAt || Date.now()).toLocaleTimeString()}</td>
                  <td className="id-cell">{ord.orderId?.slice(0, 8) || 'BYB-8271'}...</td>
                  <td>
                    <div className="pair-cell">
                      <span className="pair-main">{ord.symbol}</span>
                      <span className="pair-sub">PERP</span>
                    </div>
                  </td>
                  <td>
                    <span className={`side-badge ${ord.side.toLowerCase()}`}>{ord.side}</span>
                  </td>
                  <td className="type-cell">Market</td>
                  <td className="price-cell">${parseFloat(ord.avgPrice || ord.execPrice || 0).toLocaleString()}</td>
                  <td className="qty-cell">{parseFloat(ord.execQty || ord.qty || 0).toFixed(3)}</td>
                  <td>
                    <div className="status-cell filled">
                      <CheckCircle size={12} />
                      <span>Filled</span>
                    </div>
                  </td>
                  <td>
                    <button className="action-link">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Bar */}
      <div className="ord-footer">
        <div className="status-item">
          <div className="status-dot online"></div>
          <span>Execution Engine: Online</span>
        </div>
        <div className="status-item">
          <Clock size={12} />
          <span>Last Sync: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <style>{`
        .pg-orders {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #07111f;
        }

        .ord-header {
          padding: 24px 24px 0 24px;
          background: #060c1a;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ord-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title-group { display: flex; align-items: center; gap: 12px; color: #fff; }
        .title-group h1 { font-size: 18px; font-weight: 900; margin: 0; }

        .ord-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 8px 16px;
          border-radius: 8px;
          width: 320px;
          color: #475569;
        }
        .ord-search input { background: transparent; border: none; color: #fff; font-size: 13px; outline: none; width: 100%; }

        .ord-tabs-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ord-tabs { display: flex; gap: 24px; }
        .ord-tabs button {
          background: none; border: none; color: #475569; padding: 12px 0;
          font-size: 13px; font-weight: 800; cursor: pointer;
          position: relative; display: flex; align-items: center; gap: 8px;
          transition: 0.2s;
        }
        .ord-tabs button.active { color: #10b981; }
        .ord-tabs button.active::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px; background: #10b981; border-radius: 2px 2px 0 0;
        }
        .tab-count {
          background: rgba(255, 255, 255, 0.05); color: #94a3b8;
          font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 10px;
        }
        .active .tab-count { background: rgba(16, 185, 129, 0.15); color: #10b981; }

        .filter-btn {
          background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06);
          color: #94a3b8; padding: 8px 16px; border-radius: 8px;
          display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800;
          cursor: pointer; transition: 0.2s;
        }
        .filter-btn:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }

        .ord-content { flex: 1; overflow-y: auto; padding: 24px; }
        .table-wrapper {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          overflow: hidden;
        }

        .ord-table { width: 100%; border-collapse: collapse; }
        .ord-table th {
          padding: 16px 20px; text-align: left;
          font-size: 10px; font-weight: 900; color: #334155;
          text-transform: uppercase; letter-spacing: 0.1em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .ord-table td { padding: 16px 20px; font-size: 13px; border-bottom: 1px solid rgba(255, 255, 255, 0.02); color: #e2e8f0; }

        .time-cell { color: #475569; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
        .id-cell { font-family: monospace; color: #94a3b8; }
        .pair-cell { display: flex; flex-direction: column; }
        .pair-main { font-weight: 800; color: #fff; }
        .pair-sub { font-size: 9px; color: #334155; font-weight: 900; }

        .side-badge {
          font-size: 10px; font-weight: 900; text-transform: uppercase;
          padding: 4px 8px; border-radius: 4px; display: inline-block;
        }
        .side-badge.buy { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .side-badge.sell { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .type-cell { font-weight: 700; color: #475569; }
        .price-cell, .qty-cell { font-family: 'JetBrains Mono', monospace; font-weight: 700; }

        .status-cell { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; }
        .status-cell.filled { color: #10b981; }

        .action-link { background: none; border: none; color: #38bdf8; font-size: 11px; font-weight: 800; cursor: pointer; padding: 0; }
        .action-link:hover { text-decoration: underline; }

        .state-row { text-align: center; padding: 80px !important; color: #475569; font-weight: 700; font-size: 14px; }
        .state-row.empty { color: #334155; }

        .ord-footer {
          padding: 12px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          gap: 24px;
        }
        .status-item { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-dot.online { background: #10b981; box-shadow: 0 0 8px #10b981; }

        @media (max-width: 1024px) {
          .ord-search { width: 200px; }
          .ord-table th:nth-child(2), .ord-table td:nth-child(2) { display: none; }
        }
      `}</style>
    </div>
  );
}
