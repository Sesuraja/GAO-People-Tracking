// Pure MongoDB client stub database mapping with built-in localStorage simulation for Demo Sandbox Mode

// Helper to check if MongoDB is active/configured
export function isMongoActive(): boolean {
  return true;
}

// Custom DB indicator
export const db = {}; // Keeps type compatibility

export function serverTimestamp() {
  return new Date().toISOString();
}

export function collection(dbInstance: any, colName: string): any {
  return { type: 'collection', path: colName };
}

export function doc(dbInstanceOrColRef: any, colNameOrId: string, maybeId?: string): any {
  if (typeof dbInstanceOrColRef === 'object' && dbInstanceOrColRef.type === 'collection') {
    return { type: 'doc', col: dbInstanceOrColRef.path, id: colNameOrId };
  }
  return { type: 'doc', col: dbInstanceOrColRef, id: colNameOrId };
}

export function query(colRef: any, ...constraints: any[]): any {
  return colRef;
}

export function orderBy(field: string, direction?: 'asc' | 'desc') {
  return { type: 'orderBy', field, direction: direction || 'asc' };
}

export function limit(value: number) {
  return { type: 'limit', value };
}

// Convert JSON objects to firestore-like document format
function createMockDoc(data: any) {
  if (!data) return { id: 'unknown', exists: () => false, data: () => null };
  const idValue = data.id || data._id || 'unknown';
  
  // Wrap date and timestamp fields to provide a Firestore-compatible .toDate() method
  const wrappedData = { ...data };
  Object.keys(wrappedData).forEach(key => {
    const val = wrappedData[key];
    if (val && typeof val === 'string' && (key.toLowerCase().includes('time') || key.toLowerCase().includes('date') || key === 'createdAt' || key === 'updatedAt' || key === 'timestamp')) {
      const dateObj = new Date(val);
      if (!isNaN(dateObj.getTime())) {
        wrappedData[key] = {
          toDate: () => dateObj,
          seconds: Math.floor(dateObj.getTime() / 1000),
          nanoseconds: (dateObj.getTime() % 1000) * 1e6,
          toString: () => val,
          valueOf: () => dateObj.getTime(),
          [Symbol.toPrimitive](hint: string) {
            if (hint === 'number') return dateObj.getTime();
            return val;
          }
        };
      }
    }
  });

  return {
    id: idValue,
    ref: { id: idValue },
    data: () => wrappedData,
    exists: () => true
  };
}

function createMockSnapshot(docsData: any[]) {
  const mockDocs = docsData.map(d => createMockDoc(d));
  return {
    docs: mockDocs,
    empty: mockDocs.length === 0,
    size: mockDocs.length,
    forEach: (callback: (d: any) => void) => {
      mockDocs.forEach(callback);
    }
  };
}

