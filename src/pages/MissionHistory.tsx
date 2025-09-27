import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  TrendingUp,
  Download,
  Eye,
  Trash2,
  Archive,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import type { Mission, MissionStatus } from '../types';
import { mockMissions } from '../services';
import { formatDate, formatRelativeTime, formatDistance, formatDuration, getStatusColor } from '../utils';

interface FilterState {
  search: string;
  status: MissionStatus | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'date' | 'name' | 'duration' | 'distance';
  sortOrder: 'asc' | 'desc';
}

export function MissionHistory() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'analytics'>('table');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    // Load missions with some historical data
    const historicalMissions: Mission[] = [
      ...mockMissions,
      {
        id: 'mission-003',
        name: 'Coastal Erosion Survey',
        waypoints: [
          { id: 'wp-8', lat: 37.7549, lng: -122.4394, altitude: 120, order: 1 },
          { id: 'wp-9', lat: 37.7649, lng: -122.4294, altitude: 130, order: 2 },
          { id: 'wp-10', lat: 37.7749, lng: -122.4194, altitude: 110, order: 3 }
        ],
        estimatedDuration: 35,
        notes: 'Environmental monitoring for coastal protection',
        status: 'completed',
        createdAt: new Date('2024-02-25T14:30:00'),
        completedAt: new Date('2024-02-25T15:08:00'),
        assignedDroneId: 'drone-001',
        totalDistance: 3.2,
        estimatedFlightTime: 32
      },
      {
        id: 'mission-004',
        name: 'Power Line Inspection',
        waypoints: [
          { id: 'wp-11', lat: 37.7849, lng: -122.4494, altitude: 80, order: 1 },
          { id: 'wp-12', lat: 37.7949, lng: -122.4394, altitude: 85, order: 2 }
        ],
        estimatedDuration: 25,
        notes: 'Routine infrastructure inspection',
        status: 'completed',
        createdAt: new Date('2024-02-24T09:15:00'),
        completedAt: new Date('2024-02-24T09:42:00'),
        assignedDroneId: 'drone-003',
        totalDistance: 1.8,
        estimatedFlightTime: 22
      },
      {
        id: 'mission-005',
        name: 'Agricultural Survey Beta',
        waypoints: [
          { id: 'wp-13', lat: 37.7449, lng: -122.4594, altitude: 100, order: 1 },
          { id: 'wp-14', lat: 37.7549, lng: -122.4494, altitude: 105, order: 2 },
          { id: 'wp-15', lat: 37.7649, lng: -122.4394, altitude: 95, order: 3 },
          { id: 'wp-16', lat: 37.7749, lng: -122.4294, altitude: 100, order: 4 }
        ],
        estimatedDuration: 50,
        notes: 'Crop health monitoring and yield estimation',
        status: 'cancelled',
        createdAt: new Date('2024-02-23T11:00:00'),
        assignedDroneId: 'drone-002',
        totalDistance: 4.5,
        estimatedFlightTime: 48
      }
    ];
    setMissions(historicalMissions);
  }, []);

  const filteredMissions = useMemo(() => {
    const filtered = missions.filter(mission => {
      // Search filter
      if (filters.search && !mission.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filters.status !== 'all' && mission.status !== filters.status) {
        return false;
      }
      
      // Date range filter
      const now = new Date();
      const missionDate = mission.createdAt;
      
      switch (filters.dateRange) {
        case 'today':
          return missionDate.toDateString() === now.toDateString();
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return missionDate >= weekAgo;
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return missionDate >= monthAgo;
        }
        case 'year': {
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return missionDate >= yearAgo;
        }
        default:
          return true;
      }
    });

    // Sort missions
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'duration':
          aValue = a.estimatedDuration;
          bValue = b.estimatedDuration;
          break;
        case 'distance':
          aValue = a.totalDistance;
          bValue = b.totalDistance;
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [missions, filters]);

  const analyticsData = useMemo(() => {
    const completedMissions = missions.filter(m => m.status === 'completed');
    const totalFlightTime = completedMissions.reduce((sum, m) => sum + (m.estimatedFlightTime || 0), 0);
    const totalDistance = completedMissions.reduce((sum, m) => sum + m.totalDistance, 0);
    
    const statusCounts = missions.reduce((acc, mission) => {
      acc[mission.status] = (acc[mission.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyStats = missions.reduce((acc, mission) => {
      const month = mission.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { count: 0, distance: 0, duration: 0 };
      }
      acc[month].count++;
      acc[month].distance += mission.totalDistance;
      acc[month].duration += mission.estimatedFlightTime || 0;
      return acc;
    }, {} as Record<string, { count: number; distance: number; duration: number }>);

    return {
      totalMissions: missions.length,
      completedMissions: completedMissions.length,
      totalFlightTime,
      totalDistance,
      averageFlightTime: completedMissions.length > 0 ? totalFlightTime / completedMissions.length : 0,
      statusCounts,
      monthlyStats
    };
  }, [missions]);

  const handleMissionSelect = (missionId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedMissions(prev => [...prev, missionId]);
    } else {
      setSelectedMissions(prev => prev.filter(id => id !== missionId));
    }
  };

  const handleBulkAction = (action: 'export' | 'delete' | 'archive') => {
    if (selectedMissions.length === 0) return;
    
    switch (action) {
      case 'export':
        console.log('Exporting missions:', selectedMissions);
        alert(`Exporting ${selectedMissions.length} missions...`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedMissions.length} missions?`)) {
          setMissions(prev => prev.filter(m => !selectedMissions.includes(m.id)));
          setSelectedMissions([]);
        }
        break;
      case 'archive':
        console.log('Archiving missions:', selectedMissions);
        alert(`Archived ${selectedMissions.length} missions`);
        setSelectedMissions([]);
        break;
    }
  };

  return (
    <div className="mission-history">
      <div className="history-header">
        <h1>Mission History & Analytics</h1>
        <div className="view-toggle">
          <button
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('table')}
          >
            <Activity size={16} />
            Mission History
          </button>
          <button
            className={`btn ${viewMode === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('analytics')}
          >
            <BarChart3 size={16} />
            Analytics
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          {/* Filters and Search */}
          <div className="history-filters">
            <div className="search-bar">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search missions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterState['status'] }))}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="preparing">Preparing</option>
                <option value="in-flight">In Flight</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as FilterState['dateRange'] }))}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [FilterState['sortBy'], FilterState['sortOrder']];
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                }}
                className="filter-select"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="duration-desc">Longest Duration</option>
                <option value="duration-asc">Shortest Duration</option>
                <option value="distance-desc">Longest Distance</option>
                <option value="distance-asc">Shortest Distance</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedMissions.length > 0 && (
            <div className="bulk-actions">
              <span className="selection-count">{selectedMissions.length} missions selected</span>
              <div className="bulk-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleBulkAction('export')}
                >
                  <Download size={16} />
                  Export
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleBulkAction('archive')}
                >
                  <Archive size={16} />
                  Archive
                </button>
                <button
                  className="btn btn-error"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Mission Table */}
          <div className="missions-table-container">
            <table className="missions-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedMissions.length === filteredMissions.length && filteredMissions.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMissions(filteredMissions.map(m => m.id));
                        } else {
                          setSelectedMissions([]);
                        }
                      }}
                    />
                  </th>
                  <th>Mission Name</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Duration</th>
                  <th>Distance</th>
                  <th>Waypoints</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMissions.map((mission) => (
                  <tr key={mission.id} className={selectedMissions.includes(mission.id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedMissions.includes(mission.id)}
                        onChange={(e) => handleMissionSelect(mission.id, e.target.checked)}
                      />
                    </td>
                    <td>
                      <div className="mission-name-cell">
                        <span className="mission-name">{mission.name}</span>
                        {mission.notes && (
                          <span className="mission-notes">{mission.notes}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span 
                        className={`status-badge status-${mission.status}`}
                        style={{ backgroundColor: `${getStatusColor(mission.status)}20`, color: getStatusColor(mission.status) }}
                      >
                        {mission.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span className="date-primary">{formatDate(mission.createdAt)}</span>
                        <span className="date-secondary">{formatRelativeTime(mission.createdAt)}</span>
                      </div>
                    </td>
                    <td>{formatDuration(mission.estimatedFlightTime || mission.estimatedDuration)}</td>
                    <td>{formatDistance(mission.totalDistance)}</td>
                    <td>{mission.waypoints.length}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => console.log('View mission details:', mission.id)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleBulkAction('delete')}
                          title="Delete Mission"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredMissions.length === 0 && (
              <div className="empty-table">
                <MapPin className="empty-icon" />
                <h3>No missions found</h3>
                <p>Try adjusting your search criteria or create a new mission.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Analytics View */
        <div className="analytics-dashboard">
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="card-header">
                <h3>Mission Overview</h3>
                <Activity className="card-icon" />
              </div>
              <div className="stats-grid">
                <div className="stat">
                  <div className="stat-value">{analyticsData.totalMissions}</div>
                  <div className="stat-label">Total Missions</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{analyticsData.completedMissions}</div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{formatDistance(analyticsData.totalDistance)}</div>
                  <div className="stat-label">Total Distance</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{formatDuration(analyticsData.totalFlightTime)}</div>
                  <div className="stat-label">Total Flight Time</div>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <h3>Mission Status Distribution</h3>
                <PieChart className="card-icon" />
              </div>
              <div className="status-distribution">
                {Object.entries(analyticsData.statusCounts).map(([status, count]) => (
                  <div key={status} className="status-bar">
                    <div className="status-info">
                      <span className="status-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      <span className="status-count">{count}</span>
                    </div>
                    <div className="status-progress">
                      <div 
                        className="status-fill"
                        style={{ 
                          width: `${(count / analyticsData.totalMissions) * 100}%`,
                          backgroundColor: getStatusColor(status)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <h3>Performance Metrics</h3>
                <TrendingUp className="card-icon" />
              </div>
              <div className="metrics-list">
                <div className="metric-item">
                  <span className="metric-name">Average Flight Time</span>
                  <span className="metric-value">{formatDuration(analyticsData.averageFlightTime)}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-name">Success Rate</span>
                  <span className="metric-value">
                    {analyticsData.totalMissions > 0 
                      ? Math.round((analyticsData.completedMissions / analyticsData.totalMissions) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-name">Average Distance</span>
                  <span className="metric-value">
                    {formatDistance(analyticsData.totalMissions > 0 
                      ? analyticsData.totalDistance / analyticsData.totalMissions 
                      : 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="analytics-card full-width">
              <div className="card-header">
                <h3>Monthly Activity</h3>
                <BarChart3 className="card-icon" />
              </div>
              <div className="monthly-chart">
                {Object.entries(analyticsData.monthlyStats)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .slice(-6)
                  .map(([month, stats]) => (
                  <div key={month} className="month-bar">
                    <div className="month-stats">
                      <div 
                        className="bar"
                        style={{ height: `${(stats.count / Math.max(...Object.values(analyticsData.monthlyStats).map(s => s.count))) * 100}%` }}
                      />
                    </div>
                    <div className="month-info">
                      <div className="month-name">{new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="month-count">{stats.count} missions</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}