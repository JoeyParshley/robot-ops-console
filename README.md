# Robot Ops Console (Proof of Concept)

A React + TypeScript proof-of-concept exploring UI patterns for robotics operator dashboards — including fleet monitoring, robot status visualization, and control interfaces.  
This POC was built using **test-driven development (TDD)** and inspired by the challenges of designing clear, reliable UIs for **Alert Venture Foundry**–style zero-to-one robotics products.

---

## 🚀 Project Overview

The **Robot Ops Console** demonstrates early ideas for a monitoring and control interface for a small fleet of robots.  
The goals of this POC are to explore:

- Real-time, data-driven UI architecture  
- Operator-focused workflows and clarity  
- Navigation between fleet-level and per-robot detail views  
- UI patterns suitable for **local desktop deployment** (Electron) or web environments  

Live telemetry is available via the WebSocket simulator. Desktop deployment via Electron is available (see "Running as Electron Desktop App" below).

---

## 🎯 Motivation & Context

This project blends my background in **R&D mechanical engineering at Velcro**—where I worked with real-time UIs for monitoring temperatures, pressures, and plastic hook processing—with my passion for building **human-centered software interfaces**.

Working with industrial operator consoles is what originally sparked my interest in UI design: their clarity, or lack thereof, had direct impact on process quality, safety, and decision-making.

This POC mirrors the interface challenges present in early-stage robotics environments:

- Telemetry visualization  
- Operator safety and workflow  
- Diagnostics and control panels  
- Rapid iteration under uncertainty  

It also serves as preparation for the **Frontend Software Engineer (Web & Local UI)** role at **Alert Venture Foundry**.

---

## 🧰 Tech Stack

### **Core Technologies**
- React + TypeScript (Vite)
- MUI (Material UI)
- React Router v7
- Vitest + React Testing Library (TDD)
- JSDOM test environment

### **Telemetry Simulator**
- Node.js WebSocket server for real-time telemetry simulation
- See `server/` directory and `docs/TELEMETRY_SIMULATOR.md` for details  
- `useTelemetry(robotId)` streaming hook  
- Diagnostics dashboard (health, alerts, logs)

### **Desktop Application (Electron)**
- Standalone desktop application with native window management
- Window state persistence (remembers size and position)
- Full application menu with keyboard shortcuts
- Fullscreen mode support for operator consoles
- Platform-specific optimizations (macOS, Windows, Linux)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install telemetry simulator dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the Application

The application consists of two parts: the frontend React app and the telemetry simulator server. You'll need to run both for the full experience.

#### Option 1: Run Both Services (Recommended)

**Terminal 1 - Start the Telemetry Simulator:**
```bash
cd server
npm start
```

You should see:
```
Telemetry Simulator running on port 8080
WebSocket endpoint: ws://localhost:8080/
HTTP API endpoint: http://localhost:8080/api/robots
HTTP Health Check: http://localhost:8080/health
```

**Terminal 2 - Start the Frontend:**
```bash
npm run dev
```

The frontend will typically start on `http://localhost:5173` (or another port if 5173 is in use).

#### Option 2: Development Mode with Auto-Reload

For development with auto-reload on file changes:

**Terminal 1 - Telemetry Simulator (with watch):**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend (with hot reload):**
```bash
npm run dev
```

### Verifying the Setup

1. **Check Telemetry Simulator:**
   - Open `http://localhost:8080/health` in your browser - should return `{"status":"ok"}`
   - Check the terminal for connection logs when clients connect

2. **Check Frontend:**
   - Open the frontend URL (usually `http://localhost:5173`)
   - You should see a green banner at the top saying **"Telemetry Simulator Running"** with a pulsing animation
   - The connection status chip should show **"Live"** in green
   - Robot data (battery, status, position) should update in real-time

### Running Without the Simulator

If you don't start the telemetry simulator, the frontend will:
- Display a yellow "Offline" status indicator
- Show a warning message about using mock data
- Still function normally with static mock data

### Running as Electron Desktop App

The application can also run as a standalone desktop application using Electron.

**Prerequisites:**
- Install dependencies: `npm install` (includes Electron dependencies)

**Development Mode (Electron):**

Run the app in Electron with hot reload:

```bash
npm run electron:dev
```

This will:
1. Start the Vite dev server
2. Compile Electron main process files
3. Launch Electron window connected to the dev server
4. Enable hot reload for both React app and Electron

**Note:** You'll still need the telemetry simulator running separately if you want real-time data:

**Terminal 1 - Telemetry Simulator:**
```bash
cd server
npm start
```

**Terminal 2 - Electron App:**
```bash
npm run electron:dev
```

The Electron window will open and display the React app. DevTools are enabled by default in development mode.

**Electron Features:**
- **Window State Persistence**: The app remembers window size and position between sessions
- **Application Menu**: Full menu bar with File, Edit, View, Window, and Help menus
- **Keyboard Shortcuts**:
  - `Cmd+Q` / `Ctrl+Q`: Quit application
  - `Cmd+R` / `Ctrl+R`: Reload window
  - `Cmd+Option+I` / `Ctrl+Shift+I`: Toggle Developer Tools (development only)
  - `F11` or `View > Toggle Fullscreen`: Enter/exit fullscreen mode
- **Fullscreen Support**: Toggle fullscreen mode for operator console use
- **About Dialog**: Access version information via `Help > About Robot Ops Console`
- **Platform-Specific Behavior**: 
  - macOS: Window closes to dock (Cmd+Q to quit)
  - Windows/Linux: Window close quits the application

---

## 📦 Features (Current POC)

### **Fleet Overview**
- Table of robots with:
  - Status  
  - Battery  
  - Location  
  - Last heartbeat  
  - Current task  
- Clicking a row navigates to that robot’s detail page

### **Robot Detail**
- Status & health summary  
- Battery, last heartbeat, active task  
- Stubbed operator controls:
  - Start  
  - Pause  
  - Resume  
  - Return to Dock  
  - Emergency Stop  

### **Real-time Telemetry (with Simulator)**
- Live position, orientation, and velocity updates
- Real-time battery level and status changes
- WebSocket-based streaming data
- Connection status indicators
- Automatic reconnection with exponential backoff
- Fallback to mock data when simulator unavailable

_Note: Without the telemetry simulator running, the app uses static mock data._

---

## 🧪 Test-Driven Development (TDD)

Key UI components were developed test-first.

Current test coverage includes:

- Rendering of the fleet overview  
- Click-through navigation to detail pages  
- Robot detail rendering from URL route  
- Handling of invalid robot IDs  
- Navigation behavior  

Run tests with:

```bash
npm run test
npm run test:watch
```

For comprehensive testing instructions, see [docs/TESTING.md](docs/TESTING.md).
