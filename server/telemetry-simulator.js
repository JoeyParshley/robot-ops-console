#!/usr/bin/env node

/**
 * Robot Telemetry Simulator Service
 * 
 * Simulates real-time telemetry data for robots via WebSocket.
 * Sends position, orientation, velocity, battery, and status updates.
 */

import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const PORT = process.env.PORT || 8080;
const UPDATE_INTERVAL = 1000; // Update every 1 second (1000ms)

// Robot simulation state
const robots = new Map();

// Initialize robot states from mock data
const initializeRobots = () => {
    const robotConfigs = [
        {
            id: 'rbt-001',
            name: 'Atlas-01',
            initialStatus: 'active',
            initialBattery: 76,
            flightArea: { minX: -10, maxX: 10, minY: -10, maxY: 10, minZ: 0, maxZ: 5 },
            tether: { isTethered: true, tetherLength: 50, anchorPoint: { x: 0, y: 0, z: 0 }, currentTetherExtension: 32.5 },
        },
        {
            id: 'rbt-002',
            name: 'Atlas-02',
            initialStatus: 'charging',
            initialBattery: 45,
            flightArea: { minX: -10, maxX: 10, minY: -10, maxY: 10, minZ: 0, maxZ: 5 },
            tether: { isTethered: true, tetherLength: 50, anchorPoint: { x: 0, y: 0, z: 0 }, currentTetherExtension: 0 },
        },
        {
            id: 'rbt-003',
            name: 'Hermes-01',
            initialStatus: 'idle',
            initialBattery: 92,
            flightArea: { minX: -15, maxX: 15, minY: -15, maxY: 15, minZ: 0, maxZ: 8 },
            tether: { isTethered: false, tetherLength: 0, anchorPoint: { x: 0, y: 0, z: 0 }, currentTetherExtension: 0 },
        },
    ];

    robotConfigs.forEach(config => {
        const { flightArea } = config;
        const centerX = (flightArea.minX + flightArea.maxX) / 2;
        const centerY = (flightArea.minY + flightArea.maxY) / 2;
        const centerZ = flightArea.minZ + 1;

        robots.set(config.id, {
            id: config.id,
            name: config.name,
            status: config.initialStatus,
            battery: config.initialBattery,
            position: { x: centerX, y: centerY, z: centerZ },
            orientation: { roll: 0, pitch: 0, yaw: 0 },
            velocity: { vx: 0, vy: 0, vz: 0 },
            flightArea: config.flightArea,
            tether: config.tether,
            lastHeartbeat: new Date().toISOString(),
            // Movement parameters
            targetPosition: { x: centerX, y: centerY, z: centerZ },
            speed: config.initialStatus === 'active' ? 0.5 : 0, // m/s
            direction: Math.random() * Math.PI * 2, // random initial direction
        });
    });
};

// Generate realistic position update based on status
const updatePosition = (robot) => {
    const { position, flightArea, status, targetPosition, speed, direction } = robot;

    if (status === 'active' && speed > 0) {
        // Move towards target or in current direction
        const dx = targetPosition.x - position.x;
        const dy = targetPosition.y - position.y;
        const dz = targetPosition.z - position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 0.5) {
            // Reached target, pick new random target
            robot.targetPosition = {
                x: flightArea.minX + Math.random() * (flightArea.maxX - flightArea.minX),
                y: flightArea.minY + Math.random() * (flightArea.maxY - flightArea.minY),
                z: flightArea.minZ + 0.5 + Math.random() * (flightArea.maxZ - flightArea.minZ - 0.5),
            };
            robot.direction = Math.atan2(
                robot.targetPosition.y - position.y,
                robot.targetPosition.x - position.x
            );
        } else {
            // Move towards target
            const moveDistance = speed * (UPDATE_INTERVAL / 1000);
            robot.position.x += (dx / distance) * moveDistance;
            robot.position.y += (dy / distance) * moveDistance;
            robot.position.z += (dz / distance) * moveDistance;

            // Update velocity
            robot.velocity.vx = (dx / distance) * speed;
            robot.velocity.vy = (dy / distance) * speed;
            robot.velocity.vz = (dz / distance) * speed;

            // Update orientation (yaw towards direction of movement)
            robot.orientation.yaw = (robot.direction * 180) / Math.PI;
        }

        // Add small random variations
        robot.orientation.roll = (Math.random() - 0.5) * 5;
        robot.orientation.pitch = (Math.random() - 0.5) * 3;
    } else if (status === 'charging') {
        // Stay at dock position
        robot.velocity = { vx: 0, vy: 0, vz: 0 };
        robot.orientation = { roll: 0, pitch: 0, yaw: 0 };
    } else {
        // Idle - minimal movement
        robot.velocity = { vx: 0, vy: 0, vz: 0 };
    }

    // Clamp position to flight area bounds
    robot.position.x = Math.max(flightArea.minX, Math.min(flightArea.maxX, robot.position.x));
    robot.position.y = Math.max(flightArea.minY, Math.min(flightArea.maxY, robot.position.y));
    robot.position.z = Math.max(flightArea.minZ, Math.min(flightArea.maxZ, robot.position.z));
};

