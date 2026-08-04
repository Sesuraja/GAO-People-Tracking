import { motion, AnimatePresence } from 'motion/react';
import { Person } from '../lib/simulation';
import { useMemo, useState, useEffect } from 'react';
import { Layers, Radio, Activity, Wifi, Disc, Server, AlertCircle, Sparkles, Zap } from 'lucide-react';

interface Door {
  id: string;
  name: string;
  x: number;
  y: number;
  zone: string;
  type: string;
  orientation: 'horizontal' | 'vertical';
}

const DOORS: Door[] = [
  {
    id: 'door-entrance',
    name: 'Main Entrance Portal',
    x: 20,
    y: 80,
    zone: 'Entrance',
    type: 'UHF Gate RFID Portal',
    orientation: 'horizontal'
  },
  {
    id: 'door-cafeteria',
    name: 'Cafeteria RFID Reader',
    x: 20,
    y: 50,
    zone: 'Cafeteria',
    type: 'Fitted RFID Antenna',
    orientation: 'horizontal'
  },
  {
    id: 'door-office',
    name: 'Office Entry Gateway',
    x: 40,
    y: 55,
    zone: 'Office',
    type: 'Fitted RFID Scanner',
    orientation: 'vertical'
  },
  {
    id: 'door-meeting',
    name: 'Meeting Room Portal',
    x: 55,
    y: 30,
    zone: 'Meeting Room',
    type: 'Dual Tag Scanner',
    orientation: 'horizontal'
  },
  {
    id: 'door-server',
    name: 'Server Vault secure gate',
    x: 80,
    y: 20,
    zone: 'Server Room',
    type: 'Secured UHF RFID Reader',
    orientation: 'vertical'
  }
];

