import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

function StaffRegister() {
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

    const API_BASE_URL = import.meta.env.MODE === 'development' 
      ? 'http://localhost:3001' 
      : ''; // Use relative paths in production

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 p-8 rounded-2xl text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
          <p className="text-slate-400 mb-8">Please save your unique security key safely. You will need it for every login.</p>
          
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mb-8">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Your Unique Staff Key</p>
            <p className="text-2xl font-mono tracking-widest text-emerald-400">{generatedKey}</p>
          </div>

          <button 
            onClick={() => navigate('/support/staff/login')}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-900/20"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Secure Staff Registration</h2>
          <p className="text-slate-500 text-sm mt-1">Authorized personnel only — Hidden Management Route</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
            <input 
              type="text" 
              required 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Support Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition"
              placeholder="staff@mesoflixlabs.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/30">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-xl transition shadow-lg shadow-blue-900/20 mt-4"
          >
            {loading ? 'Creating Account...' : 'Register as Staff'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default StaffRegister;