// Update battery level based on status
const updateBattery = (robot) => {
    if (robot.status === 'charging') {
        // Charge at ~1% per 10 seconds
        robot.battery = Math.min(100, robot.battery + 0.1);
    } else if (robot.status === 'active') {
        // Discharge at ~0.5% per 10 seconds when active
        robot.battery = Math.max(0, robot.battery - 0.05);
    }
    // Idle and error states don't change battery significantly
};

// Generate telemetry update for a robot
const generateTelemetryUpdate = (robot) => {
    updatePosition(robot);
    updateBattery(robot);
    robot.lastHeartbeat = new Date().toISOString();

    return {
        robotId: robot.id,
        timestamp: new Date().toISOString(),
        position: { ...robot.position },
        orientation: { ...robot.orientation },
        velocity: { ...robot.velocity },
        battery: Math.round(robot.battery * 10) / 10, // Round to 1 decimal
        status: robot.status,
        lastHeartbeat: robot.lastHeartbeat,
    };
};

// Broadcast telemetry to all connected clients
const broadcastTelemetry = (wss) => {
    const updates = [];
    robots.forEach((robot) => {
        updates.push(generateTelemetryUpdate(robot));
    });

    const message = JSON.stringify({
        type: 'telemetry',
        data: updates,
        timestamp: new Date().toISOString(),
    });

    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
        }
    });
};

// Handle robot control commands
const handleCommand = (ws, command) => {
    const { robotId, action } = command;
    const robot = robots.get(robotId);

    if (!robot) {
        ws.send(JSON.stringify({
            type: 'error',
            message: `Robot ${robotId} not found`,
        }));
        return;
    }

    switch (action) {
        case 'start':
            robot.status = 'active';
            robot.speed = 0.5;
            break;
        case 'pause':
            robot.status = 'idle';
            robot.speed = 0;
            robot.velocity = { vx: 0, vy: 0, vz: 0 };
            break;
        case 'resume':
            robot.status = 'active';
            robot.speed = 0.5;
            break;
        case 'returnToDock':
            robot.status = 'charging';
            robot.speed = 0;
            robot.velocity = { vx: 0, vy: 0, vz: 0 };
            // Move to dock position (center of flight area)
            robot.targetPosition = {
                x: (robot.flightArea.minX + robot.flightArea.maxX) / 2,
                y: (robot.flightArea.minY + robot.flightArea.maxY) / 2,
                z: robot.flightArea.minZ + 0.5,
            };
            break;
        case 'emergencyStop':
            robot.status = 'error';
            robot.speed = 0;
            robot.velocity = { vx: 0, vy: 0, vz: 0 };
            break;
        default:
            ws.send(JSON.stringify({
                type: 'error',
                message: `Unknown action: ${action}`,
            }));
            return;
    }

    // Send confirmation
    ws.send(JSON.stringify({
        type: 'command_ack',
        robotId,
        action,
        status: robot.status,
        timestamp: new Date().toISOString(),
    }));

    console.log(`[Command] ${action} for robot ${robotId} - Status: ${robot.status}`);
};

// Main server setup
const startServer = () => {
    initializeRobots();

    const server = createServer((req, res) => {
        // CORS headers for development
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        // Health check endpoint
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                robots: Array.from(robots.keys()),
                timestamp: new Date().toISOString(),
            }));
            return;
        }

        // Get robot list endpoint
        if (req.url === '/api/robots') {
            const robotList = Array.from(robots.values()).map(robot => ({
                id: robot.id,
                name: robot.name,
                status: robot.status,
                battery: robot.battery,
                position: robot.position,
            }));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(robotList));
            return;
        }

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    });

    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        const clientIp = req.socket.remoteAddress;
        console.log(`[WebSocket] Client connected from ${clientIp}`);

        // Send initial robot states
        const initialData = Array.from(robots.values()).map(robot => ({
            robotId: robot.id,
            name: robot.name,
            status: robot.status,
            battery: robot.battery,
            position: robot.position,
            orientation: robot.orientation,
            velocity: robot.velocity,
        }));

        ws.send(JSON.stringify({
            type: 'initial_state',
            data: initialData,
            timestamp: new Date().toISOString(),
        }));

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                
                if (data.type === 'command') {
                    handleCommand(ws, data);
                } else {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Unknown message type',
                    }));
                }
            } catch (error) {
                console.error('[WebSocket] Error parsing message:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid JSON',
                }));
            }
        });

        ws.on('close', () => {
            console.log(`[WebSocket] Client disconnected from ${clientIp}`);
        });

        ws.on('error', (error) => {
            console.error(`[WebSocket] Error for client ${clientIp}:`, error);
        });
    });

    // Start telemetry broadcast loop
    setInterval(() => {
        broadcastTelemetry(wss);
    }, UPDATE_INTERVAL);

    server.listen(PORT, () => {
        console.log(`\n🤖 Robot Telemetry Simulator`);
        console.log(`================================`);
        console.log(`📡 WebSocket Server: ws://localhost:${PORT}`);
        console.log(`🌐 HTTP Server: http://localhost:${PORT}`);
        console.log(`📊 Health Check: http://localhost:${PORT}/health`);
        console.log(`🤖 Robot List: http://localhost:${PORT}/api/robots`);
        console.log(`\n✨ Simulating ${robots.size} robots`);
        console.log(`⏱️  Update interval: ${UPDATE_INTERVAL}ms\n`);
    });
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down telemetry simulator...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n🛑 Shutting down telemetry simulator...');
    process.exit(0);
});

// Start the server
startServer();

