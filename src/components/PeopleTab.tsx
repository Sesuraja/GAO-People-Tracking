import { Person } from '../lib/simulation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Plus, X, Save } from 'lucide-react';
import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function PeopleTab({ people }: { people: Person[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newTagId, setNewTagId] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Employee');
  const [isSaving, setIsSaving] = useState(false);

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSavePerson = async () => {
    if (!newTagId || !newName) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'registered_people', newTagId), {
         name: newName,
         role: newRole,
         createdAt: new Date(),
      });
      setIsAdding(false);
      setNewTagId('');
      setNewName('');
      setNewRole('Employee');
    } catch (e) {
      console.error(e);
      alert('Failed to save person');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">People Directory</h2>
          <p className="text-slate-500 font-medium">Manage and monitor all personnel currently on site.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search name, ID, or role..." 
              className="pl-9 bg-white border-slate-200 shadow-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#007BC4]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-[#007BC4] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Add Person
          </button>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-900">Active Personnel ({filteredPeople.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow className="border-slate-200 hover:bg-slate-50">
                <TableHead className="text-slate-500 font-bold">ID / Tag</TableHead>
                <TableHead className="text-slate-500 font-bold">Name</TableHead>
                <TableHead className="text-slate-500 font-bold">Role</TableHead>
                <TableHead className="text-slate-500 font-bold">Current Zone</TableHead>
                <TableHead className="text-slate-500 font-bold text-right">Dwell Time</TableHead>
                <TableHead className="text-slate-500 font-bold text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPeople.map((person) => (
                <TableRow key={person.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                  <TableCell className="font-mono text-xs text-slate-500 font-medium">{person.id}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{person.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      person.role === 'Security' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                      person.role === 'Visitor' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                      'border-[#007BC4]/20 text-[#007BC4] bg-[#007BC4]/5'
                    }>
                      {person.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#007BC4]" />
                      {person.currentZone}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-slate-700 font-medium">
                    {Math.floor(person.dwellTime / 60)}m {person.dwellTime % 60}s
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className={
                      person.presenceState === 'MOVING' ? 'bg-[#007BC4]/10 text-[#007BC4]' : 'bg-slate-100 text-slate-600'
                    }>
                      {person.presenceState}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPeople.length === 0 && (
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium">
                    No matching personnel found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Person Modal */}
      {isAdding && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
              <div className="flex justify-between items-center p-5 border-b border-slate-100">
                 <h3 className="text-lg font-bold text-slate-900">Register New Person</h3>
                 <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-700 transition">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-5 flex flex-col gap-4">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Tag ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. EPC_001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4] transition outline-none font-mono text-sm"
                      value={newTagId}
                      onChange={(e) => setNewTagId(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1.5">The required physical RFID Tag ID assigned to this person.</p>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4] transition outline-none text-sm"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Role</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-[#007BC4] focus:ring-1 focus:ring-[#007BC4] transition outline-none text-sm"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                       <option value="Employee">Employee</option>
                       <option value="Visitor">Visitor</option>
                       <option value="Security">Security</option>
                       <option value="Contractor">Contractor</option>
                    </select>
                 </div>
              </div>
              <div className="p-5 bg-slate-50 border-t border-slate-100 justify-end flex gap-3">
                 <button 
                   onClick={() => setIsAdding(false)} 
                   className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={handleSavePerson}
                   disabled={!newTagId || !newName || isSaving}
                   className="flex items-center gap-2 bg-[#007BC4] hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md transition disabled:opacity-50"
                 >
                    {isSaving ? <Save className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
                    Save Person
                 </button>
              </div>
           </div>
         </div>
      )}
    </div>
  );
}
