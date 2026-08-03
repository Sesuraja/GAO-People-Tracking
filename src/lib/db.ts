// Backend Database Client API Mapping for Server-Side Storage & Fetching

export function isMongoActive(): boolean {
  return true;
}

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

// Convert JSON objects to firestore-like document format with .toDate() support
function createMockDoc(data: any) {
  if (!data) return { id: 'unknown', exists: () => false, data: () => null };
  const idValue = data.id || data._id || 'unknown';
  
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

// --- BACKEND API DATABASE EXPORTS ---

export async function setDoc(docRef: any, data: any, options?: any): Promise<void> {
  const colName = docRef.col;
  const docId = docRef.id;

  try {
    const response = await fetch(`/api/data/${colName}/${docId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
  } catch (err: any) {
    console.warn(`setDoc API fallback for ${colName}/${docId}:`, err);
    // Local fallback buffer if offline
    const key = `gao_cache_${colName}`;
    const cached = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = cached.findIndex((x: any) => x.id === docId);
    if (idx > -1) cached[idx] = { ...cached[idx], ...data, id: docId };
    else cached.push({ ...data, id: docId });
    localStorage.setItem(key, JSON.stringify(cached));
  }
}

export async function addDoc(colRef: any, data: any): Promise<any> {
  const colName = colRef.path;

  try {
    const response = await fetch(`/api/data/${colName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
    const result = await response.json();
    return { id: result.doc.id, ...createMockDoc(result.doc) };
  } catch (err: any) {
    console.warn(`addDoc API fallback for ${colName}:`, err);
    const newId = data.id || Math.random().toString(36).substring(2, 11);
    const newDoc = { id: newId, ...data };
    return { id: newId, ...createMockDoc(newDoc) };
  }
}

export async function getDoc(docRef: any): Promise<any> {
  const colName = docRef.col;
  const docId = docRef.id;

  try {
    const response = await fetch(`/api/data/${colName}/${docId}`);
    if (response.ok) {
      const result = await response.json();
      if (result && result.doc) {
        return createMockDoc(result.doc);
      }
    }
  } catch (err) {
    console.warn(`getDoc API error for ${colName}/${docId}:`, err);
  }
  return { id: docId, exists: () => false, data: () => null };
}

export async function getDocs(queryRef: any): Promise<any> {
  const colName = queryRef.path;

  try {
    const response = await fetch(`/api/data/${colName}`);
    if (response.ok) {
      const result = await response.json();
      return createMockSnapshot(result.data || []);
    }
  } catch (err) {
    console.warn(`getDocs API error for ${colName}:`, err);
  }
  return createMockSnapshot([]);
}

export async function updateDoc(docRef: any, data: any): Promise<void> {
  return setDoc(docRef, data, { merge: true });
}

export async function deleteDoc(docRef: any): Promise<void> {
  const colName = docRef.col;
  const docId = docRef.id;

  try {
    const response = await fetch(`/api/data/${colName}/${docId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
  } catch (err: any) {
    console.warn(`deleteDoc API error for ${colName}/${docId}:`, err);
  }
}

export async function getCountFromServer(queryRef: any): Promise<any> {
  const colName = queryRef.path;

  try {
    const response = await fetch(`/api/data/${colName}`);
    if (response.ok) {
      const result = await response.json();
      const count = (result.data || []).length;
      return { data: () => ({ count }) };
    }
  } catch (err) {}
  return { data: () => ({ count: 0 }) };
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
        const response = await fetch(`/api/data/${colName}/${docId}`);
        if (response.ok && active) {
          const result = await response.json();
          callback(createMockDoc(result.doc));
        }
      } else {
        const response = await fetch(`/api/data/${colName}`);
        if (response.ok && active) {
          const result = await response.json();
          callback(createMockSnapshot(result.data || []));
        }
      }
    } catch (err) {
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

