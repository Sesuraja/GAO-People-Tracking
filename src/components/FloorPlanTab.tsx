import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, query, where, deleteDoc, doc } from 'firebase/firestore';
import { MapPin, Upload, Trash2 } from 'lucide-react';

type Marker = { id: string; deviceId: string; x: number; y: number };

export default function FloorPlanTab() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [activeDevice, setActiveDevice] = useState('');

  useEffect(() => {
    const fetchMarkers = async () => {
      const q = collection(db, 'floorPlanMarkers');
      const snapshot = await getDocs(q);
      setMarkers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Marker)));
    };
    fetchMarkers();
  }, []);

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeDevice) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newMarker = { deviceId: activeDevice, x, y };
    const docRef = await addDoc(collection(db, 'floorPlanMarkers'), newMarker);
    setMarkers([...markers, { id: docRef.id, ...newMarker }]);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'floorPlanMarkers', id));
    setMarkers(markers.filter(m => m.id !== id));
  };

  return (
    <div className="p-6 h-full flex flex-col dark:bg-slate-900 dark:text-slate-100">
      <h2 className="text-2xl font-bold mb-4">Interactive Floor Plan</h2>
      <div className="mb-4 flex gap-4 items-center">
        <input 
          placeholder="Enter Device ID to place..." 
          className="border p-2 rounded dark:bg-slate-800 dark:border-slate-700" 
          value={activeDevice} 
          onChange={e => setActiveDevice(e.target.value)} 
        />
        <p className="text-sm text-slate-500">Click on the image to place the device.</p>
      </div>
      
      <div 
        className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg relative cursor-crosshair overflow-hidden"
        onClick={handleCanvasClick}
      >
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
           Upload Image Placeholder (Click to place markers)
        </div>
        {markers.map(m => (
           <div 
             key={m.id} 
             className="absolute w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer"
             style={{ left: m.x - 12, top: m.y - 12 }}
             onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
           >
             <MapPin size={14} />
           </div>
        ))}
      </div>
    </div>
  );
}
