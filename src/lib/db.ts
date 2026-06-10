// Pure MongoDB client stub database mapping

// Helper to check if MongoDB is active/configured
export function isMongoActive(): boolean {
  // Always true for MongoDB-only mode!
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

// Convert Mongo JSON objects to firestore-like document format
function createMockDoc(data: any) {
  const idValue = data?.id || data?._id || 'unknown';
  
  // Wrap date and timestamp fields to provide a Firestore-compatible .toDate() method
  if (data && typeof data === 'object') {
    data = { ...data };
    Object.keys(data).forEach(key => {
      const val = data[key];
      if (val && typeof val === 'string' && (key.toLowerCase().includes('time') || key.toLowerCase().includes('date') || key === 'createdAt' || key === 'updatedAt' || key === 'timestamp')) {
        const dateObj = new Date(val);
        if (!isNaN(dateObj.getTime())) {
          data[key] = {
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
  }

  return {
    id: idValue,
    ref: { id: idValue },
    data: () => data,
    exists: () => !!data
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

export async function setDoc(docRef: any, data: any, options?: any): Promise<void> {
  const colName = docRef.col;
  const docId = docRef.id;
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
  const colName = colRef.path;
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
  const colName = docRef.col;
  const docId = docRef.id;
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
  const colName = queryRef.path;
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
  return setDoc(docRef, data);
}

export async function deleteDoc(docRef: any): Promise<void> {
  const colName = docRef.col;
  const docId = docRef.id;
  const response = await fetch(`/api/mongodb/${colName}/${docId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(`Failed to delete document from MongoDB: ${response.statusText}`);
  }
}

export async function getCountFromServer(queryRef: any): Promise<any> {
  const colName = queryRef.path;
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
  let active = true;
  const colName = ref.col || ref.path;
  const isDoc = !!ref.col;
  const docId = ref.id;

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
  const interval = setInterval(poll, 2500);

  return () => {
    active = false;
    clearInterval(interval);
  };
}
