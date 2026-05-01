import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageSquare, 
  Mail, 
  ExternalLink, 
  FileText,
  ChevronRight,
  LifeBuoy
} from 'lucide-react';

export default function InstitutionalHelp() {
  const [search, setSearch] = useState('');

  return (
    <div className="pg-help">
      <div className="help-hero">
        <div className="hero-content">
          <LifeBuoy size={48} className="hero-icon" />
          <h1>Institutional Support Desk</h1>
          <p>How can our high-frequency engineering team assist you today?</p>
          <div className="help-search">
            <Search size={18} />
            <input 
              placeholder="Search documentation, guides, or API references..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="help-grid">
        {/* Knowledge Base */}
        <div className="help-section kb-section">
          <div className="section-header">
            <BookOpen size={20} />
            <h2>Knowledge Base</h2>
          </div>
          <div className="kb-grid">
            {[
              { title: 'Getting Started', items: ['Institutional Onboarding', 'Account Verification', 'Vault Security'] },
              { title: 'Trading Desk', items: ['Bybit UTA Migration', 'Order Types Guide', 'Leverage & Risk'] },
              { title: 'API & Integration', items: ['WebSocket Authentication', 'Rate Limits', 'REST API Specs'] },
              { title: 'Billing & Compliance', items: ['Fee Structures', 'Institutional Tax Forms', 'KYB Process'] },
            ].map((cat, i) => (
              <div className="kb-card" key={i}>
                <h3>{cat.title}</h3>
                <div className="kb-links">
                  {cat.items.map((item, j) => (
                    <button key={j} className="kb-link">
                      <span>{item}</span>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Support */}
        <div className="help-side">
          <div className="help-section support-section">
            <div className="section-header">
              <MessageSquare size={20} />
              <h2>Direct Support</h2>
            </div>
            <div className="support-cards">
              <div className="support-card active">
                <div className="sc-icon"><MessageSquare size={20} /></div>
                <div className="sc-text">
                  <h4>Priority Live Chat</h4>
                  <p>Average response: 2 mins</p>
                </div>
              </div>
              <div className="support-card">
                <div className="sc-icon"><Mail size={20} /></div>
                <div className="sc-text">
                  <h4>Institutional Email</h4>
                  <p>desk@mesoflixlabs.com</p>
                </div>
              </div>
              <div className="support-card">
                <div className="sc-icon"><FileText size={20} /></div>
                <div className="sc-text">
                  <h4>Technical Ticket</h4>
                  <p>Open a new dev ticket</p>
                </div>
              </div>
            </div>
          </div>

          <div className="help-section system-status">
            <div className="section-header">
              <Activity size={20} />
              <h2>Platform Status</h2>
            </div>
            <div className="status-list">
              {[
                { name: 'Core Engine', status: 'Operational' },
                { name: 'Bybit WebSocket', status: 'Operational' },
                { name: 'API Services', status: 'Operational' },
                { name: 'Order Matching', status: 'Operational' },
              ].map((s, i) => (
                <div className="status-item" key={i}>
                  <span className="status-name">{s.name}</span>
                  <div className="status-indicator">
                    <span className="status-dot"></span>
                    <span className="status-label">{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

const Activity = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
