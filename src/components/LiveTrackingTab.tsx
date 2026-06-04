import React, { useState } from 'react';
import { Person } from '../lib/simulation';
import LiveFloorMap from './LiveFloorMap';
import { useGaoRealtime } from '../lib/useGaoApi';
import { Radio, MapPin, Clock } from 'lucide-react';

export default function LiveTrackingTab({ people, zones, highlightedPersonId }: { people: Person[], zones: Record<string, {x:number, y:number, width:number, height:number}>, highlightedPersonId?: string | null }) {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(highlightedPersonId || null);
  
  // Real-time data from API
  const { tags, error, isLoading } = useGaoRealtime(2000);

  return (
    <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 bg-slate-50 min-h-0 h-full">
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Live Facility Map</h2>
            <p className="text-slate-500 font-medium tracking-tight">Real-time personnel location and zone occupancy</p>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative flex flex-col min-h-0">
           <LiveFloorMap people={people} zones={zones} highlightedPersonId={selectedPerson || highlightedPersonId} />
        </div>
      </div>

      {/* Real-Time API Data Stream */}
      <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0 h-full">
         <div className="flex justify-between items-center shrink-0">
            <div>
               <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                 <Radio className="w-5 h-5 text-emerald-500 animate-pulse" /> 
                 Live Reader Feed
               </h3>
               <p className="text-slate-500 font-medium text-sm">Real-time data from GAO API</p>
            </div>
            <div className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase rounded-lg border border-emerald-200">
               {tags.length} Scans
            </div>
         </div>

         <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
               {isLoading && tags.length === 0 && (
                  <div className="flex items-center justify-center h-full text-slate-500 font-medium">
                     Connecting to Reader...
                  </div>
               )}
               {error && tags.length === 0 && (
                  <div className="flex items-center justify-center h-full text-rose-500 font-medium p-4 text-center">
                     Failed to connect to API.<br/>Check API settings in config.
                  </div>
               )}
               {tags.map((tag, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-lg shrink-0 hover:border-[#007BC4]/30 hover:bg-[#007BC4]/5 transition">
                     <div className="flex items-center justify-between mb-2">
                        <div className="font-mono text-xs font-bold text-[#007BC4] bg-[#007BC4]/10 px-2 py-0.5 rounded break-all">
                           {tag.TagID.substring(0, 16)}...
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                           {new Date(tag.Timestamp + "Z").toLocaleTimeString()}
                        </span>
                     </div>
                     <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        {tag.Location}
                     </div>
                  </div>
               ))}
               {!isLoading && !error && tags.length === 0 && (
                  <div className="flex items-center justify-center h-full text-slate-500 font-medium">
                     No immediate scans
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
