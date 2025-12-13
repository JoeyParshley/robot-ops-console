export type RobotStatus = "idle" | "active" | "charging" | "error";

export interface FlightArea {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
}

export interface Tether {
    isTethered: boolean;
    tetherLength: number; // in meters
    anchorPoint: {
        x: number;
        y: number;
        z: number;
    };
    currentTetherExtension: number; // current length extended in meters
}

export interface Robot {
    id: string;
    name: string;
    status: RobotStatus;
    battery: number; // percentage from 0 to 100
    location: string;
    lastHeartbeat: string;
    currentTask?: string;
    tether: Tether;
    flightArea: FlightArea;
}

export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface Orientation {
    roll: number; // in degrees
    pitch: number; // in degrees
    yaw: number; // in degrees
}

export interface Velocity {
    vx: number; // velocity in x direction (m/s)
    vy: number; // velocity in y direction (m/s)
    vz: number; // velocity in z direction (m/s)
}

export interface StatusHistoryEntry {
    status: RobotStatus;
    timestamp: string;
    reason?: string;
}

export interface TaskHistoryEntry {
    taskId: string;
    taskName: string;
    startTime: string;
    endTime?: string;
    status: "completed" | "failed" | "cancelled" | "in_progress";
}

export interface ErrorLogEntry {
    errorCode: string;
    message: string;
    timestamp: string;
    severity: "warning" | "error" | "critical";
    resolved: boolean;
}

export interface PerformanceMetrics {
    uptime: number; // total uptime in seconds
    totalFlightTime: number; // total flight time in seconds
    tasksCompleted: number;
    tasksFailed: number;
    averageBatteryEfficiency: number; // percentage
}

export interface RobotDetail extends Robot {
    // Real-time telemetry
    currentPosition: Position;
    currentOrientation: Orientation;
    currentVelocity: Velocity;
    
    // Historical data
    statusHistory: StatusHistoryEntry[];
    taskHistory: TaskHistoryEntry[];
    errorLogs: ErrorLogEntry[];
    
    // Performance and metrics
    metrics: PerformanceMetrics;
    
    // Additional metadata
    firmwareVersion: string;
    hardwareModel: string;
    lastMaintenanceDate?: string;
    nextMaintenanceDue?: string;
}