// mockDetail: RobotDetail
import { describe, expect, it, vi } from 'vitest';
import type { RobotDetail } from '../types/robot';
import { render, screen } from '@testing-library/react';
import { RobotDetailPage } from './RobotDetailPage';

const mockRobotDetail: RobotDetail = {
    id: "rbt-001",
    name: "Atlas-01",
    status: "active",
    battery: 76,
    location: "Lab A",
    lastHeartbeat: "2025-12-11T15:23:10Z",
    currentTask: "Patrol Route A",
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
    currentPosition: { x: 10.5, y: 8.2, z: 3.1 },
    currentOrientation: { roll: 2.5, pitch: -1.2, yaw: 45.0 },
    currentVelocity: { vx: 0.5, vy: 0.3, vz: 0.1 },
    // Historical data
    statusHistory: [
        {
            status: "idle",
            timestamp: "2025-12-11T14:00:00Z",
            reason: "Initial startup",
        },
        {
            status: "active",
            timestamp: "2025-12-11T14:15:00Z",
            reason: "Task assigned",
        },
    ],
    taskHistory: [
        {
            taskId: "task-001",
            taskName: "Patrol Route A",
            startTime: "2025-12-11T14:15:00Z",
            endTime: "2025-12-11T15:00:00Z",
            status: "completed",
        },
        {
            taskId: "task-002",
            taskName: "Patrol Route A",
            startTime: "2025-12-11T15:00:00Z",
            status: "in_progress",
        },
    ],
    errorLogs: [
        {
            errorCode: "ERR-001",
            message: "Battery level below threshold",
            timestamp: "2025-12-11T13:00:00Z",
            severity: "warning",
            resolved: true,
        },
    ],
    // Performance metrics
    metrics: {
        uptime: 86400, // 24 hours in seconds
        totalFlightTime: 7200, // 2 hours in seconds
        tasksCompleted: 15,
        tasksFailed: 2,
        averageBatteryEfficiency: 85.5,
    },
    // Additional metadata
    firmwareVersion: "v2.3.1",
    hardwareModel: "Atlas-MK2",
    lastMaintenanceDate: "2025-11-15",
    nextMaintenanceDue: "2026-01-15",
};

describe("RobotDetailPage", () => {
    it("renders robot name and basic information", () => {
        render(<RobotDetailPage robot={mockRobotDetail} onBack={vi.fn()} />);
        expect(screen.getByText("Atlas-01")).toBeInTheDocument();
        expect(screen.getByText(/rbt-001/)).toBeInTheDocument();
        expect(screen.getByText(/Lab A/)).toBeInTheDocument();
    });
});