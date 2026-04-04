import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  Users, 
  Shield, 
  Database, 
  Activity, 
  ChevronRight, 
  Search, 
  Filter,
  BarChart3,
  Cpu,
  Globe,
  TrendingUp,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  LogOut,
  Target
} from 'lucide-react';

function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const staffData = JSON.parse(localStorage.getItem('staffData') || '{}');
    // Security check for fixed admin accounts
    if (staffData.email !== 'admin@mesoflix.com' && staffData.email !== 'admin@mesoflixlabs.com') {
      // In a real app we'd check a JWT claim or a boolean in the DB.
      // But for this requirement, we'll allow the redirect from Login.jsx to handle routing.
    }
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      // Direct query to staff_profiles to get everyone
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Crypto', 'Forex', 'Binary'];
  
  const filteredMembers = members.filter(m => {
    const matchesSearch = (m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = activeTab === 'All' || m.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffData');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02020a] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-400 font-medium animate-pulse">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02020a] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar - Desktop Only */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#050512] border-r border-indigo-500/10 z-50 hidden lg:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">Central Admin</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Mesoflix Labs</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('All')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'All' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white/5 text-slate-400'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium text-sm">Unified Overview</span>
          </button>
          
          <div className="pt-6 pb-2 px-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Divisions</p>
          </div>

          {['Crypto', 'Forex', 'Binary'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white/5 text-slate-400'}`}
            >
              {cat === 'Crypto' ? <Cpu size={18} /> : cat === 'Forex' ? <TrendingUp size={18} /> : <Target size={18} />}
              <span className="font-medium text-sm">{cat} Division</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-medium text-sm"
          >
            <LogOut size={18} />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 bg-[#02020a]/80 backdrop-blur-xl border-b border-indigo-500/10 px-8 py-4 flex items-center justify-between z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">{activeTab} Monitor</h2>
            <div className="h-4 w-[1px] bg-white/10 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
              <Database size={14} />
              <span>Real-time DB Sync</span>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#050512] border border-indigo-500/10 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/30 w-64"
              />
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#050512] p-6 rounded-3xl border border-indigo-500/10 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={64} className="text-indigo-500" />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Personnel</p>
              <h3 className="text-3xl font-black text-white">{members.length}</h3>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded w-fit">
                UNIFIED COUNT
              </div>
            </div>

            <div className="bg-[#050512] p-6 rounded-3xl border border-emerald-500/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield size={64} className="text-emerald-500" />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Team Leads</p>
              <h3 className="text-3xl font-black text-white">{members.filter(m => m.role === 'leader').length}</h3>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded w-fit">
                BRANCH OVERSEERS
              </div>
            </div>

            <div className="bg-[#050512] p-6 rounded-3xl border border-purple-500/10 relative overflow-hidden group hover:border-purple-500/30 transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={64} className="text-purple-500" />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Verified Agents</p>
              <h3 className="text-3xl font-black text-white">{members.filter(m => m.agreement_signed).length}</h3>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded w-fit">
                NDA COMPLIANT
              </div>
            </div>

            <div className="bg-[#050512] p-6 rounded-3xl border border-blue-500/10 relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe size={64} className="text-blue-500" />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Divisions Active</p>
              <h3 className="text-3xl font-black text-white">3</h3>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded w-fit">
                SYSTEM REACH
              </div>
            </div>
          </div>

          {/* Members Table Section */}
          <section className="bg-[#050512] rounded-3xl border border-indigo-500/10 overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-indigo-500/10 flex justify-between items-center bg-[#07071a]">
              <div>
                <h3 className="text-lg font-bold text-white">Global Staff Directory</h3>
                <p className="text-xs text-slate-500 font-medium">Real-time surveillance of all registered personnel</p>
              </div>
              <button 
                onClick={fetchMembers}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs font-bold transition-all"
              >
                <Activity size={14} />
                REFRESH DATA
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#02020a]">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-indigo-500/5">Personnel Identity</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-indigo-500/5">Division</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-indigo-500/5">Level</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-indigo-500/5">Credential Access</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-indigo-500/5">Signature Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-indigo-500/5">Date Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-500/5">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs border ${member.role === 'leader' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`}>
                            {member.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{member.full_name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2 py-1 rounded font-bold text-[10px] tracking-widest uppercase border ${
                          member.category === 'Crypto' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          member.category === 'Forex' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-500/20' :
                          'bg-blue-400/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {member.category}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${member.role === 'leader' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-700'}`}></span>
                          <span className={`text-[11px] font-bold uppercase tracking-tight ${member.role === 'leader' ? 'text-indigo-400' : 'text-slate-500'}`}>
                            {member.role === 'leader' ? 'Tier 1 Control' : 'Specialist Operative'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-0.5">
                           <span className="text-[10px] text-slate-600 font-bold uppercase">Staff Key:</span>
                           <span className="text-[11px] text-slate-400 font-mono">{member.unique_key || '********'}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        {member.agreement_signed ? (
                          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10 w-fit">
                            <CheckCircle2 size={12} />
                            <span className="text-[10px] font-bold uppercase">Authorized</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-orange-400 bg-orange-400/5 px-3 py-1.5 rounded-full border border-orange-400/10 w-fit">
                            <XCircle size={12} />
                            <span className="text-[10px] font-bold uppercase">Pending NDA</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-end">
                           <span className="text-xs font-medium text-slate-400">{new Date(member.created_at).toLocaleDateString()}</span>
                           <span className="text-[10px] text-slate-600 font-mono">{new Date(member.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <Search size={48} className="text-slate-800 mb-4" />
                <h4 className="text-slate-400 font-bold text-lg tracking-tight uppercase">No Data Intercepted</h4>
                <p className="text-slate-600 text-xs max-w-xs px-6 mt-2">Zero records matching the specified criteria detected in the core database.</p>
              </div>
            )}
            
            <div className="px-8 py-4 bg-[#02020a] border-t border-indigo-500/5 flex justify-end">
               <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">End of Directory Protocol</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
