import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Map,
  Radio,
  History,
  Drone,
  Settings as SettingsIcon,
  User
} from 'lucide-react';

export function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="nav-logo">
          <Drone className="logo-icon" />
          <span className="logo-text">DRONEBASE</span>
        </div>
        <div className="nav-user">
          <User className="user-icon" />
          <span className="user-time">14:06 GMT</span>
        </div>
      </div>

      <div className="nav-links">
        <NavLink
          to="/mission-planning"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Map className="nav-icon" />
          <span>Mission Planning</span>
        </NavLink>

        <NavLink
          to="/mission-control"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Radio className="nav-icon" />
          <span>Real-time</span>
        </NavLink>

        <NavLink
          to="/mission-history"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <History className="nav-icon" />
          <span>History</span>
        </NavLink>

        <NavLink
          to="/fleet-management"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Drone className="nav-icon" />
          <span>Fleet</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <SettingsIcon className="nav-icon" />
          <span>Settings</span>
        </NavLink>
      </div>
    </nav>
  );
}