// --- LOCAL STORAGE SANDBOX FOR DEMO MODE ---
const DEMO_PRESETS: Record<string, any[]> = {
  floorplans: [
    {
      id: "demo_plan_1",
      name: "GAO HQ 1st Floor",
      building: "GAO Building A",
      imageUrl: "/src/assets/images/facility_floorplan_2d_1780726630123.png",
      devices: [
        { id: "dev_1", name: "Server Room RFID", mac: "00:1A:2B:3C:4D:5E", x: 85, y: 20 },
        { id: "dev_2", name: "Meeting Room RFID", mac: "00:1A:2B:3C:4D:5F", x: 55, y: 20 },
        { id: "dev_3", name: "Cafeteria RFID", mac: "00:1A:2B:3C:4D:6A", x: 20, y: 30 },
        { id: "dev_4", name: "Office RFID", mac: "00:1A:2B:3C:4D:6B", x: 65, y: 55 }
      ]
    }
  ],
  devices: [
    { id: "dev_1", name: "Server Room RFID", mac: "00:1A:2B:3C:4D:5E", status: "Online", location: "Server Room", ip: "192.168.1.101" },
    { id: "dev_2", name: "Meeting Room RFID", mac: "00:1A:2B:3C:4D:5F", status: "Online", location: "Meeting Room", ip: "192.168.1.102" },
    { id: "dev_3", name: "Cafeteria RFID", mac: "00:1A:2B:3C:4D:6A", status: "Online", location: "Cafeteria", ip: "192.168.1.103" },
    { id: "dev_4", name: "Office RFID", mac: "00:1A:2B:3C:4D:6B", status: "Online", location: "Office", ip: "192.168.1.104" }
  ],
  registered_people: [
    { id: "1", name: "Alice Smith", role: "Employee", department: "Engineering" },
    { id: "2", name: "Bob Johnson", role: "Visitor", department: "Product Guest" },
    { id: "3", name: "Charlie Davis", role: "Security", department: "Operations" },
    { id: "4", name: "Diana Prince", role: "Employee", department: "Executive" }
  ],
  visitors: [
    {
      id: "VIS-BOB",
      name: "Bob Johnson",
      company: "Fictional Corp",
      host: "Diana Prince",
      status: "Active",
      time: "Arrived 10:15 AM",
      tag: "2",
      email: "bob@fictional.com",
      location: "Office",
      duration: "1h 45m",
      path: ["Entrance", "Office"],
      arrivalTime: Date.now() - 3600 * 1000 * 2
    }
  ],
  settings: [
    {
      id: "global",
      loiteringThreshold: 120,
      idleAlertThreshold: 300,
      occupancyThresholds: {
        "Server Room": 2,
        "Meeting Room": 4,
        "Cafeteria": 8,
        "Office": 10
      }
    }
  ],
  incidents: [
    {
      id: "inc_1",
      type: "Unauthorized Entry",
      zone: "Server Room",
      timestamp: "2026-06-10T12:00:00Z",
      status: "Investigating",
      person: "Bob Johnson",
      severity: "High",
      description: "Visitor entered Server Room without escort."
    }
  ],
  alerts: [
    { id: "alert_1", type: "warning", message: "OVERCAPACITY: Server Room exceeded max occupancy of 2. Currently 3.", timestamp: "2026-06-10T11:10:00Z", resolved: false },
    { id: "alert_2", type: "security", message: "UNAUTHORIZED ACCESS: Bob Johnson entered Server Room", timestamp: "2026-06-10T11:00:00Z", resolved: false }
  ],
  ai_recommendations: [
    {
       id: "rec_1",
       title: "Optimizing HVAC Scheduling",
       category: "energy",
       content: "HVAC usage in Office Zone B remains active outside official hours.",
       roi: "$540/mo",
       appliedAt: "2026-06-10T11:00:00Z"
    }
  ],
  tag_history: [
    { id: "hist_1", TagID: "1", name: "Alice Smith", role: "Employee", fromZone: "Entrance", toZone: "Office", timestamp: "2026-06-10T12:00:00Z" },
    { id: "hist_2", TagID: "2", name: "Bob Johnson", role: "Visitor", fromZone: "Entrance", toZone: "Office", timestamp: "2026-06-10T12:05:00Z" }
  ]
};

function getDemoCollection(colName: string): any[] {
  const key = `gao_demo_db_${colName}`;
  const val = localStorage.getItem(key);
  if (val) {
    try { return JSON.parse(val); } catch (e) {}
  }
  const preset = DEMO_PRESETS[colName] || [];
  localStorage.setItem(key, JSON.stringify(preset));
  return preset;
}

function saveDemoCollection(colName: string, data: any[]): void {
  const key = `gao_demo_db_${colName}`;
  localStorage.setItem(key, JSON.stringify(data));
  // Dispatches a local event so any onSnapshot listener updates immediately
  window.dispatchEvent(new CustomEvent('gao_demo_db_update', { detail: { collection: colName } }));
}

// --- STANDARD EXPORTS INTERCEPTED BY APPMODE ---

export async function setDoc(docRef: any, data: any, options?: any): Promise<void> {
  const isDemo = localStorage.getItem('gao_app_mode') === 'demo';
  const colName = docRef.col;
  const docId = docRef.id;

  if (isDemo) {
    const list = getDemoCollection(colName);
    const existingIndex = list.findIndex(x => x.id === docId);
    if (existingIndex > -1) {
      if (options?.merge) {
        list[existingIndex] = { ...list[existingIndex], ...data };
      } else {
        list[existingIndex] = { id: docId, ...data };
      }
    } else {
      list.push({ id: docId, ...data });
    }
    saveDemoCollection(colName, list);
    return;
  }

  const response = await fetch(`/api/mongodb/${colName}/${docId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error(`Failed to write to MongoDB: ${response.statusText}`);
  }
}

export async function addDoc(colRef: any, data: any): Promise<any> {
  const isDemo = localStorage.getItem('gao_app_mode') === 'demo';
  const colName = colRef.path;

  if (isDemo) {
    const list = getDemoCollection(colName);
    const newId = data.id || Math.random().toString(36).substring(2, 11);
    const newDoc = { id: newId, ...data };
    list.push(newDoc);
    saveDemoCollection(colName, list);
    return { id: newId, ...createMockDoc(newDoc) };
  }

  const response = await fetch(`/api/mongodb/${colName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error(`Failed to insert into MongoDB: ${response.statusText}`);
  }
  const result = await response.json();
  return { id: result.doc.id, ...createMockDoc(result.doc) };
}

export async function getDoc(docRef: any): Promise<any> {
  const isDemo = localStorage.getItem('gao_app_mode') === 'demo';
  const colName = docRef.col;
  const docId = docRef.id;

  if (isDemo) {
    const list = getDemoCollection(colName);
    const hit = list.find(x => x.id === docId);
    return createMockDoc(hit || null);
  }

  try {
    const response = await fetch(`/api/mongodb/${colName}/${docId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch doc from MongoDB: ${response.statusText}`);
    }
    const result = await response.json();
    return createMockDoc(result.doc);
  } catch (err) {
    console.error('MongoDB getDoc Error:', err);
    return { id: docId, exists: () => false, data: () => null };
  }
}

