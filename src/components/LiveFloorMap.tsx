import { motion, AnimatePresence } from 'motion/react';
import { Person, Zone } from '../lib/simulation';
import { useMemo, useState, useEffect } from 'react';
import { Layers, Radio, Activity } from 'lucide-react';
import floorplanImage from '../assets/images/facility_floorplan_2d_1780726630123.png';

export default function LiveFloorMap({ people, zones, highlightedPersonId, initialFocusZone, floorplanUrl }: { people: Person[], zones: Record<string, {x:number, y:number, width:number, height:number}>, highlightedPersonId?: string | null, initialFocusZone?: string | null, floorplanUrl?: string | null }) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showReaders, setShowReaders] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(initialFocusZone || null);

  useEffect(() => {
    if (initialFocusZone) {
      setSelectedZone(initialFocusZone);
    }
  }, [initialFocusZone]);

  // Simple bounding boxes for drawing
  const zoneEntries = Object.entries(zones);

  const selectedZoneData = useMemo(() => {
    if (!selectedZone) return null;
    const occupants = people.filter(p => p.currentZone === selectedZone);
    const avgDwell = occupants.length > 0 ? occupants.reduce((sum, p) => sum + p.dwellTime, 0) / occupants.length : 0;
    return { name: selectedZone, occupants, avgDwell: Math.round(avgDwell) };
  }, [selectedZone, people]);

  const activeFloorplan = floorplanUrl || floorplanImage;

  return (
    <div className="w-full h-full relative bg-transparent overflow-hidden flex flex-col md:flex-row items-stretch justify-center pr-0 md:pr-4">
      {/* Background Image Floorplan */}
      <div 
        className="absolute inset-0 z-0 opacity-40 dark:opacity-20 transition-opacity duration-300" 
        style={{ backgroundImage: `url(${activeFloorplan})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} 
      />
      {/* Background grid pattern */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#007BC4 1px, transparent 1px), linear-gradient(90deg, #007BC4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <button 
        onClick={() => setShowHeatmap(!showHeatmap)}
        className={`absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-2 transition-colors ${showHeatmap ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700 text-slate-300'}`}
      >
        <Layers className="w-4 h-4" />
        Heatmap {showHeatmap ? 'On' : 'Off'}
      </button>

      <button 
        onClick={() => setShowReaders(!showReaders)}
        className={`absolute top-4 right-40 z-20 px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-2 transition-colors ${showReaders ? 'bg-[#007BC4]/20 border-[#007BC4]/50 text-[#007BC4] shadow-[0_0_15px_rgba(0,123,196,0.2)]' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700 text-slate-300'}`}
      >
        <Radio className="w-4 h-4" />
        Coverage Zones
      </button>

      {/* Map Container */}
      <div className="relative flex-1 w-full h-full border-0 rounded-lg bg-transparent z-10 overflow-hidden">
        
        {/* Draw Zones */}
        {zoneEntries.map(([name, rect]) => {
           const occupants = people.filter(p => p.currentZone === name);
           let risk = 0; // 0 = safe, 1 = warning, 2 = danger
           if (name === 'Server Room' && occupants.some(p => p.role === 'Visitor')) risk = 2; // Danger
           else if (occupants.some(p => p.dwellTime > 1200)) risk = 1; // Loitering

           // Risk colors
           const riskColor = risk === 2 ? 'bg-rose-500 text-white' : risk === 1 ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-white';

           return (
             <div 
              key={name}
              className={`absolute border rounded-2xl flex flex-col items-center justify-center p-2 transition-all duration-300 cursor-pointer ${selectedZone === name ? 'border-[#007BC4] bg-[#007BC4]/5 shadow-[0_0_15px_rgba(0,123,196,0.15)] z-20' : 'border-[#007BC4]/20 hover:bg-[#007BC4]/5 bg-white/40 backdrop-blur-sm z-10'}`}
              style={{ 
                left: `${rect.x}%`, 
                top: `${rect.y}%`, 
                width: `${rect.width}%`, 
                height: `${rect.height}%`
              }}
              onClick={() => setSelectedZone(name)}
             >
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-white/90 text-[#007BC4] border border-[#007BC4]/20 rounded-full px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-md whitespace-nowrap">{name}</div>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-bold shadow-sm flex items-center gap-1 ${riskColor}`}>
                     Risk Level {risk === 0 ? 'Low' : risk === 1 ? 'Med' : 'High'}
                  </div>
                </div>
             </div>
           );
        })}

        {/* Reader Layer */}
        {showReaders && (
           <>
              <div 
                 className="absolute border border-[#007BC4]/40 bg-[#007BC4]/10 rounded-full flex items-center justify-center animate-pulse"
                 style={{ left: '150px', top: '100px', width: '300px', height: '300px', transform: 'translate(-50%, -50%)' }}
              >
                  <div className="absolute flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                     <Radio className="w-6 h-6 text-[#007BC4] -mt-6" />
                     <span className="text-[10px] font-bold text-[#007BC4] bg-[#007BC4]/10 px-2 py-0.5 rounded mt-1 shadow-sm backdrop-blur-sm whitespace-nowrap">Reader A (92% Cov)</span>
                  </div>
              </div>
              <div 
                 className="absolute border border-slate-500/40 bg-slate-500/10 rounded-full flex items-center justify-center opacity-70"
                 style={{ left: '600px', top: '250px', width: '350px', height: '350px', transform: 'translate(-50%, -50%)' }}
              >
                 <div className="absolute flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                     <Radio className="w-6 h-6 text-slate-500 -mt-6 opacity-50" />
                     <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded mt-1 shadow-sm backdrop-blur-sm whitespace-nowrap">Reader B (Offline)</span>
                  </div>
              </div>
              <div 
                 className="absolute border border-indigo-500/30 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse"
                 style={{ left: '300px', top: '450px', width: '250px', height: '250px', transform: 'translate(-50%, -50%)' }}
              >
                 <div className="absolute flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                     <Radio className="w-6 h-6 text-indigo-500 -mt-6" />
                     <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded mt-1 shadow-sm backdrop-blur-sm whitespace-nowrap">Reader C (85% Cov)</span>
                  </div>
              </div>
           </>
        )}

        {/* Heatmap Layer */}
        {showHeatmap && (
          <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-60">
             {people.map(p => {
               // Render blurred radial gradients mapped to dwell times for simple heatmap approx
               const intensity = Math.min(1, Math.max(0.2, p.dwellTime / 600)); // Normalise 10 mins
               const size = 150 + (intensity * 100);
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
                    background: `radial-gradient(circle, rgba(244, 63, 94, ${intensity * 0.8}) 0%, rgba(244, 63, 94, 0) 70%)`,
                    filter: 'blur(10px)'
                  }}
                 />
               )
             })}
          </div>
        )}

        {/* Draw People Trails */}
        {!showHeatmap && people.map(p => {
           if (!p.trail || p.trail.length < 2) return null;
           const isHighlighted = highlightedPersonId === p.id;
           // Only show trail if highlighted, or for a few if none are highlighted
           if (highlightedPersonId && !isHighlighted) return null;
           
           return (
             <svg key={'trail'+p.id} className="absolute inset-0 w-full h-full pointer-events-none z-15" style={{ overflow: 'visible' }}>
               <polyline 
                 points={p.trail.map(t => `${t.x}%,${t.y}%`).join(' ')} 
                 fill="none" 
                 stroke={p.role === 'Visitor' ? '#f59e0b' : p.role === 'Security' ? '#10b981' : '#007BC4'} 
                 strokeWidth={isHighlighted ? 3 : 1}
                 strokeOpacity={isHighlighted ? 0.8 : 0.3}
                 strokeDasharray="4 2"
                 className="transition-all duration-500"
               />
             </svg>
           );
        })}

        {/* Draw Tracked People */}
        <AnimatePresence>
        {!showHeatmap && people.map(p => {
          const isWarning = p.role === 'Visitor' && p.currentZone === 'Server Room';
          const isHighlighted = highlightedPersonId === p.id;
          const opacity = highlightedPersonId ? (isHighlighted ? 1 : 0.2) : 1;

          return (
            <motion.div 
              key={p.id}
              layout="position"
              className="absolute z-20"
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
              transition={{ type: 'spring', damping: 25, stiffness: 120, mass: 0.5 }}
              style={{ zIndex: isHighlighted ? 30 : 20 }}
            >
              <div className="relative group">
                <div className={`w-4 h-4 rounded-full border-[2.5px] shadow-[0_0_10px_rgba(0,0,0,0.5)] ${isWarning ? 'bg-rose-500 border-white shadow-[0_0_15px_rgba(244,63,94,1)] animate-pulse' : p.role === 'Visitor' ? 'bg-amber-400 border-amber-900' : p.role === 'Security' ? 'bg-[#10b981] border-emerald-900' : 'bg-[#007BC4] border-blue-900'}`} />
                
                {/* Ping animation when moving */}
                {p.presenceState === 'MOVING' && (
                   <span className={`absolute top-0 left-0 w-full h-full rounded-full animate-ping opacity-75 ${isWarning ? 'bg-rose-500' : p.role === 'Employee' ? 'bg-[#007BC4]' : 'bg-[#10b981]'}`} />
                )}

                {/* Highlight ring pulse */}
                {isHighlighted && (
                   <span className="absolute -inset-2 rounded-full border-2 border-[#007BC4] animate-ping opacity-100" />
                )}

                {/* Tooltip on hover */}
                <div className={`absolute transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-slate-200 rounded px-3 py-2 shadow-xl whitespace-nowrap pointer-events-none z-50 ${isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <div className="text-xs font-bold text-slate-900">{p.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">{p.id} • Dwell {Math.floor(p.dwellTime/60)}m</div>
                </div>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>

      {/* Zone Details Side Panel */}
      {selectedZoneData && (
        <div className="w-full md:w-64 shrink-0 bg-white border-l md:border-l-0 md:border border-slate-200 rounded-none md:rounded-xl shadow-lg p-4 flex flex-col z-30 min-h-[300px] h-full mt-4 md:mt-0 relative overflow-hidden transition-all">
          <button 
            onClick={() => setSelectedZone(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded p-1 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <h3 className="font-bold text-slate-900 text-lg pr-6">{selectedZoneData.name}</h3>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center shadow-sm">
               <div className="text-2xl font-black text-[#007BC4]">{selectedZoneData.occupants.length}</div>
               <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Occupancy</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center shadow-sm">
               <div className="text-xl font-black text-slate-700">{selectedZoneData.avgDwell}s</div>
               <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Avg Dwell</div>
            </div>
          </div>
          
          <div className="mt-6 flex-1 min-h-0 flex flex-col">
            <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Current Personnel</h4>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
               {selectedZoneData.occupants.map(p => (
                 <div key={p.id} className="flex flex-col p-2 bg-slate-50 rounded border border-slate-100 hover:border-slate-200 transition shadow-sm">
                    <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${p.role === 'Visitor' ? 'bg-amber-100 text-amber-700' : p.role === 'Security' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-[#007BC4]'}`}>{p.role}</span>
                      <span className="text-[10px] font-medium text-slate-500">{p.dwellTime}s</span>
                    </div>
                 </div>
               ))}
               {selectedZoneData.occupants.length === 0 && (
                 <div className="text-sm font-medium text-slate-500 text-center mt-6">Zone is empty.</div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
