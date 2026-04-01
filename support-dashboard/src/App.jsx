import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import StaffLogin from './components/Auth/StaffLogin';
import StaffRegister from './components/Auth/StaffRegister';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!session) return <Navigate to="/support/staff/login" />;

  return children;
};

// Main Dashboard View
function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setMessages(data || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/support/staff/login');
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto bg-slate-950 text-white">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Support Dashboard</h1>
          <p className="text-slate-400 mt-1">Authorized Staff Access Only</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchMessages} className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">Refresh</button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/30 rounded-lg">Logout</button>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading messages...</div>
      ) : (
        <div className="grid gap-6">
          {messages.map(msg => (
            <div key={msg.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">{msg.subject}</span>
                <span className="text-slate-500 text-xs">{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <p className="text-slate-300 mb-4">{msg.message}</p>
              <div className="text-sm text-slate-400">From: {msg.name} ({msg.email})</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Global Router
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Hidden Registration Path */}
        <Route path="/ms/support/registration/2026/secure" element={<StaffRegister />} />
        
        {/* Staff Login */}
        <Route path="/support/staff/login" element={<StaffLogin />} />
        
        {/* Protected Dashboard */}
        <Route path="/support/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/support/staff/login" />} />
        <Route path="*" element={<Navigate to="/support/staff/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

// Since I used useNavigate in Dashboard, I need to make sure Dashboard is inside the Router.
// I'll fix that.
export default App;
