# Robot Telemetry Simulator Service

A Node.js WebSocket service that simulates real-time telemetry data for a fleet of robots. This service provides realistic position, orientation, velocity, battery, and status updates that can be consumed by the Robot Ops Console frontend.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Usage](#usage)
6. [WebSocket API](#websocket-api)
7. [HTTP API](#http-api)
8. [Message Formats](#message-formats)
9. [Robot Simulation Logic](#robot-simulation-logic)
10. [Integration Guide](#integration-guide)
11. [Development](#development)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The Telemetry Simulator Service is a standalone Node.js application that:

- **Simulates 3 robots** with realistic movement patterns
- **Broadcasts telemetry updates** every second via WebSocket
- **Handles control commands** (start, pause, resume, return to dock, emergency stop)
- **Provides HTTP endpoints** for health checks and robot information
- **Updates robot state** based on status (active robots move, charging robots stay at dock, etc.)

### Why Use This?

- **Development**: Test the frontend with realistic, changing data
- **Demo**: Show real-time updates without actual robot hardware
- **Prototyping**: Validate telemetry handling before connecting to real robots
- **Testing**: Consistent, predictable data for automated tests

---

## Features

### ✅ Real-time Telemetry Updates

- Position (x, y, z coordinates)
- Orientation (roll, pitch, yaw in degrees)
- Velocity (vx, vy, vz in m/s)
- Battery level (percentage)
- Robot status (idle, active, charging, error)
- Heartbeat timestamps

### ✅ Realistic Robot Behavior

- **Active robots**: Move autonomously within flight area boundaries
- **Charging robots**: Stay at dock position, battery increases
- **Idle robots**: Stationary, minimal battery drain
- **Error state**: Stationary, no movement

### ✅ Control Command Support

- Start robot
- Pause robot
- Resume robot
- Return to dock
- Emergency stop

### ✅ HTTP Endpoints

- Health check
- Robot list
- CORS enabled for development

---

## Architecture

```
┌─────────────────────────────────────────┐
│   Robot Ops Console (Frontend)         │
│   - React Application                   │
│   - WebSocket Client                     │
└──────────────┬──────────────────────────┘
               │ WebSocket Connection
               │ (ws://localhost:8080)
               ▼
┌─────────────────────────────────────────┐
│   Telemetry Simulator Service           │
│   - Node.js + WebSocket Server           │
│   - Robot State Management               │
│   - Telemetry Generation                 │
└─────────────────────────────────────────┘
```

### Components

1. **WebSocket Server**: Handles client connections and broadcasts
2. **Robot State Manager**: Maintains state for each robot
3. **Telemetry Generator**: Creates realistic position/orientation updates
4. **Command Handler**: Processes control commands from clients
5. **HTTP Server**: Provides REST endpoints

---

## Installation

### Prerequisites

- Node.js 18+ (ES modules support required)
- npm or yarn

### Steps

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Make script executable** (optional):
   ```bash
   chmod +x telemetry-simulator.js
   ```

---

## Usage

### Start the Server

```bash
# From the server directory
npm start

# Or directly
node telemetry-simulator.js

# Development mode with auto-reload (requires Node 18+)
npm run dev
```

### Environment Variables

```bash
# Set custom port (default: 8080)
PORT=3000 npm start
```

### Expected Output

```
🤖 Robot Telemetry Simulator
================================
📡 WebSocket Server: ws://localhost:8080
🌐 HTTP Server: http://localhost:8080
📊 Health Check: http://localhost:8080/health
🤖 Robot List: http://localhost:8080/api/robots

✨ Simulating 3 robots
⏱️  Update interval: 1000ms
```

---

## WebSocket API

### Connection

Connect to the WebSocket server:

```javascript
const ws = new WebSocket('ws://localhost:8080');
```

### Message Types

#### 1. Initial State (Server → Client)

Sent immediately upon connection with current robot states.

```json
{
  "type": "initial_state",
  "data": [
    {
      "robotId": "rbt-001",
      "name": "Atlas-01",
      "status": "active",
      "battery": 76,
      "position": { "x": 0, "y": 0, "z": 1 },
      "orientation": { "roll": 0, "pitch": 0, "yaw": 45 },
      "velocity": { "vx": 0.5, "vy": 0.3, "vz": 0 }
    }
  ],
  "timestamp": "2025-12-11T15:30:00.000Z"
}
```

#### 2. Telemetry Update (Server → Client)

Broadcast every second with updated telemetry for all robots.

```json
{
  "type": "telemetry",
  "data": [
    {
      "robotId": "rbt-001",
      "timestamp": "2025-12-11T15:30:01.000Z",
      "position": { "x": 0.5, "y": 0.3, "z": 1.2 },
      "orientation": { "roll": 2.1, "pitch": -1.5, "yaw": 45.3 },
      "velocity": { "vx": 0.5, "vy": 0.3, "vz": 0.1 },
      "battery": 75.9,
      "status": "active",
      "lastHeartbeat": "2025-12-11T15:30:01.000Z"
    }
  ],
  "timestamp": "2025-12-11T15:30:01.000Z"
}
```

#### 3. Command (Client → Server)

Send control commands to robots.

```json
{
  "type": "command",
  "robotId": "rbt-001",
  "action": "start" | "pause" | "resume" | "returnToDock" | "emergencyStop"
}
```

#### 4. Command Acknowledgment (Server → Client)

Confirmation that command was processed.

```json
{
  "type": "command_ack",
  "robotId": "rbt-001",
  "action": "start",
  "status": "active",
  "timestamp": "2025-12-11T15:30:02.000Z"
}
```

#### 5. Error (Server → Client)

Error response for invalid commands or messages.

```json
{
  "type": "error",
  "message": "Robot rbt-999 not found"
}
```

---

## HTTP API

### Health Check

**GET** `/health`

Returns server status and list of simulated robots.

```bash
curl http://localhost:8080/health
```

**Response**:
```json
{
  "status": "ok",
  "robots": ["rbt-001", "rbt-002", "rbt-003"],
  "timestamp": "2025-12-11T15:30:00.000Z"
}
```

### Robot List

**GET** `/api/robots`

Returns current state of all robots.

```bash
curl http://localhost:8080/api/robots
```

**Response**:
```json
[
  {
    "id": "rbt-001",
    "name": "Atlas-01",
    "status": "active",
    "battery": 76,
    "position": { "x": 0, "y": 0, "z": 1 }
  }
]
```

---

## Message Formats

### Telemetry Update Format

```typescript
interface TelemetryUpdate {
  robotId: string;
  timestamp: string; // ISO 8601
  position: {
    x: number; // meters
    y: number; // meters
    z: number; // meters
  };
  orientation: {
    roll: number;  // degrees
    pitch: number; // degrees
    yaw: number;   // degrees
  };
  velocity: {
    vx: number; // m/s
    vy: number; // m/s
    vz: number; // m/s
  };
  battery: number; // percentage (0-100)
  status: "idle" | "active" | "charging" | "error";
  lastHeartbeat: string; // ISO 8601
}
```

### Command Format

```typescript
interface Command {
  type: "command";
  robotId: string;
  action: "start" | "pause" | "resume" | "returnToDock" | "emergencyStop";
}
```

---

## Robot Simulation Logic

### Position Updates

**Active Robots**:
- Move autonomously within flight area boundaries
- Navigate to random target positions
- Speed: 0.5 m/s
- Smooth movement with velocity updates

**Charging Robots**:
- Stationary at dock position (center of flight area)
- No movement or velocity

**Idle Robots**:
- Stationary
- Minimal movement

**Error State**:
- Immediate stop
- No movement

### Battery Updates

- **Charging**: +0.1% per update (1% per 10 seconds)
- **Active**: -0.05% per update (0.5% per 10 seconds)
- **Idle/Error**: No significant change

### Orientation Updates

- **Active**: Yaw follows direction of movement
- **Active**: Small random variations in roll/pitch (±2.5° roll, ±1.5° pitch)
- **Other states**: Orientation remains stable

### Flight Area Constraints

Each robot is constrained to its flight area:
- Position clamped to min/max bounds
- Cannot move outside defined boundaries

---

## Integration Guide

### Frontend Integration

#### 1. Install WebSocket Client

```bash
# WebSocket is built into modern browsers
# For Node.js environments, you may need:
npm install ws
```

#### 2. Create WebSocket Hook

```typescript
// src/hooks/useTelemetry.ts
import { useEffect, useState, useRef } from 'react';

interface TelemetryUpdate {
  robotId: string;
  timestamp: string;
  position: { x: number; y: number; z: number };
  orientation: { roll: number; pitch: number; yaw: number };
  velocity: { vx: number; vy: number; vz: number };
  battery: number;
  status: string;
  lastHeartbeat: string;
}

export const useTelemetry = (url: string = 'ws://localhost:8080') => {
  const [telemetry, setTelemetry] = useState<Map<string, TelemetryUpdate>>(new Map());
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('Connected to telemetry server');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'telemetry') {
        const updates = new Map<string, TelemetryUpdate>();
        message.data.forEach((update: TelemetryUpdate) => {
          updates.set(update.robotId, update);
        });
        setTelemetry(updates);
      } else if (message.type === 'initial_state') {
        const updates = new Map<string, TelemetryUpdate>();
        message.data.forEach((update: TelemetryUpdate) => {
          updates.set(update.robotId, update);
        });
        setTelemetry(updates);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('Disconnected from telemetry server');
      setConnected(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          // Reconnect logic here
        }
      }, 3000);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [url]);

  const sendCommand = (robotId: string, action: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        robotId,
        action,
      }));
    }
  };

  return { telemetry, connected, sendCommand };
};
```

#### 3. Use in Components

```typescript
// src/pages/RobotDetailPage.tsx
import { useTelemetry } from '../hooks/useTelemetry';

export const RobotDetailPage = ({ robots }) => {
  const { id } = useParams<{ id: string }>();
  const { telemetry, connected, sendCommand } = useTelemetry();
  
  const robotTelemetry = telemetry.get(id || '');
  
  // Use robotTelemetry.position, orientation, velocity, etc.
  // ...
  
  // Send commands
  const handleStart = () => {
    sendCommand(id || '', 'start');
  };
  
  // ...
};
```

### Command Integration

Update the `useRobotControls` hook to send commands via WebSocket:

```typescript
// src/hooks/useRobotControls.ts
const handleStart = useCallback(async () => {
  // Send command via WebSocket
  if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({
      type: 'command',
      robotId,
      action: 'start',
    }));
  }
  
  // Update local state optimistically
  updateStatus('active');
}, [robotId, updateStatus]);
```

---

## Development

### Project Structure

```
server/
├── telemetry-simulator.js  # Main server file
├── package.json             # Dependencies
└── README.md               # This file
```

### Adding New Robots

Edit the `initializeRobots()` function in `telemetry-simulator.js`:

```javascript
const robotConfigs = [
  // ... existing robots
  {
    id: 'rbt-004',
    name: 'NewRobot-01',
    initialStatus: 'idle',
    initialBattery: 80,
    flightArea: { minX: -20, maxX: 20, minY: -20, maxY: 20, minZ: 0, maxZ: 10 },
    tether: { isTethered: false, tetherLength: 0, anchorPoint: { x: 0, y: 0, z: 0 }, currentTetherExtension: 0 },
  },
];
```

### Customizing Update Interval

Change the `UPDATE_INTERVAL` constant:

```javascript
const UPDATE_INTERVAL = 500; // Update every 500ms (2 updates per second)
```

### Adjusting Robot Behavior

Modify the movement logic in `updatePosition()`:

```javascript
// Change speed
robot.speed = 1.0; // Faster movement

// Change battery drain rate
robot.battery -= 0.1; // Faster drain
```

---

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to WebSocket server

**Solutions**:
- Verify server is running: `curl http://localhost:8080/health`
- Check firewall settings
- Verify port 8080 is not in use: `lsof -i :8080`
- Check browser console for WebSocket errors

### No Telemetry Updates

**Problem**: Connected but not receiving updates

**Solutions**:
- Verify WebSocket connection is open: `ws.readyState === WebSocket.OPEN`
- Check message parsing: `console.log(event.data)`
- Verify message type is 'telemetry' or 'initial_state'

### Commands Not Working

**Problem**: Commands sent but no response

**Solutions**:
- Verify command format matches expected structure
- Check robot ID exists: `curl http://localhost:8080/api/robots`
- Verify WebSocket is open before sending
- Check server console for error messages

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::8080`

**Solutions**:
- Use different port: `PORT=3000 npm start`
- Kill existing process: `lsof -ti:8080 | xargs kill`

---

## Performance Considerations

### Update Frequency

- Default: 1 update per second (1000ms interval)
- For higher frequency: Reduce `UPDATE_INTERVAL` (minimum ~100ms recommended)
- For lower frequency: Increase `UPDATE_INTERVAL` (saves bandwidth)

### Multiple Clients

- Server supports multiple concurrent WebSocket connections
- All clients receive the same telemetry broadcasts
- Each client can send independent commands

### Resource Usage

- Low CPU usage (~1-2% on modern hardware)
- Low memory usage (~10-20MB)
- Network: ~1-2 KB per update per client

---

## Security Notes

⚠️ **This is a development/demo service. Do not use in production without security hardening.**

### Production Considerations

1. **Authentication**: Add WebSocket authentication
2. **Authorization**: Verify user permissions for commands
3. **Rate Limiting**: Limit command frequency
4. **Input Validation**: Validate all incoming messages
5. **HTTPS/WSS**: Use secure WebSocket (WSS) in production
6. **CORS**: Restrict CORS to specific origins
7. **Error Handling**: Don't expose internal errors to clients

---

## Future Enhancements

### Planned Features

- [ ] Configurable robot count via environment variable
- [ ] Custom flight paths and waypoints
- [ ] Simulated sensor data (temperature, pressure, etc.)
- [ ] Error injection for testing error handling
- [ ] Historical data replay
- [ ] Multiple flight areas per robot
- [ ] Collision detection between robots
- [ ] Weather/environmental effects

### Contributing

To add features:

1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Test thoroughly
5. Submit a pull request

---

## API Reference Summary

### WebSocket Messages

| Type | Direction | Description |
|------|-----------|-------------|
| `initial_state` | Server → Client | Initial robot states on connection |
| `telemetry` | Server → Client | Periodic telemetry updates |
| `command` | Client → Server | Control command |
| `command_ack` | Server → Client | Command confirmation |
| `error` | Server → Client | Error message |

### HTTP Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/robots` | GET | List all robots |

### Commands

| Action | Description | Status Change |
|--------|-------------|---------------|
| `start` | Start robot | → `active` |
| `pause` | Pause robot | → `idle` |
| `resume` | Resume robot | → `active` |
| `returnToDock` | Return to dock | → `charging` |
| `emergencyStop` | Emergency stop | → `error` |

---

## Examples

### JavaScript/TypeScript Client

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'telemetry') {
    message.data.forEach(robot => {
      console.log(`Robot ${robot.robotId}:`, {
        position: robot.position,
        battery: robot.battery,
        status: robot.status,
      });
    });
  }
};

// Send command
ws.send(JSON.stringify({
  type: 'command',
  robotId: 'rbt-001',
  action: 'start',
}));
```

### Python Client

```python
import asyncio
import websockets
import json

async def listen():
    uri = "ws://localhost:8080"
    async with websockets.connect(uri) as websocket:
        while True:
            message = await websocket.recv()
            data = json.loads(message)
            if data['type'] == 'telemetry':
                for robot in data['data']:
                    print(f"Robot {robot['robotId']}: {robot['position']}")

asyncio.run(listen())
```

---

## License

MIT

---

**Last Updated**: December 2025  
**Version**: 1.0.0

