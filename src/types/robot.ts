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