import { useState, useEffect, useRef } from 'react';
import { gaoApi, RealtimeTag } from './gaoApi';
import { db, auth } from './firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, doc, serverTimestamp } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type Zone = 'Entrance' | 'Office' | 'Meeting Room' | 'Server Room' | 'Cafeteria';
export type PresenceState = 'MOVING' | 'IDLE' | 'EXITED';

export interface Person {
  id: string;
  name: string;
  role: 'Employee' | 'Visitor' | 'Security' | string;
  currentZone: string;
  presenceState: PresenceState;
  dwellTime: number; // in seconds
  x: number; // coordinates for the live map (0-100%)
  y: number;
  lastSeen: Date;
  trail: {x: number, y: number}[];
  activityInsights?: { activity: string; confidence: number };
}

export interface AIAlert {
  id?: string;
  type: 'security' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved?: boolean;
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

export function useSimulation(mode: 'real' | 'demo' | null) {
  const [people, setPeople] = useState<Person[]>([]);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic thresholds
  const loiteringThresholdRef = useRef(300);
  const idleAlertThresholdRef = useRef(3600);
  const occupancyLimitsRef = useRef<Record<string, number>>({});
  const alertedZonesRef = useRef<Record<string, number>>({});
  
  const registeredPeopleRef = useRef<Record<string, {name: string, role: string}>>({});

  // Helper to add fake alerts in demo mode
  const addDemoAlert = (type: 'security' | 'warning' | 'info', message: string) => {
     const newAlert: AIAlert = { id: Math.random().toString(), type, message, timestamp: new Date() };
     setAlerts(prev => [newAlert, ...prev].slice(0, 15));
     
     // In real mode, persist to db instead of just local state (although simulation runs both sometimes)
     addDoc(collection(db, 'alerts'), {
        type,
        message,
        timestamp: serverTimestamp(),
        resolved: false
     }).catch(() => {}); // handle silent failure
  };

const [dynamicZones, setDynamicZones] = useState<Record<string, { x: number; y: number; width: number; height: number }>>(ZONES);

  useEffect(() => {
    // Listen to settings changes globally
    const settingsRef = doc(db, 'settings', 'global');
    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.loiteringThreshold !== undefined) loiteringThresholdRef.current = data.loiteringThreshold;
        if (data.idleAlertThreshold !== undefined) idleAlertThresholdRef.current = data.idleAlertThreshold;
        if (data.occupancyThresholds) occupancyLimitsRef.current = data.occupancyThresholds;
      }
    });

    // Listen to real alerts from the database
    const alertQuery = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeAlerts = onSnapshot(alertQuery, (snapshot) => {
       const fetchedAlerts: AIAlert[] = [];
       snapshot.forEach(doc => {
          const data = doc.data();
          fetchedAlerts.push({
             id: doc.id,
             type: data.type,
             message: data.message,
             timestamp: data.timestamp?.toDate() || new Date(),
             resolved: data.resolved
          });
       });
       setAlerts(fetchedAlerts);
    });
    
    // Listen to floor plans to generate zones based on devices placed
    const floorplansQuery = query(collection(db, 'floorplans'));
    const unsubscribeFloorplans = onSnapshot(floorplansQuery, (snapshot) => {
       const newZones: Record<string, {x:number, y:number, width:number, height:number}> = { ...ZONES };
       snapshot.forEach(doc => {
          const plan = doc.data();
          if (plan.devices && Array.isArray(plan.devices)) {
             plan.devices.forEach((dev: any) => {
                newZones[dev.name] = {
                   x: dev.x - 10, // draw zone around center
                   y: dev.y - 10,
                   width: 20,
                   height: 20
                };
             });
          }
       });
       setDynamicZones(newZones);
    });
    
    const registeredQuery = query(collection(db, 'registered_people'));
    const unsubscribeRegistered = onSnapshot(registeredQuery, (snapshot) => {
       const mapped: Record<string, {name: string, role: string}> = {};
       snapshot.forEach(doc => {
          mapped[doc.id] = { name: doc.data().name, role: doc.data().role || 'Employee' };
       });
       registeredPeopleRef.current = mapped;
    });
    
    return () => {
       unsubscribeSettings();
       unsubscribeAlerts();
       unsubscribeFloorplans();
       unsubscribeRegistered();
    };
  }, []);

  useEffect(() => {
    if (!mode) return;
    
    let isMounted = true;
    let unsubscribeAlerts = () => {};
    let unsubscribeTags = () => {};
    let interval: NodeJS.Timeout;

    if (mode === 'real') {
       setIsLoading(false);
       
       // Listen to Firebase alerts
       const alertsQuery = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'), limit(15));
       unsubscribeAlerts = onSnapshot(alertsQuery, (snapshot) => {
         const dbAlerts = snapshot.docs.map(doc => ({
           id: doc.id,
           ...doc.data(),
           timestamp: doc.data().timestamp?.toDate() || new Date()
         })) as AIAlert[];
         setAlerts(dbAlerts);
       }, (error) => {
          handleFirestoreError(error, OperationType.GET, 'alerts');
       });

       const syncRealtime = async () => {
         if (!isMounted) return;
         try {
           const liveTags = await gaoApi.getTagsInRealtime();
           
           const latestTagInfo: Record<string, any> = {};
           liveTags.forEach(tag => {
              if (tag.TagID) {
                latestTagInfo[tag.TagID] = tag;
              }
           });

           setPeople((prev) => {
             const nextPeople = [...prev];

             if (Object.keys(latestTagInfo).length === 0) return nextPeople;

             Object.values(latestTagInfo).forEach(tag => {
                let p = nextPeople.find(x => x.id === tag.TagID);
                let targetZone = tag.Location;
                
                if (!dynamicZones[targetZone]) targetZone = 'Entrance'; 
                
                const registered = registeredPeopleRef.current[tag.TagID];
                const pName = registered ? registered.name : `Tag ${tag.TagID.substring(0, 6).toUpperCase()}`;
                const pRole = registered ? registered.role : 'Visitor';

                if (!p) {
                    p = {
                      id: tag.TagID,
                      name: pName,
                      role: pRole,
                      currentZone: targetZone,
                      presenceState: 'IDLE',
                      dwellTime: 0,
                      x: dynamicZones[targetZone].x + dynamicZones[targetZone].width / 2,
                      y: dynamicZones[targetZone].y + dynamicZones[targetZone].height / 2,
                      lastSeen: new Date(tag.Timestamp + "Z"),
                      trail: []
                    };
                    nextPeople.push(p);

                    addDoc(collection(db, 'alerts'), {
                        type: 'info',
                        message: `System tracked new tag: ${tag.TagID.substring(0, 8)} at ${tag.Location}`,
                        timestamp: new Date()
                    }).catch(error => handleFirestoreError(error, OperationType.WRITE, 'alerts'));

                    // Store real history log
                    addDoc(collection(db, 'tag_history'), {
                        TagID: p.id,
                        name: p.name,
                        role: p.role,
                        fromZone: null,
                        toZone: targetZone,
                        timestamp: new Date()
                    }).catch(() => {});

                } else {
                    p.lastSeen = new Date(tag.Timestamp + "Z");
                    p.name = pName;
                    p.role = pRole;
                    if (p.currentZone !== targetZone) {
                        const oldZone = p.currentZone;
                        p.currentZone = targetZone;
                        p.dwellTime = 0;
                        p.presenceState = 'MOVING';
                        
                        // Move avatar to center of new zone
                        p.x = dynamicZones[targetZone].x + dynamicZones[targetZone].width / 2;
                        p.y = dynamicZones[targetZone].y + dynamicZones[targetZone].height / 2;
                        
                        // Store real history log
                        addDoc(collection(db, 'tag_history'), {
                            TagID: p.id,
                            name: p.name,
                            role: p.role,
                            fromZone: oldZone,
                            toZone: targetZone,
                            timestamp: new Date()
                        }).catch(() => {});
                        
                        if (p.role === 'Visitor' && targetZone === 'Server Room') {
                           addDoc(collection(db, 'alerts'), {
                             type: 'security',
                             message: `UNAUTHORIZED ACCESS: ${p.name} entered Server Room`,
                             timestamp: new Date()
                           }).catch(error => handleFirestoreError(error, OperationType.WRITE, 'alerts'));
                        }
                    }
                }
             });

             // Calculate occupancy bounds 
             const currentOccupancy: Record<string, number> = {};
             nextPeople.forEach(p => {
                const registered = registeredPeopleRef.current[p.id];
                if (registered) {
                   p.name = registered.name;
                   p.role = registered.role;
                }
                currentOccupancy[p.currentZone] = (currentOccupancy[p.currentZone] || 0) + 1;
             });

             Object.entries(currentOccupancy).forEach(([zone, count]) => {
                const limit = occupancyLimitsRef.current[zone];
                if (limit && count > limit) {
                   const now = Date.now();
                   const lastAlerted = alertedZonesRef.current[zone] || 0;
                   if (now - lastAlerted > 60000) { // Alert max once per minute
                      alertedZonesRef.current[zone] = now;
                      addDoc(collection(db, 'alerts'), {
                        type: 'warning',
                        message: `OVERCAPACITY: ${zone} exceeded max occupancy of ${limit}. Currently ${count}.`,
                        timestamp: new Date()
                      }).catch(error => handleFirestoreError(error, OperationType.WRITE, 'alerts'));
                   }
                }
             });

             // Add dwell time logic and minor visual wander so they don't overlap completely
             nextPeople.forEach(p => {
               p.dwellTime += 2; 

               p.trail = p.trail || [];
               p.trail.push({ x: p.x, y: p.y });
               if (p.trail.length > 15) p.trail.shift();

               const zoneRect = dynamicZones[p.currentZone] || dynamicZones['Entrance'] || { x: 50, y: 50, width: 2, height: 2 };
               const targetX = zoneRect.x + Math.random() * zoneRect.width;
               const targetY = zoneRect.y + Math.random() * zoneRect.height;
               
               p.x += (targetX - p.x) * 0.1;
               p.y += (targetY - p.y) * 0.1;

               if (Math.abs(targetX - p.x) < 2 && Math.abs(targetY - p.y) < 2) {
                  p.presenceState = 'IDLE';
               } else {
                  p.presenceState = 'MOVING';
               }

               const loiterLimit = loiteringThresholdRef.current;
               const idleLimit = idleAlertThresholdRef.current;
               
               if (p.currentZone === 'Server Room' && p.dwellTime > loiterLimit && p.dwellTime < loiterLimit + 5) {
                  addDoc(collection(db, 'alerts'), {
                    type: 'warning',
                    message: `LOITERING DETECTED: ${p.name} in Server Room for over ${Math.floor(loiterLimit / 60)} minutes`,
                    timestamp: new Date()
                  }).catch(error => handleFirestoreError(error, OperationType.WRITE, 'alerts'));
               }

               if (p.presenceState === 'IDLE' && p.dwellTime > idleLimit && p.dwellTime < idleLimit + 5) {
                  addDoc(collection(db, 'alerts'), {
                    type: 'info',
                    message: `IDLE TAG: ${p.name} has been stationary for over ${Math.floor(idleLimit / 60)} minutes in ${p.currentZone}`,
                    timestamp: new Date()
                  }).catch(error => handleFirestoreError(error, OperationType.WRITE, 'alerts'));
               }
             });

             return nextPeople;
           });
         } catch (e) {
           console.error('Failed to sync realtime tags', e);
         }
       };

       interval = setInterval(syncRealtime, 2000);
    } else if (mode === 'demo') {
       setIsLoading(false);
       
       // Populate initial fake people map
       const initialPeople: Person[] = [
          { id: '1', name: 'Alice Smith', role: 'Employee', currentZone: 'Office', presenceState: 'IDLE', dwellTime: 0, x: 45, y: 50, lastSeen: new Date(), trail: [] },
          { id: '2', name: 'Bob Johnson', role: 'Visitor', currentZone: 'Entrance', presenceState: 'MOVING', dwellTime: 0, x: 15, y: 85, lastSeen: new Date(), trail: [] },
          { id: '3', name: 'Charlie Davis', role: 'Security', currentZone: 'Meeting Room', presenceState: 'IDLE', dwellTime: 0, x: 50, y: 15, lastSeen: new Date(), trail: [] },
          { id: '4', name: 'Diana Prince', role: 'Employee', currentZone: 'Cafeteria', presenceState: 'MOVING', dwellTime: 0, x: 15, y: 30, lastSeen: new Date(), trail: [] },
       ];
       setPeople(initialPeople);

       // Demo tick running local simulation logic without firebase
       const demoTick = () => {
         if (!isMounted) return;
         setPeople((prev) => {
           const nextPeople = [...prev];
           const zoneKeys = Object.keys(dynamicZones);
           
           // Calculate occupancy bounds 
           const currentOccupancy: Record<string, number> = {};
           nextPeople.forEach(p => {
              // Mock: if there's an override in registeredPeople, use it
              const registered = registeredPeopleRef.current[p.id];
              if (registered) {
                 p.name = registered.name;
                 p.role = registered.role;
              }
              currentOccupancy[p.currentZone] = (currentOccupancy[p.currentZone] || 0) + 1;
           });

           Object.entries(currentOccupancy).forEach(([zone, count]) => {
              const limit = occupancyLimitsRef.current[zone];
              if (limit && count > limit) {
                 const now = Date.now();
                 const lastAlerted = alertedZonesRef.current[zone] || 0;
                 if (now - lastAlerted > 60000) { // Alert max once per minute
                    alertedZonesRef.current[zone] = now;
                    addDemoAlert('warning', `OVERCAPACITY: ${zone} exceeded max occupancy of ${limit}. Currently ${count}.`);
                 }
              }
           });

           nextPeople.forEach(p => {
             p.dwellTime += 2; 

             p.trail = p.trail || [];
             p.trail.push({ x: p.x, y: p.y });
             if (p.trail.length > 25) p.trail.shift();

             // Random zone hopping simulation
             if (Math.random() < 0.05) {
                const oldZone = p.currentZone;
                const newZone = zoneKeys[Math.floor(Math.random() * zoneKeys.length)] || 'Entrance';
                if (oldZone !== newZone) {
                   p.currentZone = newZone;
                   p.dwellTime = 0;
                   if (p.role === 'Visitor' && newZone === 'Server Room') {
                      addDemoAlert('security', `UNAUTHORIZED ACCESS: ${p.name} entered Server Room`);
                   } else if (Math.random() < 0.2) {
                      addDemoAlert('info', `${p.name} moved from ${oldZone} to ${newZone}`);
                   }
                }
             }

             const zoneRect = dynamicZones[p.currentZone] || dynamicZones['Entrance'] || { x: 50, y: 50, width: 2, height: 2 };
             const targetX = zoneRect.x + 2 + Math.random() * (zoneRect.width - 4);
             const targetY = zoneRect.y + 2 + Math.random() * (zoneRect.height - 4);
             
             p.x += (targetX - p.x) * 0.1;
             p.y += (targetY - p.y) * 0.1;

             if (Math.abs(targetX - p.x) < 2 && Math.abs(targetY - p.y) < 2) {
                p.presenceState = 'IDLE';
             } else {
                p.presenceState = 'MOVING';
             }

             const loiterLimit = loiteringThresholdRef.current;
             const idleLimit = idleAlertThresholdRef.current;
             
             if (p.currentZone === 'Server Room' && p.dwellTime > loiterLimit && p.dwellTime < loiterLimit + 5) {
                addDemoAlert('warning', `LOITERING DETECTED: ${p.name} in Server Room for over ${Math.floor(loiterLimit / 60)} minutes`);
             }
             
             if (p.presenceState === 'IDLE' && p.dwellTime > idleLimit && p.dwellTime < idleLimit + 5) {
                addDemoAlert('info', `IDLE TAG: ${p.name} has been stationary for over ${Math.floor(idleLimit / 60)} minutes in ${p.currentZone}`);
             }
           });

           return nextPeople;
         });
       };
       interval = setInterval(demoTick, 2000);
    }

    return () => {
      isMounted = false;
      unsubscribeAlerts();
      unsubscribeTags();
      if (interval) clearInterval(interval);
    };
  }, [mode]);

  return { people, alerts, ZONES: dynamicZones, isLoading };
}

