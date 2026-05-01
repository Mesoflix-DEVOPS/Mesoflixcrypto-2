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

    </div>
  );
}
    </div>
  );
}

const AlertCircle = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
