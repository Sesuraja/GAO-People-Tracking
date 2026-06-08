import React from 'react';
import { Box, Compass, Layers, User, Zap, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DigitalTwinTab() {
  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto min-h-0">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
             <Box className="w-6 h-6 text-[#007BC4]" />
             Digital Twin & Indoor Nav
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">Real-time 3D spatial mapping and personnel routing.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
           <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-sm font-bold text-slate-900 flex items-center gap-1.5"><Box className="w-4 h-4"/> 3D View</button>
           <button className="px-4 py-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition flex items-center gap-1.5"><Layers className="w-4 h-4"/> 2D Floor</button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
         <div className="w-80 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
               <Navigation className="w-5 h-5 text-[#007BC4]" />
               Indoor Navigation
            </h3>
            <div className="flex flex-col gap-3 flex-1">
               <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Select Target</label>
                  <div className="bg-white border border-slate-200 rounded p-2 flex items-center gap-2 cursor-pointer shadow-sm">
                     <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">A</div>
                     <span className="font-medium text-sm text-slate-700">Alice Walker (Visitor)</span>
                  </div>
               </div>
               
               <div className="flex flex-col items-center justify-center py-2 opacity-50">
                  <div className="w-0.5 h-4 bg-slate-300"></div>
                  <Compass className="w-4 h-4 text-slate-400 my-1" />
                  <div className="w-0.5 h-4 bg-slate-300"></div>
               </div>

               <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Your Location</label>
                  <div className="bg-white border border-slate-200 rounded p-2 flex items-center gap-2 cursor-pointer shadow-sm">
                     <User className="w-4 h-4 text-slate-500" />
                     <span className="font-medium text-sm text-slate-700">Security Desk 1</span>
                  </div>
               </div>

               <button className="mt-4 bg-[#007BC4] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#006aa9] transition flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> Generate Route
               </button>

               <div className="mt-6 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Turn-by-turn</h4>
                  <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-slate-200">
                     <div className="relative flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center z-10 shrink-0">
                           <div className="w-2 h-2 rounded-full bg-[#007BC4]" />
                        </div>
                        <div className="text-sm font-medium text-slate-700 pt-0.5">Proceed straight down Hall A (45m)</div>
                     </div>
                     <div className="relative flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center z-10 shrink-0">
                           <div className="w-2 h-2 rounded-full bg-[#007BC4]" />
                        </div>
                        <div className="text-sm font-medium text-slate-700 pt-0.5">Turn right at Engineering Lab</div>
                     </div>
                     <div className="relative flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#007BC4] border-2 border-white flex items-center justify-center z-10 shrink-0 shadow-sm">
                           <MapPin className="w-3 h-3 text-white" />
                        </div>
                        <div className="text-sm font-bold text-slate-900 pt-0.5">Target located at Server Room outside door.</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 3D Viewport Placeholder */}
         <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner relative overflow-hidden flex flex-col group">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
               <Badge className="bg-slate-800/80 text-emerald-400 border-slate-700 backdrop-blur-sm font-mono"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1.5 inline-block"/> LIVE RENDER</Badge>
               <span className="text-slate-500 text-xs font-mono font-bold">60 FPS • WebGL</span>
            </div>

            {/* Simulated 3D background grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
               backgroundImage: 'linear-gradient(#007BC4 1px, transparent 1px), linear-gradient(90deg, #007BC4 1px, transparent 1px)',
               backgroundSize: '40px 40px',
               transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
            }} />
            
            {/* Simulated 3D walls & route */}
            <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-1000">
               <div className="relative w-96 h-96 border-4 border-slate-700/50 rounded-xl" style={{ transform: 'perspective(1000px) rotateX(45deg) rotateZ(30deg)', transformStyle: 'preserve-3d' }}>
                  {/* Walls */}
                  <div className="absolute inset-x-8 top-1/2 h-4 bg-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"></div>
                  <div className="absolute inset-y-8 left-1/3 w-4 bg-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"></div>
                  
                  {/* Route path glow */}
                  <div className="absolute w-3 h-32 bg-[#007BC4] shadow-[0_0_20px_#007BC4] bottom-8 left-1/2 rounded-full -translate-x-1/2"></div>
                  <div className="absolute w-32 h-3 bg-[#007BC4] shadow-[0_0_20px_#007BC4] bottom-40 left-1/4 rounded-full"></div>
                  
                  {/* Persona Indicator */}
                  <div className="absolute w-6 h-6 bg-rose-500 rounded-full border-2 border-white shadow-[0_0_30px_#f43f5e] bottom-[150px] left-[100px] transform -translate-x-1/2 -translate-y-1/2 animate-bounce"></div>
               </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700 flex gap-6 text-sm text-slate-300 font-medium z-10">
               <button className="hover:text-white transition flex justify-center items-center gap-1.5"><Layers className="w-4 h-4"/> Level 1</button>
               <div className="w-px bg-slate-600"></div>
               <button className="hover:text-white transition flex justify-center items-center gap-1.5 text-[#007BC4]">Level 2 (Active)</button>
               <div className="w-px bg-slate-600"></div>
               <button className="hover:text-white transition flex justify-center items-center gap-1.5">Roof</button>
            </div>
         </div>
      </div>
    </div>
  );
}

function MapPin(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
