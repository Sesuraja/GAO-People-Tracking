import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function AddPersonModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Employee' | 'Visitor' | 'Security'>('Employee');
  const [id, setId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'people'), {
        name,
        role,
        id,
        currentZone: 'Entrance',
        presenceState: 'IDLE',
        dwellTime: 0,
        lastSeen: new Date(),
      });
      onClose();
      setName('');
      setId('');
    } catch (e) {
      console.error('Error adding person: ', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Person</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input className="w-full border rounded p-2" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">ID</label>
            <input className="w-full border rounded p-2" value={id} onChange={e => setId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Role</label>
            <select className="w-full border rounded p-2" value={role} onChange={e => setRole(e.target.value as any)}>
              <option value="Employee">Employee</option>
              <option value="Visitor">Visitor</option>
              <option value="Security">Security</option>
            </select>
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
