import { useState, useEffect } from 'react';
import { gaoApi, RealtimeTag } from './gaoApi';

export type Zone = 'Entrance' | 'Office' | 'Meeting Room' | 'Server Room' | 'Cafeteria';
export type PresenceState = 'MOVING' | 'IDLE' | 'EXITED';

export interface Person {
  id: string;
  name: string;
  role: 'Employee' | 'Visitor' | 'Security';
  currentZone: string;
  presenceState: PresenceState;
  dwellTime: number; // in seconds
  x: number; // coordinates for the live map (0-100%)
  y: number;
  lastSeen: Date;
  trail: {x: number, y: number}[];
}

export interface AIAlert {
  id: string;
  type: 'security' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

const ZONES: Record<string, { x: number; y: number; width: number; height: number }> = {
  'Entrance': { x: 10, y: 80, width: 20, height: 15 },
  'Office': { x: 40, y: 40, width: 50, height: 30 },
  'Meeting Room': { x: 40, y: 10, width: 30, height: 20 },
  'Server Room': { x: 80, y: 10, width: 10, height: 20 },
  'Cafeteria': { x: 10, y: 10, width: 20, height: 40 },
  'Zone1': { x: 10, y: 80, width: 20, height: 15 }, // Fallback mappings for API zones
  'd6': { x: 40, y: 10, width: 30, height: 20 },
  'd8': { x: 10, y: 10, width: 20, height: 40 }
};

const INITIAL_PEOPLE: Person[] = [
  { id: 'EMP_1001', name: 'John Doe', role: 'Employee', currentZone: 'Office', presenceState: 'IDLE', dwellTime: 400, x: 50, y: 50, lastSeen: new Date(), trail: [] },
  { id: 'EMP_1002', name: 'Jane Smith', role: 'Employee', currentZone: 'Meeting Room', presenceState: 'IDLE', dwellTime: 600, x: 55, y: 20, lastSeen: new Date(), trail: [] },
  { id: 'VIS_001', name: 'Alice (Visitor)', role: 'Visitor', currentZone: 'Entrance', presenceState: 'MOVING', dwellTime: 20, x: 15, y: 85, lastSeen: new Date(), trail: [] },
  { id: 'EMP_1003', name: 'Bob Tech', role: 'Employee', currentZone: 'Server Room', presenceState: 'IDLE', dwellTime: 1200, x: 85, y: 15, lastSeen: new Date(), trail: [] },
  { id: 'EMP_1004', name: 'Sarah Connor', role: 'Security', currentZone: 'Office', presenceState: 'MOVING', dwellTime: 100, x: 70, y: 55, lastSeen: new Date(), trail: [] },
  { id: 'EMP_1005', name: 'James Wilson', role: 'Employee', currentZone: 'Cafeteria', presenceState: 'MOVING', dwellTime: 300, x: 20, y: 30, lastSeen: new Date(), trail: [] },
  { id: 'VIS_002', name: 'Mark (Contractor)', role: 'Visitor', currentZone: 'Meeting Room', presenceState: 'IDLE', dwellTime: 800, x: 50, y: 15, lastSeen: new Date(), trail: [] },
  { id: 'SEC_001', name: 'David (Patrol)', role: 'Security', currentZone: 'Entrance', presenceState: 'MOVING', dwellTime: 40, x: 12, y: 80, lastSeen: new Date(), trail: [] },
  { id: 'EMP_1006', name: 'Emily Chen', role: 'Employee', currentZone: 'Office', presenceState: 'IDLE', dwellTime: 2500, x: 60, y: 60, lastSeen: new Date(), trail: [] },
];

export function useSimulation() {
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [alerts, setAlerts] = useState<AIAlert[]>([
    { id: 'start', type: 'info', message: 'AI Intelligence engine initialized. Monitoring 5 active tags.', timestamp: new Date() }
  ]);

  useEffect(() => {
    let isMounted = true;

    const tick = async () => {
      let tags: RealtimeTag[] = [];
      try {
        tags = await gaoApi.getTagsInRealtime();
      } catch (err) {
        console.error('Failed to fetch real-time tags from GAO API', err);
      }

      if (!isMounted) return;

      const latestTagInfo: Record<string, RealtimeTag> = {};
      tags.forEach(t => {
         if (!latestTagInfo[t.TagID]) {
             latestTagInfo[t.TagID] = t; // Since data is descending, first is newest
         }
      });

      setPeople((prev) => {
        const nextPeople = [...prev];
        let newAlerts: AIAlert[] = [];

        // 1. Process API data
        Object.values(latestTagInfo).forEach(tag => {
           let p = nextPeople.find(x => x.id === tag.TagID);
           let targetZone = tag.Location;
           
           if (!ZONES[targetZone]) {
              // If unknown zone, we just pick Entrance
              targetZone = 'Entrance'; 
           }

           if (!p) {
               // New tag detected
               p = {
                 id: tag.TagID,
                 name: `Tag ${tag.TagID.substring(0, 6).toUpperCase()}`,
                 role: 'Visitor', // Default to visitor if unknown mapping
                 currentZone: targetZone,
                 presenceState: 'IDLE',
                 dwellTime: 0,
                 x: Math.min(100, Math.max(0, ZONES[targetZone].x + Math.random() * ZONES[targetZone].width)),
                 y: Math.min(100, Math.max(0, ZONES[targetZone].y + Math.random() * ZONES[targetZone].height)),
                 lastSeen: new Date(tag.Timestamp + "Z"),
                 trail: []
               };
               nextPeople.push(p);

               newAlerts.push({
                   id: `alert_new_${Date.now()}_${tag.TagID.substr(0,4)}`,
                   type: 'info',
                   message: `System found new tag: ${tag.TagID.substring(0, 8)} at ${tag.Location}`,
                   timestamp: new Date()
               });
           } else {
               p.lastSeen = new Date(tag.Timestamp + "Z");
               if (p.currentZone !== targetZone) {
                   p.currentZone = targetZone;
                   p.dwellTime = 0;
                   p.presenceState = 'MOVING';
                   
                   if (p.role === 'Visitor' && targetZone === 'Server Room') {
                      newAlerts.push({
                        id: `alert_sec_${Date.now()}_${p.id}`,
                        type: 'security',
                        message: `UNAUTHORIZED ACCESS: ${p.name} entered Server Room via API`,
                        timestamp: new Date()
                      });
                   }
               }
           }
        });

        // 2. Perform local simulation
        nextPeople.forEach(p => {
          p.dwellTime += 2; 
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 15) p.trail.shift();

          // Only apply random zone jumps to local mocked data that don't have api updates
          if (!latestTagInfo[p.id]) {
             if (Math.random() < 0.05) { 
               const builtinZones = ['Entrance', 'Office', 'Meeting Room', 'Server Room', 'Cafeteria'];
               const newZone = builtinZones[Math.floor(Math.random() * builtinZones.length)];
               
               if (p.currentZone !== newZone) {
                 p.currentZone = newZone;
                 p.dwellTime = 0;
                 p.presenceState = 'MOVING';
                 
                 if (p.role === 'Visitor' && newZone === 'Server Room') {
                   newAlerts.push({
                     id: `alert_sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                     type: 'security',
                     message: `UNAUTHORIZED ACCESS: ${p.name} entered Server Room`,
                     timestamp: new Date()
                   });
                 }
               }
             }
          }

          // Move randomly within the current assigned zone
          const zoneRect = ZONES[p.currentZone] || ZONES['Entrance'];
          const targetX = zoneRect.x + Math.random() * zoneRect.width;
          const targetY = zoneRect.y + Math.random() * zoneRect.height;
          
          p.x += (targetX - p.x) * 0.1;
          p.y += (targetY - p.y) * 0.1;

          if (Math.abs(targetX - p.x) < 2 && Math.abs(targetY - p.y) < 2) {
             p.presenceState = 'IDLE';
          } else {
             p.presenceState = 'MOVING';
          }

          if (p.currentZone === 'Server Room' && p.dwellTime > 1205 && p.dwellTime < 1210) {
             newAlerts.push({
               id: `alert_time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
               type: 'warning',
               message: `LOITERING DETECTED: ${p.name} in Server Room for over 20 minutes`,
               timestamp: new Date()
             });
          }
        });

        if (newAlerts.length > 0) {
           setAlerts(prevA => [...newAlerts, ...prevA].slice(0, 15));
        }

        return nextPeople;
      });
    };

    // Run interval
    const interval = setInterval(tick, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { people, alerts, ZONES };
}
