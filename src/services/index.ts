import type { Mission, Drone, Telemetry, MissionProgress } from '../types';

// Mock data for development and testing
export const mockDrones: Drone[] = [
  {
    id: 'drone-001',
    name: 'Alpha-7',
    model: 'DJI Mavic 3 Pro',
    status: 'available',
    batteryLevel: 85,
    currentPosition: {
      lat: 37.7749,
      lng: -122.4194,
      altitude: 100
    },
    speed: 0,
    lastMaintenance: new Date('2024-01-15'),
    nextMaintenance: new Date('2024-04-15'),
    specifications: {
      maxFlightTime: 43,
      maxRange: 15,
      maxAltitude: 6000,
      payloadCapacity: 0.9
    }
  },
  {
    id: 'drone-002',
    name: 'Beta-3',
    model: 'DJI Air 2S',
    status: 'active',
    batteryLevel: 72,
    currentPosition: {
      lat: 37.7849,
      lng: -122.4094,
      altitude: 150
    },
    speed: 15,
    assignedMissionId: 'mission-001',
    lastMaintenance: new Date('2024-02-01'),
    nextMaintenance: new Date('2024-05-01'),
    specifications: {
      maxFlightTime: 31,
      maxRange: 12,
      maxAltitude: 5000,
      payloadCapacity: 0.6
    }
  },
  {
    id: 'drone-003',
    name: 'Gamma-9',
    model: 'DJI Mini 3',
    status: 'maintenance',
    batteryLevel: 45,
    lastMaintenance: new Date('2024-02-20'),
    nextMaintenance: new Date('2024-02-25'),
    specifications: {
      maxFlightTime: 38,
      maxRange: 10,
      maxAltitude: 4500,
      payloadCapacity: 0.25
    }
  }
];

export const mockMissions: Mission[] = [
  {
    id: 'mission-001',
    name: 'Coastline Survey Alpha',
    waypoints: [
      { id: 'wp-1', lat: 37.7749, lng: -122.4194, altitude: 100, order: 1 },
      { id: 'wp-2', lat: 37.7849, lng: -122.4094, altitude: 120, order: 2 },
      { id: 'wp-3', lat: 37.7949, lng: -122.3994, altitude: 140, order: 3 },
      { id: 'wp-4', lat: 37.8049, lng: -122.3894, altitude: 100, order: 4 }
    ],
    estimatedDuration: 45,
    notes: 'Initial reconnaissance flight for environmental assessment',
    status: 'in-flight',
    createdAt: new Date('2024-02-27T09:00:00'),
    assignedDroneId: 'drone-002',
    totalDistance: 4.1,
    estimatedFlightTime: 42
  },
  {
    id: 'mission-002',
    name: 'Urban Infrastructure Check',
    waypoints: [
      { id: 'wp-5', lat: 37.7649, lng: -122.4294, altitude: 80, order: 1 },
      { id: 'wp-6', lat: 37.7749, lng: -122.4194, altitude: 90, order: 2 },
      { id: 'wp-7', lat: 37.7849, lng: -122.4094, altitude: 85, order: 3 }
    ],
    estimatedDuration: 30,
    notes: 'Check bridge and building conditions',
    status: 'draft',
    createdAt: new Date('2024-02-27T10:30:00'),
    totalDistance: 2.8,
    estimatedFlightTime: 28
  }
];

// WebSocket simulation service
class WebSocketService {
  private callbacks: { [key: string]: ((data: unknown) => void)[] } = {};
  private simulationInterval?: number;
  private isConnected = false;
  private missionState: 'running' | 'paused' | 'stopped' = 'running';
  private currentProgress = 0;

  connect() {
    // Simulate WebSocket connection
    console.log('WebSocket connected');
    this.isConnected = true;
    this.startSimulation();
  }

  disconnect() {
    console.log('WebSocket disconnected');
    this.isConnected = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }

