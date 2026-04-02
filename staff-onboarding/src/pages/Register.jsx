import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      setGeneratedKey(data.uniqueKey);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (generatedKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510] p-6 font-sans text-gray-100">
        <div className="max-w-md w-full bg-[#0a0a1a] border border-[#1a1a3a] p-8 rounded-3xl shadow-[0_0_50px_rgba(30,144,255,0.1)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500"></div>
          
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Welcome to the Team</h2>
          <p className="text-gray-400 mb-8 text-sm">Your account has been created. Save your unique security key safely. You will need it, along with your password, for every login.</p>
          
          <div className="bg-[#050510] border border-[#1f1f3f] p-5 rounded-2xl mb-8 shadow-inner">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Your Unique Staff Key</p>
            <p className="text-3xl font-mono tracking-widest text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">{generatedKey}</p>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-gradient-to-r from-blue-600 hover:from-blue-500 to-indigo-600 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1"
          >
            Proceed to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050510] p-6 font-sans text-gray-100">
      <div className="max-w-md w-full bg-[#0a0a1a] border border-[#1a1a3a] p-8 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-500"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all duration-500"></div>
        
        <div className="relative z-10">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold mb-2 text-white tracking-tight">Staff Portal</h2>
            <p className="text-blue-400/80 text-sm font-medium tracking-wide uppercase">Authorized Personnel Registration</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Full Legal Name</label>
              <input 
                type="text" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#050510] border border-[#1f1f3f] rounded-2xl px-5 py-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-300 placeholder-gray-600"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Corporate Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050510] border border-[#1f1f3f] rounded-2xl px-5 py-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-300 placeholder-gray-600"
                placeholder="staff@mesoflixlabs.com"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Secure Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050510] border border-[#1f1f3f] rounded-2xl px-5 py-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-300 placeholder-gray-600"
                placeholder="••••••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-2xl flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-blue-900 disabled:to-indigo-900 disabled:text-gray-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] disabled:shadow-none flex justify-center items-center transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Processing...' : 'Request Access'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Already registered? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
