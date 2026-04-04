import React from 'react';
import BybitConsole from '../components/BybitConsole';

function BybitTester() {
  return (
    <div className="min-h-screen bg-[#050510] text-gray-100 flex flex-col items-center justify-center p-6 md:p-12 selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-blue-600/5 blur-[120px] -z-10 rounded-full"></div>
      
      <div className="max-w-4xl w-full space-y-12 animate-in fade-in duration-1000">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Broker Verification Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Bybit API <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Connectivity Hub</span>
          </h1>
          <p className="max-w-xl mx-auto text-sm text-gray-400 leading-relaxed">
            Authorized testing interface for verifying broker integration and header tracking for <span className="text-white font-bold">Mesoflix Institutional Brokerage</span>.
          </p>
        </div>

        {/* Instructions for Bybit Team */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-[#0a0a1a] rounded-2xl border border-[#1a1a3a] space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Step 1: Keys</h3>
            <p className="text-[11px] text-gray-500">Provide a Testnet or Mainnet API key with Account & Trade permissions.</p>
          </div>
          <div className="p-6 bg-[#0a0a1a] rounded-2xl border border-[#1a1a3a] space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Step 2: Sign</h3>
            <p className="text-[11px] text-gray-500">Our backend automatically signs requests using HMAC-SHA256 for V5 security.</p>
          </div>
          <div className="p-6 bg-[#0a0a1a] rounded-2xl border border-[#1a1a3a] space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Step 3: Verify</h3>
            <p className="text-[11px] text-gray-500">Ensure the 'Referer: Ef001038' header is captured in your rebate tracking system.</p>
          </div>
        </div>

        {/* The Tester Console */}
        <BybitConsole />

        {/* Footer info */}
        <div className="text-center pt-8 border-t border-[#1a1a3a]/50">
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-medium">
            MesoflixLabs &copy; 2026 Institutional Trading Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}

export default BybitTester;
