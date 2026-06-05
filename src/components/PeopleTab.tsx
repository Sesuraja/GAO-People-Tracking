import { Person } from '../lib/simulation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import AddPersonModal from './AddPersonModal';

export default function PeopleTab({ people }: { people: Person[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">People Directory</h2>
          <p className="text-slate-500 font-medium">Manage and monitor all personnel currently on site.</p>
        </div>
        <div className="flex gap-3">
            <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
                placeholder="Search name, ID, or role..." 
                className="pl-9 bg-white border-slate-200 shadow-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#007BC4]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#007BC4] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
                <Plus size={18} /> Add Person
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
      <AddPersonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
