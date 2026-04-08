import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function AuthError() {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('code') || 'unknown_error';
  const details = searchParams.get('details') || '';

  const getErrorMessage = (code) => {
    switch (code) {
      case 'invalid_state': return 'Security Handshake Failed';
      case 'session_expired': return 'Link Session Expired';
      case 'token_exchange_failed': return 'Exchange Access Denied';
      case 'account_already_linked_elsewhere': return 'Account Already Linked';
      case 'session_already_consumed': return 'Link Request Reused';
      default: return 'Synchronization Failure';
    }
  };

  const getErrorDescription = (code) => {
    switch (code) {
      case 'invalid_state': return 'The security token provided does not match our records. This may be due to an interrupted connection.';
      case 'session_expired': return 'For your security, Bybit link sessions expire after 15 minutes. Please try again.';
      case 'account_already_linked_elsewhere': return 'This Bybit account is already associated with another Mesoflix user profile.';
      default: return 'An unexpected error occurred during the secure handshake. Please try the connection process again.';
    }
  };

  return (
    <div className="inner-page flex items-center justify-center" style={{ minHeight: '90vh', padding: '120px 24px' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="auth-card text-center" style={{ 
          background: 'rgba(26, 10, 10, 0.4)', 
          backdropFilter: 'blur(16px)', 
          border: '1px solid rgba(239, 68, 68, 0.1)', 
          borderRadius: '40px', 
          padding: '60px 40px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
        }}>
          <div className="error-icon-wrapper mb-8" style={{ fontSize: '64px' }}>
             ⚠️
          </div>
          
          <h1 className="large-title" style={{ fontSize: '42px', marginBottom: '16px', color: '#ef4444' }}>
            {getErrorMessage(errorCode)}
          </h1>
          
          <p className="text text-base" style={{ color: '#94a3b8', marginBottom: '40px', maxWidth: '400px', margin: '0 auto 40px auto' }}>
            {getErrorDescription(errorCode)}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/dashboard" className="btn btn-base btn-white text-base" style={{ width: '100%', py: '16px' }}>
              Retry Connection
            </Link>
            <Link to="/support" style={{ color: '#475569', fontSize: '14px', textDecoration: 'none' }}>
              Contact Security Support
            </Link>
          </div>

          <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
             <p style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
               Diagnostic Trace: {errorCode} {details && `| ${details}`}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthError;