export async function getDocs(queryRef: any): Promise<any> {
  const isDemo = localStorage.getItem('gao_app_mode') === 'demo';
  const colName = queryRef.path;

  if (isDemo) {
    const list = getDemoCollection(colName);
    return createMockSnapshot(list);
  }

  try {
    const response = await fetch(`/api/mongodb/${colName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch collection ${colName} from MongoDB`);
    }
    const result = await response.json();
    return createMockSnapshot(result.data || []);
  } catch (err) {
    console.error('MongoDB getDocs Error:', err);
    return createMockSnapshot([]);
  }
}

export async function updateDoc(docRef: any, data: any): Promise<void> {
  return setDoc(docRef, data, { merge: true });
}

export async function deleteDoc(docRef: any): Promise<void> {
  const isDemo = localStorage.getItem('gao_app_mode') === 'demo';
  const colName = docRef.col;
  const docId = docRef.id;

  if (isDemo) {
    const list = getDemoCollection(colName);
    const filtered = list.filter(x => x.id !== docId);
    saveDemoCollection(colName, filtered);
    return;
  }

  const response = await fetch(`/api/mongodb/${colName}/${docId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(`Failed to delete document from MongoDB: ${response.statusText}`);
  }
}

export async function getCountFromServer(queryRef: any): Promise<any> {
  const isDemo = localStorage.getItem('gao_app_mode') === 'demo';
  const colName = queryRef.path;

  if (isDemo) {
    const list = getDemoCollection(colName);
    return {
      data: () => ({ count: list.length })
    };
  }

  try {
    const response = await fetch(`/api/mongodb/${colName}`);
    if (!response.ok) throw new Error();
    const result = await response.json();
    const count = (result.data || []).length;
    return {
      data: () => ({ count })
    };
  } catch (err) {
    return {
      data: () => ({ count: 0 })
    };
  }
}

export function onSnapshot(ref: any, callback: (snapshot: any) => void, errorCallback?: (error: any) => void): () => void {
  const isDemo = localStorage.getItem('gao_app_mode') === 'demo';
  let active = true;
  const colName = ref.col || ref.path;
  const isDoc = !!ref.col;
  const docId = ref.id;

  if (isDemo) {
    const handleUpdate = () => {
      if (!active) return;
      const list = getDemoCollection(colName);
      if (isDoc) {
        const hit = list.find(x => x.id === docId);
        callback(createMockDoc(hit || null));
      } else {
        callback(createMockSnapshot(list));
      }
    };

    handleUpdate();

    // Custom browser updater event listener for instant responsiveness
    window.addEventListener('gao_demo_db_update', handleUpdate as any);

    // Dynamic state fluctuation simulation interval
    const interval = setInterval(handleUpdate, 2500);

    return () => {
      active = false;
      window.removeEventListener('gao_demo_db_update', handleUpdate as any);
      clearInterval(interval);
    };
  }

  const poll = async () => {
    if (!active) return;
    try {
      if (isDoc) {
        const response = await fetch(`/api/mongodb/${colName}/${docId}`);
        if (response.ok && active) {
          const result = await response.json();
          callback(createMockDoc(result.doc));
        }
      } else {
        const response = await fetch(`/api/mongodb/${colName}`);
        if (response.ok && active) {
          const result = await response.json();
          callback(createMockSnapshot(result.data || []));
        }
      }
    } catch (err) {
      console.warn(`MongoDB polling onSnapshot error for ${colName}:`, err);
      if (errorCallback) {
        try { errorCallback(err); } catch {}
      }
    }
  };

  poll();
  const interval = setInterval(poll, 3000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}
