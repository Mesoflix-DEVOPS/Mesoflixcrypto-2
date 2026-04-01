import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuration (Should be moved to environment variables for production)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'new' ? 'resolved' : 'new';
    try {
      const { error } = await supabase
        .from('support_messages')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Support Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage user inquiries and technical issues</p>
        </div>
        <button 
          onClick={fetchMessages}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
        >
          {loading ? 'Refreshing...' : 'Refresh Feed'}
        </button>
      </header>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8">
          <strong>Error:</strong> {error}. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
        </div>
      )}

      {loading && messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading support messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-2xl p-20 text-center text-slate-500">
          <p className="text-xl">No support messages found yet.</p>
          <p className="text-sm mt-2">When someone uses the contact form, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`bg-slate-800/50 border rounded-2xl p-6 transition-all ${msg.status === 'resolved' ? 'border-emerald-500/30 opacity-75' : 'border-slate-700'}`}>
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${msg.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {msg.status}
                    </span>
                    <span className="text-slate-500 text-xs">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                  <h3 className="text-xl font-semibold mt-1">{msg.subject}</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateStatus(msg.id, msg.status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${msg.status === 'resolved' ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                  >
                    {msg.status === 'resolved' ? 'Mark as New' : 'Resolve'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">User Name</p>
                  <p className="font-medium">{msg.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Contact Email</p>
                  <a href={`mailto:${msg.email}`} className="text-blue-400 hover:underline">{msg.email}</a>
                </div>
                {msg.account_email && (
                  <div className="md:col-span-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Account Email</p>
                    <p className="text-slate-300">{msg.account_email}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Message</p>
                <div className="bg-slate-900/80 p-4 rounded-lg text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
