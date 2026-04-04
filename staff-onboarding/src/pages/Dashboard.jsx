import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Dashboard() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const staffData = JSON.parse(localStorage.getItem('staffData') || '{}');

  useEffect(() => {
    if (!staffData.id) {
      navigate('/login');
      return;
    }
    if (!staffData.agreementSigned) {
      navigate('/onboarding');
      return;
    }
    fetchTeamData();
  }, [navigate]);

  const fetchTeamData = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE_URL}/api/staff/team/${staffData.id}`);
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data);
      }
    } catch (err) {
      console.error("Failed to fetch team data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffData');
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen bg-[#050510] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050510] text-gray-100 font-sans">
      {/* Top Navbar */}
      <nav className="bg-[#0a0a1a] border-b border-[#1a1a3a] px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white">Staff Portal</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{staffData.category} Division</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-right hidden md:block">
            <p className="font-bold text-sm text-white">{staffData.fullName}</p>
            <p className="text-xs text-emerald-400 capitalize">{staffData.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1a3a] rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* Verification Status */}
        <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Clearance Verified</h2>
              <p className="text-sm text-gray-400">Professional Agreement signed. System access granted.</p>
            </div>
          </div>
          <div className="bg-[#050510] px-4 py-2 rounded-lg border border-[#1f1f3f] text-xs font-mono text-gray-500">
            Clearance Level: {staffData.role === 'leader' ? 'Tier 1' : 'Tier 2'}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Quick Stats Placeholder */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white">Overview</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#0a0a1a] p-6 rounded-2xl border border-[#1a1a3a] shadow-lg">
                <p className="text-sm text-gray-400 mb-1">Active Support Tickets</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-white">0</span>
                  <span className="text-emerald-400 text-sm">Assigned below</span>
                </div>
              </div>
              <div className="bg-[#0a0a1a] p-6 rounded-2xl border border-[#1a1a3a] shadow-lg">
                <p className="text-sm text-gray-400 mb-1">Division Rank</p>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 capitalize">{staffData.role}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          </div>
          
          <div className="space-y-8">
            {/* Team Widget */}
            <div className="bg-[#0a0a1a] rounded-2xl border border-[#1a1a3a] shadow-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex justify-between items-center">
              Team Roster
              <span className="bg-[#1f1f3f] text-xs px-2 py-1 rounded text-gray-300">{teamMembers.length}/3</span>
            </h2>
            
            <div className="space-y-4">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-[#050510] rounded-xl border border-[#1f1f3f]">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${member.role === 'leader' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {member.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{member.full_name} {member.id === staffData.id && '(You)'}</p>
                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  </div>
                  {member.role === 'leader' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))}
              
              {teamMembers.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500">No members found.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
