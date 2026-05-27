import React, { useState } from 'react';
import { Save, Bell, Shield, Network, Database, Users, Layout, Key } from 'lucide-react';

export default function SettingsTab() {
  const [activeSection, setActiveSection] = useState('general');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('success');
    }, 1500);
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-slate-50">
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col p-4 shadow-sm z-10">
         <h2 className="text-xl font-bold text-slate-900 mb-6 px-2 tracking-tight">Settings</h2>
         
         <nav className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveSection('general')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeSection === 'general' ? 'bg-[#007BC4]/10 text-[#007BC4]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Layout className="w-4 h-4" /> General
            </button>
            <button 
              onClick={() => setActiveSection('security')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeSection === 'security' ? 'bg-[#007BC4]/10 text-[#007BC4]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Shield className="w-4 h-4" /> Security & Tracking
            </button>
            <button 
              onClick={() => setActiveSection('notifications')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeSection === 'notifications' ? 'bg-[#007BC4]/10 text-[#007BC4]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Bell className="w-4 h-4" /> Notifications
            </button>
            <button 
              onClick={() => setActiveSection('network')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeSection === 'network' ? 'bg-[#007BC4]/10 text-[#007BC4]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Network className="w-4 h-4" /> Network config
            </button>
            <button 
              onClick={() => setActiveSection('integrations')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeSection === 'integrations' ? 'bg-[#007BC4]/10 text-[#007BC4]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Database className="w-4 h-4" /> Integrations
            </button>
         </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
         <div className="max-w-3xl mx-auto">
            {activeSection === 'general' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mb-4">
                     <h3 className="text-xl font-bold text-slate-900">General Settings</h3>
                     <p className="text-slate-500 font-medium mt-1">Configure your dashboard preferences and global system defaults.</p>
                  </div>
                  
                  <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden divide-y divide-slate-100">
                     <div className="p-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                        <input type="text" defaultValue="GAO System Administration" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4] outline-none transition" />
                     </div>
                     <div className="p-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">System Timezone</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-[#007BC4] outline-none transition">
                           <option>UTC (Coordinated Universal Time)</option>
                           <option>EST (Eastern Standard Time)</option>
                           <option>PST (Pacific Standard Time)</option>
                        </select>
                     </div>
                     <div className="p-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Data Retention (Days)</label>
                        <input type="number" defaultValue="90" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-[#007BC4] outline-none transition" />
                        <p className="text-xs text-slate-500 mt-2 font-medium">Movement history and logs older than this will be permanently archived.</p>
                     </div>
                  </div>

                  <div className="flex justify-end pt-4">
                     <button className="flex items-center gap-2 bg-[#007BC4] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition">
                        <Save className="w-4 h-4" /> Save Changes
                     </button>
                  </div>
               </div>
            )}

            {activeSection === 'security' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mb-4">
                     <h3 className="text-xl font-bold text-slate-900">Security & Tracking</h3>
                     <p className="text-slate-500 font-medium mt-1">Configure physical access policies and AI tracking sensitivity.</p>
                  </div>

                  <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden divide-y divide-slate-100">
                     <div className="p-6 flex items-center justify-between">
                        <div>
                           <div className="font-bold text-slate-900">Enable AI Anomalous Tracking</div>
                           <div className="text-sm font-medium text-slate-500 mt-1">Automatically flag unusual movement patterns (e.g. loitering).</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" defaultChecked className="sr-only peer" />
                           <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#007BC4]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007BC4]"></div>
                        </label>
                     </div>
                     <div className="p-6 flex items-center justify-between">
                        <div>
                           <div className="font-bold text-slate-900">Strict Tailgating Detection</div>
                           <div className="text-sm font-medium text-slate-500 mt-1">Require 1:1 tag read ratio per motion event at entry points.</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" defaultChecked className="sr-only peer" />
                           <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#007BC4]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007BC4]"></div>
                        </label>
                     </div>
                     <div className="p-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Loitering Threshold (Seconds)</label>
                        <input type="number" defaultValue="300" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-[#007BC4] outline-none transition" />
                        <p className="text-xs text-slate-500 mt-2 font-medium">Time before an alert is triggered in restricted zones.</p>
                     </div>
                  </div>
               </div>
            )}

            {activeSection === 'integrations' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mb-4">
                     <h3 className="text-xl font-bold text-slate-900">API & Database Integrations</h3>
                     <p className="text-slate-500 font-medium mt-1">Connect your external database and API services to sync personnel data.</p>
                  </div>
                  
                  <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden divide-y divide-slate-100">
                     <div className="p-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Database Connection String</label>
                        <input type="password" placeholder="postgresql://user:password@localhost:5432/gao_db" defaultValue="postgresql://admin:supersecret@10.0.1.55:5432/gao_core" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4] outline-none transition font-mono text-sm" />
                        <p className="text-xs text-slate-500 mt-2 font-medium">Used for syncing long-term tracking data and reports.</p>
                     </div>
                     <div className="p-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">External API Endpoint URL</label>
                        <input type="url" placeholder="https://api.example.com/v1" defaultValue="https://api.gaosystems.com/v1/sync" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4] outline-none transition font-mono text-sm" />
                     </div>
                     <div className="p-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">API Key</label>
                        <input type="password" placeholder="sk_live_..." defaultValue="sk_live_definitely_a_secure_key" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4] outline-none transition font-mono text-sm" />
                     </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                     <div>
                        {testResult === 'success' && (
                           <div className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-sm flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Connection Successful
                           </div>
                        )}
                        {testResult === 'error' && (
                           <div className="text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 text-sm flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-500" /> Connection Failed
                           </div>
                        )}
                     </div>
                     <div className="flex gap-3">
                        <button 
                           onClick={handleTestConnection}
                           disabled={isTesting}
                           className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                        >
                           {isTesting ? (
                              <><Network className="w-4 h-4 animate-spin" /> Testing...</>
                           ) : (
                              <><Network className="w-4 h-4" /> Test Connection</>
                           )}
                        </button>
                        <button className="flex items-center gap-2 bg-[#007BC4] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition">
                           <Save className="w-4 h-4" /> Save Configuration
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* Fallback for other sections just for mockup */}
            {(activeSection !== 'general' && activeSection !== 'security' && activeSection !== 'integrations') && (
               <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                  <div className="p-4 bg-slate-100 rounded-full mb-4">
                     <Key className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-bold text-slate-700">Settings Section</p>
                  <p className="text-sm font-medium">Additional configuration options would be placed here.</p>
               </div>
            )}

         </div>
      </div>
    </div>
  );
}
