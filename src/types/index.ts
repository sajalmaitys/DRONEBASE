export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
  altitude?: number;
  order: number;
}

export interface Mission {
  id: string;
  name: string;
  waypoints: Waypoint[];
  estimatedDuration: number;
  notes: string;
  status: MissionStatus;
  createdAt: Date;
  completedAt?: Date;
  assignedDroneId?: string;
  totalDistance: number;
  estimatedFlightTime: number;
}

export type MissionStatus = 'draft' | 'preparing' | 'in-flight' | 'landing' | 'completed' | 'emergency' | 'cancelled';

export interface Drone {
  id: string;
  name: string;
  model: string;
  status: DroneStatus;
  batteryLevel: number;
  currentPosition?: {
    lat: number;
    lng: number;
    altitude: number;
  };
  speed?: number;
  assignedMissionId?: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
  specifications: {
    maxFlightTime: number;
    maxRange: number;
    maxAltitude: number;
    payloadCapacity: number;
  };
}

export type DroneStatus = 'available' | 'active' | 'maintenance' | 'charging' | 'offline';

export interface Telemetry {
  droneId: string;
  timestamp: Date;
  position: {
    lat: number;
    lng: number;
    altitude: number;
  };
  speed: number;
  batteryLevel: number;
  heading: number;
  temperature: number;
  signalStrength: number;
}

export interface MissionProgress {
  missionId: string;
  currentWaypointIndex: number;
  completionPercentage: number;
  remainingTime: number;
  distanceCovered: number;
  remainingDistance: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  preferences: UserPreferences;
}

export interface UserPreferences {
  mapStyle: 'satellite' | 'terrain' | 'street';
  defaultZoom: number;
  units: 'metric' | 'imperial';
  notifications: {
    missionStart: boolean;
    missionComplete: boolean;
    lowBattery: boolean;
    emergency: boolean;
  };
  theme: 'light' | 'dark';
}

export interface Settings {
  simulationSpeed: number;
  updateFrequency: number;
  alertThresholds: {
    lowBattery: number;
    criticalBattery: number;
    maxFlightTime: number;
  };
  map: {
    defaultCenter: {
      lat: number;
      lng: number;
    };
    defaultZoom: number;
    tileProvider: string;
  };
}