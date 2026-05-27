import React from 'react';
import { X, User, Mail, Shield, Key, LogOut } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
         <div className="bg-[#007BC4] p-6 relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-white/20 flex items-center justify-center text-xl font-black text-[#007BC4] shadow-md">
                AD
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-white tracking-tight">Admin User</h2>
                <span className="text-sm font-medium text-white/80 bg-white/10 px-2 py-0.5 rounded mt-1 inline-block border border-white/20">System Administrator</span>
              </div>
            </div>
         </div>
         
         <div className="p-6 flex flex-col gap-6">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-50 text-[#007BC4] rounded-lg">
                   <Mail className="w-4 h-4" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</span>
                   <span className="text-sm font-semibold text-slate-900">admin@gaosystems.com</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-50 text-[#007BC4] rounded-lg">
                   <Shield className="w-4 h-4" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Clearance</span>
                   <span className="text-sm font-semibold text-slate-900">Level 5 (Full Access)</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-50 text-[#007BC4] rounded-lg">
                   <Key className="w-4 h-4" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Login</span>
                   <span className="text-sm font-semibold text-slate-900">Today, 08:32 AM IP: 10.0.1.45</span>
                 </div>
               </div>
            </div>

            <div className="border-t border-slate-100 pt-6 flex flex-col gap-2">
               <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#007BC4] transition">
                 <User className="w-4 h-4" /> Edit Profile
               </button>
               <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-transparent bg-rose-50 text-sm font-bold text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition">
                 <LogOut className="w-4 h-4" /> Sign Out
               </button>
            </div>
         </div>
       </div>
    </div>
  );
}
