import type { Robot, RobotDetail } from '../types/robot';

export const mockRobots: Robot[] = [
    {
        id: 'rbt-001',
        name: 'Atlas-01',
        status: 'active',
        battery: 76,
        location: 'Lab A',
        lastHeartbeat: '2025-12-11T15:23:10Z',
        currentTask: 'Patrol Route A',
        tether: {
            isTethered: true,
            tetherLength: 50,
            anchorPoint: { x: 0, y: 0, z: 0 },
            currentTetherExtension: 32.5,
        },
        flightArea: {
            minX: -25,
            maxX: 25,
            minY: -25,
            maxY: 25,
            minZ: 0,
            maxZ: 15,
        },
    },
    {
        id: 'rbt-002',
        name: 'Atlas-02',
        status: 'charging',
        battery: 45,
        location: 'Charging Station 1',
        lastHeartbeat: '2025-12-11T15:23:10Z',
        currentTask: 'Charging',
        tether: {
            isTethered: true,
            tetherLength: 40,
            anchorPoint: { x: 10, y: 5, z: 0 },
            currentTetherExtension: 5.2,
        },
        flightArea: {
            minX: -20,
            maxX: 20,
            minY: -20,
            maxY: 20,
            minZ: 0,
            maxZ: 12,
        },
    },
    {
        id: 'rbt-003',
        name: 'Hermes-01',
        status: 'idle',
        battery: 89,
        location: 'Warehouse B',
        lastHeartbeat: '2025-12-11T15:23:10Z',
        tether: {
            isTethered: true,
            tetherLength: 60,
            anchorPoint: { x: -15, y: 10, z: 0 },
            currentTetherExtension: 18.7,
        },
        flightArea: {
            minX: -30,
            maxX: 30,
            minY: -30,
            maxY: 30,
            minZ: 0,
            maxZ: 20,
        },
    },
    {
        id: 'rbt-004',
        name: 'Scout-01',
        status: 'error',
        battery: 20,
        location: 'Sector 7G',
        lastHeartbeat: '2025-12-11T15:23:10Z',
        currentTask: 'Diagnostics',
        tether: {
            isTethered: true,
            tetherLength: 35,
            anchorPoint: { x: 5, y: -8, z: 0 },
            currentTetherExtension: 35, // at max extension
        },
        flightArea: {
            minX: -15,
            maxX: 15,
            minY: -15,
            maxY: 15,
            minZ: 0,
            maxZ: 10,
        },
    }
];

