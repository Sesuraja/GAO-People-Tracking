import React, { useState, useEffect } from 'react';
import { Person } from '../lib/simulation';
import LiveFloorMap from './LiveFloorMap';
import { useGaoRealtime } from '../lib/useGaoApi';
import { Radio, MapPin, Clock, Search, AlertTriangle, UserCheck, Building2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { collection, onSnapshot } from '../lib/db';
import { db } from '../lib/firebase';

const FACILITIES = [
  {
    id: 'hq-f1',
    name: 'Headquarters (Floor 1)',
    zones: {
      'Cafeteria': { x: 5, y: 10, width: 30, height: 35 },
      'Meeting Room': { x: 40, y: 10, width: 28, height: 35 },
      'Server Room': { x: 72, y: 10, width: 23, height: 35 },
      'Entrance': { x: 5, y: 55, width: 30, height: 35 },
      'Office': { x: 40, y: 55, width: 55, height: 35 }
    }
  },
  {
    id: 'hq-f2',
    name: 'Headquarters (Floor 2 - Executive)',
    zones: {
      'Executive Boardroom': { x: 5, y: 10, width: 42, height: 40 },
      'Finance & Legal': { x: 50, y: 10, width: 45, height: 40 },
      'CEO Suite': { x: 5, y: 54, width: 30, height: 38 },
      'Strategy War Room': { x: 38, y: 54, width: 57, height: 38 }
    }
  },
  {
    id: 'warehouse',
    name: 'Warehouse & Logistics Center',
    zones: {
      'Loading Dock Alpha': { x: 5, y: 10, width: 30, height: 40 },
      'High-Bay Storage': { x: 38, y: 10, width: 57, height: 40 },
      'Packing & Shipping': { x: 5, y: 54, width: 45, height: 38 },
      'Inventory Control': { x: 53, y: 54, width: 42, height: 38 }
    }
  },
  {
    id: 'rd-campus',
    name: 'Secure R&D Tech Campus',
    zones: {
      'AI Neural Lab': { x: 5, y: 10, width: 45, height: 40 },
      'Robotics Arena': { x: 53, y: 10, width: 42, height: 40 },
      'Quantum Testing': { x: 5, y: 54, width: 35, height: 38 },
      'Cleanroom Vault': { x: 43, y: 54, width: 52, height: 38 }
    }
  },
  {
    id: 'datacenter',
    name: 'Server Datacenter Annex',
    zones: {
      'Server Vault A': { x: 5, y: 10, width: 45, height: 40 },
      'Network Operations Center': { x: 53, y: 10, width: 42, height: 40 },
      'Power Substation': { x: 5, y: 54, width: 40, height: 38 },
      'Security Operations': { x: 48, y: 54, width: 47, height: 38 }
    }
  }
];

export default function LiveTrackingTab({ people, zones: defaultZones, highlightedPersonId, isLoading: mainIsLoading }: { people: Person[], zones: Record<string, {x:number, y:number, width:number, height:number}>, highlightedPersonId?: string | null, isLoading?: boolean }) {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(highlightedPersonId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const focusZone = location.state?.focusZone || null;
  const [floorplanUrl, setFloorplanUrl] = useState<string | null>(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [activeFacilityId, setActiveFacilityId] = useState('hq-f1');

  const currentFacility = FACILITIES.find(f => f.id === activeFacilityId) || FACILITIES[0];
  const activeZones = currentFacility.zones;
  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'floorplans'), (snapshot) => {
      const plans = snapshot.docs.map(doc => doc.data());
      if (plans.length > 0 && plans[0].imageUrl) {
        setFloorplanUrl(plans[0].imageUrl);
      } else {
        setFloorplanUrl(null);
      }
    });
    return () => unsub();
  }, []);

  const handleLocateNow = () => {
     if (!searchQuery) return;
     const found = people.find(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()));
     if (found) {
        setSelectedPerson(found.id);
     }
  };

  // Real-time data from API
  const { tags, error, isLoading: feedIsLoading } = useGaoRealtime(2000);

  return (
    <div className="w-full flex flex-col lg:flex-row p-6 gap-6 max-w-7xl mx-auto">
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Live Facility Map</h2>
            <p className="text-slate-500 font-medium tracking-tight">Real-time personnel location and zone occupancy</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                <Building2 className="w-4 h-4 text-[#007BC4]" />
                <select 
                  value={activeFacilityId}
                  onChange={e => setActiveFacilityId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  {FACILITIES.map(fac => (
                    <option key={fac.id} value={fac.id}>{fac.name}</option>
                  ))}
                </select>
             </div>

             <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="pl-3 py-2 text-slate-400">
                   <Search className="w-4 h-4" />
                </div>
                <input 
                   type="text" 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleLocateNow()}
                   placeholder="Search ID/Name..."
                   className="pl-2 pr-3 py-2 text-sm outline-none w-36 sm:w-48 text-slate-700" 
                />
                <button 
                  onClick={handleLocateNow}
                  className="bg-slate-100 border-l border-slate-200 text-slate-700 px-3 hover:bg-slate-200 text-sm font-semibold transition"
                >
                  Locate Now
                </button>
             </div>
             <button
               onClick={() => setIsEmergencyMode(!isEmergencyMode)}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition ${isEmergencyMode ? 'bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700' : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'}`}
             >
                <AlertTriangle className="w-4 h-4" />
                {isEmergencyMode ? 'Exit Emergency Mode' : 'Evac & Muster'}
             </button>
          </div>
        </div>
        <div className={`flex-1 min-h-[560px] bg-white rounded-xl border ${isEmergencyMode ? 'border-rose-500 ring-2 ring-rose-200 shadow-rose-100' : 'border-slate-200'} shadow-sm p-4 relative flex flex-col transition-all duration-300`}>
           {isEmergencyMode && (
             <div className="absolute top-4 left-4 z-50 bg-rose-600 border border-rose-700 shadow-xl rounded-xl p-5 w-80 text-white animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 mb-3">
                   <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
                   <div>
                      <h3 className="font-bold text-base uppercase tracking-wider">Evacuation Validated</h3>
                      <p className="text-[10px] text-rose-200">System syncing muster terminals in real-time.</p>
                   </div>
                </div>
                <div className="space-y-3 text-sm font-medium bg-rose-800/40 rounded-lg p-3">
                   <div className="flex justify-between items-center pb-2 border-b border-rose-500/50">
                      <span className="text-rose-200 font-semibold tracking-wide">Expected Total</span>
                      <span className="font-bold text-lg">{people.length}</span>
                   </div>
                   <div className="flex justify-between items-center pb-2 border-b border-rose-500/50">
                      <span className="text-emerald-300 flex items-center gap-1.5"><UserCheck className="w-4 h-4"/> Safely Mustered</span>
                      <span className="font-black text-lg text-emerald-300">{Math.floor(people.length * 0.45)}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-white flex items-center gap-1.5 font-bold"><AlertTriangle className="w-4 h-4"/> Missing Persons</span>
                      <span className="font-black text-lg text-white animate-pulse">{Math.ceil(people.length * 0.55)}</span>
                   </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-rose-500">
                   <h4 className="text-[10px] uppercase font-bold text-rose-300 mb-2">Last Known Locations of Missing</h4>
                   <div className="space-y-2">
                       {/* Hardcoding some mock data based on real zones for visual richness */}
                      <div className="flex justify-between text-xs items-center bg-rose-800/40 p-1.5 rounded">
                         <span className="font-semibold text-rose-100">Engineering Lab</span>
                         <span className="text-white font-bold bg-rose-500 px-1.5 rounded">3</span>
                      </div>
                      <div className="flex justify-between text-xs items-center bg-rose-800/40 p-1.5 rounded">
                         <span className="font-semibold text-rose-100">Server Room</span>
                         <span className="text-white font-bold bg-rose-500 px-1.5 rounded">1</span>
                      </div>
                   </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 bg-white text-rose-700 rounded-lg py-2 font-bold text-xs uppercase hover:bg-rose-50 transition shadow-sm">
                    Print Evac List
                  </button>
                  <button className="flex-1 bg-rose-500 text-white border border-rose-400 rounded-lg py-2 font-bold text-xs uppercase hover:bg-rose-400 transition shadow-sm">
                    Broadcast PA
                  </button>
                </div>
             </div>
           )}
           {mainIsLoading ? (

             <div className="flex-1 flex items-center justify-center">
               <div className="flex flex-col items-center gap-4 animate-pulse">
                 <div className="w-12 h-12 rounded-full border-4 border-[#007BC4] border-t-transparent animate-spin"></div>
                 <div className="text-slate-500 font-medium">Syncing live locations...</div>
               </div>
             </div>
           ) : (
             <LiveFloorMap 
               people={people} 
               zones={activeZones} 
               highlightedPersonId={selectedPerson || highlightedPersonId} 
               initialFocusZone={focusZone} 
               floorplanUrl={floorplanUrl} 
             />
           )}
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
               {feedIsLoading && tags.length === 0 && (
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
               {!feedIsLoading && !error && tags.length === 0 && (
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
