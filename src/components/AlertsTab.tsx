import { AIAlert } from '../lib/simulation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FileWarning, Info, BellRing } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AlertsTab({ alerts }: { alerts: AIAlert[] }) {
  // Let's create an extended list from alerts to simulate history if short
  const allAlerts = [...alerts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Intelligence Log</h2>
          <p className="text-slate-500 font-medium">Complete history of all AI-generated alerts and events.</p>
        </div>
        <div className="flex gap-4">
           <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50 px-3 py-1 text-sm shadow-sm font-semibold">
             {alerts.filter(a => a.type === 'security').length} Security
           </Badge>
           <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 px-3 py-1 text-sm shadow-sm font-semibold">
             {alerts.filter(a => a.type === 'warning').length} Warnings
           </Badge>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-900 font-bold">
            <BellRing className="w-5 h-5 text-[#007BC4]" />
            Alert History
          </CardTitle>
          <span className="text-sm font-medium text-slate-500">{allAlerts.length} total events recorded</span>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col relative h-full bg-slate-50/20">
          <ScrollArea className="flex-1 absolute inset-0">
            <div className="p-6 flex flex-col gap-4">
              {allAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl border relative shadow-sm ${
                    alert.type === 'security' ? 'bg-rose-50 border-rose-200 hover:bg-rose-100 hover:border-rose-300' :
                    alert.type === 'warning' ? 'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300' :
                    'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  } transition-colors`}
                >
                  <div className={`p-3 rounded-lg shrink-0 self-start shadow-inner ${
                    alert.type === 'security' ? 'bg-rose-100 text-rose-600' :
                    alert.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-[#007BC4]/10 text-[#007BC4]'
                  }`}>
                    {alert.type === 'security' && <AlertCircle className="w-6 h-6" />}
                    {alert.type === 'warning' && <FileWarning className="w-6 h-6" />}
                    {alert.type === 'info' && <Info className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                         <Badge variant="outline" className={`text-[10px] sm:text-xs uppercase px-2 py-0.5 border-0 font-bold tracking-wider ${
                            alert.type === 'security' ? 'bg-rose-500/10 text-rose-700' :
                            alert.type === 'warning' ? 'bg-amber-500/10 text-amber-700' :
                            'bg-[#007BC4]/10 text-[#007BC4]'
                         }`}>
                           {alert.type}
                         </Badge>
                         <span className="text-sm font-semibold text-slate-500">
                           {alert.timestamp.toLocaleDateString()}
                         </span>
                      </div>
                      <div className="text-sm font-mono font-medium text-slate-600 bg-white border border-slate-200 shadow-sm px-2 py-1 rounded">
                         {alert.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                    
                    <p className="text-base font-bold text-slate-900 mt-1 leading-relaxed">
                      {alert.message}
                    </p>
                    
                    {alert.type === 'security' && (
                      <div className="mt-4 pt-4 border-t border-rose-200 flex gap-4 text-sm font-medium text-rose-600">
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" /> Action required</span>
                        <span className="text-[#007BC4] cursor-pointer hover:underline font-bold">View on map →</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {allAlerts.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-4">
                  <Info className="w-12 h-12 text-slate-300" />
                  <p className="text-lg font-medium text-slate-600">No alerts recorded yet.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
