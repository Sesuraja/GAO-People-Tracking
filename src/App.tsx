/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSimulation } from './lib/simulation';
import { Activity, Bell, Map, Users, BarChart3, Settings, ShieldAlert, Cpu, LayoutDashboard, Radio, PlayCircle, Search } from 'lucide-react';
import TopBar from './components/TopBar';
import PeopleTab from './components/PeopleTab';
import AlertsTab from './components/AlertsTab';
import AnalyticsTab from './components/AnalyticsTab';
import DashboardTab from './components/DashboardTab';
import LiveTrackingTab from './components/LiveTrackingTab';
import PlaybackTab from './components/PlaybackTab';
import DevicesTab from './components/DevicesTab';
import SettingsTab from './components/SettingsTab';
import ProfileModal from './components/ProfileModal';
import ChatBot from './components/ChatBot';

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const { people, alerts, ZONES, isLoading } = useSimulation();
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedPersonId, setHighlightedPersonId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const navigate = useNavigate();

  const filteredPeople = searchQuery 
    ? people.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col py-6 shrink-0 z-10 transition-all duration-300 shadow-sm">
        {/* LOGO */}
        <div className="px-6 mb-8 flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#007BC4] leading-none">GAO</h1>
          </div>
          <span className="text-[10px] tracking-widest text-slate-500 font-semibold mt-1">People Tracking</span>
        </div>

        {/* Global Search */}
        <div className="px-4 mb-4">
           <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search personnel..." 
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4] transition"
                value={searchQuery}
                onChange={e => {
                   setSearchQuery(e.target.value);
                   if (!e.target.value) setHighlightedPersonId(null);
                }}
              />
           </div>
           {searchQuery && (
             <div className="relative z-50">
               <div className="absolute top-1 left-0 w-full flex flex-col gap-1 max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-lg p-1">
                 {filteredPeople.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => {
                          setHighlightedPersonId(p.id);
                          navigate('/');
                          setSearchQuery('');
                      }}
                      className={`text-left text-xs p-2 rounded flex justify-between items-center ${highlightedPersonId === p.id ? 'bg-[#007BC4] text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-[#007BC4]'}`}
                    >
                      <span className="truncate mr-2 font-medium">{p.name}</span>
                      <span className="opacity-60 text-[9px] uppercase tracking-wider">{p.currentZone}</span>
                    </button>
                 ))}
                 {filteredPeople.length === 0 && (
                    <div className="text-xs text-slate-500 p-2 text-center">No results found.</div>
                 )}
               </div>
             </div>
           )}
        </div>

        <nav className="flex flex-col gap-1 px-3 flex-1 overflow-y-auto min-h-0">
          <NavItem to="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <NavItem to="/live" icon={<Map size={20}/>} label="Live Tracking" />
          <NavItem to="/playback" icon={<PlayCircle size={20}/>} label="Playback History" />
          <NavItem to="/people" icon={<Users size={20}/>} label="People" />
          <NavItem to="/alerts" icon={<Bell size={20}/>} label="Alerts" hasNotification={alerts.some(a => a.type === 'security')} />
          <NavItem to="/analytics" icon={<BarChart3 size={20}/>} label="Analytics" />
          <NavItem to="/devices" icon={<Radio size={20}/>} label="Devices" />
          <NavItem to="/settings" icon={<Settings size={20}/>} label="Settings" />
        </nav>
        
        {/* User Profile */}
        <div className="mt-auto px-4 pt-4 shrink-0">
           <div 
             onClick={() => setIsProfileModalOpen(true)}
             className="bg-slate-50 p-3 rounded-xl flex items-center justify-between cursor-pointer border border-slate-200 hover:bg-slate-100 transition shadow-sm"
           >
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#007BC4] flex items-center justify-center text-xs font-bold text-white shrink-0">AD</div>
               <div className="flex flex-col min-w-0 pr-2">
                 <span className="text-sm font-semibold text-slate-900 truncate">Admin User</span>
                 <span className="text-[10px] text-slate-500">GAO Admin</span>
               </div>
             </div>
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <TopBar />
        
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 flex flex-col">
            <Routes>
                <Route path="/" element={<DashboardTab people={people} alerts={alerts} zones={ZONES} highlightedPersonId={highlightedPersonId} isLoading={isLoading} />} />
              <Route path="/live" element={<LiveTrackingTab people={people} zones={ZONES} highlightedPersonId={highlightedPersonId} isLoading={isLoading} />} />
              <Route path="/playback" element={<PlaybackTab people={people} zones={ZONES} />} />
              <Route path="/people" element={<PeopleTab people={people} />} />
              <Route path="/alerts" element={<AlertsTab alerts={alerts} />} />
              <Route path="/analytics" element={<AnalyticsTab people={people} isLoading={isLoading} />} />
              <Route path="/devices" element={<DevicesTab />} />
              <Route path="/settings" element={<SettingsTab />} />
            </Routes>
          </div>
        </div>
      </main>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <ChatBot />
    </div>
  );
}

function NavItem({ to, icon, label, hasNotification = false }: { to: string, icon: React.ReactNode, label: string, hasNotification?: boolean }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => `relative flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 shrink-0 ${
        isActive 
          ? 'bg-[#007BC4] text-white shadow-md font-medium' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-[#007BC4]'
      }`}
    >
      {icon}
      <span className="text-sm tracking-wide">{label}</span>
      {hasNotification && (
        <span className="absolute top-1/2 -translate-y-1/2 right-4 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
      )}
      {hasNotification && (
        <span className="absolute top-1/2 -translate-y-1/2 right-4 w-1.5 h-1.5 bg-rose-500 rounded-full" />
      )}
    </NavLink>
  );
}

