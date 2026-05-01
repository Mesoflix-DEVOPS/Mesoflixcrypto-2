import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Key, 
  Bell, 
  Globe, 
  Eye, 
  EyeOff, 
  Save, 
  Lock,
  Cpu
} from 'lucide-react';

export default function InstitutionalSettings() {
  const { user } = useOutletContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="pg-settings">
      <div className="set-container">
        {/* Sidebar Nav */}
        <div className="set-nav">
          <div className="set-nav-header">
            <h1>Settings</h1>
            <p>Manage your institutional account</p>
          </div>
          <div className="set-nav-items">
            {[
              { id: 'profile', label: 'Profile & Identity', icon: User },
              { id: 'security', label: 'Security & 2FA', icon: Shield },
              { id: 'api', label: 'API Management', icon: Key },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'preferences', label: 'System Prefs', icon: Globe },
            ].map(item => (
              <button 
                key={item.id} 
                className={`set-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="set-content">
          {activeTab === 'profile' && (
            <div className="set-section">
              <div className="section-header">
                <h2>Profile Information</h2>
                <p>Update your personal and professional details.</p>
              </div>
              <div className="section-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Account ID</label>
                    <input value={user?.id || 'INST-9281-XM'} readOnly disabled />
                  </div>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input defaultValue={user?.name || 'Administrator'} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input defaultValue={user?.email || 'admin@mesoflix.com'} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <button className="save-btn">
                  <Save size={16} />
                  <span>Update Profile</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="set-section">
              <div className="section-header">
                <h2>Security Settings</h2>
                <p>Enhance the protection of your digital vault.</p>
              </div>
              <div className="section-body security-stack">
                <div className="security-item">
                  <div className="si-info">
                    <div className="si-icon"><Lock size={18} /></div>
                    <div className="si-text">
                      <h3>Two-Factor Authentication</h3>
                      <p>Add an extra layer of security using Google Authenticator or Authy.</p>
                    </div>
                  </div>
                  <button className="si-action active">Enabled</button>
                </div>
                <div className="security-item">
                  <div className="si-info">
                    <div className="si-icon"><Cpu size={18} /></div>
                    <div className="si-text">
                      <h3>Withdrawal Whitelist</h3>
                      <p>Restrict withdrawals to verified institutional addresses only.</p>
                    </div>
                  </div>
                  <button className="si-action">Configure</button>
                </div>
                <div className="security-item">
                  <div className="si-info">
                    <div className="si-icon"><Shield size={18} /></div>
                    <div className="si-text">
                      <h3>Session Management</h3>
                      <p>Review and manage your active trading sessions across devices.</p>
                    </div>
                  </div>
                  <button className="si-action secondary">View Logs</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="set-section">
              <div className="section-header">
                <h2>API Management</h2>
                <p>Connect your institutional tools via secure API keys.</p>
              </div>
              <div className="section-body api-manager">
                <div className="api-key-box">
                  <div className="ak-header">
                    <span>Default Institutional Key</span>
                    <span className="ak-tag">Read / Write</span>
                  </div>
                  <div className="ak-display">
                    <input 
                      type={showApiKey ? 'text' : 'password'} 
                      value="msf_live_8271x_9921_aa827161551" 
                      readOnly 
                    />
                    <button onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="api-warning">
                  <AlertCircle size={14} />
                  <span>Never share your private keys. Mesoflix staff will never ask for them.</span>
                </div>
                <button className="new-key-btn">Generate New API Key</button>
              </div>
            </div>
          )}

          {/* Placeholder sections for others */}
          {['notifications', 'preferences'].includes(activeTab) && (
            <div className="set-section empty">
              <div className="section-header">
                <h2>Coming Soon</h2>
                <p>This module is currently being optimized for institutional deployment.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .pg-settings {
          padding: 32px;
          background: #07111f;
          min-height: 100%;
        }

        .set-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 48px;
        }

        .set-nav { display: flex; flex-direction: column; gap: 32px; }
        .set-nav-header h1 { font-size: 24px; font-weight: 900; color: #fff; margin: 0 0 8px 0; }
        .set-nav-header p { font-size: 13px; color: #475569; margin: 0; }

        .set-nav-items { display: flex; flex-direction: column; gap: 4px; }
        .set-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; border: none; background: transparent;
          color: #64748b; font-size: 14px; font-weight: 700;
          border-radius: 8px; cursor: pointer; text-align: left;
          transition: 0.2s;
        }
        .set-nav-item:hover { background: rgba(255, 255, 255, 0.03); color: #fff; }
        .set-nav-item.active { background: rgba(16, 185, 129, 0.08); color: #10b981; }

        .set-content { display: flex; flex-direction: column; }
        .set-section { display: flex; flex-direction: column; gap: 32px; }
        .section-header h2 { font-size: 18px; font-weight: 900; color: #fff; margin: 0 0 8px 0; }
        .section-header p { font-size: 14px; color: #475569; margin: 0; }

        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 12px; font-weight: 800; color: #334155; text-transform: uppercase; }
        .form-group input {
          background: #0b1629; border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff; padding: 12px 16px; border-radius: 8px; font-size: 14px;
          outline: none; transition: 0.2s;
        }
        .form-group input:focus { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1); }
        .form-group input:disabled { opacity: 0.5; cursor: not-allowed; }

        .save-btn {
          margin-top: 32px; align-self: flex-start;
          background: #10b981; color: #000; border: none;
          padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 900;
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          transition: 0.2s;
        }
        .save-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }

        .security-stack { display: flex; flex-direction: column; gap: 1px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; }
        .security-item { display: flex; justify-content: space-between; align-items: center; padding: 24px; background: #07111f; }
        .si-info { display: flex; gap: 20px; }
        .si-icon { width: 44px; height: 44px; background: rgba(255, 255, 255, 0.03); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #10b981; }
        .si-text h3 { font-size: 15px; font-weight: 800; color: #fff; margin: 0 0 4px 0; }
        .si-text p { font-size: 13px; color: #475569; margin: 0; }
        .si-action { background: #0b1629; border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 800; cursor: pointer; }
        .si-action.active { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: #10b981; }
        .si-action.secondary { color: #38bdf8; }

        .api-manager { display: flex; flex-direction: column; gap: 20px; }
        .api-key-box { background: #0b1629; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 20px; }
        .ak-header { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 12px; font-weight: 800; color: #475569; }
        .ak-tag { color: #10b981; text-transform: uppercase; }
        .ak-display { display: flex; gap: 12px; }
        .ak-display input { flex: 1; background: #060c1a; border: none; color: #fff; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px; }
        .ak-display button { background: none; border: none; color: #64748b; cursor: pointer; }
        .api-warning { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #f59e0b; background: rgba(245, 158, 11, 0.05); padding: 12px; border-radius: 8px; }
        .new-key-btn { align-self: flex-start; background: transparent; border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 800; cursor: pointer; }

        .set-section.empty { padding: 80px 0; text-align: center; opacity: 0.5; }

        @media (max-width: 900px) {
          .set-container { grid-template-columns: 1fr; }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

const AlertCircle = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
