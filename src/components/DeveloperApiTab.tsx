import React, { useState } from 'react';
import { Key, Webhook, Activity, ShieldAlert, BarChart, Plus, Copy, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MOCK_KEYS = [
  { id: '1', name: 'HRMS Integration', prefix: 'pk_live_8f92', created: '2026-05-10', lastUsed: '10 mins ago', status: 'Active', usage: '45.2k reqs' },
  { id: '2', name: 'Building Mgmt (BMS)', prefix: 'pk_live_b2a1', created: '2026-04-22', lastUsed: '5 secs ago', status: 'Active', usage: '1.2M reqs' },
  { id: '3', name: 'ERP Legacy Sync', prefix: 'pk_live_c109', created: '2026-01-15', lastUsed: '2 days ago', status: 'Revoked', usage: '0 reqs' },
];

export default function DeveloperApiTab() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto min-h-0">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Key className="w-6 h-6 text-[#007BC4]" />
            API & Integrations
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">Manage API keys, webhooks, rate limits, and enterprise connectivity.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#007BC4] text-white px-4 py-2 rounded-xl hover:bg-[#006aa9] font-bold text-sm shadow-md transition">
           <Plus className="w-4 h-4" />
           Generate API Key
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Activity className="w-4 h-4 text-[#007BC4]" /> API Requests (24h)</span>
            <span className="text-3xl font-black text-slate-900 mt-2">1,245k</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-rose-500" /> Rate Limits Hit</span>
            <span className="text-3xl font-black text-slate-900 mt-2">14</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> API Availability</span>
            <span className="text-3xl font-black text-slate-900 mt-2">99.99%</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Webhook className="w-4 h-4 text-indigo-500" /> Active Webhooks</span>
            <span className="text-3xl font-black text-slate-900 mt-2">8</span>
        </div>
      </div>

      <div className="bg-white border flex-1 border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex gap-4">
           <button className="text-sm font-bold text-[#007BC4] border-b-2 border-[#007BC4] pb-2">API Keys</button>
           <button className="text-sm font-bold text-slate-500 hover:text-slate-700 pb-2">Webhooks</button>
           <button className="text-sm font-bold text-slate-500 hover:text-slate-700 pb-2">Rate Limits</button>
           <button className="text-sm font-bold text-slate-500 hover:text-slate-700 pb-2 flex items-center gap-1"><BarChart className="w-4 h-4"/> Analytics</button>
        </div>
        <div className="overflow-y-auto flex-1">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
              <TableRow>
                <TableHead className="py-4">Application Name</TableHead>
                <TableHead className="py-4">Key Prefix</TableHead>
                <TableHead className="py-4">Last Used</TableHead>
                <TableHead className="py-4">Usage (30d)</TableHead>
                <TableHead className="py-4">Status</TableHead>
                <TableHead className="py-4 w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_KEYS.map((key) => (
                <TableRow key={key.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="font-semibold text-slate-900">{key.name}</div>
                    <div className="text-xs text-slate-500 font-medium">Created on {key.created}</div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                        <code className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">{key.prefix}••••••••</code>
                        <button 
                           onClick={() => setCopiedKey(key.id)}
                           className="text-slate-400 hover:text-[#007BC4] transition"
                        >
                           {copiedKey === key.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                     </div>
                  </TableCell>
                  <TableCell>
                     <span className="text-sm text-slate-600 font-medium">{key.lastUsed}</span>
                  </TableCell>
                  <TableCell>
                     <span className="text-sm text-slate-600 font-medium">{key.usage}</span>
                  </TableCell>
                  <TableCell>
                     {key.status === 'Active' ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200">Active</Badge>
                     ) : (
                        <Badge className="bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200">Revoked</Badge>
                     )}
                  </TableCell>
                  <TableCell>
                     <button className="text-[#007BC4] font-bold text-xs hover:underline">Manage</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
