import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, ZoomControl } from 'react-leaflet';
import { Icon } from 'leaflet';
import {
  Play,
  Pause,
  Square,
  AlertTriangle,
  Battery,
  Navigation as NavigationIcon,
  Gauge,
  Radio,
  MapPin
} from 'lucide-react';
import type { Drone, Mission, Telemetry, MissionProgress } from '../types';
import { mockDrones, mockMissions, webSocketService } from '../services';
import { formatDistance, formatDuration, getBatteryColor } from '../utils';
import 'leaflet/dist/leaflet.css';

// Drone icon for the map
const droneIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiMwNmI2ZDQiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTQgMTZWMTBhMiAyIDAgMCAwLTQgMHY2YTIgMiAwIDAgMCA0IDBaTTE2IDEzbDEtN2EyIDIgMCAwIDEgNSAydjZhMiAyIDAgMCAxLTYgMFpNOCAxM2wtMS03YTIgMiAwIDAgMC01IDJ2NmEyIDIgMCAwIDAgNiAwWiIvPgo8L3N2Zz4KPC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export function MissionControl() {
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [activeDrone, setActiveDrone] = useState<Drone | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [missionProgress, setMissionProgress] = useState<MissionProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [missionState, setMissionState] = useState<'running' | 'paused' | 'stopped'>('running');
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Find active mission and drone
    const mission = mockMissions.find(m => m.status === 'in-flight');
    const drone = mockDrones.find(d => d.status === 'active');
    
    setActiveMission(mission || null);
    setActiveDrone(drone || null);

    // Connect to WebSocket for real-time updates
    webSocketService.connect();
    setIsConnected(true);

    // Listen for telemetry updates
    const handleTelemetry = (data: unknown) => {
      setTelemetry(data as Telemetry);
    };

    const handleMissionProgress = (data: unknown) => {
      setMissionProgress(data as MissionProgress);
    };

    const handleMissionStateChanged = (data: unknown) => {
      const stateData = data as { state: string; timestamp: Date };
      setMissionState(stateData.state as 'running' | 'paused' | 'stopped');
      addNotification(`Mission ${stateData.state} at ${new Date(stateData.timestamp).toLocaleTimeString()}`);
    };

    const handleEmergencyAlert = (data: unknown) => {
      const alertData = data as { message: string; timestamp: Date; severity: string };
      addNotification(`🚨 EMERGENCY: ${alertData.message}`);
    };

    const handleMissionComplete = (data: unknown) => {
      const completeData = data as { missionId: string; completedAt: Date };
      addNotification(`✅ Mission completed at ${new Date(completeData.completedAt).toLocaleTimeString()}`);
      setMissionState('stopped');
    };

    webSocketService.on('telemetry', handleTelemetry);
    webSocketService.on('missionProgress', handleMissionProgress);
    webSocketService.on('missionStateChanged', handleMissionStateChanged);
    webSocketService.on('emergencyAlert', handleEmergencyAlert);
    webSocketService.on('missionComplete', handleMissionComplete);

    return () => {
      webSocketService.off('telemetry', handleTelemetry);
      webSocketService.off('missionProgress', handleMissionProgress);
      webSocketService.off('missionStateChanged', handleMissionStateChanged);
      webSocketService.off('emergencyAlert', handleEmergencyAlert);
      webSocketService.off('missionComplete', handleMissionComplete);
      webSocketService.disconnect();
      setIsConnected(false);
    };
  }, []);

  const addNotification = (message: string) => {
    setNotifications(prev => {
      const newNotifications = [message, ...prev].slice(0, 5); // Keep only last 5 notifications
      return newNotifications;
    });
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 5000);
  };

  const handleMissionControl = (action: 'pause' | 'resume' | 'stop' | 'emergency') => {
    if (!isConnected) {
      alert('Cannot control mission: WebSocket not connected');
      return;
    }

    switch (action) {
      case 'pause':
        if (missionState === 'running') {
          webSocketService.pauseMission();
        } else {
          alert('Mission is not currently running');
        }
        break;
      case 'resume':
        if (missionState === 'paused') {
          webSocketService.resumeMission();
        } else {
          alert('Mission is not currently paused');
        }
        break;
      case 'stop':
        if (missionState !== 'stopped') {
          if (confirm('Are you sure you want to stop the mission? The drone will return to home.')) {
            webSocketService.stopMission();
          }
        } else {
          alert('Mission is already stopped');
        }
        break;
      case 'emergency':
        if (confirm('Are you sure you want to activate emergency stop? This will immediately halt the mission and return the drone to home position.')) {
          webSocketService.emergencyStop();
        }
        break;
    }
  };

  if (!activeMission || !activeDrone) {
    return (
      <div className="mission-control-empty">
        <div className="empty-state">
          <Radio className="empty-icon" />
          <h2>No Active Mission</h2>
          <p>Start a mission from the Mission Planning dashboard to see real-time control here.</p>
        </div>
      </div>
    );
  }

  const pathCoordinates = activeMission.waypoints.map(wp => [wp.lat, wp.lng] as [number, number]);
  const dronePosition = activeDrone.currentPosition
    ? [activeDrone.currentPosition.lat, activeDrone.currentPosition.lng] as [number, number]
    : pathCoordinates[0];

  return (
    <div className="mission-control">
      <div className="control-header">
        <div className="mission-info">
          <h1>{activeMission.name}</h1>
          <div className="mission-meta">
            <span className={`status-badge status-${activeMission.status} ${missionState !== 'running' ? 'status-' + missionState : ''}`}>
              {missionState === 'paused' ? 'PAUSED' : 
               missionState === 'stopped' ? 'STOPPED' : 
               activeMission.status.toUpperCase()}
            </span>
            <span className="drone-name">Drone: {activeDrone.name}</span>
            <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              <Radio size={14} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="control-actions">
          <button 
            className={`btn ${missionState === 'paused' ? 'btn-secondary' : 'btn-warning'}`}
            onClick={() => handleMissionControl(missionState === 'paused' ? 'resume' : 'pause')}
            disabled={missionState === 'stopped'}
          >
            {missionState === 'paused' ? (
              <>
                <Play size={16} />
                Resume
              </>
            ) : (
              <>
                <Pause size={16} />
                Pause
              </>
            )}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => handleMissionControl('stop')}
            disabled={missionState === 'stopped'}
          >
            <Square size={16} />
            Stop
          </button>
          <button 
            className="btn btn-error"
            onClick={() => handleMissionControl('emergency')}
            disabled={missionState === 'stopped'}
          >
            <AlertTriangle size={16} />
            Emergency
          </button>
        </div>
      </div>

      <div className="control-content">
        <div className="live-map">
          <MapContainer
            center={dronePosition}
            zoom={15}
            className="leaflet-map"
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
            
            {/* Mission path */}
            <Polyline
              positions={pathCoordinates}
              color="#06b6d4"
              weight={3}
              opacity={0.6}
              dashArray="10, 10"
            />
            
            {/* Waypoint markers */}
            {activeMission.waypoints.map((waypoint) => (
              <Marker
                key={waypoint.id}
                position={[waypoint.lat, waypoint.lng]}
                icon={new Icon({
                  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNmNTllMGIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })}
              />
            ))}
            
            {/* Live drone position */}
            <Marker
              position={dronePosition}
              icon={droneIcon}
            />
            
            {/* Zoom Control positioned in bottom right */}
            <ZoomControl position="bottomright" />
          </MapContainer>

          <div className="progress-overlay">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${missionProgress?.completionPercentage || 0}%` }}
              />
            </div>
            <div className="progress-text">
              {missionProgress?.completionPercentage?.toFixed(1) || 0}% Complete
            </div>
            <div className="mission-state-indicator">
              <span className={`state-badge state-${missionState}`}>
                {missionState.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Live Notifications */}
          {notifications.length > 0 && (
            <div className="notifications-overlay">
              {notifications.map((notification, index) => (
                <div key={index} className="notification-item animate-in">
                  {notification}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="telemetry-panel">
          <div className="telemetry-section">
            <h3>Live Telemetry</h3>
            <div className="telemetry-grid">
              <div className="telemetry-item">
                <Battery 
                  className="telemetry-icon" 
                  style={{ color: getBatteryColor(telemetry?.batteryLevel || activeDrone.batteryLevel) }}
                />
                <div>
                  <div className="telemetry-label">Battery</div>
                  <div className="telemetry-value">{telemetry?.batteryLevel?.toFixed(1) || activeDrone.batteryLevel}%</div>
                </div>
              </div>

              <div className="telemetry-item">
                <Gauge className="telemetry-icon" />
                <div>
                  <div className="telemetry-label">Speed</div>
                  <div className="telemetry-value">{telemetry?.speed?.toFixed(1) || activeDrone.speed} km/h</div>
                </div>
              </div>

              <div className="telemetry-item">
                <NavigationIcon className="telemetry-icon" />
                <div>
                  <div className="telemetry-label">Altitude</div>
                  <div className="telemetry-value">{telemetry?.position?.altitude?.toFixed(0) || activeDrone.currentPosition?.altitude}m</div>
                </div>
              </div>

              <div className="telemetry-item">
                <MapPin className="telemetry-icon" />
                <div>
                  <div className="telemetry-label">GPS Signal</div>
                  <div className="telemetry-value">{telemetry?.signalStrength?.toFixed(0) || 95}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="telemetry-section">
            <h3>Mission Progress</h3>
            <div className="progress-metrics">
              <div className="metric">
                <div className="metric-label">Current Waypoint</div>
                <div className="metric-value">
                  {(missionProgress?.currentWaypointIndex || 0) + 1} of {activeMission.waypoints.length}
                </div>
              </div>
              <div className="metric">
                <div className="metric-label">Distance Remaining</div>
                <div className="metric-value">
                  {formatDistance(missionProgress?.remainingDistance || activeMission.totalDistance)}
                </div>
              </div>
              <div className="metric">
                <div className="metric-label">Time Remaining</div>
                <div className="metric-value">
                  {formatDuration(missionProgress?.remainingTime || activeMission.estimatedFlightTime)}
                </div>
              </div>
            </div>
          </div>

          <div className="telemetry-section">
            <h3>Position Data</h3>
            <div className="position-data">
              <div className="coordinate">
                <span className="coord-label">Latitude:</span>
                <span className="coord-value">{telemetry?.position?.lat?.toFixed(6) || activeDrone.currentPosition?.lat?.toFixed(6)}</span>
              </div>
              <div className="coordinate">
                <span className="coord-label">Longitude:</span>
                <span className="coord-value">{telemetry?.position?.lng?.toFixed(6) || activeDrone.currentPosition?.lng?.toFixed(6)}</span>
              </div>
              <div className="coordinate">
                <span className="coord-label">Heading:</span>
                <span className="coord-value">{telemetry?.heading?.toFixed(0) || 0}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}