import React from 'react';
import { Link } from 'react-router-dom';

function AuthComplete() {
  return (
    <div className="inner-page flex items-center justify-center" style={{ minHeight: '90vh', padding: '120px 24px' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="auth-card text-center" style={{ 
          background: 'rgba(10, 10, 26, 0.6)', 
          backdropFilter: 'blur(16px)', 
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          borderRadius: '40px', 
          padding: '60px 40px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
        }}>
          <div className="success-icon-wrapper mb-8" style={{ fontSize: '64px' }}>
            ✨
          </div>
          
          <h1 className="large-title" style={{ fontSize: '42px', marginBottom: '16px', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Connection Secured
          </h1>
          
          <p className="text text-base" style={{ color: '#94a3b8', marginBottom: '40px', maxWidth: '400px', margin: '0 auto 40px auto' }}>
            Your Bybit account has been successfully linked with military-grade encryption. Your trading console is now ready.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/dashboard" className="btn btn-base btn-g-blue-veronica text-base" style={{ width: '100%', py: '16px' }}>
              Launch Dashboard
            </Link>
            <Link to="/settings" style={{ color: '#475569', fontSize: '14px', textDecoration: 'none' }}>
              View Connection Settings
            </Link>
          </div>

          <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
             <p style={{ fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
               Audit ID: {new URLSearchParams(window.location.search).get('session_id') || 'Verified'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthComplete;
