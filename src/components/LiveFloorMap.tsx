import { motion, AnimatePresence } from 'motion/react';
import { Person } from '../lib/simulation';
import { useMemo, useState, useEffect } from 'react';
import { 
  Layers, Radio, Activity, Wifi, Disc, Server, AlertCircle, Sparkles, Zap, 
  Edit3, Sliders, Plus, Trash2, Settings, ShieldAlert, HardHat, Clock, 
  CheckCircle2, Terminal, Image as ImageIcon, RotateCcw, X, Save, RefreshCw, Cpu
} from 'lucide-react';

export interface Door {
  id: string;
  name: string;
  x: number;
  y: number;
  zone: string;
  type: string;
  orientation: 'horizontal' | 'vertical';
  ipAddress: string;
  port: number;
  macAddress: string;
  transmitPowerDbm: number; // 10-33 dBm
  antennaGainDbi: number;
  frequencyBand: string;
  scanIntervalMs: number;
  rssiThresholdDbm: number;
  // Alert triggers
  alertUnauthorizedBreach: boolean;
  alertPpeRequired: boolean;
  alertLoiteringTimeout: number; // in seconds, 0 = disabled
}

const DEFAULT_DOORS: Door[] = [
  {
    id: 'door-entrance',
    name: 'Main Entrance Portal Gate',
    x: 20,
    y: 80,
    zone: 'Entrance',
    type: 'UHF Gate RFID Portal',
    orientation: 'horizontal',
    ipAddress: '192.168.1.101',
    port: 8080,
    macAddress: '00:1A:2B:3C:4D:01',
    transmitPowerDbm: 30,
    antennaGainDbi: 9.0,
    frequencyBand: 'US FCC (902-928 MHz)',
    scanIntervalMs: 250,
    rssiThresholdDbm: -75,
    alertUnauthorizedBreach: true,
    alertPpeRequired: false,
    alertLoiteringTimeout: 300,
  },
  {
    id: 'door-cafeteria',
    name: 'Cafeteria RFID Reader',
    x: 20,
    y: 50,
    zone: 'Cafeteria',
    type: 'Fitted RFID Antenna',
    orientation: 'horizontal',
    ipAddress: '192.168.1.102',
    port: 8080,
    macAddress: '00:1A:2B:3C:4D:02',
    transmitPowerDbm: 27,
    antennaGainDbi: 6.0,
    frequencyBand: 'US FCC (902-928 MHz)',
    scanIntervalMs: 500,
    rssiThresholdDbm: -80,
    alertUnauthorizedBreach: false,
    alertPpeRequired: false,
    alertLoiteringTimeout: 600,
  },
  {
    id: 'door-office',
    name: 'Office Entry Gateway',
    x: 40,
    y: 55,
    zone: 'Office',
    type: 'Fitted RFID Scanner',
    orientation: 'vertical',
    ipAddress: '192.168.1.103',
    port: 8080,
    macAddress: '00:1A:2B:3C:4D:03',
    transmitPowerDbm: 28,
    antennaGainDbi: 8.0,
    frequencyBand: 'US FCC (902-928 MHz)',
    scanIntervalMs: 300,
    rssiThresholdDbm: -78,
    alertUnauthorizedBreach: true,
    alertPpeRequired: false,
    alertLoiteringTimeout: 450,
  },
  {
    id: 'door-meeting',
    name: 'Meeting Room Portal',
    x: 55,
    y: 30,
    zone: 'Meeting Room',
    type: 'Dual Tag Scanner',
    orientation: 'horizontal',
    ipAddress: '192.168.1.104',
    port: 8080,
    macAddress: '00:1A:2B:3C:4D:04',
    transmitPowerDbm: 26,
    antennaGainDbi: 6.0,
    frequencyBand: 'US FCC (902-928 MHz)',
    scanIntervalMs: 500,
    rssiThresholdDbm: -82,
    alertUnauthorizedBreach: false,
    alertPpeRequired: false,
    alertLoiteringTimeout: 900,
  },
  {
    id: 'door-server',
    name: 'Server Vault Secure Gate',
    x: 80,
    y: 20,
    zone: 'Server Room',
    type: 'Secured UHF RFID Reader',
    orientation: 'vertical',
    ipAddress: '192.168.1.105',
    port: 8080,
    macAddress: '00:1A:2B:3C:4D:05',
    transmitPowerDbm: 33,
    antennaGainDbi: 12.0,
    frequencyBand: 'US FCC (902-928 MHz)',
    scanIntervalMs: 100,
    rssiThresholdDbm: -70,
    alertUnauthorizedBreach: true,
    alertPpeRequired: true,
    alertLoiteringTimeout: 180,
  }
];

