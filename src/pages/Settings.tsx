import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Map,
  Bell,
  Shield,
  Database,
  Gauge,
  Moon,
  Sun,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import type { UserPreferences, Settings as SettingsType } from '../types';
import { storage } from '../utils';

interface SettingsData {
  userPreferences: UserPreferences;
  systemSettings: SettingsType;
  userProfile: {
    name: string;
    email: string;
    role: 'admin' | 'operator' | 'viewer';
    avatar?: string;
  };
}

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState<SettingsData>({
    userPreferences: {
      mapStyle: 'satellite',
      defaultZoom: 13,
      units: 'metric',
      notifications: {
        missionStart: true,
        missionComplete: true,
        lowBattery: true,
        emergency: true
      },
      theme: 'dark'
    },
    systemSettings: {
      simulationSpeed: 1,
      updateFrequency: 2000,
      alertThresholds: {
        lowBattery: 20,
        criticalBattery: 10,
        maxFlightTime: 45
      },
      map: {
        defaultCenter: {
          lat: 37.7749,
          lng: -122.4194
        },
        defaultZoom: 13,
        tileProvider: 'satellite'
      }
    },
    userProfile: {
      name: 'Mission Controller',
      email: 'controller@dronebase.com',
      role: 'admin'
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = storage.get('dronebase-settings', settings);
    setSettings(savedSettings);
  }, []);

  const updateSettings = (section: keyof SettingsData, updates: Partial<SettingsData[typeof section]>) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    storage.set('dronebase-settings', settings);
    setHasUnsavedChanges(false);
    alert('Settings saved successfully!');
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      storage.remove('dronebase-settings');
      window.location.reload();
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dronebase-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        setHasUnsavedChanges(true);
        alert('Settings imported successfully!');
      } catch {
        alert('Invalid settings file format.');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'map', label: 'Map Settings', icon: Map },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Gauge },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data Management', icon: Database }
  ];

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings & Configuration</h1>
        {hasUnsavedChanges && (
          <div className="unsaved-changes">
            <AlertTriangle size={16} />
            <span>You have unsaved changes</span>
            <button className="btn btn-primary" onClick={saveSettings}>
              <Save size={16} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="nav-icon" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="settings-main">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>User Profile</h2>
              <div className="profile-section">
                <div className="profile-avatar">
                  <div className="avatar-placeholder">
                    <User className="avatar-icon" />
                  </div>
                  <button className="btn btn-secondary">Change Avatar</button>
                </div>
                
                <div className="profile-form">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.userProfile.name}
                      onChange={(e) => updateSettings('userProfile', { name: e.target.value })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={settings.userProfile.email}
                      onChange={(e) => updateSettings('userProfile', { email: e.target.value })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-input"
                      value={settings.userProfile.role}
                      onChange={(e) => updateSettings('userProfile', { role: e.target.value as 'admin' | 'operator' | 'viewer' })}
                    >
                      <option value="admin">Administrator</option>
                      <option value="operator">Operator</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>User Preferences</h2>
              
              <div className="preference-group">
                <h3>Appearance</h3>
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <div className="theme-selector">
                    <button
                      className={`theme-option ${settings.userPreferences.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => updateSettings('userPreferences', { theme: 'dark' })}
                    >
                      <Moon size={20} />
                      <span>Dark</span>
                    </button>
                    <button
                      className={`theme-option ${settings.userPreferences.theme === 'light' ? 'active' : ''}`}
                      onClick={() => updateSettings('userPreferences', { theme: 'light' })}
                    >
                      <Sun size={20} />
                      <span>Light</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="preference-group">
                <h3>Units & Format</h3>
                <div className="form-group">
                  <label className="form-label">Measurement Units</label>
                  <select
                    className="form-input"
                    value={settings.userPreferences.units}
                    onChange={(e) => updateSettings('userPreferences', { units: e.target.value as 'metric' | 'imperial' })}
                  >
                    <option value="metric">Metric (km, m, °C)</option>
                    <option value="imperial">Imperial (mi, ft, °F)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="settings-section">
              <h2>Map Settings</h2>
              
              <div className="form-group">
                <label className="form-label">Default Map Style</label>
                <select
                  className="form-input"
                  value={settings.userPreferences.mapStyle}
                  onChange={(e) => updateSettings('userPreferences', { mapStyle: e.target.value as 'satellite' | 'terrain' | 'street' })}
                >
                  <option value="satellite">Satellite</option>
                  <option value="terrain">Terrain</option>
                  <option value="street">Street</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Default Zoom Level</label>
                <input
                  type="range"
                  min="1"
                  max="18"
                  className="form-range"
                  value={settings.userPreferences.defaultZoom}
                  onChange={(e) => updateSettings('userPreferences', { defaultZoom: Number(e.target.value) })}
                />
                <div className="range-value">{settings.userPreferences.defaultZoom}</div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Default Center Location</label>
                <div className="location-inputs">
                  <input
                    type="number"
                    placeholder="Latitude"
                    className="form-input"
                    value={settings.systemSettings.map.defaultCenter.lat}
                    onChange={(e) => updateSettings('systemSettings', {
                      map: {
                        ...settings.systemSettings.map,
                        defaultCenter: {
                          ...settings.systemSettings.map.defaultCenter,
                          lat: Number(e.target.value)
                        }
                      }
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Longitude"
                    className="form-input"
                    value={settings.systemSettings.map.defaultCenter.lng}
                    onChange={(e) => updateSettings('systemSettings', {
                      map: {
                        ...settings.systemSettings.map,
                        defaultCenter: {
                          ...settings.systemSettings.map.defaultCenter,
                          lng: Number(e.target.value)
                        }
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              
              <div className="notification-list">
                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Mission Start</h4>
                    <p>Get notified when missions begin</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.userPreferences.notifications.missionStart}
                      onChange={(e) => updateSettings('userPreferences', {
                        notifications: {
                          ...settings.userPreferences.notifications,
                          missionStart: e.target.checked
                        }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Mission Complete</h4>
                    <p>Get notified when missions are completed</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.userPreferences.notifications.missionComplete}
                      onChange={(e) => updateSettings('userPreferences', {
                        notifications: {
                          ...settings.userPreferences.notifications,
                          missionComplete: e.target.checked
                        }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Low Battery</h4>
                    <p>Get alerted when drone battery is low</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.userPreferences.notifications.lowBattery}
                      onChange={(e) => updateSettings('userPreferences', {
                        notifications: {
                          ...settings.userPreferences.notifications,
                          lowBattery: e.target.checked
                        }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Emergency Alerts</h4>
                    <p>Critical system and safety notifications</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.userPreferences.notifications.emergency}
                      onChange={(e) => updateSettings('userPreferences', {
                        notifications: {
                          ...settings.userPreferences.notifications,
                          emergency: e.target.checked
                        }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="settings-section">
              <h2>System Configuration</h2>
              
              <div className="form-group">
                <label className="form-label">Simulation Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  className="form-range"
                  value={settings.systemSettings.simulationSpeed}
                  onChange={(e) => updateSettings('systemSettings', { simulationSpeed: Number(e.target.value) })}
                />
                <div className="range-value">{settings.systemSettings.simulationSpeed}x</div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Update Frequency (ms)</label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="500"
                  className="form-input"
                  value={settings.systemSettings.updateFrequency}
                  onChange={(e) => updateSettings('systemSettings', { updateFrequency: Number(e.target.value) })}
                />
              </div>
              
              <div className="alert-thresholds">
                <h3>Alert Thresholds</h3>
                
                <div className="form-group">
                  <label className="form-label">Low Battery Warning (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="form-input"
                    value={settings.systemSettings.alertThresholds.lowBattery}
                    onChange={(e) => updateSettings('systemSettings', {
                      alertThresholds: {
                        ...settings.systemSettings.alertThresholds,
                        lowBattery: Number(e.target.value)
                      }
                    })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Critical Battery Alert (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="form-input"
                    value={settings.systemSettings.alertThresholds.criticalBattery}
                    onChange={(e) => updateSettings('systemSettings', {
                      alertThresholds: {
                        ...settings.systemSettings.alertThresholds,
                        criticalBattery: Number(e.target.value)
                      }
                    })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Maximum Flight Time (minutes)</label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    className="form-input"
                    value={settings.systemSettings.alertThresholds.maxFlightTime}
                    onChange={(e) => updateSettings('systemSettings', {
                      alertThresholds: {
                        ...settings.systemSettings.alertThresholds,
                        maxFlightTime: Number(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                />
              </div>
              
              <div className="security-options">
                <h3>Security Options</h3>
                <div className="security-item">
                  <div className="security-info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <button className="btn btn-primary">Enable 2FA</button>
                </div>
                
                <div className="security-item">
                  <div className="security-info">
                    <h4>Session Timeout</h4>
                    <p>Automatically log out after period of inactivity</p>
                  </div>
                  <select className="form-input" style={{ width: '200px' }}>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="240">4 hours</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="settings-section">
              <h2>Data Management</h2>
              
              <div className="data-section">
                <h3>Import/Export Settings</h3>
                <div className="data-actions">
                  <button className="btn btn-secondary" onClick={exportSettings}>
                    <Download size={16} />
                    Export Settings
                  </button>
                  <label className="btn btn-secondary">
                    <Upload size={16} />
                    Import Settings
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: 'none' }}
                      onChange={importSettings}
                    />
                  </label>
                </div>
              </div>
              
              <div className="data-section">
                <h3>Reset Options</h3>
                <div className="reset-options">
                  <div className="reset-item">
                    <div className="reset-info">
                      <h4>Reset User Preferences</h4>
                      <p>Reset theme, notifications, and display preferences</p>
                    </div>
                    <button className="btn btn-warning">
                      <RefreshCw size={16} />
                      Reset Preferences
                    </button>
                  </div>
                  
                  <div className="reset-item">
                    <div className="reset-info">
                      <h4>Reset All Settings</h4>
                      <p>Reset all settings to factory defaults</p>
                    </div>
                    <button className="btn btn-error" onClick={resetSettings}>
                      <Trash2 size={16} />
                      Reset All
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="data-section">
                <h3>Application Data</h3>
                <div className="data-stats">
                  <div className="data-stat">
                    <span className="stat-label">Storage Used</span>
                    <span className="stat-value">2.4 MB</span>
                  </div>
                  <div className="data-stat">
                    <span className="stat-label">Mission History</span>
                    <span className="stat-value">45 records</span>
                  </div>
                  <div className="data-stat">
                    <span className="stat-label">User Preferences</span>
                    <span className="stat-value">Stored</span>
                  </div>
                </div>
                <button className="btn btn-error">
                  <Trash2 size={16} />
                  Clear All Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}