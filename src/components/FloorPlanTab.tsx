import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { MapPin, Upload, Trash2 } from 'lucide-react';

type Marker = { id: string; deviceId: string; x: number; y: number };
type Device = { id: string; name: string };

export default function FloorPlanTab() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDevice, setActiveDevice] = useState('');
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const markersSnap = await getDocs(collection(db, 'floorPlanMarkers'));
      setMarkers(markersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Marker)));

      const devicesSnap = await getDocs(collection(db, 'devices'));
      setDevices(devicesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Device)));
    };
    fetchData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeDevice) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newMarker = { deviceId: activeDevice, x, y };
    const docRef = await addDoc(collection(db, 'floorPlanMarkers'), newMarker);
    setMarkers([...markers, { id: docRef.id, ...newMarker }]);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteDoc(doc(db, 'floorPlanMarkers', id));
    setMarkers(markers.filter(m => m.id !== id));
  };

  return (
    <div className="p-6 h-full flex flex-col dark:bg-slate-900 dark:text-slate-100">
      <h2 className="text-2xl font-bold mb-4">Interactive Floor Plan</h2>
      <div className="mb-4 flex gap-4 items-center">
        <label className="flex items-center gap-2 bg-slate-100 p-2 rounded cursor-pointer dark:bg-slate-800">
          <Upload size={18} /> Upload Plan
          <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
        </label>
        
        <select 
          className="border p-2 rounded dark:bg-slate-800 dark:border-slate-700" 
          value={activeDevice} 
          onChange={e => setActiveDevice(e.target.value)}
        >
          <option value="">Select Device...</option>
          {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        
        <p className="text-sm text-slate-500">Pick a device and click on the plan to place it.</p>
      </div>
      
      <div 
        className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg relative cursor-crosshair overflow-hidden bg-white dark:bg-slate-800"
        onClick={handleCanvasClick}
      >
        {image ? (
            <img src={image} alt="Floor Plan" className="w-full h-full object-contain" />
        ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
               Upload Floor Plan Image
            </div>
        )}

        {markers.map(m => (
           <div 
             key={m.id} 
             className="absolute w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform"
             style={{ left: m.x - 16, top: m.y - 16 }}
             onClick={(e) => handleDelete(m.id, e)}
           >
             <MapPin size={20} />
           </div>
        ))}
      </div>
    </div>
  );
}
