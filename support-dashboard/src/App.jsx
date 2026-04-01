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
    const token = localStorage.getItem('staffToken');
    setSession(token);
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
    </div>
  );

  if (!session) return <Navigate to="/support/staff/login" />;

  return children;
};

// Main Dashboard View
function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const navigate = useNavigate();
  const staff = JSON.parse(localStorage.getItem('staffUser') || '{}');

  const API_BASE_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:3001' 
    : 'https://mesoflixcrypto-2.onrender.com';

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setMessages(data || []);
      // Auto-select first message if none selected
      if (!activeTicket && data?.length > 0) setActiveTicket(data[0]);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchMessages();
        if (activeTicket?.id === id) setActiveTicket({ ...activeTicket, status });
        alert(`Status updated to ${status}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: activeTicket.id,
          userEmail: activeTicket.email,
          userName: activeTicket.name,
          message: replyText,
          staffName: staff.fullName
        })
      });

      if (response.ok) {
        setReplyText('');
        fetchMessages();
        alert('Reply sent successfully!');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (err) {
      alert('Failed to send reply. Please ensure BREVO_API_KEY is active on the backend.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    navigate('/support/staff/login');
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  return (
    <div className="dashboard-grid h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Sidebar */}
      <aside className="bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
        <header className="p-6 border-b border-slate-800 flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
               <span className="font-bold text-blue-400 text-xl">M</span>
             </div>
             <div>
               <h2 className="text-xl font-bold tracking-tight">Mesoflix<span className="text-blue-500">Labs</span></h2>
               <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Support Central</p>
             </div>
          </div>
          
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-300">@{staff.fullName || 'Support'}</span>
            </div>
            <button onClick={handleLogout} className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase transition">Logout</button>
          </div>
        </header>

        {/* Filters */}
        <div className="p-4 flex gap-2 overflow-x-auto border-b border-slate-800 scrollbar-hide">
          {['all', 'new', 'active', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition whitespace-nowrap ${
                filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
             <div className="p-8 text-center text-slate-600 text-sm italic">Loading tickets...</div>
          ) : filteredMessages.length === 0 ? (
             <div className="p-8 text-center text-slate-600 text-sm">No {filter} tickets found</div>
          ) : (
            filteredMessages.map(msg => (
              <button
                key={msg.id}
                onClick={() => setActiveTicket(msg)}
                className={`w-full p-4 rounded-2xl flex flex-col text-left transition group ${
                  activeTicket?.id === msg.id ? 'bg-blue-600 shadow-xl shadow-blue-900/20' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1 w-full gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider truncate ${activeTicket?.id === msg.id ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-300'}`}>
                    {msg.subject}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex-shrink-0 ${
                    msg.status === 'new' ? 'bg-blue-500/20 text-blue-400' : 
                    msg.status === 'active' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {msg.status || 'new'}
                  </span>
                </div>
                <h3 className={`font-bold truncate w-full ${activeTicket?.id === msg.id ? 'text-white' : 'text-slate-200'}`}>
                  {msg.name}
                </h3>
                <p className={`text-xs truncate w-full mt-1 ${activeTicket?.id === msg.id ? 'text-blue-100/70' : 'text-slate-400 group-hover:text-slate-300'}`}>
                  {msg.message}
                </p>
                <span className={`text-[10px] mt-2 ${activeTicket?.id === msg.id ? 'text-blue-100/50' : 'text-slate-500'}`}>
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="h-full flex flex-col bg-slate-950 relative overflow-hidden">
        {activeTicket ? (
          <>
            {/* Ticket Header */}
            <header className="p-6 border-b border-slate-800 glass flex justify-between items-center z-10 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border border-white/10 uppercase">
                  {activeTicket.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{activeTicket.name}</h2>
                  <p className="text-xs text-slate-400">{activeTicket.email} • Ticket #{activeTicket.id.slice(0,8)}</p>
                </div>
              </div>
              <div className="hidden md:flex gap-3">
                <button 
                  onClick={() => handleUpdateStatus(activeTicket.id, 'completed')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-900/20 text-emerald-400 border border-emerald-900/30 rounded-xl text-xs font-bold hover:bg-emerald-900/40 transition"
                >
                  Mark Completed
                </button>
                <button 
                  onClick={() => handleUpdateStatus(activeTicket.id, 'closed')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-700 transition"
                >
                  Close Ticket
                </button>
              </div>
            </header>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Original Message (Left side) */}
              <div className="flex flex-col items-start animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="max-w-[80%] bg-slate-900 border border-slate-800 p-5 rounded-2xl rounded-tl-none shadow-xl">
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                    Original Request • {activeTicket.subject}
                  </div>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{activeTicket.message}</p>
                  <div className="mt-3 text-[10px] text-slate-500 flex justify-between">
                    <span>{new Date(activeTicket.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Change Indicator */}
              <div className="flex justify-center">
                <div className={`text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/5 ${
                   activeTicket.status === 'active' ? 'bg-amber-500/10 text-amber-400' : 
                   activeTicket.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'
                }`}>
                  Ticket Status: {activeTicket.status || 'New'}
                </div>
              </div>
            </div>

            {/* Reply Bar */}
            <footer className="p-6 bg-slate-900/50 border-t border-slate-800 flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="max-w-4xl mx-auto flex flex-col gap-4">
                  <div className="relative group">
                    <textarea
                      placeholder={`Type your reply to ${activeTicket.name}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition resize-none shadow-2xl"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                     <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                           <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Email Response</span>
                        </div>
                        <p className="text-[10px] text-slate-600 italic">User receives a professional HTML email branded as MesoflixLabs.</p>
                     </div>
                     <button 
                        onClick={handleSendReply}
                        disabled={actionLoading || !replyText.trim()}
                        className="px-10 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl transition shadow-xl shadow-blue-900/20 active:scale-95"
                     >
                       {actionLoading ? 'Sending Response...' : 'Send Reply'}
                     </button>
                  </div>
               </div>
            </footer>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-20 text-center animate-in fade-in duration-700">
            <div>
              <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-slate-800 shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-3">No Active Thread</h2>
              <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">Select a correspondence from the sidebar to view details, update status, or send a professional reply.</p>
            </div>
          </div>
        )}
      </main>
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

export default App;
