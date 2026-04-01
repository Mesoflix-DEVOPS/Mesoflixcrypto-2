import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

function StaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffKey, setStaffKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Primary Authentication (Email/Password)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Secondary Authentication (Unique Staff Key)
        const { data: profileData, error: profileError } = await supabase
          .from('staff_profiles')
          .select('unique_key')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          await supabase.auth.signOut();
          throw new Error('Access denied. Profile not found.');
        }

        if (profileData.unique_key !== staffKey) {
          // KEY MISMATCH - Immediate Security Termination
          await supabase.auth.signOut();
          throw new Error('UNAUTHORIZED: Invalid Security Key. This attempt has been logged.');
        }

        // 3. SUCCESS - Redirect to main dash
        navigate('/support/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Staff Central Login</h2>
          <p className="text-slate-500 text-sm mt-1">Multi-factor identity verification required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Staff Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition"
              placeholder="name@mesoflixlabs.com"
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
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">Unique Security Key</label>
              <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Required</span>
            </div>
            <input 
              type="text" 
              required 
              value={staffKey}
              onChange={(e) => setStaffKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition font-mono tracking-widest text-emerald-400"
              placeholder="S-XXXX-XXXX-XXXX"
            />
          </div>

          {error && <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/30">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-white hover:bg-slate-200 text-black font-bold rounded-xl transition shadow-lg mt-4"
          >
            {loading ? 'Verifying Identity...' : 'Access Dashboard'}
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-600">
            Forgot your security key? Contact system administration.
          </p>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;
