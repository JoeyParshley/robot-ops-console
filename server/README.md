# Robot Telemetry Simulator

A Node.js WebSocket service that simulates real-time telemetry data for robots.

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Development mode (auto-reload)
npm run dev
```

## Configuration

Set the port via environment variable:

```bash
PORT=3000 npm start
```

## Documentation

See [../docs/TELEMETRY_SIMULATOR.md](../docs/TELEMETRY_SIMULATOR.md) for complete documentation.

## Features

- Real-time telemetry updates via WebSocket
- Robot control commands (start, pause, resume, return to dock, emergency stop)
- HTTP endpoints for health checks and robot information
- Realistic robot movement simulation
- Battery and status updates

## API

- **WebSocket**: `ws://localhost:8080`
- **HTTP**: `http://localhost:8080`
- **Health Check**: `http://localhost:8080/health`
- **Robot List**: `http://localhost:8080/api/robots`

