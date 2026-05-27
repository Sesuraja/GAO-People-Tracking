import React, { useState } from 'react';
import { Search, Radio, Wifi, WifiOff, AlertCircle, RefreshCw, MoreVertical, Plus } from 'lucide-react';

const MOCK_DEVICES = [
  { id: 'RD-001', name: 'Main Entrance Reader', location: 'Lobby', type: 'UHF RFID', status: 'online', ip: '10.0.0.12', lastPing: 'Just now', uptime: '45d 12h' },
  { id: 'RD-002', name: 'Server Room Door', location: 'Server Room', type: 'UHF RFID', status: 'online', ip: '10.0.0.13', lastPing: 'Just now', uptime: '12d 4h' },
  { id: 'RD-003', name: 'Loading Dock A', location: 'Dock', type: 'UHF RFID', status: 'warning', ip: '10.0.0.14', lastPing: '2 mins ago', uptime: '5d 1h' },
  { id: 'RD-004', name: 'Elevator Lobby 1F', location: 'Floor 1', type: 'BLE Beacon', status: 'online', ip: '10.0.0.21', lastPing: 'Just now', uptime: '150d 2h' },
  { id: 'RD-005', name: 'Emergency Exit West', location: 'Stairwell B', type: 'UHF RFID', status: 'offline', ip: '10.0.0.22', lastPing: '3 hrs ago', uptime: '0d 0h' },
  { id: 'RD-006', name: 'Cafeteria Entrance', location: 'Floor 2', type: 'UHF RFID', status: 'online', ip: '10.0.0.25', lastPing: 'Just now', uptime: '32d 5h' },
];

export default function DevicesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [devices] = useState(MOCK_DEVICES);

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6 bg-slate-50">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Device Management</h2>
          <p className="text-slate-500 font-medium">Monitor and configure RFID readers and beacons.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search devices..." 
              className="w-full pl-9 bg-white border border-slate-200 rounded-lg py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4] outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-[#007BC4] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md border border-transparent transition">
            <Plus className="w-4 h-4" /> Add Device
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
         <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
               <Wifi className="w-6 h-6" />
            </div>
            <div>
               <div className="text-sm font-semibold text-slate-500">Online Devices</div>
               <div className="text-2xl font-bold text-slate-900">28</div>
            </div>
         </div>
         <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
               <AlertCircle className="w-6 h-6" />
            </div>
            <div>
               <div className="text-sm font-semibold text-slate-500">Needs Attention</div>
               <div className="text-2xl font-bold text-slate-900">3</div>
            </div>
         </div>
         <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
               <WifiOff className="w-6 h-6" />
            </div>
            <div>
               <div className="text-sm font-semibold text-slate-500">Offline Devices</div>
               <div className="text-2xl font-bold text-slate-900">1</div>
            </div>
         </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-sm font-bold text-slate-500">Device</th>
                <th className="py-3 px-4 text-sm font-bold text-slate-500">Location</th>
                <th className="py-3 px-4 text-sm font-bold text-slate-500">Type</th>
                <th className="py-3 px-4 text-sm font-bold text-slate-500">Status</th>
                <th className="py-3 px-4 text-sm font-bold text-slate-500">IP Address</th>
                <th className="py-3 px-4 text-sm font-bold text-slate-500">Last Ping</th>
                <th className="py-3 px-4 text-sm font-bold text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map(device => (
                <tr key={device.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${device.status === 'online' ? 'bg-emerald-50 text-emerald-600' : device.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                           <Radio className="w-4 h-4" />
                        </div>
                        <div>
                           <div className="font-semibold text-slate-900">{device.name}</div>
                           <div className="text-xs font-mono text-slate-500">{device.id}</div>
                        </div>
                     </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{device.location}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{device.type}</td>
                  <td className="py-3 px-4">
                     <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        device.status === 'online' ? 'bg-emerald-100 text-emerald-700' :
                        device.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                     }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-emerald-500' : device.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        {device.status}
                     </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-sm text-slate-500">{device.ip}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                     <div>{device.lastPing}</div>
                     <div className="text-[10px] text-slate-400">Up: {device.uptime}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-[#007BC4] hover:bg-slate-100 rounded transition" title="Restart">
                           <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition">
                           <MoreVertical className="w-4 h-4" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
              {filteredDevices.length === 0 && (
                <tr>
                   <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                      No devices found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
