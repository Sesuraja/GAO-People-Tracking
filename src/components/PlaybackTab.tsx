import { useState, useMemo, useEffect } from 'react';
import { Person, Zone } from '../lib/simulation';
import { Play, Pause, FastForward, SkipBack, Search } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function PlaybackTab({ people, zones }: { people: Person[], zones: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeIndex, setTimeIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedPersonId, setHighlightedPersonId] = useState<string | null>(null);

  // Generate deterministic mock history based on current people's trail or fallback
  const simulatedHistory = useMemo(() => {
    const historyFrames: Person[][] = [];
    const frameCount = 100;
    
    // We will create a fake history where people move back and forth along a line
    for (let i = 0; i < frameCount; i++) {
       const frame = people.map(p => {
          // slight sine wave movement based on their ID and time offset
          const idHash = p.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
          const offsetX = Math.sin(i * 0.1 + idHash) * 10;
          const offsetY = Math.cos(i * 0.1 + idHash) * 10;
          
          return {
             ...p,
             x: Math.max(5, Math.min(95, p.x + offsetX)),
             y: Math.max(5, Math.min(95, p.y + offsetY)),
             presenceState: (Math.abs(offsetX) > 5) ? 'MOVING' : 'IDLE' as ('MOVING' | 'IDLE')
          };
       });
       historyFrames.push(frame);
    }
    return historyFrames;
  }, [people]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
         setTimeIndex(prev => {
            if (prev >= simulatedHistory.length - 1) {
               setIsPlaying(false);
               return prev;
            }
            return prev + 1;
         });
      }, 500 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, simulatedHistory.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetPlayback = () => { setIsPlaying(false); setTimeIndex(0); };

  const currentFramePeople = simulatedHistory[timeIndex] || people;
  
  // Format current playback time
  const startTime = new Date();
  startTime.setHours(8, 0, 0, 0); // Start at 8:00 AM
  const currentTime = new Date(startTime.getTime() + timeIndex * 60000 * 5); // 5 minutes per frame

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 bg-slate-50 min-h-0 h-full">
      <div className="flex flex-col md:flex-row justify-between shrink-0 gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-900 tracking-tight">Historical Playback</h2>
           <p className="text-slate-500 text-sm font-medium mt-1">Review movement paths and events over time</p>
        </div>
        
        <div className="flex bg-white rounded-xl border border-slate-200 shadow-sm p-2 items-center gap-4">
           <div className="text-[#007BC4] font-mono text-sm font-bold bg-[#007BC4]/10 px-3 py-1.5 rounded-lg border border-[#007BC4]/20 shadow-sm">
             {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </div>
           <div className="w-px h-6 bg-slate-200" />
           <button onClick={resetPlayback} className="p-2 text-slate-500 hover:text-[#007BC4] hover:bg-slate-50 rounded-lg transition"><SkipBack className="w-4 h-4" /></button>
           <button onClick={togglePlay} className="p-2 text-white bg-[#007BC4] hover:bg-blue-700 rounded-lg shadow-md shadow-[#007BC4]/20 transition">
             {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
           </button>
           <button onClick={() => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1)} className="p-2 text-slate-500 hover:text-[#007BC4] hover:bg-slate-50 rounded-lg transition flex items-center gap-1 font-mono text-xs font-bold">
             <FastForward className="w-4 h-4" /> {speed}x
           </button>
        </div>
      </div>

      <div className="px-5 py-6 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
        <Slider 
           value={[timeIndex]} 
           max={simulatedHistory.length - 1} 
           step={1} 
           onValueChange={(val) => setTimeIndex(val[0])}
           className="w-full"
        />
      </div>

      <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-0">
         {/* Live Map Area */}
         <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 relative shadow-sm overflow-hidden flex flex-col">
           <PlaybackMap people={currentFramePeople} zones={zones} highlightedPersonId={highlightedPersonId} />
         </div>

         {/* Search Box & Person Track */}
         <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col min-h-0 h-full shadow-sm">
               <h3 className="text-sm font-bold text-slate-900 mb-4 tracking-tight">Track Person</h3>
               <div className="relative mb-4">
                 <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                 <input 
                   type="text" 
                   className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4] outline-none transition shadow-inner"
                   placeholder="Search ID or Name..."
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
               </div>
               
               <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                 {currentFramePeople.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                   <button 
                     key={p.id}
                     onClick={() => setHighlightedPersonId(prev => prev === p.id ? null : p.id)}
                     className={`w-full text-left p-3 rounded-xl border transition-all ${highlightedPersonId === p.id ? 'bg-[#007BC4]/5 border-[#007BC4] shadow-sm' : 'bg-white border-slate-200 hover:border-[#007BC4]/50 hover:bg-slate-50 shadow-sm hover:shadow'}`}
                   >
                     <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-sm">{p.name}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${p.role === 'Visitor' ? 'bg-amber-100 text-amber-700' : p.role === 'Security' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-[#007BC4]'}`}>{p.role}</span>
                     </div>
                     <span className="text-xs text-slate-500 mt-1 block font-mono font-medium">{p.id}</span>
                   </button>
                 ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function PlaybackMap({ people, zones, highlightedPersonId }: { people: Person[], zones: any, highlightedPersonId: string | null }) {
  const zoneEntries = Object.entries(zones);
  
  return (
    <div className="w-full h-full relative bg-transparent overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#007BC4 1px, transparent 1px), linear-gradient(90deg, #007BC4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="relative w-full h-full border-0 rounded-lg bg-transparent z-10 overflow-hidden">
        {zoneEntries.map(([name, rect]: any) => (
           <div 
            key={name}
            className="absolute border border-[#007BC4]/20 bg-white/40 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-2"
            style={{ 
              left: `${rect.x}%`, 
              top: `${rect.y}%`, 
              width: `${rect.width}%`, 
              height: `${rect.height}%`
            }}
           >
              <div className="bg-white/90 text-[#007BC4] border border-[#007BC4]/20 rounded-full px-3 py-1 text-[10px] font-bold shadow backdrop-blur-sm whitespace-nowrap">{name}</div>
           </div>
        ))}

        {/* Draw People */}
        {people.map(p => {
          const isHighlighted = highlightedPersonId === p.id;
          const opacity = highlightedPersonId ? (isHighlighted ? 1 : 0.2) : 1;
          
          return (
            <div
              key={p.id}
              className="absolute w-4 h-4 rounded-full border-[2px] transition-all duration-300"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: 'translate(-50%, -50%)',
                opacity,
                zIndex: isHighlighted ? 50 : 20,
                backgroundColor: p.role === 'Visitor' ? '#f59e0b' : p.role === 'Security' ? '#10b981' : '#007BC4',
                borderColor: '#ffffff',
                boxShadow: isHighlighted ? '0 0 20px rgba(0,123,196,0.8)' : '0 0 5px rgba(0,0,0,0.2)'
              }}
            >
              {isHighlighted && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-slate-900 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-50">
                  {p.name}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
