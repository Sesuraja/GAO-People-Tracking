import React from 'react';
import { Users, AlertTriangle, Clock, ShieldAlert, Bell, Sun, Moon, Maximize, Calendar } from 'lucide-react';

export default function TopBar({ isDarkMode, setIsDarkMode }: { isDarkMode: boolean, setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <header className="h-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 justify-between shrink-0 shadow-sm z-10 w-full relative">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-[#007BC4]/10 rounded border border-[#007BC4]/20 hidden md:block">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007BC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/><path d="m14 12 4-4-4-4"/><path d="m10 12-4 4 4 4"/></svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">People Tracking Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 tracking-wide mt-0.5 font-medium">UHF RFID Based AI Tracking System</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* System Online Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mr-2 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </div>
        
        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm text-sm">
           <Calendar className="w-4 h-4 text-slate-400" />
           <span className="font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2 ml-2">
           <button className="relative w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#007BC4] transition">
             <Bell className="w-5 h-5" />
             <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
           </button>
           <button 
             onClick={() => setIsDarkMode(!isDarkMode)}
             className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#007BC4] transition hidden md:flex"
            >
             {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
           </button>
           <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#007BC4] transition hidden md:flex">
             <Maximize className="w-5 h-5" />
           </button>
        </div>
      </div>
    </header>
  );
}
