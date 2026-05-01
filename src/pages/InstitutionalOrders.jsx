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

    </div>
  );
}
