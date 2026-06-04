import { useState, useEffect } from 'react';
import { gaoApi, RealtimeTag } from './gaoApi';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

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
  id?: string;
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
  'Zone1': { x: 10, y: 80, width: 20, height: 15 },
  'd6': { x: 40, y: 10, width: 30, height: 20 },
  'd8': { x: 10, y: 10, width: 20, height: 40 }
};

export function useSimulation() {
  const [people, setPeople] = useState<Person[]>([]);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);

  useEffect(() => {
    // Listen to Firebase alerts
    const alertsQuery = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'), limit(15));
    const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      const dbAlerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as AIAlert[];
      setAlerts(dbAlerts);
    }, (error) => {
       console.error('Firestore Error sync alerts:', error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Listen to live_tags from Firestore instead of direct API polling!
    const tagsQuery = query(collection(db, 'live_tags'));
    const unsubscribeTags = onSnapshot(tagsQuery, (snapshot) => {
      if (!isMounted) return;

      const latestTagInfo: Record<string, any> = {};
      snapshot.forEach(doc => {
         const data = doc.data();
         if (data.TagID) {
           latestTagInfo[data.TagID] = data;
         }
      });

      setPeople((prev) => {
        const nextPeople = [...prev];

        if (Object.keys(latestTagInfo).length === 0) return nextPeople;

        Object.values(latestTagInfo).forEach(tag => {
           let p = nextPeople.find(x => x.id === tag.TagID);
           let targetZone = tag.Location;
           
           if (!ZONES[targetZone]) targetZone = 'Entrance'; 

           if (!p) {
               p = {
                 id: tag.TagID,
                 name: `Tag ${tag.TagID.substring(0, 6).toUpperCase()}`,
                 role: 'Visitor',
                 currentZone: targetZone,
                 presenceState: 'IDLE',
                 dwellTime: 0,
                 x: ZONES[targetZone].x + ZONES[targetZone].width / 2,
                 y: ZONES[targetZone].y + ZONES[targetZone].height / 2,
                 lastSeen: new Date(tag.Timestamp + "Z"),
                 trail: []
               };
               nextPeople.push(p);

               addDoc(collection(db, 'alerts'), {
                   type: 'info',
                   message: `System tracked new tag: ${tag.TagID.substring(0, 8)} at ${tag.Location}`,
                   timestamp: new Date()
               }).catch(e => console.error("Firebase write error:", e));

           } else {
               p.lastSeen = new Date(tag.Timestamp + "Z");
               if (p.currentZone !== targetZone) {
                   p.currentZone = targetZone;
                   p.dwellTime = 0;
                   p.presenceState = 'MOVING';
                   
                   // Move avatar to center of new zone
                   p.x = ZONES[targetZone].x + ZONES[targetZone].width / 2;
                   p.y = ZONES[targetZone].y + ZONES[targetZone].height / 2;
                   
                   if (p.role === 'Visitor' && targetZone === 'Server Room') {
                      addDoc(collection(db, 'alerts'), {
                        type: 'security',
                        message: `UNAUTHORIZED ACCESS: ${p.name} entered Server Room`,
                        timestamp: new Date()
                      }).catch(console.error);
                   }
               }
           }
        });

        return nextPeople;
      });
    }, (error) => {
       console.error("Firestore Error sync tags:", error);
    });

    const tick = () => {
      if (!isMounted) return;
      setPeople((prev) => {
        const nextPeople = [...prev];
        // Add dwell time logic and minor visual wander so they don't overlap completely
        nextPeople.forEach(p => {
          p.dwellTime += 2; 

          p.trail = p.trail || [];
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 15) p.trail.shift();

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
             addDoc(collection(db, 'alerts'), {
               type: 'warning',
               message: `LOITERING DETECTED: ${p.name} in Server Room for over 20 minutes`,
               timestamp: new Date()
             }).catch(console.error);
          }
        });

        return nextPeople;
      });
    };

    const interval = setInterval(tick, 2000);
    return () => {
      isMounted = false;
      unsubscribeTags();
      clearInterval(interval);
    };
  }, []);

  return { people, alerts, ZONES };
}

