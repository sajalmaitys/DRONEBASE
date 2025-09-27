import type { Waypoint } from '../types';

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert degrees to radians
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Calculate total distance for a route of waypoints
export function calculateRouteDistance(waypoints: Waypoint[]): number {
  if (waypoints.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng
    );
  }
  return totalDistance;
}

// Estimate flight time based on distance and average speed
export function estimateFlightTime(distance: number, averageSpeed: number = 15): number {
  // distance in km, speed in km/h, returns time in minutes
  return (distance / averageSpeed) * 60;
}

// Format duration from minutes to human readable string
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

// Format distance with appropriate units
export function formatDistance(km: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') {
    const miles = km * 0.621371;
    return miles < 1 ? `${Math.round(miles * 5280)}ft` : `${miles.toFixed(1)}mi`;
  }
  
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

// Generate unique ID
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Debounce function for performance optimization
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

// Validate coordinates
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Color utilities for status indicators
export function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    'available': '#10b981',
    'active': '#3b82f6',
    'maintenance': '#f59e0b',
    'charging': '#8b5cf6',
    'offline': '#6b7280',
    'draft': '#6b7280',
    'preparing': '#f59e0b',
    'in-flight': '#3b82f6',
    'landing': '#f59e0b',
    'completed': '#10b981',
    'emergency': '#ef4444',
    'cancelled': '#6b7280'
  };
  return colors[status] || '#6b7280';
}

// Battery level color coding
export function getBatteryColor(level: number): string {
  if (level > 50) return '#10b981';
  if (level > 20) return '#f59e0b';
  return '#ef4444';
}

// Local storage utilities
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
};

// Date formatting utilities
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
  
  const diffInHours = diffInMinutes / 60;
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  
  const diffInDays = diffInHours / 24;
  if (diffInDays < 7) return `${Math.floor(diffInDays)}d ago`;
  
  return formatDate(date);
}