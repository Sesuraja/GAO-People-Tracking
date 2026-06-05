import { Users, AlertTriangle, Clock, ShieldAlert, Bell, Sun, Maximize, Calendar } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0 shadow-sm z-10 w-full relative">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-[#007BC4]/10 rounded border border-[#007BC4]/20 hidden md:block">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007BC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/><path d="m14 12 4-4-4-4"/><path d="m10 12-4 4 4 4"/></svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">People Tracking Dashboard</h1>
          <p className="text-xs text-slate-500 tracking-wide mt-0.5 font-medium">UHF RFID Based AI Tracking System</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* System Online Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold mr-2 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </div>
        
        {/* Date Picker Mock */}
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm text-sm hover:bg-slate-50 transition hover:text-[#007BC4]">
           <Calendar className="w-4 h-4 text-slate-400" />
           <span className="font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        {/* Action Icons */}
        <div className="flex items-center gap-2 ml-2">
           <button className="relative w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-50 text-slate-500 hover:text-[#007BC4] transition">
             <Bell className="w-5 h-5" />
             <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
           </button>
           <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-50 text-slate-500 hover:text-[#007BC4] transition hidden md:flex">
             <Sun className="w-5 h-5" />
           </button>
           <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-50 text-slate-500 hover:text-[#007BC4] transition hidden md:flex">
             <Maximize className="w-5 h-5" />
           </button>
        </div>
      </div>
    </header>
  );
}
