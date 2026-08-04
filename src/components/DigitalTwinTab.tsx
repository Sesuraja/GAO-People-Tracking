import React, { useState, useEffect } from 'react';
import { 
  Box, Compass, Layers, User, Zap, Navigation, MapPin, 
  RotateCw, RotateCcw, Eye, Play, Pause, RefreshCw, Search, 
  Building, CheckCircle2, AlertTriangle, ShieldAlert, 
  ArrowRight, Clock, Footprints, Shield, Radio, Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface IndoorTarget {
  id: string;
  name: string;
  type: 'visitor' | 'staff' | 'room' | 'safety' | 'amenity';
  floor: 'Level 1' | 'Level 2' | 'Level 3';
  zoneName: string;
  coords2D: { x: number; y: number };
  distanceMeters: number;
  estTime: string;
  requiredAccess: string;
  status?: string;
  tagId?: string;
  description: string;
  steps: Array<{
    stepNumber: number;
    text: string;
    distance: string;
    icon: 'straight' | 'turn-left' | 'turn-right' | 'elevator' | 'destination';
  }>;
}

const START_LOCATIONS = [
  { id: 'LOBBY', name: 'Main Lobby - Security Desk 1 (Level 1)' },
  { id: 'ELEVATOR_B', name: 'Elevator B Lobby (Level 2)' },
  { id: 'DOCK', name: 'South Loading Dock Gate (Level 1)' },
  { id: 'CAFETERIA', name: 'Cafeteria West Entrance (Level 1)' }
];

const INDOOR_TARGETS: IndoorTarget[] = [
  {
    id: 'vis-alice',
    name: 'Alice Walker (Active Visitor)',
    type: 'visitor',
    floor: 'Level 2',
    zoneName: 'Executive Suite A101',
    coords2D: { x: 70, y: 25 },
    distanceMeters: 115,
    estTime: '1 min 35 sec',
    requiredAccess: 'Level 2 Visitor Badge',
    status: 'In Executive Suite A101',
    tagId: 'T042',
    description: 'TechCorp Inc. Representative meeting with CTO Sarah Jenkins.',
    steps: [
      { stepNumber: 1, text: 'Start at Security Desk 1', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Proceed North down Central Corridor A', distance: '40m', icon: 'straight' },
      { stepNumber: 3, text: 'Take Elevator B to Level 2', distance: '15m', icon: 'elevator' },
      { stepNumber: 4, text: 'Turn Right towards Executive Suite A101', distance: '35m', icon: 'turn-right' },
      { stepNumber: 5, text: 'Arrive at Executive Suite A101 (Target Located)', distance: '25m', icon: 'destination' }
    ]
  },
  {
    id: 'vis-robert',
    name: 'Robert Fox (Auditor Visitor)',
    type: 'visitor',
    floor: 'Level 2',
    zoneName: 'High-Security Server Vault B204',
    coords2D: { x: 82, y: 68 },
    distanceMeters: 185,
    estTime: '2 min 20 sec',
    requiredAccess: 'Escorted Access (Vault B2)',
    status: 'Active on RFID Tag T089',
    tagId: 'T089',
    description: 'External Audits LLC conducting infrastructure compliance check.',
    steps: [
      { stepNumber: 1, text: 'Start at Security Desk 1', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Proceed North to Elevator Bank B', distance: '45m', icon: 'straight' },
      { stepNumber: 3, text: 'Ascend to Level 2', distance: '10m', icon: 'elevator' },
      { stepNumber: 4, text: 'Turn Left into Server Wing Corridor B', distance: '65m', icon: 'turn-left' },
      { stepNumber: 5, text: 'Scan badge at Server Vault B204 door', distance: '65m', icon: 'destination' }
    ]
  },
  {
    id: 'staff-priya',
    name: 'Priya Sharma (R&D Lab Lead)',
    type: 'staff',
    floor: 'Level 2',
    zoneName: 'R&D Robotics Lab 3',
    coords2D: { x: 32, y: 72 },
    distanceMeters: 95,
    estTime: '1 min 10 sec',
    requiredAccess: 'R&D Level 3 Clearance',
    status: 'In Robotics Lab 3',
    tagId: 'T094',
    description: 'BioHealth Tech lead overseeing sensor calibration test.',
    steps: [
      { stepNumber: 1, text: 'Start at Security Desk 1', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Head West past Central Atrium', distance: '30m', icon: 'straight' },
      { stepNumber: 3, text: 'Take West Stairs to Level 2', distance: '20m', icon: 'elevator' },
      { stepNumber: 4, text: 'Turn Left into R&D Bay', distance: '25m', icon: 'turn-left' },
      { stepNumber: 5, text: 'Target located at Bay 3 Workstation', distance: '20m', icon: 'destination' }
    ]
  },
  {
    id: 'room-exec',
    name: 'Executive Suite A101',
    type: 'room',
    floor: 'Level 2',
    zoneName: 'Executive Wing',
    coords2D: { x: 75, y: 20 },
    distanceMeters: 110,
    estTime: '1 min 30 sec',
    requiredAccess: 'Standard Visitor Badge',
    description: 'Main executive conference suite equipped with video conferencing.',
    steps: [
      { stepNumber: 1, text: 'Start at Security Desk 1', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Proceed North 40m along Corridor A', distance: '40m', icon: 'straight' },
      { stepNumber: 3, text: 'Take Elevator B to Floor 2', distance: '15m', icon: 'elevator' },
      { stepNumber: 4, text: 'Turn Right at glass doors', distance: '35m', icon: 'turn-right' },
      { stepNumber: 5, text: 'Executive Suite A101 is straight ahead', distance: '20m', icon: 'destination' }
    ]
  },
  {
    id: 'room-server',
    name: 'High-Density Server Vault B204',
    type: 'room',
    floor: 'Level 2',
    zoneName: 'Server Wing B',
    coords2D: { x: 85, y: 70 },
    distanceMeters: 190,
    estTime: '2 min 30 sec',
    requiredAccess: 'Restricted Security Level 4',
    description: 'Main server cluster and network infrastructure vault.',
    steps: [
      { stepNumber: 1, text: 'Start at Security Desk 1', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Proceed North to Elevator B', distance: '45m', icon: 'straight' },
      { stepNumber: 3, text: 'Take Elevator to Floor 2', distance: '15m', icon: 'elevator' },
      { stepNumber: 4, text: 'Turn Left into High-Security Vault Corridor', distance: '70m', icon: 'turn-left' },
      { stepNumber: 5, text: 'Vault B204 double-door entrance', distance: '60m', icon: 'destination' }
    ]
  },
  {
    id: 'room-lab',
    name: 'R&D Robotics Lab 3',
    type: 'room',
    floor: 'Level 2',
    zoneName: 'Robotics Wing',
    coords2D: { x: 28, y: 75 },
    distanceMeters: 90,
    estTime: '1 min 05 sec',
    requiredAccess: 'R&D Clearance',
    description: 'Prototyping facility for autonomous RFID tracking equipment.',
    steps: [
      { stepNumber: 1, text: 'Start at Security Desk 1', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Proceed West through Atrium', distance: '30m', icon: 'straight' },
      { stepNumber: 3, text: 'Take Stairwell West to Floor 2', distance: '20m', icon: 'elevator' },
      { stepNumber: 4, text: 'Turn Left at R&D Entrance', distance: '25m', icon: 'turn-left' },
      { stepNumber: 5, text: 'Robotics Lab 3 entrance on right', distance: '15m', icon: 'destination' }
    ]
  },
  {
    id: 'room-cafe',
    name: 'Main Cafeteria & Lounge',
    type: 'amenity',
    floor: 'Level 1',
    zoneName: 'Dining & Atrium',
    coords2D: { x: 25, y: 35 },
    distanceMeters: 55,
    estTime: '40 sec',
    requiredAccess: 'Public Access',
    description: 'Staff and visitor dining hall, espresso bar, and breakout lounge.',
    steps: [
      { stepNumber: 1, text: 'Start at Security Desk 1', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Turn Left through Lobby Glass Arch', distance: '30m', icon: 'turn-left' },
      { stepNumber: 3, text: 'Walk straight past Atrium Fountain', distance: '25m', icon: 'straight' },
      { stepNumber: 4, text: 'Cafeteria & Lounge Entrance', distance: '0m', icon: 'destination' }
    ]
  },
  {
    id: 'safety-exit-north',
    name: 'Emergency Exit North (Level 2)',
    type: 'safety',
    floor: 'Level 2',
    zoneName: 'Safety Escape Way 1',
    coords2D: { x: 15, y: 15 },
    distanceMeters: 70,
    estTime: '45 sec',
    requiredAccess: 'Emergency Unlocked',
    description: 'Pressurized fire escape stairwell directly connecting to North Parking Lot.',
    steps: [
      { stepNumber: 1, text: 'Start at Security Desk 1', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Head Northwest towards North Stairwell', distance: '40m', icon: 'straight' },
      { stepNumber: 3, text: 'Push Emergency Crash Door North-1', distance: '30m', icon: 'destination' }
    ]
  },
  {
    id: 'safety-med',
    name: 'First Aid & Medical Kiosk',
    type: 'safety',
    floor: 'Level 1',
    zoneName: 'Safety Station 2',
    coords2D: { x: 50, y: 45 },
    distanceMeters: 40,
    estTime: '30 sec',
    requiredAccess: 'Open Access',
    description: 'Automated External Defibrillator (AED) and emergency medical kit.',
    steps: [
      { stepNumber: 1, text: 'Start at Security Desk 1', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Walk 40m straight into Central Atrium', distance: '40m', icon: 'straight' },
      { stepNumber: 3, text: 'First Aid Kiosk on your Right', distance: '0m', icon: 'destination' }
    ]
  }
];

export default function DigitalTwinTab() {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedStart, setSelectedStart] = useState<string>('LOBBY');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('vis-alice');
  const [targetFilter, setTargetFilter] = useState<'All' | 'People' | 'Rooms' | 'Safety'>('All');
  const [selectedLevel, setSelectedLevel] = useState<'Level 1' | 'Level 2' | 'Level 3'>('Level 2');
  
  // 3D Controls
  const [rotationAngle, setRotationAngle] = useState<number>(30);
  const [tiltAngle, setTiltAngle] = useState<number>(45);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);

  const selectedTarget = INDOOR_TARGETS.find(t => t.id === selectedTargetId) || INDOOR_TARGETS[0];

  // Auto update level based on target
  useEffect(() => {
    if (selectedTarget) {
      setSelectedLevel(selectedTarget.floor);
    }
  }, [selectedTargetId]);

  // Simulation loop
  useEffect(() => {
    let interval: any = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimProgress(prev => {
          if (prev >= 100) {
            setIsSimulating(false);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleStartSimulation = () => {
    setSimProgress(0);
    setIsSimulating(true);
  };

  const filteredTargets = INDOOR_TARGETS.filter(t => {
    if (targetFilter === 'People') return t.type === 'visitor' || t.type === 'staff';
    if (targetFilter === 'Rooms') return t.type === 'room' || t.type === 'amenity';
    if (targetFilter === 'Safety') return t.type === 'safety';
    return true;
  });

  return (
    <div className="w-full flex flex-col p-6 max-w-7xl mx-auto gap-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Box className="w-6 h-6 text-[#007BC4]" />
            Digital Twin & Indoor Navigation
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Real-time 3D spatial mapping, target location tracking, and turn-by-turn route guidance.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setViewMode('3d')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              viewMode === '3d' 
                ? 'bg-[#007BC4] text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Box className="w-4 h-4" />
            3D Isometric Twin
          </button>
          <button 
            onClick={() => setViewMode('2d')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              viewMode === '2d' 
                ? 'bg-[#007BC4] text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            2D Floor Plan
          </button>
        </div>
      </div>

      {/* Main Grid: Left Navigation Control Panel, Right 3D/2D Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Panel - Target Selection & Directions (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#007BC4]" />
              Indoor Navigation Control
            </h3>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px]">
              GPS / RFID SYNCED
            </Badge>
          </div>

          {/* Quick Target Category Filters */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Target Filter</label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['All', 'People', 'Rooms', 'Safety'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setTargetFilter(cat)}
                  className={`flex-1 py-1 rounded text-xs font-bold transition ${
                    targetFilter === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Start Location */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Starting Point</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedStart}
                onChange={e => setSelectedStart(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007BC4]/20"
              >
                {START_LOCATIONS.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Location Select */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Destination / Person</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#007BC4]" />
              <select
                value={selectedTargetId}
                onChange={e => setSelectedTargetId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007BC4]/20"
              >
                {filteredTargets.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.floor})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Info Summary Box */}
          {selectedTarget && (
            <div className="bg-[#007BC4]/5 border border-[#007BC4]/20 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5 text-[#007BC4]">
                  <Activity className="w-3.5 h-3.5" />
                  {selectedTarget.zoneName}
                </span>
                <Badge className="bg-[#007BC4] text-white text-[10px]">{selectedTarget.floor}</Badge>
              </div>
              <p className="text-slate-600">{selectedTarget.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#007BC4]/10 text-slate-700 font-semibold">
                <div>Distance: <span className="font-mono text-slate-900">{selectedTarget.distanceMeters}m</span></div>
                <div>Walk Time: <span className="font-mono text-slate-900">{selectedTarget.estTime}</span></div>
                <div className="col-span-2 text-[11px] text-slate-500">Access: <span className="text-slate-800">{selectedTarget.requiredAccess}</span></div>
              </div>
            </div>
          )}

          {/* Action Simulation Controls */}
          <div className="flex gap-2">
            <button 
              onClick={handleStartSimulation}
              disabled={isSimulating}
              className="flex-1 bg-[#007BC4] hover:bg-[#006aa9] text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSimulating ? <Pause className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isSimulating ? 'Navigating...' : 'Simulate Walkthrough'}
            </button>
            <button 
              onClick={() => setSimProgress(0)}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              title="Reset Route"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Simulation Progress Bar */}
          {simProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                <span>Route Progress</span>
                <span>{simProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#007BC4] transition-all duration-300"
                  style={{ width: `${simProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Turn-by-Turn Navigation Steps */}
          <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Turn-by-turn Directions</h4>
            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-slate-200">
              {selectedTarget.steps.map((step, idx) => {
                const stepThreshold = ((idx + 1) / selectedTarget.steps.length) * 100;
                const isCompletedStep = simProgress >= stepThreshold;
                return (
                  <div key={idx} className="relative flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10 shrink-0 text-[10px] font-bold ${
                      isCompletedStep 
                        ? 'bg-emerald-500 text-white shadow-sm' 
                        : idx === selectedTarget.steps.length - 1 
                          ? 'bg-[#007BC4] text-white shadow-sm' 
                          : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isCompletedStep ? '✓' : step.stepNumber}
                    </div>
                    <div className="pt-0.5">
                      <div className={`text-xs ${isCompletedStep ? 'font-bold text-emerald-800' : 'font-medium text-slate-800'}`}>
                        {step.text}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{step.distance}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Canvas - 3D / 2D Viewport (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner relative overflow-hidden flex flex-col">
          {/* Top Canvas Bar Controls */}
          <div className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-20">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-800 text-emerald-400 border-slate-700 font-mono text-xs">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-1.5 inline-block"/>
                LIVE TWIN ENGINE
              </Badge>
              <span className="text-slate-400 text-xs font-mono font-bold hidden sm:inline">WebGL 60FPS • GAO Spatial 3.2</span>
            </div>

            {/* Level Selector Buttons */}
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              {(['Level 1', 'Level 2', 'Level 3'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedLevel === lvl 
                      ? 'bg-[#007BC4] text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* 3D Rotation Controls */}
            {viewMode === '3d' && (
              <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
                <button 
                  onClick={() => setRotationAngle(r => r - 45)}
                  className="p-1.5 text-slate-300 hover:text-white transition"
                  title="Rotate Left"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setRotationAngle(0)}
                  className="px-2 text-xs font-bold text-slate-300 hover:text-white transition"
                  title="Reset Angle"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setRotationAngle(r => r + 45)}
                  className="p-1.5 text-slate-300 hover:text-white transition"
                  title="Rotate Right"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Viewport Render Area */}
          <div className="flex-1 relative flex items-center justify-center p-6 min-h-[460px] overflow-hidden select-none">
            {/* Background 3D Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-500" 
              style={{
                backgroundImage: 'linear-gradient(#007BC4 1px, transparent 1px), linear-gradient(90deg, #007BC4 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: viewMode === '3d' ? `perspective(800px) rotateX(${tiltAngle}deg) rotateZ(${rotationAngle}deg) scale(${zoomLevel / 100})` : 'scale(1)',
              }} 
            />

            {/* 3D VIEW MODE */}
            {viewMode === '3d' && (
              <div 
                className="relative w-[520px] h-[360px] border-2 border-slate-700/60 rounded-3xl bg-slate-900/60 shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-700 flex flex-col justify-between p-6 overflow-hidden"
                style={{
                  transform: `perspective(900px) rotateX(${tiltAngle}deg) rotateZ(${rotationAngle}deg) scale(${zoomLevel / 100})`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* 3D Zone Blocks */}
                {/* Executive Wing */}
                <div className="absolute top-6 right-6 w-44 h-28 bg-[#007BC4]/20 border-2 border-[#007BC4] rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,123,196,0.3)] backdrop-blur-sm flex flex-col justify-between"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <div className="text-[11px] font-bold text-sky-300 flex items-center justify-between">
                    <span>Executive Suite A101</span>
                    <Badge className="bg-[#007BC4] text-white text-[9px]">L2</Badge>
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">Room A101 • CTO Wing</div>
                </div>

                {/* Server Room B2 */}
                <div className="absolute bottom-6 right-6 w-44 h-32 bg-amber-500/20 border-2 border-amber-500/80 rounded-2xl p-3 shadow-[0_10px_30px_rgba(245,158,11,0.2)] backdrop-blur-sm flex flex-col justify-between"
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                    <span>Server Vault B204</span>
                    <Badge className="bg-amber-500 text-slate-950 font-bold text-[9px]">RESTRICTED</Badge>
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">Cluster Rack B-08</div>
                </div>

                {/* R&D Robotics Lab 3 */}
                <div className="absolute bottom-6 left-6 w-44 h-32 bg-emerald-500/20 border-2 border-emerald-500/80 rounded-2xl p-3 shadow-[0_10px_30px_rgba(16,185,129,0.2)] backdrop-blur-sm flex flex-col justify-between"
                  style={{ transform: 'translateZ(25px)' }}
                >
                  <div className="text-[11px] font-bold text-emerald-300 flex items-center justify-between">
                    <span>Robotics Lab 3</span>
                    <Badge className="bg-emerald-500 text-slate-950 font-bold text-[9px]">ACTIVE</Badge>
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">RFID Test Bed</div>
                </div>

                {/* Main Lobby / Security Desk */}
                <div className="absolute top-6 left-6 w-40 h-24 bg-slate-800/80 border-2 border-slate-600 rounded-2xl p-3 backdrop-blur-sm flex flex-col justify-between"
                  style={{ transform: 'translateZ(10px)' }}
                >
                  <div className="text-[11px] font-bold text-slate-200">Security Gate 1</div>
                  <div className="text-[10px] text-slate-400 font-mono">Level 1 • Entrance</div>
                </div>

                {/* Glowing 3D Navigation Path Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ transform: 'translateZ(35px)' }}>
                  <line 
                    x1="120" y1="80" 
                    x2="260" y2="180" 
                    stroke="#007BC4" strokeWidth="4" strokeDasharray="6 6"
                    className="animate-pulse"
                  />
                  <line 
                    x1="260" y1="180" 
                    x2={selectedTarget.coords2D.x * 5} y2={selectedTarget.coords2D.y * 3.4} 
                    stroke="#007BC4" strokeWidth="4" strokeDasharray="6 6"
                    className="animate-pulse"
                  />

                  {/* Animated Simulated Walker Dot */}
                  {simProgress > 0 && (
                    <circle 
                      cx={120 + ((selectedTarget.coords2D.x * 5 - 120) * (simProgress / 100))} 
                      cy={80 + ((selectedTarget.coords2D.y * 3.4 - 80) * (simProgress / 100))} 
                      r="7" 
                      fill="#38bdf8" 
                      className="shadow-[0_0_20px_#38bdf8] animate-bounce"
                    />
                  )}
                </svg>

                {/* Target Marker Pin */}
                <div 
                  className="absolute z-20 transition-all duration-500 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{
                    left: `${selectedTarget.coords2D.x}%`,
                    top: `${selectedTarget.coords2D.y}%`,
                    transform: 'translateZ(45px)'
                  }}
                >
                  <div className="bg-[#007BC4] text-white p-2 rounded-full border-2 border-white shadow-[0_0_25px_#007BC4] animate-bounce">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-slate-900/90 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-md mt-1 border border-slate-700 whitespace-nowrap">
                    {selectedTarget.name}
                  </div>
                </div>
              </div>
            )}

            {/* 2D VIEW MODE */}
            {viewMode === '2d' && (
              <div className="relative w-full max-w-xl h-[380px] bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col justify-between">
                <div className="absolute top-3 left-4 text-xs font-mono font-bold text-slate-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#007BC4]" />
                  2D Floor Vector Map • {selectedLevel} Grid
                </div>

                {/* Vector Grid Blueprint SVG */}
                <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none" viewBox="0 0 500 350">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Building Room Outlines */}
                  <rect x="30" y="40" width="120" height="90" fill="#1e293b" stroke="#334155" strokeWidth="2" rx="8" />
                  <text x="40" y="65" fill="#94a3b8" fontSize="10" fontWeight="bold">SECURITY LOBBY</text>

                  <rect x="200" y="40" width="260" height="110" fill="#0f172a" stroke="#007BC4" strokeWidth="2" rx="8" />
                  <text x="210" y="65" fill="#38bdf8" fontSize="10" fontWeight="bold">EXECUTIVE SUITE A101</text>

                  <rect x="30" y="180" width="180" height="130" fill="#0f172a" stroke="#10b981" strokeWidth="2" rx="8" />
                  <text x="40" y="205" fill="#34d399" fontSize="10" fontWeight="bold">ROBOTICS LAB 3</text>

                  <rect x="260" y="180" width="200" height="130" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="8" />
                  <text x="270" y="205" fill="#fbbf24" fontSize="10" fontWeight="bold">SERVER VAULT B204</text>

                  {/* Navigation Path Line */}
                  <path 
                    d={`M 90 85 L 230 85 L ${selectedTarget.coords2D.x * 4.8} ${selectedTarget.coords2D.y * 3.2}`} 
                    fill="none" 
                    stroke="#007BC4" 
                    strokeWidth="3" 
                    strokeDasharray="6 6"
                  />

                  {/* Animated Simulated Walker Dot */}
                  {simProgress > 0 && (
                    <circle 
                      cx={90 + ((selectedTarget.coords2D.x * 4.8 - 90) * (simProgress / 100))} 
                      cy={85 + ((selectedTarget.coords2D.y * 3.2 - 85) * (simProgress / 100))} 
                      r="6" 
                      fill="#38bdf8" 
                    />
                  )}
                </svg>

                {/* Clickable Target Waypoints on 2D Map */}
                <div className="relative w-full h-full">
                  {INDOOR_TARGETS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTargetId(t.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full border-2 transition-all duration-300 ${
                        selectedTargetId === t.id 
                          ? 'bg-[#007BC4] border-white scale-125 z-20 shadow-[0_0_20px_#007BC4]' 
                          : 'bg-slate-800 border-slate-600 hover:scale-110 z-10'
                      }`}
                      style={{ left: `${t.coords2D.x}%`, top: `${t.coords2D.y}%` }}
                      title={t.name}
                    >
                      <MapPin className="w-3.5 h-3.5 text-white" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Control Dock */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-4">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-400">Selected Route:</span>
              <span className="font-semibold text-white">{START_LOCATIONS.find(s => s.id === selectedStart)?.name.split(' - ')[0]} → {selectedTarget.name}</span>
            </div>

            <div className="flex items-center gap-6 font-mono text-[11px]">
              <div>Distance: <span className="text-[#007BC4] font-bold">{selectedTarget.distanceMeters}m</span></div>
              <div>ETA: <span className="text-emerald-400 font-bold">{selectedTarget.estTime}</span></div>
              <div>Steps: <span className="text-slate-200 font-bold">{selectedTarget.steps.length} Waypoints</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
