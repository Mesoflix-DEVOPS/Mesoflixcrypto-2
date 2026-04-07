import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function BybitRelay() {
  const [searchParams] = useSearchParams();
  const [syncStep, setSyncStep] = useState(0);

  useEffect(() => {
    // 1. Instantly clean up the URL for the user
    // This hides the 'messy' code and state from the address bar
    window.history.replaceState({}, document.title, window.location.pathname);

    // 2. Extract the actual parameters
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    const backendUrl = 'https://mesoflixcrypto-2.onrender.com/api/auth/bybit/callback';

    // 3. Institutional Animation Sequence
    const timer1 = setTimeout(() => setSyncStep(1), 800);  // "Secure Handshake..."
    const timer2 = setTimeout(() => setSyncStep(2), 1800); // "Synchronizing Credentials..."
    
    const timer3 = setTimeout(() => {
      if (code && state) {
        window.location.href = `${backendUrl}?code=${code}&state=${state}`;
      } else if (error) {
        window.location.href = `${backendUrl}?error=${error}`;
      } else {
        window.location.href = '/brokerage';
      }
    }, 2800); // The "Jump" to Render

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [searchParams]);

  return (
    <div className="inner-page flex items-center justify-center p-6" 
         style={{ minHeight: '100vh', background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)' }}>
      
      <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-emerald-500/20 p-10 rounded-3xl text-center shadow-2xl">
        
        {/* Animated Institutional Logo/Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-emerald-400 rounded-full animate-spin"></div>
          <div className="absolute inset-4 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.9L9.03 9.003c.273.163.665.163.938 0l6.865-4.103a.5.5 0 000-.853l-6.865-4.103a.965.965 0 00-.938 0L2.166 4.047a.5.5 0 000 .853zM10 10.463l6.547-3.914a.5.5 0 01.765.426v6.78a.966.966 0 01-.482.836l-6.36 3.8a.965.965 0 01-.94 0l-6.36-3.8a.966.966 0 01-.481-.836V6.975a.5.5 0 01.766-.426L10 10.463z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
          Bybit Institutional Sync
        </h2>
        
        {/* Progress Steps */}
        <div className="space-y-4 text-left mt-8">
          <div className={`flex items-center gap-4 transition-all duration-500 ${syncStep >= 0 ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-2 h-2 rounded-full ${syncStep >= 1 ? 'bg-emerald-400' : 'bg-slate-600 animate-pulse'}`}></div>
            <p className="text-sm font-medium text-slate-300">Verifying Brokerage Handshake</p>
          </div>
          
          <div className={`flex items-center gap-4 transition-all duration-500 ${syncStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-2 h-2 rounded-full ${syncStep >= 2 ? 'bg-emerald-400' : 'bg-slate-600 animate-pulse'}`}></div>
            <p className="text-sm font-medium text-slate-300">Synchronizing OAuth Credentials</p>
          </div>

          <div className={`flex items-center gap-4 transition-all duration-500 ${syncStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-2 h-2 rounded-full ${syncStep >= 2 ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></div>
            <p className="text-sm font-medium text-slate-300">Securing Exchange Connection</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
            Mesoflix Secure Gateway
          </p>
        </div>
      </div>
    </div>
  );
}

export default BybitRelay;
