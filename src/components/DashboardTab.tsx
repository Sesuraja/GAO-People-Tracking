import { Person, AIAlert, Zone } from '../lib/simulation';
import { Card } from '@/components/ui/card';
import { Users, UserCheck, Activity, ShieldAlert, Clock, Bell, Map, LayoutDashboard, Cpu, ShieldCheck, Radio } from 'lucide-react';
import AIFeed from './AIFeed';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useMemo } from 'react';

const COLORS = ['#007BC4', '#38bdf8', '#10b981', '#f59e0b', '#8b5cf6'];

export default function DashboardTab({ people, alerts, zones, highlightedPersonId }: { people: Person[], alerts: AIAlert[], zones: any, highlightedPersonId?: string | null }) {
  const movingCount = people.filter(p => p.presenceState === 'MOVING').length;
  const restrictedAlertsCount = alerts.filter(a => a.type === 'security').length;
  const avgDwellInfo = people.length > 0 ? (people.reduce((sum, p) => sum + p.dwellTime, 0) / people.length / 60).toFixed(1) : "0.0";

  // Data for charts
  const zoneData = useMemo(() => {
    const counts = people.reduce((acc, p) => {
      acc[p.currentZone] = (acc[p.currentZone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).map(zone => ({
      name: zone,
      value: counts[zone]
    }));
  }, [people]);

  const mockTimelineData = useMemo(() => {
    const base = [
      { time: '12 AM', load: 12 },
      { time: '4 AM', load: 18 },
      { time: '8 AM', load: 250 },
      { time: '12 PM', load: 856 },
      { time: '4 PM', load: 650 },
      { time: '8 PM', load: 300 },
      { time: '12 AM', load: 100 }
    ];
    return base;
  }, []);

  const deviceData = [
    { name: 'Online', value: 24, color: '#10b981' },
    { name: 'Offline', value: 5, color: '#f43f5e' },
    { name: 'Warning', value: 3, color: '#f59e0b' }
  ];

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 bg-slate-50 min-h-0">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 shrink-0">
         <KpiCard title="Total People" value="1,248" sub="↗ 12.5% vs yesterday" icon={<Users className="w-6 h-6 text-white" />} iconColor="bg-[#007BC4]" />
         <KpiCard title="Currently On-Site" value={people.length.toString()} sub="↗ 8.3% vs yesterday" icon={<UserCheck className="w-6 h-6 text-white" />} iconColor="bg-[#10b981]" />
         <KpiCard title="In Motion" value={movingCount.toString()} sub="↗ 15.7% vs yesterday" icon={<Activity className="w-6 h-6 text-white" />} iconColor="bg-[#007BC4]" />
         <KpiCard title="Alerts" value={alerts.length.toString()} sub="↘ 22.2% vs yesterday" icon={<ShieldAlert className="w-6 h-6 text-white" />} iconColor="bg-[#f59e0b]" />
         <KpiCard title="Avg. Dwell Time" value={`${avgDwellInfo}m`} sub="↗ 5.6% vs yesterday" icon={<Clock className="w-6 h-6 text-white" />} iconColor="bg-[#8b5cf6]" />
      </div>
      
      {/* Middle Row (System Overview + Alerts) */}
      <div className="flex flex-col xl:flex-row gap-6 min-h-[450px]">
        {/* System Snapshot */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 flex flex-col shadow-sm transition hover:shadow-md">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#10b981]" />
               <h3 className="font-semibold text-slate-900 tracking-tight">Facility Occupancy & Status</h3>
             </div>
             <div className="flex gap-2">
               <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Nominal</span>
               <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Busy</span>
             </div>
           </div>
           
           <div className="flex flex-1 gap-6">
             <div className="w-1/3 flex flex-col gap-4 border-r border-slate-100 pr-6 overflow-y-auto shrink-0 z-20">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Device Health</h4>
               <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100">
                 <div className="font-semibold text-sm">Main Entrance</div>
                 <div className="text-xs font-bold uppercase">Online</div>
               </div>
               <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100">
                 <div className="font-semibold text-sm">Lobby Scanner</div>
                 <div className="text-xs font-bold uppercase">Online</div>
               </div>
               <div className="flex items-center justify-between bg-amber-50 text-amber-700 p-3 rounded-lg border border-amber-100">
                 <div className="font-semibold text-sm">Server Rm Door</div>
                 <div className="text-xs font-bold uppercase">Warning</div>
               </div>
               <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100">
                 <div className="font-semibold text-sm">Loading Dock</div>
                 <div className="text-xs font-bold uppercase">Online</div>
               </div>
               <button className="text-xs font-bold text-[#007BC4] uppercase text-left hover:underline mt-2">View all devices →</button>
             </div>
             
             <div className="flex-1 flex flex-col bg-slate-50 rounded-lg p-5 overflow-hidden border border-slate-200 shadow-inner overflow-y-auto">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Live Zone Occupancy Distribution</h4>
                <div className="flex flex-col gap-3">
                   {Object.keys(zones).map(z => {
                      const count = people.filter(p => p.currentZone === z).length;
                      const percent = Math.round((count / Math.max(people.length, 1)) * 100);
                      return (
                         <div key={z} className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                            <div className="font-bold text-slate-700 w-32 text-sm">{z}</div>
                            <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                               <div className={`h-full rounded-full transition-all duration-500 ${percent > 40 ? 'bg-[#f59e0b]' : 'bg-[#007BC4]'}`} style={{ width: `${Math.max(percent, 2)}%` }}></div>
                            </div>
                            <div className="w-12 text-right">
                              <span className="font-black text-slate-900">{count}</span>
                              <span className="text-[10px] text-slate-400 ml-1">pax</span>
                            </div>
                         </div>
                      )
                   })}
                </div>
                
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 mt-6">Recent Movement Log</h4>
                <div className="flex flex-col gap-2">
                   {people.slice(0, 3).map(p => (
                     <div key={p.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded bg-[#007BC4]/10 text-[#007BC4] flex items-center justify-center font-bold text-sm border border-[#007BC4]/20">{p.name.charAt(0)}</div>
                           <div>
                             <div className="font-bold text-sm text-slate-800">{p.name}</div>
                             <div className="text-[10px] text-slate-500 font-medium uppercase">{p.role}</div>
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {p.currentZone}
                           </div>
                           <div className="text-[10px] text-slate-400 font-mono mt-0.5">Dwell: {Math.floor(p.dwellTime/60)}m {p.dwellTime%60}s</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           </div>
        </div>
        
        {/* Alerts */}
        <div className="w-full xl:w-[380px] bg-white rounded-xl border border-slate-200 p-4 flex flex-col shadow-sm shrink-0 transition hover:shadow-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 tracking-tight">Recent Alerts</h3>
            <button className="text-sm font-medium text-[#007BC4] hover:underline">View All</button>
          </div>
          <AIFeed alerts={alerts} />
        </div>
      </div>

      {/* Bottom Row (Charts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 shrink-0 h-[260px]">
        {/* Chart 1: Over Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-semibold text-slate-900 tracking-tight">People on Site Over Time</h3>
             <select className="bg-white text-xs font-medium text-slate-700 border border-slate-200 shadow-sm rounded px-2 py-1 outline-none focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4]">
               <option>Today</option>
             </select>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTimelineData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007BC4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#007BC4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#0f172a', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="load" stroke="#007BC4" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Zones */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col shadow-sm transition hover:shadow-md">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight mb-4">Top Zones by Occupancy</h3>
          <div className="flex-1 flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={zoneData}
                   innerRadius="65%"
                   outerRadius="90%"
                   paddingAngle={2}
                   dataKey="value"
                   stroke="none"
                 >
                   {zoneData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#0f172a', fontWeight: 'bold' }} />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-2xl font-bold text-slate-900">{people.length.toString()}</span>
               <span className="text-xs font-medium text-slate-500">Total</span>
             </div>
             
             {/* Custom Legend Overlay (simplified for layout) */}
             <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-none">
               {zoneData.slice(0, 4).map((entry, index) => (
                 <div key={entry.name} className="flex items-center justify-between gap-4 text-xs bg-white/90 border border-slate-100 px-2 py-1 rounded shadow-sm backdrop-blur">
                   <div className="flex items-center gap-1.5">
                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                     <span className="text-slate-700 font-medium max-w-[70px] truncate">{entry.name}</span>
                   </div>
                   <span className="text-slate-500 font-semibold">{Math.round((entry.value / people.length) * 100)}%</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Chart 3: Device Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col shadow-sm transition hover:shadow-md">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight mb-4">Device Status</h3>
          <div className="flex-1 flex items-center justify-center relative">
             <ResponsiveContainer width={160} height={160}>
               <PieChart>
                 <Pie
                   data={deviceData}
                   innerRadius="75%"
                   outerRadius="90%"
                   paddingAngle={0}
                   dataKey="value"
                   stroke="none"
                   startAngle={90}
                   endAngle={-270}
                 >
                   {deviceData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-3xl font-bold text-slate-900">32</span>
               <span className="text-xs font-medium text-slate-500">Total Devices</span>
             </div>
             
             <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
               {deviceData.map(d => (
                 <div key={d.name} className="flex flex-col">
                    <span className="text-xl font-bold flex items-center gap-2 text-slate-900">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                      {d.value}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 ml-4">{d.name}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Chart 4: Heatmap (Placeholder) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col shadow-sm transition hover:shadow-md">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight mb-3">People Flow Heatmap</h3>
          <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 shadow-inner relative overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#007BC4 1px, transparent 1px), linear-gradient(90deg, #007BC4 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
             {/* Mock heatmap blobs */}
             <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-rose-500/60 rounded-full blur-xl"></div>
             <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-[#007BC4]/60 rounded-full blur-xl"></div>
             <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-amber-500/60 rounded-full blur-xl"></div>
             <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-emerald-500/60 rounded-full blur-xl"></div>
             
             {/* Scale bar */}
             <div className="absolute bottom-2 left-4 right-4 flex items-center gap-2 z-10 bg-white/70 backdrop-blur px-2 py-1 rounded border border-slate-200">
               <span className="text-[9px] font-bold text-slate-500 uppercase">Low</span>
               <div className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-[#007BC4] via-emerald-400 to-rose-500"></div>
               <span className="text-[9px] font-bold text-slate-500 uppercase">High</span>
             </div>
          </div>
        </div>
      </div>
      
      {/* Footer Features */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 pt-4 shrink-0">
         <FooterCard icon={<Radio className="text-[#007BC4] w-5 h-5"/>} title="UHF RFID Technology" desc="Long range, high accuracy tracking for large environments." />
         <FooterCard icon={<Cpu className="text-[#8b5cf6] w-5 h-5"/>} title="AI Powered Analytics" desc="Behavior analysis and insightful reports." />
         <FooterCard icon={<Map className="text-[#10b981] w-5 h-5"/>} title="Real-time Monitoring" desc="Live location and movement tracking." />
         <FooterCard icon={<Bell className="text-[#f59e0b] w-5 h-5"/>} title="Smart Alerts" desc="Instant notifications and event detection." />
         <FooterCard icon={<ShieldCheck className="text-[#007BC4] w-5 h-5"/>} title="Data Security" desc="Enterprise grade security and privacy." />
      </div>
    </div>
  );
}

function KpiCard({ title, value, sub, icon, iconColor }: { title: string, value: string, sub: string, icon: React.ReactNode, iconColor: string }) {
  const isUp = sub.includes('↗');
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 transition hover:shadow-md">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconColor} shadow-inner`}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-slate-500 truncate mb-0.5">{title}</span>
        <span className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</span>
        <span className={`text-[10px] font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'} truncate`}>{sub}</span>
      </div>
    </div>
  );
}

function FooterCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 mb-2 flex items-start gap-3 transition hover:shadow-md border-t-2 border-t-[#007BC4]/20">
       <div className="p-2 bg-slate-50 rounded-lg border border-slate-100/50 text-[#007BC4]">
         {icon}
       </div>
       <div className="flex flex-col">
         <h4 className="text-xs font-bold text-slate-900 mb-0.5">{title}</h4>
         <p className="text-[10px] font-medium text-slate-500 leading-tight">{desc}</p>
       </div>
    </div>
  );
}
