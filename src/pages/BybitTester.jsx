import React from 'react';
import BybitConsole from '../components/BybitConsole';

function BybitTester() {
  return (
    <div className="bybit-tester-page">
      <div className="tester-container">
        {/* Page Header */}
        <header className="tester-header">
          <div className="status-badge">
            <span className="pulse-dot"></span>
            <span className="badge-text">Connectivity Portal</span>
          </div>
          <h1>
            Bybit API <span className="gradient-span">Connectivity Hub</span>
          </h1>
          <p>
            Authorized testing interface for verifying high-performance API integration and connectivity headers for <strong>Mesoflix Institutional Infrastructure</strong>.
          </p>
        </header>

        {/* Instructions for Integration Team */}
        <div className="instruction-steps">
          <div className="step-card">
            <h3 className="step-title">Phase 1: Keys</h3>
            <p className="step-desc">Provide a Testnet or Mainnet API key with Read-Write permissions for account balance verification.</p>
          </div>
          <div className="step-card">
            <h3 className="step-title">Phase 2: Sign</h3>
            <p className="step-desc">Requests are cryptographically signed using HMAC-SHA256 for V5 protocol security compliance.</p>
          </div>
          <div className="step-card">
            <h3 className="step-title">Phase 3: Verify</h3>
            <p className="step-desc">Confirmation of 'Referer' header capture within the institutional tracking subsystem.</p>
          </div>
        </div>

        {/* The Tester Console */}
        <BybitConsole />

        {/* Footer info */}
        <footer className="tester-footer">
          <p className="copyright">
            MesoflixLabs &copy; 2026 Institutional Trading Infrastructure
          </p>
        </footer>
      </div>
    </div>
  );
}

export default BybitTester;