  on(event: string, callback: (data: unknown) => void) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event: string, callback: (data: unknown) => void) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  // Mission control commands
  pauseMission() {
    this.missionState = 'paused';
    this.emit('missionStateChanged', { state: 'paused', timestamp: new Date() });
    console.log('Mission paused via WebSocket command');
  }

  resumeMission() {
    this.missionState = 'running';
    this.emit('missionStateChanged', { state: 'running', timestamp: new Date() });
    console.log('Mission resumed via WebSocket command');
  }

  stopMission() {
    this.missionState = 'stopped';
    this.currentProgress = 0;
    this.emit('missionStateChanged', { state: 'stopped', timestamp: new Date() });
    console.log('Mission stopped via WebSocket command');
  }

  emergencyStop() {
    this.missionState = 'stopped';
    this.emit('missionStateChanged', { state: 'emergency', timestamp: new Date() });
    this.emit('emergencyAlert', { 
      message: 'Emergency stop activated - Drone returning to home position',
      timestamp: new Date(),
      severity: 'critical'
    });
    console.log('Emergency stop activated via WebSocket command');
  }

  getMissionState() {
    return this.missionState;
  }

  private emit(event: string, data: unknown) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  private startSimulation() {
    this.simulationInterval = window.setInterval(() => {
      // Only update telemetry if mission is running
      if (this.missionState !== 'running') {
        return;
      }

      // Simulate telemetry updates
      const activeDrone = this.getActiveDrone();
      if (activeDrone && activeDrone.currentPosition) {
        // Simulate mission progress
        this.currentProgress = Math.min(100, this.currentProgress + Math.random() * 2);
        
        // Simulate battery drain
        activeDrone.batteryLevel = Math.max(0, activeDrone.batteryLevel - Math.random() * 0.1);
        
        const telemetry: Telemetry = {
          droneId: activeDrone.id,
          timestamp: new Date(),
          position: {
            lat: activeDrone.currentPosition.lat + (Math.random() - 0.5) * 0.001,
            lng: activeDrone.currentPosition.lng + (Math.random() - 0.5) * 0.001,
            altitude: activeDrone.currentPosition.altitude + (Math.random() - 0.5) * 10
          },
          speed: activeDrone.speed! + (Math.random() - 0.5) * 2,
          batteryLevel: activeDrone.batteryLevel,
          heading: Math.random() * 360,
          temperature: 20 + Math.random() * 10,
          signalStrength: 80 + Math.random() * 20
        };

        this.emit('telemetry', telemetry);

        // Update mission progress
        const activeMission = this.getActiveMission();
        if (activeMission) {
          const remainingTime = Math.max(0, activeMission.estimatedFlightTime * (100 - this.currentProgress) / 100);
          const progress: MissionProgress = {
            missionId: activeMission.id,
            currentWaypointIndex: Math.floor((this.currentProgress / 100) * activeMission.waypoints.length),
            completionPercentage: this.currentProgress,
            remainingTime,
            distanceCovered: (this.currentProgress / 100) * activeMission.totalDistance,
            remainingDistance: ((100 - this.currentProgress) / 100) * activeMission.totalDistance
          };

          this.emit('missionProgress', progress);

          // Check if mission is complete
          if (this.currentProgress >= 100) {
            this.emit('missionComplete', {
              missionId: activeMission.id,
              completedAt: new Date(),
              finalStats: {
                totalDistance: activeMission.totalDistance,
                actualFlightTime: activeMission.estimatedFlightTime,
                batteryUsed: 100 - activeDrone.batteryLevel
              }
            });
            this.missionState = 'stopped';
            this.currentProgress = 0;
          }
        }
      }
    }, 2000); // Update every 2 seconds
  }

  private getActiveDrone() {
    return mockDrones.find(d => d.status === 'active');
  }

  private getActiveMission() {
    return mockMissions.find(m => m.status === 'in-flight');
  }
}

export const webSocketService = new WebSocketService();

// Mission management service
export const missionService = {
  getMissions: (): Promise<Mission[]> => {
    return Promise.resolve([...mockMissions]);
  },

  getMission: (id: string): Promise<Mission | undefined> => {
    return Promise.resolve(mockMissions.find(m => m.id === id));
  },

  createMission: (mission: Omit<Mission, 'id' | 'createdAt'>): Promise<Mission> => {
    const newMission: Mission = {
      ...mission,
      id: `mission-${Date.now()}`,
      createdAt: new Date()
    };
    mockMissions.push(newMission);
    return Promise.resolve(newMission);
  },

  updateMission: (id: string, updates: Partial<Mission>): Promise<Mission> => {
    const index = mockMissions.findIndex(m => m.id === id);
    if (index !== -1) {
      mockMissions[index] = { ...mockMissions[index], ...updates };
      return Promise.resolve(mockMissions[index]);
    }
    throw new Error('Mission not found');
  },

  deleteMission: (id: string): Promise<void> => {
    const index = mockMissions.findIndex(m => m.id === id);
    if (index !== -1) {
      mockMissions.splice(index, 1);
      return Promise.resolve();
    }
    throw new Error('Mission not found');
  }
};

// Drone management service
export const droneService = {
  getDrones: (): Promise<Drone[]> => {
    return Promise.resolve([...mockDrones]);
  },

  getDrone: (id: string): Promise<Drone | undefined> => {
    return Promise.resolve(mockDrones.find(d => d.id === id));
  },

  updateDroneStatus: (id: string, status: Drone['status']): Promise<Drone> => {
    const index = mockDrones.findIndex(d => d.id === id);
    if (index !== -1) {
      mockDrones[index].status = status;
      return Promise.resolve(mockDrones[index]);
    }
    throw new Error('Drone not found');
  },

  assignMission: (droneId: string, missionId: string): Promise<void> => {
    const droneIndex = mockDrones.findIndex(d => d.id === droneId);
    const missionIndex = mockMissions.findIndex(m => m.id === missionId);
    
    if (droneIndex !== -1 && missionIndex !== -1) {
      mockDrones[droneIndex].assignedMissionId = missionId;
      mockMissions[missionIndex].assignedDroneId = droneId;
      return Promise.resolve();
    }
    throw new Error('Drone or mission not found');
  }
};