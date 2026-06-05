import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { MapPin, Upload, Trash2 } from 'lucide-react';

type Marker = { id: string; deviceId: string; x: number; y: number; floorPlanId: string };
type Device = { id: string; name: string };
type FloorPlan = { id: string; name: string; imageBase64: string };

export default function FloorPlanTab() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [activeFloorPlanId, setActiveFloorPlanId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const markersSnap = await getDocs(collection(db, 'floorPlanMarkers'));
      setMarkers(markersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Marker)));

      const devicesSnap = await getDocs(collection(db, 'devices'));
      setDevices(devicesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Device)));
      
      const plansSnap = await getDocs(collection(db, 'floorPlans'));
      const plans = plansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FloorPlan));
      setFloorPlans(plans);
      if (plans.length > 0) setActiveFloorPlanId(plans[0].id);
    };
    fetchData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const name = prompt('Enter level name', 'Level 1');
        if (name) {
             const docRef = await addDoc(collection(db, 'floorPlans'), { name, imageBase64: reader.result });
             const newPlan = { id: docRef.id, name, imageBase64: reader.result as string };
             setFloorPlans([...floorPlans, newPlan]);
             setActiveFloorPlanId(newPlan.id);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeFloorPlanId) return;
    
    const deviceName = prompt('Enter New Device Name:');
    if (!deviceName) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 1. Create Device
    const deviceRef = await addDoc(collection(db, 'devices'), {
        name: deviceName,
        location: 'Mapped',
        type: 'IoT Device',
        status: 'online',
        ip: '0.0.0.0'
    });

    // 2. Create Marker
    const newMarker = { deviceId: deviceRef.id, x, y, floorPlanId: activeFloorPlanId };
    const markerRef = await addDoc(collection(db, 'floorPlanMarkers'), newMarker);
    
    setMarkers([...markers, { id: markerRef.id, ...newMarker }]);
    setDevices([...devices, { id: deviceRef.id, name: deviceName }]);
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
          <Upload size={18} /> Add Plan
          <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
        </label>
        
        <select 
          className="border p-2 rounded dark:bg-slate-800 dark:border-slate-700" 
          value={activeFloorPlanId} 
          onChange={e => setActiveFloorPlanId(e.target.value)}
        >
          <option value="">Select Level...</option>
          {floorPlans.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        
        <p className="text-sm text-slate-500">Pick level and click on plan to place a new device.</p>
      </div>
      
      <div 
        className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg relative cursor-crosshair overflow-hidden bg-white dark:bg-slate-800"
        onClick={handleCanvasClick}
      >
        {activeFloorPlanId && floorPlans.find(f => f.id === activeFloorPlanId)?.imageBase64 ? (
            <img src={floorPlans.find(f => f.id === activeFloorPlanId)?.imageBase64} alt="Floor Plan" className="w-full h-full object-contain" />
        ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
               Select or Upload Floor Plan
            </div>
        )}

        {markers.filter(m => m.floorPlanId === activeFloorPlanId).map(m => (
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
