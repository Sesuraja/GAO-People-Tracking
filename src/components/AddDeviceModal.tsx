import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function AddDeviceModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [ip, setIp] = useState('');
  const [type, setType] = useState('UHF RFID');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'devices'), {
        name,
        location,
        ip,
        type,
        status: 'online',
        lastPing: 'Just now',
        uptime: '0d 0h'
      });
      onClose();
      setName('');
      setLocation('');
      setIp('');
    } catch (e) {
      console.error('Error adding device: ', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Device</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input className="w-full border rounded p-2" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Location</label>
            <input className="w-full border rounded p-2" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">IP Address</label>
            <input className="w-full border rounded p-2" value={ip} onChange={e => setIp(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-[#007BC4] text-white rounded">
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
