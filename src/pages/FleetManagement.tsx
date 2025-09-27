import React, { useState, useEffect } from 'react';
import {
  Drone as DroneIcon,
  Battery,
  Wifi,
  MapPin,
  Clock,
  Wrench,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Filter,
  Grid,
  List,
  Settings,
  Plus
} from 'lucide-react';
import type { Drone, DroneStatus, Mission } from '../types';
import { mockMissions, droneService } from '../services';
import { getBatteryColor, getStatusColor, formatDate, formatRelativeTime } from '../utils';

interface DroneWithMission extends Drone {
  assignedMission?: Mission;
}

export function FleetManagement() {
  const [drones, setDrones] = useState<DroneWithMission[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<DroneStatus | 'all'>('all');
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<string>('');

  useEffect(() => {
    loadFleetData();
  }, []);

  const loadFleetData = async () => {
    try {
      const [dronesData, missionsData] = await Promise.all([
        droneService.getDrones(),
        Promise.resolve(mockMissions)
      ]);
      
      // Enrich drones with mission data
      const enrichedDrones = dronesData.map(drone => {
        const assignedMission = drone.assignedMissionId 
          ? missionsData.find(m => m.id === drone.assignedMissionId)
          : undefined;
        
        return {
          ...drone,
          assignedMission
        };
      });
      
      setDrones(enrichedDrones);
      setMissions(missionsData.filter(m => m.status === 'draft' || m.status === 'preparing'));
    } catch (error) {
      console.error('Failed to load fleet data:', error);
    }
  };

  const filteredDrones = drones.filter(drone => 
    statusFilter === 'all' || drone.status === statusFilter
  );

  const handleStatusChange = async (droneId: string, newStatus: DroneStatus) => {
    try {
      await droneService.updateDroneStatus(droneId, newStatus);
      setDrones(prev => prev.map(drone => 
        drone.id === droneId ? { ...drone, status: newStatus } : drone
      ));
    } catch (error) {
      console.error('Failed to update drone status:', error);
    }
  };

  const handleMissionAssignment = async () => {
    if (!selectedDrone || !selectedMissionId) return;
    
    try {
      await droneService.assignMission(selectedDrone, selectedMissionId);
      await loadFleetData();
      setShowAssignModal(false);
      setSelectedDrone(null);
      setSelectedMissionId('');
    } catch (error) {
      console.error('Failed to assign mission:', error);
    }
  };

  const getStatusIcon = (status: DroneStatus) => {
    switch (status) {
      case 'available': return <CheckCircle className="status-icon" />;
      case 'active': return <Play className="status-icon" />;
      case 'maintenance': return <Wrench className="status-icon" />;
      case 'charging': return <Battery className="status-icon" />;
      case 'offline': return <AlertTriangle className="status-icon" />;
      default: return <DroneIcon className="status-icon" />;
    }
  };

  const getMaintenanceStatus = (drone: Drone) => {
    const now = new Date();
    const daysTillMaintenance = Math.ceil((drone.nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysTillMaintenance < 0) {
      return { status: 'overdue', text: 'Overdue', color: '#ef4444' };
    } else if (daysTillMaintenance <= 7) {
      return { status: 'due-soon', text: `Due in ${daysTillMaintenance}d`, color: '#f59e0b' };
    } else {
      return { status: 'ok', text: `Due in ${daysTillMaintenance}d`, color: '#10b981' };
    }
  };

  const statusCounts = drones.reduce((acc, drone) => {
    acc[drone.status] = (acc[drone.status] || 0) + 1;
    return acc;
  }, {} as Record<DroneStatus, number>);

  return (
    <div className="fleet-management">
      <div className="fleet-header">
        <div className="header-info">
          <h1>Drone Fleet Management</h1>
          <div className="fleet-stats">
            <div className="stat-item">
              <span className="stat-value">{drones.length}</span>
              <span className="stat-label">Total Drones</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statusCounts.available || 0}</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statusCounts.active || 0}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statusCounts.maintenance || 0}</span>
              <span className="stat-label">Maintenance</span>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-primary">
            <Plus size={16} />
            Add Drone
          </button>
        </div>
      </div>

      <div className="fleet-controls">
        <div className="filter-section">
          <Filter className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DroneStatus | 'all')}
            className="status-filter"
          >
            <option value="all">All Status ({drones.length})</option>
            <option value="available">Available ({statusCounts.available || 0})</option>
            <option value="active">Active ({statusCounts.active || 0})</option>
            <option value="maintenance">Maintenance ({statusCounts.maintenance || 0})</option>
            <option value="charging">Charging ({statusCounts.charging || 0})</option>
            <option value="offline">Offline ({statusCounts.offline || 0})</option>
          </select>
        </div>
        
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} />
          </button>
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <div className={`fleet-content ${viewMode}`}>
        {filteredDrones.map((drone) => {
          const maintenance = getMaintenanceStatus(drone);
          
          return (
            <div key={drone.id} className="drone-card">
              <div className="drone-header">
                <div className="drone-identity">
                  <div className="drone-avatar">
                    <DroneIcon className="drone-icon" />
                    <div 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(drone.status) }}
                    />
                  </div>
                  <div className="drone-info">
                    <h3 className="drone-name">{drone.name}</h3>
                    <p className="drone-model">{drone.model}</p>
                  </div>
                </div>
                
                <div className="drone-status">
                  {getStatusIcon(drone.status)}
                  <span 
                    className="status-text"
                    style={{ color: getStatusColor(drone.status) }}
                  >
                    {drone.status.charAt(0).toUpperCase() + drone.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="drone-metrics">
                <div className="metric">
                  <Battery 
                    className="metric-icon"
                    style={{ color: getBatteryColor(drone.batteryLevel) }}
                  />
                  <div className="metric-info">
                    <span className="metric-label">Battery</span>
                    <span className="metric-value">{drone.batteryLevel}%</span>
                  </div>
                  <div className="battery-bar">
                    <div 
                      className="battery-fill"
                      style={{ 
                        width: `${drone.batteryLevel}%`,
                        backgroundColor: getBatteryColor(drone.batteryLevel)
                      }}
                    />
                  </div>
                </div>

                {drone.currentPosition && (
                  <div className="metric">
                    <MapPin className="metric-icon" />
                    <div className="metric-info">
                      <span className="metric-label">Location</span>
                      <span className="metric-value">
                        {drone.currentPosition.lat.toFixed(4)}, {drone.currentPosition.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                )}

                {drone.speed !== undefined && (
                  <div className="metric">
                    <Wifi className="metric-icon" />
                    <div className="metric-info">
                      <span className="metric-label">Speed</span>
                      <span className="metric-value">{drone.speed} km/h</span>
                    </div>
                  </div>
                )}

                <div className="metric">
                  <Clock className="metric-icon" />
                  <div className="metric-info">
                    <span className="metric-label">Maintenance</span>
                    <span 
                      className="metric-value"
                      style={{ color: maintenance.color }}
                    >
                      {maintenance.text}
                    </span>
                  </div>
                </div>
              </div>

              {drone.assignedMission && (
                <div className="assigned-mission">
                  <h4>Current Mission</h4>
                  <div className="mission-info">
                    <span className="mission-name">{drone.assignedMission.name}</span>
                    <span 
                      className="mission-status"
                      style={{ color: getStatusColor(drone.assignedMission.status) }}
                    >
                      {drone.assignedMission.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              <div className="drone-specifications">
                <h4>Specifications</h4>
                <div className="specs-grid">
                  <div className="spec">
                    <span className="spec-label">Max Flight Time</span>
                    <span className="spec-value">{drone.specifications.maxFlightTime}min</span>
                  </div>
                  <div className="spec">
                    <span className="spec-label">Max Range</span>
                    <span className="spec-value">{drone.specifications.maxRange}km</span>
                  </div>
                  <div className="spec">
                    <span className="spec-label">Max Altitude</span>
                    <span className="spec-value">{drone.specifications.maxAltitude}m</span>
                  </div>
                  <div className="spec">
                    <span className="spec-label">Payload</span>
                    <span className="spec-value">{drone.specifications.payloadCapacity}kg</span>
                  </div>
                </div>
              </div>

              <div className="drone-actions">
                {drone.status === 'available' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedDrone(drone.id);
                      setShowAssignModal(true);
                    }}
                  >
                    <Play size={14} />
                    Assign Mission
                  </button>
                )}
                
                {drone.status === 'active' && (
                  <button
                    className="btn btn-warning"
                    onClick={() => handleStatusChange(drone.id, 'available')}
                  >
                    <Pause size={14} />
                    Recall
                  </button>
                )}
                
                {drone.status === 'maintenance' && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleStatusChange(drone.id, 'available')}
                  >
                    <CheckCircle size={14} />
                    Mark Ready
                  </button>
                )}
                
                <button className="btn btn-secondary">
                  <Settings size={14} />
                  Configure
                </button>
              </div>

              <div className="maintenance-info">
                <div className="maintenance-dates">
                  <div className="maintenance-date">
                    <span className="date-label">Last Maintenance:</span>
                    <span className="date-value">{formatRelativeTime(drone.lastMaintenance)}</span>
                  </div>
                  <div className="maintenance-date">
                    <span className="date-label">Next Maintenance:</span>
                    <span 
                      className="date-value"
                      style={{ color: maintenance.color }}
                    >
                      {formatDate(drone.nextMaintenance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDrones.length === 0 && (
        <div className="empty-fleet">
          <DroneIcon className="empty-icon" />
          <h3>No drones found</h3>
          <p>No drones match the current filter criteria.</p>
        </div>
      )}

      {/* Mission Assignment Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Mission</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAssignModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Mission</label>
                <select
                  value={selectedMissionId}
                  onChange={(e) => setSelectedMissionId(e.target.value)}
                  className="form-input"
                >
                  <option value="">Choose a mission...</option>
                  {missions.map(mission => (
                    <option key={mission.id} value={mission.id}>
                      {mission.name} - {mission.waypoints.length} waypoints
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedMissionId && (
                <div className="mission-preview">
                  {(() => {
                    const mission = missions.find(m => m.id === selectedMissionId);
                    return mission ? (
                      <div className="preview-content">
                        <h4>{mission.name}</h4>
                        <p>Estimated Duration: {mission.estimatedDuration} minutes</p>
                        <p>Waypoints: {mission.waypoints.length}</p>
                        <p>Notes: {mission.notes || 'None'}</p>
                      </div>
                    ) : null;
                  })()} 
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleMissionAssignment}
                disabled={!selectedMissionId}
              >
                Assign Mission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}