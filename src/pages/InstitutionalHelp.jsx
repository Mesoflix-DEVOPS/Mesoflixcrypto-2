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

      <style>{`
        .pg-help {
          display: flex;
          flex-direction: column;
          background: #07111f;
          min-height: 100%;
        }

        .help-hero {
          background: linear-gradient(rgba(11, 22, 41, 0.9), rgba(7, 17, 31, 1)), url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070');
          background-size: cover;
          background-position: center;
          padding: 80px 24px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .hero-content { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .hero-icon { color: #10b981; }
        .hero-content h1 { font-size: 32px; font-weight: 900; color: #fff; margin: 0; letter-spacing: -0.02em; }
        .hero-content p { font-size: 16px; color: #94a3b8; margin: 0; }

        .help-search {
          width: 100%;
          max-width: 600px;
          background: #0b1629;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          color: #64748b;
        }
        .help-search input { background: transparent; border: none; color: #fff; font-size: 15px; outline: none; width: 100%; }

        .help-grid {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 48px;
          width: 100%;
        }

        .help-section { display: flex; flex-direction: column; gap: 24px; }
        .section-header { display: flex; align-items: center; gap: 12px; color: #fff; }
        .section-header h2 { font-size: 18px; font-weight: 800; margin: 0; }

        .kb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .kb-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; }
        .kb-card h3 { font-size: 15px; font-weight: 800; color: #10b981; margin: 0 0 16px 0; }
        .kb-links { display: flex; flex-direction: column; gap: 4px; }
        .kb-link {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; background: none; border: none; color: #94a3b8;
          font-size: 14px; font-weight: 700; cursor: pointer; border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          transition: 0.2s;
        }
        .kb-link:hover { color: #fff; padding-left: 4px; }

        .support-cards { display: flex; flex-direction: column; gap: 12px; }
        .support-card {
          display: flex; align-items: center; gap: 16px;
          background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 16px; border-radius: 12px; cursor: pointer; transition: 0.2s;
        }
        .support-card:hover { transform: translateX(4px); background: rgba(255, 255, 255, 0.04); }
        .support-card.active { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }
        .sc-icon { width: 40px; height: 40px; background: #0b1629; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #10b981; }
        .sc-text h4 { font-size: 14px; font-weight: 800; color: #fff; margin: 0 0 4px 0; }
        .sc-text p { font-size: 12px; color: #475569; margin: 0; }

        .system-status { margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.05); }
        .status-list { display: flex; flex-direction: column; gap: 12px; }
        .status-item { display: flex; justify-content: space-between; align-items: center; }
        .status-name { font-size: 13px; font-weight: 700; color: #94a3b8; }
        .status-indicator { display: flex; align-items: center; gap: 8px; }
        .status-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
        .status-label { font-size: 11px; font-weight: 900; color: #10b981; text-transform: uppercase; }

        @media (max-width: 900px) {
          .help-grid { grid-template-columns: 1fr; }
          .kb-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

const Activity = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
