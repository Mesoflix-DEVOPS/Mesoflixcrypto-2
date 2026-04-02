import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Onboarding() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const staffData = JSON.parse(localStorage.getItem('staffData') || '{}');

  useEffect(() => {
    if (!staffData.id) {
      navigate('/login');
      return;
    }
    if (staffData.agreementSigned) {
      navigate('/dashboard');
    }
    fetchStatus();
  }, [navigate]);

  const fetchStatus = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    try {
      const res = await fetch(`${API_BASE_URL}/api/staff/status`);
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to fetch branch status:", err);
    }
  };

  const handleComplete = async () => {
    if (!category || !agreed) {
      setError("Please select a division and sign the agreement.");
      return;
    }

    setLoading(true);
    setError(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

    try {
      const res = await fetch(`${API_BASE_URL}/api/staff/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          staffId: staffData.id, 
          category 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete onboarding.');
      }

      // Update local storage
      const newStaffData = { 
        ...staffData, 
        agreementSigned: true, 
        role: data.role,
        teamId: data.teamId,
        category 
      };
      localStorage.setItem('staffData', JSON.stringify(newStaffData));
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!status) return <div className="min-h-screen bg-[#050510] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050510] text-gray-100 p-6 md:p-12 font-sans overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Staff Induction</h1>
            <p className="text-gray-400 mt-2">MesoflixLabs Institutional Services</p>
          </div>
          <div className="flex space-x-2">
            <div className={`w-12 h-2 rounded-full ${step === 1 ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-[#1f1f3f]'}`}></div>
            <div className={`w-12 h-2 rounded-full ${step === 2 ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-[#1f1f3f]'}`}></div>
          </div>
        </div>

        <div className="bg-[#0a0a1a]/80 backdrop-blur-xl border border-[#1a1a3a] rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-white border-b border-[#1f1f3f] pb-4">Non-Disclosure & Professional Agreement</h2>
              
              <div className="bg-[#050510] rounded-2xl p-6 h-96 overflow-y-auto mb-8 border border-[#1f1f3f] custom-scrollbar text-sm text-gray-300 leading-relaxed space-y-6">
                <div>
                  <h3 className="text-white font-bold mb-2 uppercase tracking-wide">1. Absolute Confidentiality (NDA)</h3>
                  <p>As an authorized staff member, you shall hold in strict confidence all proprietary strategies, client data, technical architecture, and team communications. Unauthorized disclosure of internal operations will result in immediate termination and potential legal action.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2 uppercase tracking-wide">2. Structural Order & Hierarchy</h3>
                  <p>The first inducted member of a division acts as the Team Lead. All subsequent members are required to follow the operational blueprint laid down by the Team Lead. Structural hierarchy is to be maintained with utmost professionalism.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2 uppercase tracking-wide">3. Intellectual Property (IP)</h3>
                  <p>All scripts, tools, support templates, and strategies developed during your tenure are the exclusive property of MesoflixLabs. You surrender all rights to claim ownership or reproduce these assets outside of this ecosystem.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2 uppercase tracking-wide">4. Unified Front</h3>
                  <p>Internal disputes must remain strictly within the team. When interacting with clients via the Support Portal or any external channel, members must present a unified, respectful, and authoritative presence representative of MesoflixLabs Institutional Services.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-purple-900/10 p-5 rounded-2xl border border-purple-500/20 mb-8 cursor-pointer hover:bg-purple-900/20 transition-colors" onClick={() => setAgreed(!agreed)}>
                <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${agreed ? 'bg-purple-500 border-purple-500' : 'bg-[#050510] border-gray-500'}`}>
                  {agreed && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div className="select-none">
                  <p className="font-bold text-white text-sm">I have read and consent to the terms above.</p>
                  <p className="text-xs text-gray-400 mt-1">By proceeding, you legally bind yourself to the MesoflixLabs Professional Agreement.</p>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!agreed}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-purple-900 disabled:to-indigo-900 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg"
              >
                Proceed to Division Selection
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-2 text-white">Select Your Division</h2>
              <p className="text-gray-400 mb-8 text-sm">Choose the trading division you will specialize in. The first registrant in each division automatically assumes the Team Lead role.</p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {['crypto', 'forex', 'binary'].map((cat) => {
                  const stat = status[cat];
                  const isFull = stat?.members >= 3;
                  const isSelected = category === cat;

                  return (
                    <div 
                      key={cat}
                      className={`relative rounded-2xl p-6 border transition-all cursor-pointer overflow-hidden ${isFull ? 'bg-[#050510] border-[#1f1f3f] opacity-60' : isSelected ? 'bg-cyan-900/20 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)] transform -translate-y-1' : 'bg-[#050510] border-[#1a1a3a] hover:border-gray-500'}`}
                      onClick={() => !isFull && setCategory(cat)}
                    >
                      {/* Decoration */}
                      {isSelected && <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/20 blur-xl rounded-full"></div>}
                      
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-[#1f1f3f] flex items-center justify-center">
                          {cat === 'crypto' && <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                          {cat === 'forex' && <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                          {cat === 'binary' && <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                        </div>
                        {isSelected && (
                          <div className="bg-cyan-500 text-[#050510] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Selected</div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-white capitalize mb-1 relative z-10">{cat} Division</h3>
                      
                      <div className="space-y-2 mt-4 relative z-10">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Status</span>
                          <span className={isFull ? 'text-red-400' : 'text-emerald-400'}>{isFull ? 'Full' : 'Open'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Available Role</span>
                          <span className="text-blue-400 font-medium">{!stat?.hasLeader ? 'Team Lead' : 'Member'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Current Members</span>
                          <span className="text-white bg-[#1f1f3f] px-2 py-0.5 rounded">{stat?.members || 0}/3</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl mb-6 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-4 bg-[#1f1f3f] hover:bg-[#2a2a4f] text-white font-bold rounded-2xl transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleComplete}
                  disabled={!category || loading}
                  className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex justify-center items-center"
                >
                  {loading ? 'Processing...' : 'Finalize Registration'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Onboarding;
