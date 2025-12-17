import { useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import {
  Save,
  Upload,
  Trash2,
  MapPin,
  Route,
  Clock,
  Ruler
} from 'lucide-react';
import type { Waypoint, Mission } from '../types';
import { calculateRouteDistance, estimateFlightTime, formatDistance, formatDuration, generateId } from '../utils';
import { missionService } from '../services';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
const defaultIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export function MissionPlanning() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [missionName, setMissionName] = useState('New Mission');
  const [missionNotes, setMissionNotes] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(45);
  const [isCreatingWaypoint, setIsCreatingWaypoint] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<string | null>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [availableMissions, setAvailableMissions] = useState<Mission[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (isCreatingWaypoint) {
      const newWaypoint: Waypoint = {
        id: generateId('waypoint'),
        lat,
        lng,
        altitude: 100,
        order: waypoints.length + 1
      };
      setWaypoints(prev => [...prev, newWaypoint]);
      setIsCreatingWaypoint(false);
    }
  }, [isCreatingWaypoint, waypoints.length]);

  const removeWaypoint = useCallback((waypointId: string) => {
    setWaypoints(prev => {
      const filtered = prev.filter(wp => wp.id !== waypointId);
      return filtered.map((wp, index) => ({ ...wp, order: index + 1 }));
    });
    setSelectedWaypoint(null);
  }, []);

  const clearAllWaypoints = useCallback(() => {
    setWaypoints([]);
    setSelectedWaypoint(null);
  }, []);

  const saveMission = useCallback(async () => {
    try {
      const totalDistance = calculateRouteDistance(waypoints);
      const estimatedFlightTime = estimateFlightTime(totalDistance);
      
      const mission: Omit<Mission, 'id' | 'createdAt'> = {
        name: missionName,
        waypoints,
        estimatedDuration,
        notes: missionNotes,
        status: 'draft',
        totalDistance,
        estimatedFlightTime
      };

      await missionService.createMission(mission);
      alert('Mission saved successfully!');
    } catch (error) {
      console.error('Failed to save mission:', error);
      alert('Failed to save mission. Please try again.');
    }
  }, [waypoints, missionName, estimatedDuration, missionNotes]);

  const loadAvailableMissions = useCallback(async () => {
    try {
      setLoadingMissions(true);
      const missions = await missionService.getMissions();
      // Filter to only show draft missions (not in-flight or completed)
      const draftMissions = missions.filter(m => m.status === 'draft' || m.status === 'completed');
      setAvailableMissions(draftMissions);
    } catch (error) {
      console.error('Failed to load missions:', error);
      alert('Failed to load missions. Please try again.');
    } finally {
      setLoadingMissions(false);
    }
  }, []);

  const handleLoadMissionClick = useCallback(() => {
    loadAvailableMissions();
    setShowLoadModal(true);
  }, [loadAvailableMissions]);

  const loadMission = useCallback((mission: Mission) => {
    setWaypoints(mission.waypoints);
    setMissionName(mission.name);
    setMissionNotes(mission.notes || '');
    setEstimatedDuration(mission.estimatedDuration);
    setShowLoadModal(false);
    
    // Center map on the first waypoint if available
    if (mission.waypoints.length > 0 && mapRef.current) {
      const firstWaypoint = mission.waypoints[0];
      mapRef.current.setView([firstWaypoint.lat, firstWaypoint.lng], 13);
    }
    
    alert(`Mission "${mission.name}" loaded successfully!`);
  }, []);

  const totalDistance = calculateRouteDistance(waypoints);
  const estimatedFlightTime = estimateFlightTime(totalDistance);
  const pathCoordinates = waypoints.map(wp => [wp.lat, wp.lng] as [number, number]);

  return (
    <div className="mission-planning">
      <div className="planning-header">
        <h1>Mission Planning </h1>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleLoadMissionClick}
          >
            <Upload size={16} />
            Load Mission
          </button>
          <button 
            className="btn btn-primary"
            onClick={saveMission}
            disabled={waypoints.length === 0}
          >
            <Save size={16} />
            Save Mission
          </button>
        </div>
      </div>

      <div className="planning-content">
        <div className="map-container">
          <div className="map-toolbar">
            <button
              className={`btn ${isCreatingWaypoint ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setIsCreatingWaypoint(!isCreatingWaypoint)}
            >
              <MapPin size={16} />
              {isCreatingWaypoint ? 'Cancel' : 'Add Waypoint'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={clearAllWaypoints}
              disabled={waypoints.length === 0}
            >
              <Trash2 size={16} />
              Clear All
            </button>
            <div className="map-info">
              <span className="info-item">
                <Route size={16} />
                {formatDistance(totalDistance)}
              </span>
              <span className="info-item">
                <Clock size={16} />
                {formatDuration(estimatedFlightTime)}
              </span>
            </div>
          </div>

          <MapContainer
            center={[37.7749, -122.4194]}
            zoom={13}
            className="leaflet-map"
            ref={mapRef}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
            <MapClickHandler onMapClick={handleMapClick} />
            
            {waypoints.map((waypoint) => (
              <Marker
                key={waypoint.id}
                position={[waypoint.lat, waypoint.lng]}
                icon={defaultIcon}
                eventHandlers={{
                  click: () => setSelectedWaypoint(waypoint.id)
                }}
              />
            ))}
            
            {pathCoordinates.length > 1 && (
              <Polyline
                positions={pathCoordinates}
                color="#06b6d4"
                weight={3}
                opacity={0.8}
              />
            )}
          </MapContainer>
        </div>

        <div className="mission-config">
          <div className="card">
            <h3>Mission Configuration</h3>
            
            <div className="form-group">
              <label className="form-label">Mission Name</label>
              <input
                type="text"
                className="form-input"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                placeholder="Enter mission name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Duration (minutes)</label>
              <input
                type="number"
                className="form-input"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                min="1"
                max="300"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-input form-textarea"
                value={missionNotes}
                onChange={(e) => setMissionNotes(e.target.value)}
                placeholder="Enter mission notes and requirements"
                rows={3}
              />
            </div>
          </div>

          <div className="card">
            <h3>Path Validation</h3>
            <div className="validation-metrics">
              <div className="metric">
                <Ruler className="metric-icon" />
                <div>
                  <div className="metric-label">Total Distance</div>
                  <div className="metric-value">{formatDistance(totalDistance)}</div>
                </div>
              </div>
              <div className="metric">
                <Clock className="metric-icon" />
                <div>
                  <div className="metric-label">Estimated Flight Time</div>
                  <div className="metric-value">{formatDuration(estimatedFlightTime)}</div>
                </div>
              </div>
              <div className="metric">
                <MapPin className="metric-icon" />
                <div>
                  <div className="metric-label">Waypoints</div>
                  <div className="metric-value">{waypoints.length}</div>
                </div>
              </div>
            </div>
            
            <div className="validation-status">
              {waypoints.length === 0 && (
                <div className="status-message warning">
                  Click "Add Waypoint" and then click on the map to create your flight path
                </div>
              )}
              {waypoints.length > 0 && waypoints.length < 2 && (
                <div className="status-message warning">
                  Add at least 2 waypoints to create a valid flight path
                </div>
              )}
              {waypoints.length >= 2 && (
                <div className="status-message success">
                  ✓ Valid flight path with {waypoints.length} waypoints
                </div>
              )}
            </div>
          </div>

          {waypoints.length > 0 && (
            <div className="card">
              <h3>Waypoints</h3>
              <div className="waypoint-list">
                {waypoints.map((waypoint, index) => (
                  <div
                    key={waypoint.id}
                    className={`waypoint-item ${selectedWaypoint === waypoint.id ? 'selected' : ''}`}
                    onClick={() => setSelectedWaypoint(waypoint.id)}
                  >
                    <div className="waypoint-info">
                      <span className="waypoint-number">{index + 1}</span>
                      <div className="waypoint-coords">
                        <div>Lat: {waypoint.lat.toFixed(6)}</div>
                        <div>Lng: {waypoint.lng.toFixed(6)}</div>
                      </div>
                    </div>
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWaypoint(waypoint.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Load Mission Modal */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Load Mission</h3>
              <button 
                className="btn-icon"
                onClick={() => setShowLoadModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {loadingMissions ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading missions...</p>
                </div>
              ) : availableMissions.length === 0 ? (
                <div className="empty-state">
                  <p>No saved missions found.</p>
                  <p>Create and save a mission first to load it later.</p>
                </div>
              ) : (
                <div className="mission-list">
                  {availableMissions.map((mission) => (
                    <div 
                      key={mission.id} 
                      className="mission-item"
                      onClick={() => loadMission(mission)}
                    >
                      <div className="mission-info">
                        <h4>{mission.name}</h4>
                        <p className="mission-meta">
                          {mission.waypoints.length} waypoints • {formatDistance(mission.totalDistance)} • 
                          {formatDuration(mission.estimatedFlightTime)} • 
                          <span className={`status-badge status-${mission.status}`}>
                            {mission.status.toUpperCase()}
                          </span>
                        </p>
                        {mission.notes && (
                          <p className="mission-notes">{mission.notes}</p>
                        )}
                        <p className="mission-date">
                          Created: {mission.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowLoadModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}