export const mockRobotDetails: RobotDetail[] = [
    {
        // Base Robot data
        id: 'rbt-001',
        name: 'Atlas-01',
        status: 'active',
        battery: 76,
        location: 'Lab A',
        lastHeartbeat: '2025-12-11T15:23:10Z',
        currentTask: 'Patrol Route A',
        tether: {
            isTethered: true,
            tetherLength: 50,
            anchorPoint: { x: 0, y: 0, z: 0 },
            currentTetherExtension: 32.5,
        },
        flightArea: {
            minX: -25,
            maxX: 25,
            minY: -25,
            maxY: 25,
            minZ: 0,
            maxZ: 15,
        },
        // Real-time telemetry
        currentPosition: { x: 12.5, y: -8.3, z: 5.2 },
        currentOrientation: { roll: 2.1, pitch: -1.5, yaw: 45.3 },
        currentVelocity: { vx: 1.2, vy: 0.8, vz: 0.1 },
        // Historical data
        statusHistory: [
            { status: 'active', timestamp: '2025-12-11T15:23:10Z', reason: 'Task started' },
            { status: 'idle', timestamp: '2025-12-11T14:45:00Z', reason: 'Task completed' },
            { status: 'active', timestamp: '2025-12-11T14:30:00Z', reason: 'Patrol route assigned' },
            { status: 'charging', timestamp: '2025-12-11T13:15:00Z', reason: 'Low battery' },
            { status: 'idle', timestamp: '2025-12-11T12:00:00Z', reason: 'Standby' },
            { status: 'active', timestamp: '2025-12-11T11:00:00Z', reason: 'Morning patrol started' },
        ],
        taskHistory: [
            { taskId: 'task-001', taskName: 'Patrol Route A', startTime: '2025-12-11T15:20:00Z', status: 'in_progress' },
            { taskId: 'task-002', taskName: 'Inspection Zone 3', startTime: '2025-12-11T14:30:00Z', endTime: '2025-12-11T14:45:00Z', status: 'completed' },
            { taskId: 'task-003', taskName: 'Data Collection', startTime: '2025-12-11T13:00:00Z', endTime: '2025-12-11T13:15:00Z', status: 'completed' },
            { taskId: 'task-004', taskName: 'Emergency Response', startTime: '2025-12-10T16:00:00Z', endTime: '2025-12-10T16:45:00Z', status: 'completed' },
            { taskId: 'task-005', taskName: 'Routine Maintenance', startTime: '2025-12-10T10:00:00Z', endTime: '2025-12-10T10:30:00Z', status: 'completed' },
        ],
        errorLogs: [
            { errorCode: 'WRN-001', message: 'Battery level below 30%', timestamp: '2025-12-11T13:10:00Z', severity: 'warning', resolved: true },
            { errorCode: 'ERR-002', message: 'GPS signal weak', timestamp: '2025-12-10T15:30:00Z', severity: 'error', resolved: true },
        ],
        // Performance metrics
        metrics: {
            uptime: 86400 * 7, // 7 days in seconds
            totalFlightTime: 86400 * 2.5, // 2.5 days
            tasksCompleted: 127,
            tasksFailed: 3,
            averageBatteryEfficiency: 87.5,
        },
        // Additional metadata
        firmwareVersion: 'v2.4.1',
        hardwareModel: 'Atlas Pro',
        lastMaintenanceDate: '2025-11-15',
        nextMaintenanceDue: '2025-12-20',
    },
    {
        // Base Robot data
        id: 'rbt-002',
        name: 'Atlas-02',
        status: 'charging',
        battery: 45,
        location: 'Charging Station 1',
        lastHeartbeat: '2025-12-11T15:23:10Z',
        currentTask: 'Charging',
        tether: {
            isTethered: true,
            tetherLength: 40,
            anchorPoint: { x: 10, y: 5, z: 0 },
            currentTetherExtension: 5.2,
        },
        flightArea: {
            minX: -20,
            maxX: 20,
            minY: -20,
            maxY: 20,
            minZ: 0,
            maxZ: 12,
        },
        // Real-time telemetry
        currentPosition: { x: 10, y: 5, z: 0.5 },
        currentOrientation: { roll: 0, pitch: 0, yaw: 0 },
        currentVelocity: { vx: 0, vy: 0, vz: 0 },
        // Historical data
        statusHistory: [
            { status: 'charging', timestamp: '2025-12-11T15:00:00Z', reason: 'Low battery threshold reached' },
            { status: 'active', timestamp: '2025-12-11T14:00:00Z', reason: 'Task started' },
            { status: 'idle', timestamp: '2025-12-11T13:30:00Z', reason: 'Task completed' },
            { status: 'active', timestamp: '2025-12-11T12:00:00Z', reason: 'Patrol route assigned' },
            { status: 'charging', timestamp: '2025-12-11T10:00:00Z', reason: 'Scheduled charging' },
            { status: 'active', timestamp: '2025-12-11T08:00:00Z', reason: 'Morning shift started' },
        ],
        taskHistory: [
            { taskId: 'task-006', taskName: 'Charging', startTime: '2025-12-11T15:00:00Z', status: 'in_progress' },
            { taskId: 'task-007', taskName: 'Surveillance Zone 2', startTime: '2025-12-11T14:00:00Z', endTime: '2025-12-11T14:30:00Z', status: 'completed' },
            { taskId: 'task-008', taskName: 'Environmental Scan', startTime: '2025-12-11T12:00:00Z', endTime: '2025-12-11T13:30:00Z', status: 'completed' },
            { taskId: 'task-009', taskName: 'Routine Inspection', startTime: '2025-12-10T14:00:00Z', endTime: '2025-12-10T15:00:00Z', status: 'completed' },
            { taskId: 'task-010', taskName: 'Data Backup', startTime: '2025-12-10T10:00:00Z', endTime: '2025-12-10T11:00:00Z', status: 'completed' },
        ],
        errorLogs: [
            { errorCode: 'WRN-003', message: 'Battery level critical', timestamp: '2025-12-11T14:55:00Z', severity: 'warning', resolved: false },
            { errorCode: 'WRN-004', message: 'Charging port temperature elevated', timestamp: '2025-12-11T15:05:00Z', severity: 'warning', resolved: true },
        ],
        // Performance metrics
        metrics: {
            uptime: 86400 * 5, // 5 days
            totalFlightTime: 86400 * 1.8, // 1.8 days
            tasksCompleted: 89,
            tasksFailed: 1,
            averageBatteryEfficiency: 82.3,
        },
        // Additional metadata
        firmwareVersion: 'v2.4.1',
        hardwareModel: 'Atlas Pro',
        lastMaintenanceDate: '2025-11-20',
        nextMaintenanceDue: '2025-12-25',
    },
    {
        // Base Robot data
        id: 'rbt-003',
        name: 'Hermes-01',
        status: 'idle',
        battery: 89,
        location: 'Warehouse B',
        lastHeartbeat: '2025-12-11T15:23:10Z',
        tether: {
            isTethered: true,
            tetherLength: 60,
            anchorPoint: { x: -15, y: 10, z: 0 },
            currentTetherExtension: 18.7,
        },
        flightArea: {
            minX: -30,
            maxX: 30,
            minY: -30,
            maxY: 30,
            minZ: 0,
            maxZ: 20,
        },
        // Real-time telemetry
        currentPosition: { x: -15, y: 10, z: 2.1 },
        currentOrientation: { roll: 0.5, pitch: -0.3, yaw: 180 },
        currentVelocity: { vx: 0, vy: 0, vz: 0 },
        // Historical data
        statusHistory: [
            { status: 'idle', timestamp: '2025-12-11T15:00:00Z', reason: 'Standby mode' },
            { status: 'active', timestamp: '2025-12-11T13:00:00Z', reason: 'Task completed' },
            { status: 'active', timestamp: '2025-12-11T11:00:00Z', reason: 'Inventory scan started' },
            { status: 'idle', timestamp: '2025-12-11T09:00:00Z', reason: 'Scheduled break' },
            { status: 'active', timestamp: '2025-12-11T08:00:00Z', reason: 'Morning patrol' },
            { status: 'idle', timestamp: '2025-12-11T06:00:00Z', reason: 'Night watch completed' },
        ],
        taskHistory: [
            { taskId: 'task-011', taskName: 'Standby', startTime: '2025-12-11T15:00:00Z', status: 'in_progress' },
            { taskId: 'task-012', taskName: 'Warehouse Inventory Scan', startTime: '2025-12-11T13:00:00Z', endTime: '2025-12-11T15:00:00Z', status: 'completed' },
            { taskId: 'task-013', taskName: 'Security Patrol', startTime: '2025-12-11T11:00:00Z', endTime: '2025-12-11T13:00:00Z', status: 'completed' },
            { taskId: 'task-014', taskName: 'Morning Inspection', startTime: '2025-12-11T08:00:00Z', endTime: '2025-12-11T09:00:00Z', status: 'completed' },
            { taskId: 'task-015', taskName: 'Night Watch', startTime: '2025-12-10T20:00:00Z', endTime: '2025-12-11T06:00:00Z', status: 'completed' },
        ],
        errorLogs: [],
        // Performance metrics
        metrics: {
            uptime: 86400 * 10, // 10 days
            totalFlightTime: 86400 * 4.2, // 4.2 days
            tasksCompleted: 203,
            tasksFailed: 0,
            averageBatteryEfficiency: 91.2,
        },
        // Additional metadata
        firmwareVersion: 'v2.5.0',
        hardwareModel: 'Hermes Elite',
        lastMaintenanceDate: '2025-12-01',
        nextMaintenanceDue: '2025-12-28',
    },
];