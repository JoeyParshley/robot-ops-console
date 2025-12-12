export type RobotStatus = "idle" | "active" | "charging" | "error";

export interface Robot {
    id: string;
    name: string;
    status: RobotStatus;
    battery: number; // percentage from 0 to 100
    location: string
    lastHeartbeat: string;
    currentTaskId?: string;
}