export default function LiveFloorMap({ 
  people, 
  zones, 
  highlightedPersonId, 
  initialFocusZone, 
  floorplanUrl 
}: { 
  people: Person[]; 
  zones: Record<string, {x:number; y:number; width:number; height:number}>; 
  highlightedPersonId?: string | null; 
  initialFocusZone?: string | null; 
  floorplanUrl?: string | null; 
}) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showReaders, setShowReaders] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(initialFocusZone || null);

  useEffect(() => {
    if (initialFocusZone) {
      setSelectedZone(initialFocusZone);
    }
  }, [initialFocusZone]);

  // Combine zones passed in with any extra zones found in active people
  const allZoneNames = useMemo(() => {
    const names = new Set(Object.keys(zones));
    people.forEach(p => {
      if (p.currentZone) names.add(p.currentZone);
    });
    return Array.from(names);
  }, [zones, people]);

  const defaultZoneBounds: Record<string, { x: number; y: number; width: number; height: number }> = {
    'Cafeteria': { x: 5, y: 10, width: 30, height: 35 },
    'Meeting Room': { x: 40, y: 10, width: 28, height: 35 },
    'Server Room': { x: 72, y: 10, width: 23, height: 35 },
    'Entrance': { x: 5, y: 55, width: 30, height: 35 },
    'Office': { x: 40, y: 55, width: 55, height: 35 }
  };

  const zoneEntries = useMemo(() => {
    return allZoneNames.map((name, idx) => {
      let rect = zones[name];
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
            height: 25
          };
        }
      }
      return [name, rect] as [string, { x: number; y: number; width: number; height: number }];
    });
  }, [allZoneNames, zones]);

  const selectedZoneData = useMemo(() => {
    if (!selectedZone) return null;
    const occupants = people.filter(p => p.currentZone === selectedZone);
    const avgDwell = occupants.length > 0 ? occupants.reduce((sum, p) => sum + p.dwellTime, 0) / occupants.length : 0;
    return { name: selectedZone, occupants, avgDwell: Math.round(avgDwell) };
  }, [selectedZone, people]);

  return (
    <div className="w-full h-full min-h-[520px] relative bg-transparent overflow-hidden flex flex-col md:flex-row items-stretch justify-center pr-0 md:pr-4">
      
      {/* Control Buttons (Sticky Top-Right) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button 
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-3 py-1.5 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all shadow-sm ${showHeatmap ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-[0_0_12px_rgba(244,63,94,0.1)]' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          Heatmap {showHeatmap ? 'On' : 'Off'}
        </button>

        <button 
          onClick={() => setShowReaders(!showReaders)}
          className={`px-3 py-1.5 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all shadow-sm ${showReaders ? 'bg-blue-50 border-blue-200 text-[#007BC4]' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}
        >
          <Radio className="w-3.5 h-3.5" />
          RFID Readers {showReaders ? 'Visible' : 'Hidden'}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 w-full h-full min-h-[480px] border border-slate-200 rounded-2xl bg-white z-10 overflow-hidden shadow-sm flex flex-col items-center justify-center p-4">
        
        {/* Render custom architectural floorplan image if uploaded in Locations */}
        {floorplanUrl && (
          <div className="absolute inset-0 z-0 pointer-events-none p-3 opacity-30 flex items-center justify-center">
            <img src={floorplanUrl} alt="Facility Floor Plan" className="w-full h-full object-contain rounded-xl" />
          </div>
        )}

        {/* Subtle architectural floor background grid */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{ 
          backgroundImage: 'linear-gradient(rgba(0,123,196,0.06) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(0,123,196,0.06) 1.5px, transparent 1.5px)', 
          backgroundSize: '24px 24px' 
        }} />

        {/* Outer Hallway corridor label */}
        <div className="absolute top-[48%] left-[32%] text-[9px] font-bold text-slate-400 select-none uppercase tracking-widest pointer-events-none">
          Active Connecting Passage
        </div>

        {/* Draw 2D Room Boxes */}
        {zoneEntries.map(([name, rect]) => {
           const occupants = people.filter(p => p.currentZone === name);
           const isFocused = selectedZone === name;

           let risk = 0; // 0 = safe, 1 = warning, 2 = danger
           if (name === 'Server Room' && occupants.some(p => p.role === 'Visitor')) risk = 2; // Danger
           else if (occupants.some(p => p.dwellTime > 1200)) risk = 1; // Loitering

           // Elegant minimalistic risk banner styling
           const riskBadgeColor = risk === 2 
             ? 'bg-rose-50 text-rose-700 border border-rose-200' 
             : risk === 1 
               ? 'bg-amber-50 text-amber-700 border border-amber-200' 
               : 'bg-emerald-50 text-emerald-700 border border-emerald-100';

           return (
             <div 
              key={name}
              className={`absolute border-2 rounded-2xl flex flex-col justify-between p-3.5 transition-all duration-300 cursor-pointer overflow-hidden ${
                isFocused 
                  ? 'border-[#007BC4] bg-[#007BC4]/5 shadow-[0_4px_20px_rgba(0,123,196,0.12)] z-25' 
                  : 'border-slate-300 bg-white/95 hover:bg-slate-50 hover:border-slate-400 shadow-sm z-10'
              }`}
              style={{ 
                left: `${rect.x}%`, 
                top: `${rect.y}%`, 
                width: `${rect.width}%`, 
                height: `${rect.height}%`
              }}
              onClick={() => setSelectedZone(name)}
             >
                {/* Title and stats bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 text-[10px] sm:text-xs tracking-tight uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                      {name}
                    </span>
                    <span className="bg-[#007BC4]/10 text-[#007BC4] text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                      {occupants.length} Tag{occupants.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-[9px] font-medium text-slate-400">
                    {name === 'Server Room' ? 'HIGH SECURITY' : 'REGULATED AREA'}
                  </div>
                </div>

                {/* Bottom risk alert level */}
                <div className={`mt-auto px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold text-center ${riskBadgeColor}`}>
                  {risk === 2 ? '⚠️ Critical Violation' : risk === 1 ? '⏰ Warning: Prolonged' : '✓ Normal State'}
                </div>
             </div>
           );
        })}

        {/* Draw Fitted Doors with Dynamic Tag Scanning Radii */}
        {DOORS.map((door) => {
           const occupantsInZone = people.filter(p => p.currentZone === door.zone);
           const isScanningActive = occupantsInZone.length > 0;
           const isServerDoor = door.id === 'door-server';

           return (
             <div 
               key={door.id}
               className="absolute z-28 group"
               style={{ 
                 left: `${door.x}%`, 
                 top: `${door.y}%`, 
                 transform: 'translate(-50%, -50%)' 
               }}
             >
               {/* Hidden/Hover helper tag */}
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
                 {door.name} • <span className="text-emerald-400 font-mono text-[8px]">{door.type}</span>
               </div>

               <div className="relative flex items-center justify-center">
                 
                 {/* Door Bar Threshold Line */}
                 <div className={`rounded-full transition-all duration-300 ${
                   door.orientation === 'horizontal' ? 'w-10 h-1.5' : 'w-1.5 h-10'
                 } ${
                   isScanningActive 
                     ? isServerDoor 
                       ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]' 
                       : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                     : 'bg-slate-400'
                 }`} />

                 {/* Fitted Tag Reader Circle Unit (Where device/tag is fitted) */}
                 <div className={`absolute w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white shadow-sm ${
                   isScanningActive 
                     ? isServerDoor 
                       ? 'border-rose-500 text-rose-500' 
                       : 'border-emerald-500 text-emerald-500'
                     : 'border-slate-400 text-slate-500'
                 }`}>
                   <Radio className={`w-2.5 h-2.5 ${isScanningActive ? 'animate-pulse' : ''}`} />
                 </div>

                 {/* Glowing RFID signal propagation fields radiating from fitted reader */}
                 {showReaders && isScanningActive && (
                   <div className="absolute pointer-events-none">
                     <span className={`absolute -inset-6 rounded-full border border-dashed animate-ping opacity-25 ${
                       isServerDoor ? 'border-rose-400 bg-rose-400/5' : 'border-emerald-400 bg-emerald-400/5'
                     }`} style={{ animationDuration: '2s' }} />
                     <span className={`absolute -inset-10 rounded-full border border-dotted animate-ping opacity-15 ${
                       isServerDoor ? 'border-rose-300' : 'border-emerald-300'
                     }`} style={{ animationDuration: '3.5s' }} />
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

        {/* Draw Continuous Tag Signal Trails */}
        {!showHeatmap && people.map(p => {
           if (!p.trail || p.trail.length < 2) return null;
           const isHighlighted = highlightedPersonId === p.id;
           
           // Highlight specific user or show elegant thin trails
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

        {/* Draw Live Tracked Tag Positions */}
        <AnimatePresence>
        {!showHeatmap && people.map(p => {
          const isWarning = p.role === 'Visitor' && p.currentZone === 'Server Room';
          const isHighlighted = highlightedPersonId === p.id;
          const opacity = highlightedPersonId ? (isHighlighted ? 1 : 0.2) : 1;

          // Align tags visually
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
                
                {/* Visual Circle Tag Pin */}
                <div className={`w-4 h-4 rounded-full border-2 shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all ${
                  isWarning 
                    ? 'bg-rose-500 border-white shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-bounce' 
                    : p.role === 'Visitor' 
                      ? 'bg-amber-400 border-amber-955 text-amber-950' 
                      : p.role === 'Security' 
                        ? 'bg-emerald-500 border-emerald-955 text-emerald-950' 
                        : 'bg-[#007BC4] border-blue-955 text-white'
                }`} />
                
                {/* Ping dynamic ring when tag is walking */}
                {p.presenceState === 'MOVING' && (
                   <span className={`absolute top-0 left-0 w-full h-full rounded-full animate-ping opacity-60 ${
                     isWarning ? 'bg-rose-500' : p.role === 'Visitor' ? 'bg-amber-400' : 'bg-[#007BC4]'
                   }`} style={{ animationDuration: '1.4s' }} />
                )}

                {/* Highlight beacon tracker ring */}
                {isHighlighted && (
                   <span className="absolute -inset-2.5 rounded-full border-2 border-[#007BC4] animate-pulse opacity-100" />
                )}

                {/* Tooltip on Hover */}
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

      {/* Zone Details Side Panel */}
      {selectedZoneData && (
        <div className="w-full md:w-64 shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col z-35 min-h-[300px] h-full mt-4 md:mt-0 relative overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setSelectedZone(null)}
            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg p-1.5 transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#007BC4] animate-pulse" />
            <h3 className="font-extrabold text-slate-900 text-base pr-6 truncate">{selectedZoneData.name}</h3>
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
    </div>
  );
}
