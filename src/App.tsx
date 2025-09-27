import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { MissionPlanning } from './pages/MissionPlanning';
import { MissionControl } from './pages/MissionControl';
import { MissionHistory } from './pages/MissionHistory';
import { FleetManagement } from './pages/FleetManagement';
import { Settings } from './pages/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/mission-planning" replace />} />
            <Route path="/mission-planning" element={<MissionPlanning />} />
            <Route path="/mission-control" element={<MissionControl />} />
            <Route path="/mission-history" element={<MissionHistory />} />
            <Route path="/fleet-management" element={<FleetManagement />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
