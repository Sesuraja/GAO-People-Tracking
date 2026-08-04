import React, { useState, useEffect } from 'react';
import { 
  Box, Compass, Layers, User, Zap, Navigation, MapPin, 
  RotateCw, RotateCcw, Eye, Play, Pause, RefreshCw, Search, 
  Building, CheckCircle2, AlertTriangle, ShieldAlert, 
  ArrowRight, Clock, Footprints, Shield, Radio, Activity,
  Upload, Building2, Image as ImageIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface IndoorTarget {
  id: string;
  facilityId: string;
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

interface FacilityRoom {
  id: string;
  facilityId: string;
  level: 'Level 1' | 'Level 2' | 'Level 3';
  name: string;
  subtitle: string;
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z?: number;
  colorType: 'blue' | 'amber' | 'emerald' | 'purple' | 'slate' | 'rose';
}

const FACILITIES = [
  { id: 'hq', name: 'GAO HQ Main Building', levels: ['Level 1', 'Level 2', 'Level 3'] },
  { id: 'warehouse', name: 'Logistics & Warehouse Center', levels: ['Level 1', 'Level 2'] },
  { id: 'rd', name: 'Secure R&D Tech Campus', levels: ['Level 1', 'Level 2', 'Level 3'] },
  { id: 'datacenter', name: 'Server Datacenter Annex', levels: ['Level 1', 'Level 2'] }
];

const START_LOCATIONS = [
  { id: 'LOBBY', name: 'Main Lobby - Security Desk 1 (Level 1)', coords: { x: 15, y: 15 } },
  { id: 'ELEVATOR_B', name: 'Elevator B Lobby (Level 2)', coords: { x: 50, y: 20 } },
  { id: 'DOCK', name: 'South Loading Dock Gate (Level 1)', coords: { x: 10, y: 80 } },
  { id: 'CAFETERIA', name: 'Cafeteria West Entrance (Level 1)', coords: { x: 25, y: 35 } }
];

const FACILITY_ROOMS: FacilityRoom[] = [
  // --- GAO HQ Main Building (hq) ---
  { id: 'hq-l1-sec', facilityId: 'hq', level: 'Level 1', name: 'Security Gate 1', subtitle: 'Main Entrance & Badging', code: 'ENT-1', x: 5, y: 5, width: 40, height: 40, z: 15, colorType: 'slate' },
  { id: 'hq-l1-cafe', facilityId: 'hq', level: 'Level 1', name: 'Cafeteria & Lounge', subtitle: 'Dining & Breakout Space', code: 'AMN-1', x: 5, y: 52, width: 40, height: 42, z: 20, colorType: 'blue' },
  { id: 'hq-l1-atrium', facilityId: 'hq', level: 'Level 1', name: 'Central Atrium', subtitle: 'Public Assembly Area', code: 'ATR-1', x: 50, y: 5, width: 45, height: 40, z: 15, colorType: 'purple' },
  { id: 'hq-l1-med', facilityId: 'hq', level: 'Level 1', name: 'First Aid Kiosk', subtitle: 'AED & Emergency Kit', code: 'MED-1', x: 50, y: 52, width: 45, height: 42, z: 25, colorType: 'rose' },

  { id: 'hq-l2-exec', facilityId: 'hq', level: 'Level 2', name: 'Executive Suite A101', subtitle: 'CTO Wing & Boardroom', code: 'EXEC-1', x: 50, y: 5, width: 45, height: 40, z: 25, colorType: 'blue' },
  { id: 'hq-l2-server', facilityId: 'hq', level: 'Level 2', name: 'Server Vault B204', subtitle: 'Cluster Rack B-08', code: 'RSTR-1', x: 50, y: 52, width: 45, height: 42, z: 30, colorType: 'amber' },
  { id: 'hq-l2-lab', facilityId: 'hq', level: 'Level 2', name: 'Robotics Lab 3', subtitle: 'RFID Test Bed', code: 'LAB-3', x: 5, y: 52, width: 40, height: 42, z: 20, colorType: 'emerald' },
  { id: 'hq-l2-exit', facilityId: 'hq', level: 'Level 2', name: 'North Fire Exit', subtitle: 'Emergency Stairwell 2', code: 'SAFE-1', x: 5, y: 5, width: 40, height: 40, z: 15, colorType: 'rose' },

  { id: 'hq-l3-ai', facilityId: 'hq', level: 'Level 3', name: 'AI Neural Lab 301', subtitle: 'Deep Learning Cluster', code: 'LAB-301', x: 5, y: 5, width: 42, height: 42, z: 25, colorType: 'purple' },
  { id: 'hq-l3-csuite', facilityId: 'hq', level: 'Level 3', name: 'C-Suite Boardroom', subtitle: 'Executive Strategy Hall', code: 'BOARD-3', x: 52, y: 5, width: 43, height: 42, z: 30, colorType: 'blue' },
  { id: 'hq-l3-vip', facilityId: 'hq', level: 'Level 3', name: 'VIP Observation Lounge', subtitle: 'Panoramic Skyline View', code: 'VIP-1', x: 20, y: 54, width: 60, height: 40, z: 20, colorType: 'emerald' },

  // --- Logistics & Warehouse Center (warehouse) ---
  { id: 'wh-l1-dock', facilityId: 'warehouse', level: 'Level 1', name: 'Loading Dock Alpha', subtitle: 'Receiving Gate 1-4', code: 'DOCK-A', x: 5, y: 5, width: 42, height: 42, z: 20, colorType: 'amber' },
  { id: 'wh-l1-bay', facilityId: 'warehouse', level: 'Level 1', name: 'High-Bay Staging Area', subtitle: 'Automated Pallet Racks', code: 'BAY-1', x: 52, y: 5, width: 43, height: 42, z: 30, colorType: 'blue' },
  { id: 'wh-l1-sort', facilityId: 'warehouse', level: 'Level 1', name: 'Package Sorting Hub', subtitle: 'Conveyor RFID Scanners', code: 'SORT-1', x: 5, y: 52, width: 42, height: 42, z: 22, colorType: 'purple' },
  { id: 'wh-l1-fork', facilityId: 'warehouse', level: 'Level 1', name: 'Forklift Charging Depot', subtitle: 'Heavy Equipment Bay', code: 'CHG-1', x: 52, y: 52, width: 43, height: 42, z: 18, colorType: 'slate' },

  { id: 'wh-l2-inv', facilityId: 'warehouse', level: 'Level 2', name: 'Inventory Control Office', subtitle: 'Stock Audit Systems', code: 'INV-2', x: 5, y: 5, width: 44, height: 42, z: 22, colorType: 'blue' },
  { id: 'wh-l2-dispatch', facilityId: 'warehouse', level: 'Level 2', name: 'Dispatch Command Hub', subtitle: 'Fleet Logistics Center', code: 'DISP-1', x: 54, y: 5, width: 41, height: 42, z: 25, colorType: 'emerald' },
  { id: 'wh-l2-hazmat', facilityId: 'warehouse', level: 'Level 2', name: 'Hazmat Safe Storage', subtitle: 'Pressurized Vault', code: 'HAZ-1', x: 15, y: 52, width: 70, height: 42, z: 30, colorType: 'rose' },

  // --- Secure R&D Tech Campus (rd) ---
  { id: 'rd-l1-quantum', facilityId: 'rd', level: 'Level 1', name: 'Quantum Physics Testing', subtitle: 'Cryogenic Test Cell', code: 'QTM-1', x: 5, y: 5, width: 42, height: 42, z: 25, colorType: 'purple' },
  { id: 'rd-l1-arena', facilityId: 'rd', level: 'Level 1', name: 'Robotics Arena', subtitle: 'Autonomous Swarm Test', code: 'BOT-1', x: 52, y: 5, width: 43, height: 42, z: 30, colorType: 'emerald' },
  { id: 'rd-l1-clean', facilityId: 'rd', level: 'Level 1', name: 'Class-100 Cleanroom', subtitle: 'Silicon Micro-Fab', code: 'FAB-1', x: 5, y: 52, width: 42, height: 42, z: 28, colorType: 'amber' },
  { id: 'rd-l1-demo', facilityId: 'rd', level: 'Level 1', name: 'Visitor Demo Center', subtitle: 'Interactive Exhibit', code: 'DEMO-1', x: 52, y: 52, width: 43, height: 42, z: 20, colorType: 'blue' },

  { id: 'rd-l2-neural', facilityId: 'rd', level: 'Level 2', name: 'Neural Net Training Bay', subtitle: 'Tensor Supercomputer', code: 'NN-2', x: 5, y: 5, width: 42, height: 42, z: 28, colorType: 'purple' },
  { id: 'rd-l2-proto', facilityId: 'rd', level: 'Level 2', name: 'Rapid Prototyping Workshop', subtitle: '3D Laser Printing', code: 'PROTO-1', x: 52, y: 5, width: 43, height: 42, z: 22, colorType: 'blue' },
  { id: 'rd-l2-server', facilityId: 'rd', level: 'Level 2', name: 'R&D Micro-Data Annex', subtitle: 'Edge Computing Racks', code: 'EDGE-1', x: 15, y: 52, width: 70, height: 42, z: 32, colorType: 'slate' },

  { id: 'rd-l3-laser', facilityId: 'rd', level: 'Level 3', name: 'Optical Laser Testing', subtitle: 'Class 4 Laser Chamber', code: 'LSR-3', x: 5, y: 5, width: 44, height: 42, z: 30, colorType: 'rose' },
  { id: 'rd-l3-drone', facilityId: 'rd', level: 'Level 3', name: 'Drone Flight Test Enclosure', subtitle: 'High-Altitude Cage', code: 'DRN-1', x: 54, y: 5, width: 41, height: 42, z: 25, colorType: 'emerald' },
  { id: 'rd-l3-lounge', facilityId: 'rd', level: 'Level 3', name: 'R&D Executive Lounge', subtitle: 'Scientist Breakout Zone', code: 'LNG-3', x: 20, y: 52, width: 60, height: 42, z: 20, colorType: 'blue' },

  // --- Server Datacenter Annex (datacenter) ---
  { id: 'dc-l1-vault-a', facilityId: 'datacenter', level: 'Level 1', name: 'Server Cluster Vault A', subtitle: '100 Gbps Dark Fiber', code: 'VLT-A', x: 5, y: 5, width: 42, height: 42, z: 32, colorType: 'amber' },
  { id: 'dc-l1-noc', facilityId: 'datacenter', level: 'Level 1', name: 'Network Operations Center', subtitle: '24/7 Security Monitoring', code: 'NOC-1', x: 52, y: 5, width: 43, height: 42, z: 25, colorType: 'blue' },
  { id: 'dc-l1-power', facilityId: 'datacenter', level: 'Level 1', name: 'High-Voltage Substation', subtitle: 'Dual Grid Transformers', code: 'PWR-1', x: 5, y: 52, width: 42, height: 42, z: 28, colorType: 'rose' },
  { id: 'dc-l1-cool', facilityId: 'datacenter', level: 'Level 1', name: 'Liquid Cooling Hub', subtitle: 'Chiller Distribution', code: 'COOL-1', x: 52, y: 52, width: 43, height: 42, z: 22, colorType: 'purple' },

  { id: 'dc-l2-fiber', facilityId: 'datacenter', level: 'Level 2', name: 'Fiber Distribution Node', subtitle: 'Main Patch Panel', code: 'FBR-2', x: 5, y: 5, width: 44, height: 42, z: 25, colorType: 'blue' },
  { id: 'dc-l2-gen', facilityId: 'datacenter', level: 'Level 2', name: 'Emergency Diesel Generators', subtitle: '3MW Backup Power', code: 'GEN-1', x: 54, y: 5, width: 41, height: 42, z: 30, colorType: 'amber' },
  { id: 'dc-l2-sec', facilityId: 'datacenter', level: 'Level 2', name: 'Security Operations & CCTV', subtitle: 'Biometric Access Control', code: 'CCTV-1', x: 15, y: 52, width: 70, height: 42, z: 22, colorType: 'emerald' }
];

const INDOOR_TARGETS: IndoorTarget[] = [
  // --- GAO HQ Main Building Targets ---
  {
    id: 'vis-alice',
    facilityId: 'hq',
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
      { stepNumber: 5, text: 'Arrive at Executive Suite A101', distance: '25m', icon: 'destination' }
    ]
  },
  {
    id: 'vis-robert',
    facilityId: 'hq',
    name: 'Robert Fox (Auditor Visitor)',
    type: 'visitor',
    floor: 'Level 2',
    zoneName: 'Server Vault B204',
    coords2D: { x: 72, y: 72 },
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
    facilityId: 'hq',
    name: 'Priya Sharma (R&D Lab Lead)',
    type: 'staff',
    floor: 'Level 2',
    zoneName: 'Robotics Lab 3',
    coords2D: { x: 25, y: 72 },
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
    facilityId: 'hq',
    name: 'Executive Suite A101',
    type: 'room',
    floor: 'Level 2',
    zoneName: 'Executive Wing',
    coords2D: { x: 72, y: 25 },
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
    id: 'room-cafe',
    facilityId: 'hq',
    name: 'Main Cafeteria & Lounge',
    type: 'amenity',
    floor: 'Level 1',
    zoneName: 'Cafeteria & Lounge',
    coords2D: { x: 25, y: 72 },
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
    facilityId: 'hq',
    name: 'North Fire Exit',
    type: 'safety',
    floor: 'Level 2',
    zoneName: 'North Fire Exit',
    coords2D: { x: 25, y: 25 },
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

  // --- Logistics & Warehouse Center Targets ---
  {
    id: 'wh-dock-target',
    facilityId: 'warehouse',
    name: 'Loading Dock Alpha',
    type: 'room',
    floor: 'Level 1',
    zoneName: 'Loading Dock Alpha',
    coords2D: { x: 25, y: 25 },
    distanceMeters: 45,
    estTime: '35 sec',
    requiredAccess: 'Warehouse Badge',
    description: 'Primary receiving dock for incoming freight and cargo shipments.',
    steps: [
      { stepNumber: 1, text: 'Start at Main Gate', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Walk along Receiving Bay A', distance: '30m', icon: 'straight' },
      { stepNumber: 3, text: 'Arrive at Dock Alpha', distance: '15m', icon: 'destination' }
    ]
  },
  {
    id: 'wh-marcus-target',
    facilityId: 'warehouse',
    name: 'Marcus Vance (Logistics Supervisor)',
    type: 'staff',
    floor: 'Level 1',
    zoneName: 'High-Bay Staging Area',
    coords2D: { x: 72, y: 25 },
    distanceMeters: 80,
    estTime: '1 min',
    requiredAccess: 'Supervisor Badge',
    status: 'In High-Bay Staging Area',
    tagId: 'T108',
    description: 'Supervising pallet conveyor calibration and RFID inventory scan.',
    steps: [
      { stepNumber: 1, text: 'Start at Main Gate', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Proceed East past Staging A', distance: '50m', icon: 'straight' },
      { stepNumber: 3, text: 'Arrive at High-Bay Rack 12', distance: '30m', icon: 'destination' }
    ]
  },
  {
    id: 'wh-hazmat-target',
    facilityId: 'warehouse',
    name: 'Hazmat Safe Storage',
    type: 'safety',
    floor: 'Level 2',
    zoneName: 'Hazmat Safe Storage',
    coords2D: { x: 50, y: 72 },
    distanceMeters: 140,
    estTime: '1 min 50 sec',
    requiredAccess: 'Hazmat Level 4 Clearance',
    description: 'Climate-controlled containment room for regulated chemical materials.',
    steps: [
      { stepNumber: 1, text: 'Start at Gate A', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Take Industrial Lift to Level 2', distance: '40m', icon: 'elevator' },
      { stepNumber: 3, text: 'Turn Right into Vault Corridor', distance: '100m', icon: 'destination' }
    ]
  },

  // --- Secure R&D Tech Campus Targets ---
  {
    id: 'rd-elena-target',
    facilityId: 'rd',
    name: 'Dr. Elena Rostova (Lead Physicist)',
    type: 'staff',
    floor: 'Level 1',
    zoneName: 'Quantum Physics Testing',
    coords2D: { x: 25, y: 25 },
    distanceMeters: 65,
    estTime: '50 sec',
    requiredAccess: 'R&D Level 3',
    status: 'In Cryogenic Lab',
    tagId: 'T302',
    description: 'Monitoring superconducting sensor tests on RFID quantum tags.',
    steps: [
      { stepNumber: 1, text: 'Start at Campus Entrance', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Walk West into Testing Wing', distance: '45m', icon: 'straight' },
      { stepNumber: 3, text: 'Enter Quantum Testing Cell 1', distance: '20m', icon: 'destination' }
    ]
  },
  {
    id: 'rd-clean-target',
    facilityId: 'rd',
    name: 'Class-100 Cleanroom',
    type: 'room',
    floor: 'Level 1',
    zoneName: 'Class-100 Cleanroom',
    coords2D: { x: 25, y: 72 },
    distanceMeters: 90,
    estTime: '1 min 10 sec',
    requiredAccess: 'Gown Room Clearance',
    description: 'Ultra-clean silicon fab room for micro-sensor development.',
    steps: [
      { stepNumber: 1, text: 'Start at Campus Entrance', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Proceed South down Clean Corridor', distance: '60m', icon: 'straight' },
      { stepNumber: 3, text: 'Enter Air Lock Chamber', distance: '30m', icon: 'destination' }
    ]
  },
  {
    id: 'rd-neural-target',
    facilityId: 'rd',
    name: 'Neural Net Training Bay',
    type: 'room',
    floor: 'Level 2',
    zoneName: 'Neural Net Training Bay',
    coords2D: { x: 25, y: 25 },
    distanceMeters: 120,
    estTime: '1 min 30 sec',
    requiredAccess: 'AI Research Badge',
    description: 'High-density GPU cluster running neural spatial tracking models.',
    steps: [
      { stepNumber: 1, text: 'Start at Elevator Bank', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Ascend to Level 2', distance: '20m', icon: 'elevator' },
      { stepNumber: 3, text: 'Turn Left into Server Wing', distance: '100m', icon: 'destination' }
    ]
  },

  // --- Server Datacenter Annex Targets ---
  {
    id: 'dc-chen-target',
    facilityId: 'datacenter',
    name: 'David Chen (NOC Systems Admin)',
    type: 'staff',
    floor: 'Level 1',
    zoneName: 'Network Operations Center',
    coords2D: { x: 72, y: 25 },
    distanceMeters: 50,
    estTime: '40 sec',
    requiredAccess: 'NOC Level 2 Clearance',
    status: 'In NOC Command Console',
    tagId: 'T501',
    description: 'Monitoring real-time telemetry from 500+ UHF RFID gateways.',
    steps: [
      { stepNumber: 1, text: 'Start at Security Checkpoint', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Proceed East past Monitoring Glass', distance: '35m', icon: 'straight' },
      { stepNumber: 3, text: 'Enter NOC Command Room', distance: '15m', icon: 'destination' }
    ]
  },
  {
    id: 'dc-vault-target',
    facilityId: 'datacenter',
    name: 'Server Cluster Vault A',
    type: 'room',
    floor: 'Level 1',
    zoneName: 'Server Cluster Vault A',
    coords2D: { x: 25, y: 25 },
    distanceMeters: 85,
    estTime: '1 min 05 sec',
    requiredAccess: 'Biometric Access Level 5',
    description: 'Ultra-secure core server racks holding real-time tracking logs.',
    steps: [
      { stepNumber: 1, text: 'Start at Security Checkpoint', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Walk West along Cold-Aisle Corridor', distance: '60m', icon: 'straight' },
      { stepNumber: 3, text: 'Scan Palm Scanner at Vault A Gate', distance: '25m', icon: 'destination' }
    ]
  },
  {
    id: 'dc-gen-target',
    facilityId: 'datacenter',
    name: 'Emergency Diesel Generators',
    type: 'safety',
    floor: 'Level 2',
    zoneName: 'Emergency Diesel Generators',
    coords2D: { x: 72, y: 25 },
    distanceMeters: 130,
    estTime: '1 min 40 sec',
    requiredAccess: 'Facilities Staff Badge',
    description: '3MW industrial diesel generators with 72-hour fuel capacity.',
    steps: [
      { stepNumber: 1, text: 'Start at Elevator 1', distance: '0m', icon: 'straight' },
      { stepNumber: 2, text: 'Ascend to Level 2 Power Wing', distance: '30m', icon: 'elevator' },
      { stepNumber: 3, text: 'Turn Right to Generator Bay 1', distance: '100m', icon: 'destination' }
    ]
  }
];

export default function DigitalTwinTab() {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedFacility, setSelectedFacility] = useState<string>('hq');
  const [customFloorplanUrl, setCustomFloorplanUrl] = useState<string | null>(null);
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

  const activeFacility = FACILITIES.find(f => f.id === selectedFacility) || FACILITIES[0];
  const facilityTargets = INDOOR_TARGETS.filter(t => t.facilityId === selectedFacility);

  const filteredTargets = facilityTargets.filter(t => {
    if (targetFilter === 'People') return t.type === 'visitor' || t.type === 'staff';
    if (targetFilter === 'Rooms') return t.type === 'room' || t.type === 'amenity';
    if (targetFilter === 'Safety') return t.type === 'safety';
    return true;
  });

  const selectedTarget = INDOOR_TARGETS.find(t => t.id === selectedTargetId) || facilityTargets[0] || INDOOR_TARGETS[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomFloorplanUrl(url);
    }
  };

  // Sync selected target when facility changes
  useEffect(() => {
    if (facilityTargets.length > 0) {
      const exists = facilityTargets.some(t => t.id === selectedTargetId);
      if (!exists) {
        setSelectedTargetId(facilityTargets[0].id);
      }
    }
  }, [selectedFacility]);

  // Sync selected level when active facility changes or target changes
  useEffect(() => {
    if (activeFacility) {
      if (!activeFacility.levels.includes(selectedLevel)) {
        setSelectedLevel(activeFacility.levels[0] as any);
      }
    }
  }, [selectedFacility]);

  // Sync level when target changes
  useEffect(() => {
    if (selectedTarget) {
      setSelectedLevel(selectedTarget.floor);
    }
  }, [selectedTargetId]);

  const currentLevelRooms = FACILITY_ROOMS.filter(
    r => r.facilityId === selectedFacility && r.level === selectedLevel
  );

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
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Select Facility & Floor Plan</label>
            <div className="space-y-2">
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#007BC4]" />
                <select
                  value={selectedFacility}
                  onChange={e => setSelectedFacility(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007BC4]/20"
                >
                  {FACILITIES.map(fac => (
                    <option key={fac.id} value={fac.id}>{fac.name}</option>
                  ))}
                </select>
              </div>

              {/* Upload Custom Floorplan Button */}
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-[#007BC4]" />
                  {customFloorplanUrl ? 'Change Floorplan Image' : 'Upload Floorplan Image'}
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                {customFloorplanUrl && (
                  <button 
                    onClick={() => setCustomFloorplanUrl(null)}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition"
                    title="Remove custom floor plan"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

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
          {selectedTarget && (
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
          )}
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
              <span className="text-slate-400 text-xs font-mono font-bold hidden sm:inline">{activeFacility.name}</span>
            </div>

            {/* Level Selector Buttons */}
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              {activeFacility.levels.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl as any)}
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
                {/* Dynamic 3D Room Blocks for Active Facility & Level */}
                {currentLevelRooms.map(room => {
                  const isTargetRoom = selectedTarget && (
                    selectedTarget.zoneName.toLowerCase().includes(room.name.toLowerCase()) || 
                    room.name.toLowerCase().includes(selectedTarget.zoneName.toLowerCase())
                  );

                  return (
                    <div 
                      key={room.id}
                      onClick={() => {
                        const matchingTarget = facilityTargets.find(
                          t => t.zoneName.toLowerCase().includes(room.name.toLowerCase()) || room.name.toLowerCase().includes(t.zoneName.toLowerCase())
                        );
                        if (matchingTarget) setSelectedTargetId(matchingTarget.id);
                      }}
                      className={`absolute rounded-2xl p-3 shadow-lg border-2 backdrop-blur-md cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                        isTargetRoom 
                          ? 'ring-4 ring-[#007BC4] scale-105 z-20 bg-[#007BC4]/40 border-[#007BC4] shadow-[0_0_30px_rgba(0,123,196,0.6)]' 
                          : room.colorType === 'blue' ? 'bg-[#007BC4]/20 border-[#007BC4] hover:bg-[#007BC4]/30'
                          : room.colorType === 'amber' ? 'bg-amber-500/20 border-amber-500/80 hover:bg-amber-500/30'
                          : room.colorType === 'emerald' ? 'bg-emerald-500/20 border-emerald-500/80 hover:bg-emerald-500/30'
                          : room.colorType === 'purple' ? 'bg-purple-500/20 border-purple-500/80 hover:bg-purple-500/30'
                          : room.colorType === 'rose' ? 'bg-rose-500/20 border-rose-500/80 hover:bg-rose-500/30'
                          : 'bg-slate-800/80 border-slate-600 hover:bg-slate-700/80'
                      }`}
                      style={{
                        left: `${room.x}%`,
                        top: `${room.y}%`,
                        width: `${room.width}%`,
                        height: `${room.height}%`,
                        transform: `translateZ(${room.z || 20}px)`
                      }}
                    >
                      <div className="text-[11px] font-bold text-slate-100 flex items-center justify-between gap-1">
                        <span className="truncate">{room.name}</span>
                        <Badge className={`text-[9px] font-bold shrink-0 ${
                          isTargetRoom ? 'bg-[#007BC4] text-white' : 'bg-slate-800 text-slate-200 border-slate-600'
                        }`}>{room.code}</Badge>
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono truncate">{room.subtitle}</div>
                    </div>
                  );
                })}

                {/* Glowing 3D Navigation Path Overlay */}
                {selectedTarget && (
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
                )}

                {/* Target Marker Pin */}
                {selectedTarget && (
                  <div 
                    className="absolute z-20 transition-all duration-500 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
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
                )}
              </div>
            )}

            {/* 2D VIEW MODE */}
            {viewMode === '2d' && (
              <div className="relative w-full max-w-xl h-[380px] bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col justify-between">
                <div className="absolute top-3 left-4 z-20 text-xs font-mono font-bold text-slate-200 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#007BC4]" />
                  {activeFacility.name} • {selectedLevel} {customFloorplanUrl ? '(Custom Uploaded Map)' : '(Vector Blueprint)'}
                </div>

                {customFloorplanUrl ? (
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={customFloorplanUrl} 
                      alt="Uploaded Floorplan" 
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-slate-950/40" />
                  </div>
                ) : (
                  /* Vector Grid Blueprint SVG */
                  <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none z-0" viewBox="0 0 500 350">
                    {/* Grid Lines */}
                    <defs>
                      <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                        <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Dynamic Room Outlines for Selected Facility & Level */}
                    {currentLevelRooms.map(r => {
                      const isTargetRoom = selectedTarget && (
                        selectedTarget.zoneName.toLowerCase().includes(r.name.toLowerCase()) || 
                        r.name.toLowerCase().includes(selectedTarget.zoneName.toLowerCase())
                      );

                      return (
                        <g key={r.id}>
                          <rect 
                            x={r.x * 4.6 + 10} 
                            y={r.y * 3.1 + 10} 
                            width={r.width * 4.6} 
                            height={r.height * 3.1} 
                            fill={isTargetRoom ? "#007BC4" : "#0f172a"} 
                            stroke={isTargetRoom ? "#38bdf8" : r.colorType === 'amber' ? '#f59e0b' : r.colorType === 'emerald' ? '#10b981' : r.colorType === 'purple' ? '#a855f7' : r.colorType === 'rose' ? '#f43f5e' : '#007BC4'} 
                            strokeWidth={isTargetRoom ? "3" : "2"} 
                            rx="8" 
                          />
                          <text 
                            x={r.x * 4.6 + 20} 
                            y={r.y * 3.1 + 32} 
                            fill={isTargetRoom ? "#ffffff" : "#94a3b8"} 
                            fontSize="10" 
                            fontWeight="bold"
                          >
                            {r.name.toUpperCase()}
                          </text>
                        </g>
                      );
                    })}

                    {/* Navigation Path Line */}
                    {selectedTarget && (
                      <path 
                        d={`M 90 85 L 230 85 L ${selectedTarget.coords2D.x * 4.8} ${selectedTarget.coords2D.y * 3.2}`} 
                        fill="none" 
                        stroke="#007BC4" 
                        strokeWidth="3" 
                        strokeDasharray="6 6"
                      />
                    )}

                    {/* Animated Simulated Walker Dot */}
                    {simProgress > 0 && selectedTarget && (
                      <circle 
                        cx={90 + ((selectedTarget.coords2D.x * 4.8 - 90) * (simProgress / 100))} 
                        cy={85 + ((selectedTarget.coords2D.y * 3.2 - 85) * (simProgress / 100))} 
                        r="6" 
                        fill="#38bdf8" 
                      />
                    )}
                  </svg>
                )}

                {/* Clickable Target Waypoints on 2D Map filtered by facility & level */}
                <div className="relative w-full h-full z-10">
                  {facilityTargets.filter(t => t.floor === selectedLevel).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTargetId(t.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full border-2 transition-all duration-300 ${
                        selectedTargetId === t.id 
                          ? 'bg-[#007BC4] border-white scale-125 z-20 shadow-[0_0_20px_#007BC4]' 
                          : 'bg-slate-800 border-slate-600 hover:scale-110 z-10'
                      }`}
                      style={{ left: `${t.coords2D.x}%`, top: `${t.coords2D.y}%` }}
                      title={`${t.name} (${t.zoneName})`}
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
              <span className="font-semibold text-white">{START_LOCATIONS.find(s => s.id === selectedStart)?.name.split(' - ')[0]} → {selectedTarget?.name || 'Destination'}</span>
            </div>

            {selectedTarget && (
              <div className="flex items-center gap-6 font-mono text-[11px]">
                <div>Distance: <span className="text-[#007BC4] font-bold">{selectedTarget.distanceMeters}m</span></div>
                <div>ETA: <span className="text-emerald-400 font-bold">{selectedTarget.estTime}</span></div>
                <div>Steps: <span className="text-slate-200 font-bold">{selectedTarget.steps.length} Waypoints</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