export interface ZoneBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  category?: string;
  capacity?: number;
}

export default function LiveFloorMap({ 
  people, 
  zones, 
  highlightedPersonId, 
  initialFocusZone, 
  floorplanUrl: initialFloorplanUrl 
}: { 
  people: Person[]; 
  zones: Record<string, ZoneBounds>; 
  highlightedPersonId?: string | null; 
  initialFocusZone?: string | null; 
  floorplanUrl?: string | null; 
}) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showReaders, setShowReaders] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(initialFocusZone || null);

  // Custom editable state for zones & floorplan
  const [customZones, setCustomZones] = useState<Record<string, ZoneBounds>>({});
  const [customFloorplanUrl, setCustomFloorplanUrl] = useState<string | null>(initialFloorplanUrl || null);
  const [isEditingMap, setIsEditingMap] = useState(false);
  const [editingZoneName, setEditingZoneName] = useState<string | null>(null);

  // Hardware configuration state
  const [hardwareDevices, setHardwareDevices] = useState<Door[]>(DEFAULT_DOORS);
  const [selectedDevice, setSelectedDevice] = useState<Door | null>(null);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  
  // Hardware diagnostic state
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);

  useEffect(() => {
    if (initialFocusZone) {
      setSelectedZone(initialFocusZone);
    }
  }, [initialFocusZone]);

  useEffect(() => {
    if (initialFloorplanUrl !== undefined) {
      setCustomFloorplanUrl(initialFloorplanUrl);
    }
  }, [initialFloorplanUrl]);

  // Combine default zones prop with custom added zones
  const activeZonesMap = useMemo(() => {
    return { ...zones, ...customZones };
  }, [zones, customZones]);

  // Combine zones passed in with any extra zones found in active people
  const allZoneNames = useMemo(() => {
    const names = new Set(Object.keys(activeZonesMap));
    people.forEach(p => {
      if (p.currentZone) names.add(p.currentZone);
    });
    return Array.from(names);
  }, [activeZonesMap, people]);

  const defaultZoneBounds: Record<string, ZoneBounds> = {
    'Cafeteria': { x: 5, y: 10, width: 30, height: 35, category: 'REGULATED AREA', capacity: 25 },
    'Meeting Room': { x: 40, y: 10, width: 28, height: 35, category: 'COMMON ZONE', capacity: 15 },
    'Server Room': { x: 72, y: 10, width: 23, height: 35, category: 'HIGH SECURITY', capacity: 5 },
    'Entrance': { x: 5, y: 55, width: 30, height: 35, category: 'REGULATED AREA', capacity: 40 },
    'Office': { x: 40, y: 55, width: 55, height: 35, category: 'COMMON ZONE', capacity: 50 }
  };

  const zoneEntries = useMemo(() => {
    return allZoneNames.map((name, idx) => {
      let rect = activeZonesMap[name];
      if (!rect || !rect.width || !rect.height) {
        if (defaultZoneBounds[name]) {
          rect = defaultZoneBounds[name];
        } else {
          // Generate clean grid placement for extra/custom zones
          const col = idx % 3;
          const row = Math.floor(idx / 3);
          rect = {
            x: 5 + (col * 31),
            y: 5 + (row * 30),
            width: 28,
            height: 25,
            category: 'CUSTOM SECTOR',
            capacity: 20
          };
        }
      }
      return [name, rect] as [string, ZoneBounds];
    });
  }, [allZoneNames, activeZonesMap]);

  const selectedZoneData = useMemo(() => {
    if (!selectedZone) return null;
    const occupants = people.filter(p => p.currentZone === selectedZone);
    const avgDwell = occupants.length > 0 ? occupants.reduce((sum, p) => sum + p.dwellTime, 0) / occupants.length : 0;
    const bounds = activeZonesMap[selectedZone] || defaultZoneBounds[selectedZone] || { category: 'REGULATED AREA', capacity: 30 };
    return { name: selectedZone, occupants, avgDwell: Math.round(avgDwell), bounds };
  }, [selectedZone, people, activeZonesMap]);

  // Handler for adding a new zone in map layout editor
  const handleAddNewSector = () => {
    const newName = `New Sector ${Object.keys(activeZonesMap).length + 1}`;
    const newBounds: ZoneBounds = {
      x: 10,
      y: 10,
      width: 25,
      height: 25,
      category: 'HAZARD / CONSTRUCTION',
      capacity: 15
    };
    setCustomZones(prev => ({ ...prev, [newName]: newBounds }));
    setEditingZoneName(newName);
  };

  // Handler for updating a zone's bounds/properties
  const handleUpdateZone = (zoneName: string, updated: Partial<ZoneBounds>, newName?: string) => {
    setCustomZones(prev => {
      const copy = { ...prev };
      const current = copy[zoneName] || activeZonesMap[zoneName] || { x: 10, y: 10, width: 25, height: 25 };
      const merged = { ...current, ...updated };

      if (newName && newName !== zoneName) {
        delete copy[zoneName];
        copy[newName] = merged;
        if (editingZoneName === zoneName) setEditingZoneName(newName);
        if (selectedZone === zoneName) setSelectedZone(newName);
      } else {
        copy[zoneName] = merged;
      }

      return copy;
    });
  };

  // Handler for deleting a sector
  const handleDeleteSector = (zoneName: string) => {
    setCustomZones(prev => {
      const copy = { ...prev };
      delete copy[zoneName];
      return copy;
    });
    if (editingZoneName === zoneName) setEditingZoneName(null);
    if (selectedZone === zoneName) setSelectedZone(null);
  };

  // Open device settings modal
  const handleOpenHardwareDevice = (device: Door) => {
    setSelectedDevice({ ...device });
    setIsHardwareModalOpen(true);
    setDiagnosticLogs([]);
  };

  // Save hardware settings
  const handleSaveHardwareDevice = (updated: Door) => {
    setHardwareDevices(prev => prev.map(d => d.id === updated.id ? updated : d));
    setSelectedDevice(updated);
  };

  // Run real-time diagnostic test runner
  const handleRunDiagnostic = () => {
    if (!selectedDevice) return;
    setIsRunningDiagnostic(true);
    setDiagnosticLogs([`[INIT] Starting diagnostic ping to ${selectedDevice.ipAddress}:${selectedDevice.port}...`]);

    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, `[SUCCESS] Host ${selectedDevice.ipAddress} reached in 1.4ms (MAC: ${selectedDevice.macAddress})`]);
    }, 600);

    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, `[UHF TEST] Transmit power calibrated at ${selectedDevice.transmitPowerDbm} dBm, Gain: ${selectedDevice.antennaGainDbi} dBi`]);
    }, 1200);

    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, `[RF SCAN] Frequency band ${selectedDevice.frequencyBand} active. Sensitivity threshold: ${selectedDevice.rssiThresholdDbm} dBm`]);
    }, 1800);

    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, `[ALERT TRIGGERS] Breach Alert: ${selectedDevice.alertUnauthorizedBreach ? 'ACTIVE' : 'OFF'} | PPE Check: ${selectedDevice.alertPpeRequired ? 'ENFORCED' : 'OFF'}`]);
    }, 2400);

    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, `[PASS] Hardware diagnostic passed. 100% operational efficiency.`]);
      setIsRunningDiagnostic(false);
    }, 3000);
  };

  return (
    <div className="w-full h-full min-h-[580px] relative bg-slate-900/5 rounded-2xl p-2 sm:p-4 border border-slate-200 overflow-hidden flex flex-col md:flex-row items-stretch gap-4">
      
      {/* Control Toolbar (Sticky Top) */}
      <div className="absolute top-4 right-4 z-30 flex flex-wrap items-center gap-2">
        <button 
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${showHeatmap ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-[0_0_12px_rgba(244,63,94,0.15)]' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}
        >
          <Layers className="w-3.5 h-3.5 text-rose-500" />
          Heatmap {showHeatmap ? 'On' : 'Off'}
        </button>

        <button 
          onClick={() => setShowReaders(!showReaders)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${showReaders ? 'bg-blue-50 border-blue-300 text-[#007BC4]' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}
        >
          <Radio className="w-3.5 h-3.5" />
          Readers {showReaders ? 'Visible' : 'Hidden'}
        </button>

        <button 
          onClick={() => setIsEditingMap(!isEditingMap)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${isEditingMap ? 'bg-amber-500 border-amber-600 text-white shadow-md' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          {isEditingMap ? 'Exit Map Editor' : 'Edit Map'}
        </button>

        <button 
          onClick={() => {
            if (hardwareDevices.length > 0) handleOpenHardwareDevice(hardwareDevices[0]);
          }}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Cpu className="w-3.5 h-3.5 text-[#007BC4]" />
          Configure Hardware
        </button>
      </div>

      {/* Main Floor Plan Canvas Container */}
      <div className="relative flex-1 w-full h-full min-h-[500px] border border-slate-200 rounded-2xl bg-white z-10 overflow-hidden shadow-sm flex flex-col items-center justify-center p-4">
        
        {/* Architectural floorplan blueprint overlay */}
        {customFloorplanUrl && (
          <div className="absolute inset-0 z-0 pointer-events-none p-3 opacity-35 flex items-center justify-center">
            <img src={customFloorplanUrl} alt="Facility Floor Plan" className="w-full h-full object-contain rounded-xl" />
          </div>
        )}

        {/* Subtle architectural floor background grid */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{ 
          backgroundImage: 'linear-gradient(rgba(0,123,196,0.06) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(0,123,196,0.06) 1.5px, transparent 1.5px)', 
          backgroundSize: '24px 24px' 
        }} />

        {/* Outer Hallway corridor indicator */}
        <div className="absolute top-[48%] left-[30%] text-[9px] font-black text-slate-300 select-none uppercase tracking-widest pointer-events-none">
          Active Connecting Passage & Radial UHF Zones
        </div>

        {/* Render 2D Room / Sector Boxes */}
        {zoneEntries.map(([name, rect]) => {
           const occupants = people.filter(p => p.currentZone === name);
           const isFocused = selectedZone === name || editingZoneName === name;
           const category = rect.category || (name === 'Server Room' ? 'HIGH SECURITY' : 'REGULATED AREA');
           const capacity = rect.capacity || 20;

           let risk = 0; // 0 = safe, 1 = warning, 2 = danger
           if (category === 'HIGH SECURITY' && occupants.some(p => p.role === 'Visitor')) risk = 2; // Danger
           else if (occupants.length > capacity) risk = 2; // Over capacity
           else if (occupants.some(p => p.dwellTime > 1200)) risk = 1; // Loitering

           const riskBadgeColor = risk === 2 
             ? 'bg-rose-50 text-rose-700 border border-rose-200' 
             : risk === 1 
               ? 'bg-amber-50 text-amber-700 border border-amber-200' 
               : 'bg-emerald-50 text-emerald-700 border border-emerald-100';

           return (
             <div 
              key={name}
              className={`absolute border-2 rounded-2xl flex flex-col justify-between p-3 transition-all duration-300 cursor-pointer overflow-hidden ${
                isEditingMap && editingZoneName === name
                  ? 'border-amber-500 ring-4 ring-amber-200/60 bg-amber-50/20 z-30'
                  : isFocused 
                    ? 'border-[#007BC4] bg-[#007BC4]/5 shadow-[0_4px_20px_rgba(0,123,196,0.14)] z-25' 
                    : 'border-slate-300 bg-white/95 hover:bg-slate-50 hover:border-slate-400 shadow-sm z-10'
              }`}
              style={{ 
                left: `${rect.x}%`, 
                top: `${rect.y}%`, 
                width: `${rect.width}%`, 
                height: `${rect.height}%`
              }}
              onClick={() => {
                setSelectedZone(name);
                if (isEditingMap) setEditingZoneName(name);
              }}
             >
                {/* Sector Header */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-slate-800 text-[10px] sm:text-xs tracking-tight uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                      {name}
                    </span>
                    <span className="bg-[#007BC4]/10 text-[#007BC4] text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                      {occupants.length}/{capacity}
                    </span>
                  </div>
                  <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
                    {category}
                  </div>
                </div>

                {/* Edit Indicator if map editor is active */}
                {isEditingMap && (
                  <div className="my-auto flex items-center justify-center">
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                      <Edit3 className="w-2.5 h-2.5" /> Edit Sector
                    </span>
                  </div>
                )}

                {/* Bottom risk alert status */}
                {!isEditingMap && (
                  <div className={`mt-auto px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold text-center ${riskBadgeColor}`}>
                    {risk === 2 ? '⚠️ Critical Violation' : risk === 1 ? '⏰ Prolonged Dwell' : '✓ Normal State'}
                  </div>
                )}
             </div>
           );
        })}

        {/* Draw Fitted RFID Reader Gate Doors */}
        {hardwareDevices.map((door) => {
           const occupantsInZone = people.filter(p => p.currentZone === door.zone);
           const isScanningActive = occupantsInZone.length > 0;
           const isHighSecurityDoor = door.zone === 'Server Room' || door.alertUnauthorizedBreach;

           return (
             <div 
               key={door.id}
               className="absolute z-28 group cursor-pointer"
               style={{ 
                 left: `${door.x}%`, 
                 top: `${door.y}%`, 
                 transform: 'translate(-50%, -50%)' 
               }}
               onClick={(e) => {
                 e.stopPropagation();
                 handleOpenHardwareDevice(door);
               }}
             >
               {/* Quick Tooltip on Hover */}
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
                 <div className="flex items-center gap-1.5">
                   <Server className="w-3 h-3 text-[#007BC4]" />
                   {door.name}
                 </div>
                 <div className="text-[8px] text-emerald-400 font-mono mt-0.5">
                   IP: {door.ipAddress}:{door.port} • Power: {door.transmitPowerDbm} dBm
                 </div>
               </div>

               <div className="relative flex items-center justify-center">
                 {/* Door Bar Threshold Line */}
                 <div className={`rounded-full transition-all duration-300 ${
                   door.orientation === 'horizontal' ? 'w-10 h-1.5' : 'w-1.5 h-10'
                 } ${
                   isScanningActive 
                     ? isHighSecurityDoor 
                       ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]' 
                       : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                     : 'bg-slate-400'
                 }`} />

                 {/* Fitted Tag Reader Circle Unit */}
                 <div className={`absolute w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white shadow-md hover:scale-110 ${
                   isScanningActive 
                     ? isHighSecurityDoor 
                       ? 'border-rose-500 text-rose-500' 
                       : 'border-emerald-500 text-emerald-500'
                     : 'border-slate-400 text-slate-600'
                 }`}>
                   <Radio className={`w-3 h-3 ${isScanningActive ? 'animate-pulse' : ''}`} />
                 </div>

                 {/* Glowing RFID signal propagation fields */}
                 {showReaders && isScanningActive && (
                   <div className="absolute pointer-events-none">
                     <span className={`absolute -inset-6 rounded-full border border-dashed animate-ping opacity-25 ${
                       isHighSecurityDoor ? 'border-rose-400 bg-rose-400/5' : 'border-emerald-400 bg-emerald-400/5'
                     }`} style={{ animationDuration: '2s' }} />
                   </div>
                 )}
               </div>
             </div>
           );
        })}

        {/* Heatmap Layer */}
        {showHeatmap && (
          <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-55 z-20">
             {people.map(p => {
               const intensity = Math.min(1, Math.max(0.2, p.dwellTime / 600)); 
               const size = 120 + (intensity * 80);
               return (
                 <div 
                  key={`heat-${p.id}`}
                  className="absolute pointer-events-none transition-all duration-1000"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, rgba(14, 165, 233, ${intensity * 0.75}) 0%, rgba(14, 165, 233, 0) 70%)`,
                    filter: 'blur(8px)'
                  }}
                 />
               );
             })}
          </div>
        )}

        {/* Continuous Tag Signal Trails */}
        {!showHeatmap && people.map(p => {
           if (!p.trail || p.trail.length < 2) return null;
           const isHighlighted = highlightedPersonId === p.id;
           if (highlightedPersonId && !isHighlighted) return null;
           
           return (
             <svg key={'trail'+p.id} className="absolute inset-0 w-full h-full pointer-events-none z-15" style={{ overflow: 'visible' }}>
               <polyline 
                 points={p.trail.map(t => `${t.x}%,${t.y}%`).join(' ')} 
                 fill="none" 
                 stroke={p.role === 'Visitor' ? '#f59e0b' : p.role === 'Security' ? '#10b981' : '#007BC4'} 
                 strokeWidth={isHighlighted ? 3 : 1.5}
                 strokeOpacity={isHighlighted ? 0.9 : 0.25}
                 strokeDasharray="4 3"
               />
             </svg>
           );
        })}

        {/* Live Tracked Tag Positions */}
        <AnimatePresence>
        {!showHeatmap && people.map(p => {
          const isWarning = p.role === 'Visitor' && p.currentZone === 'Server Room';
          const isHighlighted = highlightedPersonId === p.id;
          const opacity = highlightedPersonId ? (isHighlighted ? 1 : 0.2) : 1;

          return (
            <motion.div 
              key={p.id}
              layout="position"
              className="absolute z-30"
              initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
              animate={{ 
                left: `${p.x}%`, 
                top: `${p.y}%`,
                scale: 1,
                opacity,
                x: "-50%",
                y: "-50%"
              }}
              exit={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
              transition={{ type: 'spring', damping: 28, stiffness: 130, mass: 0.5 }}
              style={{ zIndex: isHighlighted ? 35 : 30 }}
            >
              <div className="relative group cursor-pointer" onClick={() => setSelectedZone(p.currentZone)}>
                <div className={`w-4 h-4 rounded-full border-2 shadow-md flex items-center justify-center transition-all ${
                  isWarning 
                    ? 'bg-rose-500 border-white shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-bounce' 
                    : p.role === 'Visitor' 
                      ? 'bg-amber-400 border-amber-950 text-amber-950' 
                      : p.role === 'Security' 
                        ? 'bg-emerald-500 border-emerald-950 text-emerald-950' 
                        : 'bg-[#007BC4] border-blue-950 text-white'
                }`} />
                
                {p.presenceState === 'MOVING' && (
                   <span className={`absolute top-0 left-0 w-full h-full rounded-full animate-ping opacity-60 ${
                     isWarning ? 'bg-rose-500' : p.role === 'Visitor' ? 'bg-amber-400' : 'bg-[#007BC4]'
                   }`} style={{ animationDuration: '1.4s' }} />
                )}

                {isHighlighted && (
                   <span className="absolute -inset-2.5 rounded-full border-2 border-[#007BC4] animate-pulse opacity-100" />
                )}

                <div className={`absolute transition-all duration-200 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white border border-slate-800 rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap pointer-events-none z-50 ${isHighlighted ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'}`}>
                  <div className="text-xs font-black flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${p.role === 'Visitor' ? 'bg-amber-400' : p.role === 'Security' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
                    {p.name}
                  </div>
                  <div className="text-[9px] text-slate-300 font-mono tracking-wide mt-0.5">
                    {p.id} • Dwell {Math.floor(p.dwellTime/60)}m • Zone: {p.currentZone}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>

      {/* Interactive Map Layout Editor Drawer Panel */}
      {isEditingMap && (
        <div className="w-full md:w-80 shrink-0 bg-white border border-amber-200 rounded-2xl shadow-xl p-4 flex flex-col z-35 min-h-[400px] h-full overflow-y-auto">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Interactive Map Editor</h3>
                <p className="text-[10px] text-slate-500">Configure sectors & layout coordinates</p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditingMap(false)}
              className="text-slate-400 hover:text-slate-800 bg-slate-100 rounded-lg p-1 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Add New Sector Button */}
          <button 
            onClick={handleAddNewSector}
            className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition mb-4"
          >
            <Plus className="w-4 h-4" /> Add Custom Construction Sector
          </button>

          {/* Background Blueprint Floorplan Image Setter */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1.5 mb-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#007BC4]" /> Background Blueprint Image URL
            </label>
            <input 
              type="text" 
              value={customFloorplanUrl || ''} 
              onChange={(e) => setCustomFloorplanUrl(e.target.value || null)}
              placeholder="https://example.com/floorplan-blueprint.png"
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-[#007BC4]"
            />
            {customFloorplanUrl && (
              <button 
                onClick={() => setCustomFloorplanUrl(null)}
                className="mt-1.5 text-[10px] text-rose-600 hover:underline font-semibold"
              >
                Clear Background Blueprint
              </button>
            )}
          </div>

          {/* List of Sectors & Coordinate Adjuster */}
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Select Sector to Edit Bounds ({zoneEntries.length})
            </div>

            {zoneEntries.map(([name, rect]) => {
              const isSelected = editingZoneName === name;
              return (
                <div 
                  key={name}
                  className={`p-3 rounded-xl border transition ${
                    isSelected 
                      ? 'border-amber-400 bg-amber-50/50 shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setEditingZoneName(isSelected ? null : name)}
                  >
                    <span className="font-extrabold text-xs text-slate-800">{name}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      {isSelected ? 'Editing' : 'Select'}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-amber-200/60 space-y-2.5">
                      {/* Name */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Sector Title</label>
                        <input 
                          type="text" 
                          value={name} 
                          onChange={(e) => handleUpdateZone(name, {}, e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-white font-bold text-slate-800 outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Category Label</label>
                        <select
                          value={rect.category || 'REGULATED AREA'}
                          onChange={(e) => handleUpdateZone(name, { category: e.target.value })}
                          className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-white font-semibold text-slate-700 outline-none"
                        >
                          <option value="HIGH SECURITY">HIGH SECURITY</option>
                          <option value="REGULATED AREA">REGULATED AREA</option>
                          <option value="COMMON ZONE">COMMON ZONE</option>
                          <option value="HAZARD / CONSTRUCTION">HAZARD / CONSTRUCTION</option>
                          <option value="CLEANROOM VAULT">CLEANROOM VAULT</option>
                        </select>
                      </div>

                      {/* Max Capacity */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Capacity Limit</label>
                        <input 
                          type="number" 
                          value={rect.capacity || 20} 
                          onChange={(e) => handleUpdateZone(name, { capacity: parseInt(e.target.value) || 10 })}
                          className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-white font-bold text-slate-800 outline-none"
                        />
                      </div>

                      {/* Coordinates (X, Y, Width, Height) */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500">X Pos ({rect.x}%)</label>
                          <input 
                            type="range" min="0" max="80" 
                            value={rect.x} 
                            onChange={(e) => handleUpdateZone(name, { x: parseInt(e.target.value) })}
                            className="w-full accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500">Y Pos ({rect.y}%)</label>
                          <input 
                            type="range" min="0" max="80" 
                            value={rect.y} 
                            onChange={(e) => handleUpdateZone(name, { y: parseInt(e.target.value) })}
                            className="w-full accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500">Width ({rect.width}%)</label>
                          <input 
                            type="range" min="15" max="90" 
                            value={rect.width} 
                            onChange={(e) => handleUpdateZone(name, { width: parseInt(e.target.value) })}
                            className="w-full accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500">Height ({rect.height}%)</label>
                          <input 
                            type="range" min="15" max="90" 
                            value={rect.height} 
                            onChange={(e) => handleUpdateZone(name, { height: parseInt(e.target.value) })}
                            className="w-full accent-amber-500"
                          />
                        </div>
                      </div>

                      {/* Delete button */}
                      <button 
                        onClick={() => handleDeleteSector(name)}
                        className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Sector
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zone Details Side Panel (Standard view mode) */}
      {!isEditingMap && selectedZoneData && (
        <div className="w-full md:w-64 shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col z-35 min-h-[300px] h-full mt-4 md:mt-0 relative overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setSelectedZone(null)}
            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg p-1.5 transition"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 pr-6">
            <span className="w-2 h-2 rounded-full bg-[#007BC4] animate-pulse shrink-0" />
            <h3 className="font-extrabold text-slate-900 text-base truncate">{selectedZoneData.name}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center shadow-sm">
               <div className="text-2xl font-black text-[#007BC4]">{selectedZoneData.occupants.length}</div>
               <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center shadow-sm">
               <div className="text-xl font-black text-slate-700">{selectedZoneData.avgDwell}s</div>
               <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Dwell</div>
            </div>
          </div>
          
          <div className="mt-5 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tracked Tags Inside</h4>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-black">Live</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
               {selectedZoneData.occupants.map(p => (
                 <div key={p.id} className="flex flex-col p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 hover:border-slate-200 transition shadow-sm">
                    <span className="text-xs font-bold text-slate-850">{p.name}</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${p.role === 'Visitor' ? 'bg-amber-100 text-amber-700' : p.role === 'Security' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-[#007BC4]'}`}>{p.role}</span>
                      <span className="text-[9px] font-mono font-semibold text-slate-500">ID: {p.id.substring(0, 7)}</span>
                    </div>
                 </div>
               ))}
               {selectedZoneData.occupants.length === 0 && (
                 <div className="text-xs font-semibold text-slate-400 text-center mt-8 p-4 border-2 border-dashed border-slate-100 rounded-xl">
                   No tags currently detected in this room.
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Hardware Device Configuration Modal */}
      {isHardwareModalOpen && selectedDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#007BC4]/10 text-[#007BC4] rounded-xl">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{selectedDevice.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">UHF Hardware Device & RFID Trigger Configuration</p>
                </div>
              </div>
              <button 
                onClick={() => setIsHardwareModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Form */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Select device dropdown */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Select Hardware Unit</label>
                <select 
                  value={selectedDevice.id}
                  onChange={(e) => {
                    const dev = hardwareDevices.find(d => d.id === e.target.value);
                    if (dev) setSelectedDevice({ ...dev });
                  }}
                  className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                >
                  {hardwareDevices.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.ipAddress})</option>
                  ))}
                </select>
              </div>

              {/* Network Configuration */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-[#007BC4]" /> Network & Address Settings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500">IP Address</label>
                    <input 
                      type="text" 
                      value={selectedDevice.ipAddress} 
                      onChange={(e) => handleSaveHardwareDevice({ ...selectedDevice, ipAddress: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500">Port</label>
                    <input 
                      type="number" 
                      value={selectedDevice.port} 
                      onChange={(e) => handleSaveHardwareDevice({ ...selectedDevice, port: parseInt(e.target.value) || 8080 })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500">MAC Address</label>
                    <input 
                      type="text" 
                      value={selectedDevice.macAddress} 
                      onChange={(e) => handleSaveHardwareDevice({ ...selectedDevice, macAddress: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* UHF RF Transmit Power & Antenna Parameters */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" /> UHF Radio Frequency Calibration
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 flex justify-between">
                      <span>Transmit Power (10-33 dBm)</span>
                      <span className="font-extrabold text-[#007BC4]">{selectedDevice.transmitPowerDbm} dBm</span>
                    </label>
                    <input 
                      type="range" min="10" max="33" 
                      value={selectedDevice.transmitPowerDbm} 
                      onChange={(e) => handleSaveHardwareDevice({ ...selectedDevice, transmitPowerDbm: parseInt(e.target.value) })}
                      className="w-full accent-[#007BC4] mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500">Antenna Gain (dBi)</label>
                    <select
                      value={selectedDevice.antennaGainDbi}
                      onChange={(e) => handleSaveHardwareDevice({ ...selectedDevice, antennaGainDbi: parseFloat(e.target.value) })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-bold"
                    >
                      <option value={6.0}>6.0 dBi Circular</option>
                      <option value={8.0}>8.0 dBi Circular</option>
                      <option value={9.0}>9.0 dBi Circular</option>
                      <option value={12.0}>12.0 dBi High Gain Linear</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500">Frequency Band Region</label>
                    <select
                      value={selectedDevice.frequencyBand}
                      onChange={(e) => handleSaveHardwareDevice({ ...selectedDevice, frequencyBand: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-bold"
                    >
                      <option value="US FCC (902-928 MHz)">US FCC (902-928 MHz)</option>
                      <option value="EU ETSI (865-868 MHz)">EU ETSI (865-868 MHz)</option>
                      <option value="Asia Pacific (920-925 MHz)">Asia Pacific (920-925 MHz)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500">Bound Map Sector</label>
                    <select
                      value={selectedDevice.zone}
                      onChange={(e) => handleSaveHardwareDevice({ ...selectedDevice, zone: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-bold"
                    >
                      {allZoneNames.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Safety Alert Triggers */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" /> Automated Safety & Breach Triggers
                </h4>
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      <div>
                        <div className="font-bold text-slate-800">Unauthorized Zone Breach Alarm</div>
                        <div className="text-[10px] text-slate-400">Triggers loud alarm when non-cleared tags pass gate</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={selectedDevice.alertUnauthorizedBreach}
                      onChange={(e) => handleSaveHardwareDevice({ ...selectedDevice, alertUnauthorizedBreach: e.target.checked })}
                      className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-amber-500" />
                      <div>
                        <div className="font-bold text-slate-800">Hardhat & PPE Compliance Check</div>
                        <div className="text-[10px] text-slate-400">Verifies mandatory safety helmet RFID tag presence</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={selectedDevice.alertPpeRequired}
                      onChange={(e) => handleSaveHardwareDevice({ ...selectedDevice, alertPpeRequired: e.target.checked })}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Hardware Diagnostic Test Runner */}
              <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono font-bold text-xs text-emerald-400">
                    <Terminal className="w-4 h-4" /> Hardware Diagnostic Runner
                  </div>
                  <button 
                    onClick={handleRunDiagnostic}
                    disabled={isRunningDiagnostic}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-extrabold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
                    Run Diagnostic Test
                  </button>
                </div>

                {/* Console Log Feed */}
                <div className="font-mono text-[10px] p-3 bg-black/60 rounded-lg border border-slate-800 min-h-[90px] space-y-1 overflow-y-auto">
                  {diagnosticLogs.length === 0 ? (
                    <span className="text-slate-500">Click "Run Diagnostic Test" to execute ping and antenna sweep.</span>
                  ) : (
                    diagnosticLogs.map((log, i) => (
                      <div key={i} className={log.includes('PASS') || log.includes('SUCCESS') ? 'text-emerald-400' : 'text-slate-300'}>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button 
                onClick={() => setIsHardwareModalOpen(false)}
                className="px-5 py-2 bg-[#007BC4] hover:bg-[#0062a0] text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

