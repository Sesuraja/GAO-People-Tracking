import React, { useState } from 'react';
import { Person } from '../lib/simulation';
import LiveFloorMap from './LiveFloorMap';

export default function LiveTrackingTab({ people, zones, highlightedPersonId }: { people: Person[], zones: Record<string, {x:number, y:number, width:number, height:number}>, highlightedPersonId?: string | null }) {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(highlightedPersonId || null);

  return (
    <div className="flex-1 flex flex-col p-6 gap-4 bg-slate-50 min-h-0 h-full">
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
  );
}
