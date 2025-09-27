# DRONEBASE - Mission Planning Web Application

A comprehensive drone mission planning and control web application built with React, TypeScript, and modern web technologies.

![Dronebase Mission Planner](https://via.placeholder.com/800x400/1a1a1a/06b6d4?text=DRONEBASE+Mission+Planner)

## 🚁 Features

### 📋 Mission Planning Dashboard
- **Interactive Leaflet Maps** with satellite imagery
- **Waypoint Creation** - Click on map to add mission waypoints
- **Route Visualization** - Real-time path display with distance/time calculations
- **Mission Configuration** - Set mission parameters, notes, and duration
- **Load/Save Missions** - Persistent mission storage and retrieval
- **Path Validation** - Ensures valid flight paths with proper waypoint sequences

### 🎮 Real-time Mission Control
- **Live Drone Tracking** - Real-time position updates on interactive maps
- **Mission Control Commands** - Pause, Resume, Stop, Emergency Stop
- **Live Telemetry Display** - Battery, speed, altitude, GPS signal strength
- **Mission Progress Tracking** - Completion percentage and remaining time/distance
- **WebSocket Integration** - Real-time data streaming and notifications
- **Full-screen Interface** - Immersive mission control experience

### 📊 Mission History & Analytics
- **Mission Archive** - Complete history of all missions
- **Advanced Filtering** - Filter by status, date range, and search terms
- **Analytics Dashboard** - Mission statistics and performance metrics
- **Data Visualization** - Charts and graphs for mission analysis
- **Export Capabilities** - Download mission data and reports
- **Bulk Operations** - Manage multiple missions simultaneously

### 🚁 Fleet Management
- **Drone Status Monitoring** - Real-time status of all drones in fleet
- **Mission Assignment** - Assign missions to available drones
- **Maintenance Tracking** - Schedule and track drone maintenance
- **Battery Monitoring** - Real-time battery levels and alerts
- **Fleet Statistics** - Overview of fleet availability and performance
- **Grid/List Views** - Flexible display options for fleet overview

### ⚙️ Settings & Configuration
- **User Profile Management** - Personal settings and preferences
- **Map Configuration** - Customize map styles and default settings
- **Notification Settings** - Configure alerts and notifications
- **System Settings** - Simulation speed, update frequencies, alert thresholds
- **Security Settings** - Password management and account security
- **Data Management** - Import/export settings and backup options

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Mapping**: Leaflet.js with React-Leaflet integration
- **UI Components**: Lucide React icons
- **Routing**: React Router for navigation
- **Styling**: Modern CSS with CSS Grid and Flexbox
- **Data Visualization**: Chart.js with React integration
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **WebSocket**: Real-time communication simulation
- **TypeScript**: Full type safety throughout the application

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sajalmaitys/DRONEBASE.git
   cd DRONEBASE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
dronebase-mission-planner/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Navigation.tsx   # Main navigation component
│   ├── pages/              # Main application pages
│   │   ├── MissionPlanning.tsx
│   │   ├── MissionControl.tsx
│   │   ├── MissionHistory.tsx
│   │   ├── FleetManagement.tsx
│   │   └── Settings.tsx
│   ├── services/           # API and data services
│   │   └── index.ts        # WebSocket and data services
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # All application types
│   ├── utils/              # Utility functions
│   │   └── index.ts        # Helper functions
│   ├── App.tsx             # Main application component
│   ├── App.css             # Global styles
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
└── README.md              # Project documentation
```

## 🎯 Key Features in Detail

### Mission Planning
- **Interactive Map Interface**: Click-to-add waypoints on satellite imagery
- **Real-time Calculations**: Automatic distance and flight time estimation
- **Mission Persistence**: Save and load missions for reuse
- **Route Optimization**: Visual feedback for optimal flight paths

### Real-time Control
- **Live Telemetry**: Real-time drone position, battery, speed, and altitude
- **Mission Commands**: Full control over mission execution
- **Progress Tracking**: Visual progress indicators and completion status
- **Emergency Protocols**: Quick emergency stop functionality

### Analytics & History
- **Comprehensive Filtering**: Search by name, status, date range
- **Performance Metrics**: Flight time, distance, success rates
- **Data Visualization**: Charts for mission trends and statistics
- **Export Functions**: CSV/JSON export for external analysis

### Fleet Management
- **Multi-drone Support**: Manage entire drone fleet from single interface
- **Status Monitoring**: Real-time status updates for all drones
- **Maintenance Scheduling**: Track and schedule maintenance activities
- **Assignment Management**: Efficiently assign missions to available drones

## 🔧 Configuration

The application includes a comprehensive settings panel allowing users to configure:

- **Map Settings**: Default zoom levels, map styles, center coordinates
- **Notification Preferences**: Mission alerts, battery warnings, emergency notifications
- **System Parameters**: Simulation speed, update frequencies, alert thresholds
- **User Preferences**: Theme settings, units of measurement, default values

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers (1920px and above)
- Laptops (1024px - 1920px)
- Tablets (768px - 1024px)
- Mobile devices (320px - 768px)

## 🚦 Status Indicators

The application uses color-coded status indicators throughout:
- **🟢 Green**: Active, available, completed, good status
- **🟡 Yellow**: Warning, preparing, maintenance due
- **🔴 Red**: Error, emergency, critical battery, offline
- **🔵 Blue**: In-flight, processing, information
- **⚪ Gray**: Draft, inactive, disabled

## 🔮 Future Enhancements

- **Weather Integration**: Real-time weather data and flight conditions
- **3D Mission Visualization**: Three-dimensional flight path planning
- **Advanced Analytics**: Machine learning insights and predictive analytics
- **Multi-user Support**: Team collaboration and role-based access
- **Mobile App**: Native mobile applications for iOS and Android
- **API Integration**: Connect with real drone hardware and flight controllers
- **Video Streaming**: Live video feeds from drone cameras
- **Automated Flight Planning**: AI-powered route optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Developer**: Mission Planning System Developer
- **Repository Owner**: [sajalmaitys](https://github.com/sajalmaitys)

## 🙏 Acknowledgments

- **Leaflet.js** for excellent mapping capabilities
- **React Team** for the amazing framework
- **Vite** for lightning-fast development experience
- **TypeScript** for type safety and developer experience
- **Lucide** for beautiful icons
- **OpenStreetMap** and **Esri** for map tiles

---

**Built with ❤️ for the drone community**
