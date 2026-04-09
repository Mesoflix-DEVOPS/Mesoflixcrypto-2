import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function BybitRelay() {
  const [searchParams] = useSearchParams();
  const [syncStep, setSyncStep] = useState(0);
  const [syncStatus, setSyncStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const syncWithBackend = async () => {
      // 1. Capture ALL query parameters
      const queryParams = new URLSearchParams(window.location.search);
      const capturedParams = {};
      queryParams.forEach((value, key) => {
        capturedParams[key] = value;
      });

      console.log('[Institutional Relay] Captured Synchronization Parameters:', capturedParams);

      // NOTE: window.history.replaceState is REMOVED to keep token in URL for debugging/retry
      // window.history.replaceState({}, document.title, window.location.pathname);

      const backendUrl = 'https://mesoflixcrypto-2.onrender.com/api/auth/bybit/callback';

      const timer1 = setTimeout(() => setSyncStep(1), 800);
      const timer2 = setTimeout(() => setSyncStep(2), 1800);
      
      try {
        if (Object.keys(capturedParams).length > 0) {
          // Build the query string for the backend
          const forwardQuery = new URLSearchParams(capturedParams).toString();
          
          // Use fetch instead of window.location.href to keep the user on this page on failure
          const response = await fetch(`${backendUrl}?${forwardQuery}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setSyncStatus('success');
            // Success! Proceed to complete page
            setTimeout(() => {
              window.location.href = data.redirect || '/auth/complete?success=true';
            }, 1500);
          } else {
            console.error('[Institutional Relay] Synchronization Failed:', data);
            setSyncStatus('error');
            setErrorMessage(data.error || 'Connection handshake failed. Please refresh current page to retry.');
            
            // If we have a specific error redirect URL from backend, we could use it, 
            // but the user wants to be able to RETRY by refreshing, so we stay here.
            if (data.error === 'incomplete_credentials') {
               setErrorMessage('Incomplete Credentials. The system will attempt to re-handshake on refresh.');
            }
          }
        } else {
          console.warn('[Institutional Relay] No parameters found.');
          setSyncStatus('error');
          setErrorMessage('No synchronization parameters detected in URL.');
        }
      } catch (err) {
        console.error('[Institutional Relay] Network Error:', err);
        setSyncStatus('error');
        setErrorMessage('Network error communicating with secure gateway. Please refresh to try again.');
      }
    };

    syncWithBackend();
  }, [searchParams]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, sans-serif'
    }}>
      
      <div style={{ 
        maxWidth: '440px', 
        width: '100%', 
        backgroundColor: 'rgba(15, 23, 42, 0.6)', 
        backdropFilter: 'blur(16px)', 
        border: syncStatus === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)', 
        padding: '40px', 
        borderRadius: '32px', 
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        transition: 'border 0.5s ease'
      }}>
        
        {/* State-dependent UI */}
        {syncStatus === 'loading' && (
          <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 32px' }}>
            <div style={{ position: 'absolute', inset: '0', border: '4px solid rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}></div>
            <div style={{ 
              position: 'absolute', 
              inset: '0', 
              border: '4px solid transparent', 
              borderTopColor: '#34d399', 
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div style={{ 
              position: 'absolute', 
              inset: '16px', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <svg style={{ width: '32px', height: '32px', color: '#34d399' }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.9L9.03 9.003c.273.163.665.163.938 0l6.865-4.103a.5.5 0 000-.853l-6.865-4.103a.965.965 0 00-.938 0L2.166 4.047a.5.5 0 000 .853zM10 10.463l6.547-3.914a.5.5 0 01.765.426v6.78a.966.966 0 01-.482.836l-6.36 3.8a.965.965 0 01-.94 0l-6.36-3.8a.966.966 0 01-.481-.836V6.975a.5.5 0 01.766-.426L10 10.463z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {syncStatus === 'error' && (
          <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 32px' }}>
            <div style={{ 
              position: 'absolute', 
              inset: '0', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <svg style={{ width: '48px', height: '48px', color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        )}

        {syncStatus === 'success' && (
          <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 32px' }}>
            <div style={{ 
              position: 'absolute', 
              inset: '0', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
               <svg style={{ width: '48px', height: '48px', color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', letterSpacing: '-0.025em' }}>
          {syncStatus === 'error' ? 'Sync Interrupted' : syncStatus === 'success' ? 'Sync Completed' : 'Bybit Institutional Sync'}
        </h2>

        {syncStatus === 'error' ? (
          <div style={{ marginTop: '24px' }}>
             <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>ERROR: {errorMessage}</p>
             <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
               Please do not navigate away. Review the URL parameters and <span style={{ color: '#fff', fontWeight: '700' }}>Refresh (F5)</span> the system to attempt a re-handshake with the new configuration.
             </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: syncStep >= 0 ? 1 : 0.3, transition: 'opacity 0.5s' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: syncStep >= 1 || syncStatus === 'success' ? '#34d399' : '#475569' }}></div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8', margin: '0' }}>Verifying Brokerage Handshake</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: syncStep >= 1 ? 1 : 0.3, transition: 'opacity 0.5s' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: syncStep >= 2 || syncStatus === 'success' ? '#34d399' : '#475569' }}></div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8', margin: '0' }}>Synchronizing OAuth Credentials</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: syncStep >= 2 ? 1 : 0.3, transition: 'opacity 0.5s' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: syncStatus === 'success' ? '#34d399' : syncStep >= 2 ? '#34d399' : '#475569', animation: syncStep >= 2 && syncStatus === 'loading' ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none' }}></div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8', margin: '0' }}>Securing Exchange Connection</p>
            </div>
          </div>
        )}

        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', margin: '0' }}>
            Mesoflix Secure Gateway
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}} />
    </div>
  );
}

export default BybitRelay;
