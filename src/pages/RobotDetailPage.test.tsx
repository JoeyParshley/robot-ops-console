import { describe, expect, it } from 'vitest';
import type { RobotDetail } from '../types/robot';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { RobotDetailPage } from './RobotDetailPage';

// Create a mock RobotDetail that extends Robot
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

const mockRobots: RobotDetail[] = [mockRobotDetail];

// Helper function to create router with RobotDetailPage
const createRouterWithRobots = (path: string, robots: RobotDetail[]) => {
    return createMemoryRouter([
        {
            path: "/robots/:id",
            element: <RobotDetailPage robots={robots} />,
        },
    ], {
        initialEntries: [path],
    });
};

describe("RobotDetailPage", () => {
    it("renders robot name and basic information", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText("Atlas-01")).toBeInTheDocument();
        expect(screen.getByText(/rbt-001/)).toBeInTheDocument();
        expect(screen.getByText(/Lab A/)).toBeInTheDocument();
    });

    it("displays robot status chip", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        // There are multiple ACTIVE chips (header and status history), so use getAllByText
        const activeChips = screen.getAllByText(/ACTIVE/i);
        expect(activeChips.length).toBeGreaterThan(0);
    });

    it("displays the battery level with percentage", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText(/76%/i)).toBeInTheDocument();
    });

    it("navigates back when the back button is clicked", () => {
        const router = createMemoryRouter([
            {
                path: "/",
                element: <div>Fleet Overview</div>,
            },
            {
                path: "/robots/:id",
                element: <RobotDetailPage robots={mockRobots} />,
            },
        ], {
            initialEntries: ["/robots/rbt-001"],
        });
        render(<RouterProvider router={router} />);
        
        const backButton = screen.getByRole("button", { name: "Back" });
        expect(backButton).toBeInTheDocument();
        
        fireEvent.click(backButton);
        
        // After navigation, should show fleet overview
        expect(screen.getByText("Fleet Overview")).toBeInTheDocument();
    });

    it("displays the status chip for idle status", () => {
        const idleRobot: RobotDetail = {
            ...mockRobotDetail,
            status: "idle" as const,
        };
        const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
        render(<RouterProvider router={router} />);
        
        // There are multiple IDLE chips (header and status history), so use getAllByText
        const idleChips = screen.getAllByText(/IDLE/i);
        expect(idleChips.length).toBeGreaterThan(0);
    });

    it("displays the status chip for charging status", () => {
        const chargingRobot: RobotDetail = {
            ...mockRobotDetail,
            status: "charging" as const,
        };
        const router = createRouterWithRobots("/robots/rbt-001", [chargingRobot]);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText(/CHARGING/i)).toBeInTheDocument();
    });

    it("displays the status chip for error status", () => {
        const errorRobot: RobotDetail = {
            ...mockRobotDetail,
            status: "error" as const,
        };
        const router = createRouterWithRobots("/robots/rbt-001", [errorRobot]);
        render(<RouterProvider router={router} />);
        
        // There are multiple ERROR references (header chip and error logs section), so use getAllByText
        const errorTexts = screen.getAllByText(/ERROR/i);
        expect(errorTexts.length).toBeGreaterThan(0);
    });

    it("displays battery level for different percentages", () => {
        const lowBatteryRobot: RobotDetail = {
            ...mockRobotDetail,
            battery: 15,
        };
        const router1 = createRouterWithRobots("/robots/rbt-001", [lowBatteryRobot]);
        const { unmount } = render(<RouterProvider router={router1} />);
        expect(screen.getByText(/15%/i)).toBeInTheDocument();
        unmount();

        const mediumBatteryRobot: RobotDetail = {
            ...mockRobotDetail,
            battery: 50,
        };
        const router2 = createRouterWithRobots("/robots/rbt-001", [mediumBatteryRobot]);
        render(<RouterProvider router={router2} />);
        expect(screen.getByText(/50%/i)).toBeInTheDocument();

        const highBatteryRobot: RobotDetail = {
            ...mockRobotDetail,
            battery: 90,
        };
        const router3 = createRouterWithRobots("/robots/rbt-001", [highBatteryRobot]);
        render(<RouterProvider router={router3} />);
        expect(screen.getByText(/90%/i)).toBeInTheDocument();
    });

    it("renders all required elements", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText("Atlas-01")).toBeInTheDocument();
        expect(screen.getByText(/rbt-001/)).toBeInTheDocument();
        expect(screen.getByText(/Lab A/)).toBeInTheDocument();
        // There are multiple ACTIVE chips (header and status history), so use getAllByText
        const activeChips = screen.getAllByText(/ACTIVE/i);
        expect(activeChips.length).toBeGreaterThan(0);
        expect(screen.getByText(/76%/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    });

    it("displays error message for invalid robot ID", () => {
        const router = createRouterWithRobots("/robots/invalid-id", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText(/Robot not found/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid-id/)).toBeInTheDocument();
    });

    it("displays hardware model and firmware version", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText(/Atlas-MK2/i)).toBeInTheDocument();
        expect(screen.getByText(/v2.3.1/i)).toBeInTheDocument();
    });

    it("displays real-time telemetry data", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        // Position - check for Position heading and specific values with context
        expect(screen.getByText(/Position/i)).toBeInTheDocument();
        // Use getAllByText and find the one in Position section
        const xLabels = screen.getAllByText(/^X:$/);
        const xPosition = xLabels.find(el => el.closest('p')?.textContent?.includes('10.50'));
        expect(xPosition).toBeDefined();
        const yPosition = screen.getByText(/^Y:$/);
        expect(yPosition.closest('p')?.textContent).toContain('8.20');
        const zPosition = screen.getByText(/^Z:$/);
        expect(zPosition.closest('p')?.textContent).toContain('3.10');
        
        // Orientation - check for Orientation heading and specific values with context
        expect(screen.getByText(/Orientation/i)).toBeInTheDocument();
        const roll = screen.getByText(/^Roll:$/);
        expect(roll.closest('p')?.textContent).toContain('2.5');
        const pitch = screen.getByText(/^Pitch:$/);
        expect(pitch.closest('p')?.textContent).toContain('-1.2');
        const yaw = screen.getByText(/^Yaw:$/);
        expect(yaw.closest('p')?.textContent).toContain('45.0');
        
        // Velocity - check for Velocity heading and specific values with context
        expect(screen.getByText(/Velocity/i)).toBeInTheDocument();
        const vx = screen.getByText(/^Vx:$/);
        expect(vx.closest('p')?.textContent).toContain('0.50');
        const vy = screen.getByText(/^Vy:$/);
        expect(vy.closest('p')?.textContent).toContain('0.30');
        const vz = screen.getByText(/^Vz:$/);
        expect(vz.closest('p')?.textContent).toContain('0.10');
    });

    it("displays status history table", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText(/Status History/i)).toBeInTheDocument();
        expect(screen.getByText(/Initial startup/i)).toBeInTheDocument();
        expect(screen.getByText(/Task assigned/i)).toBeInTheDocument();
    });

    it("displays task history table", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText(/Task History/i)).toBeInTheDocument();
        expect(screen.getByText(/task-001/i)).toBeInTheDocument();
        expect(screen.getByText(/task-002/i)).toBeInTheDocument();
        // "Patrol Route A" appears in Current Task and Task History, so use getAllByText
        const patrolRouteTexts = screen.getAllByText(/Patrol Route A/i);
        expect(patrolRouteTexts.length).toBeGreaterThan(0);
    });

    it("displays error logs table when errors exist", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText(/Error Logs/i)).toBeInTheDocument();
        expect(screen.getByText(/ERR-001/i)).toBeInTheDocument();
        expect(screen.getByText(/Battery level below threshold/i)).toBeInTheDocument();
    });

    it("does not display error logs section when no errors exist", () => {
        const robotWithoutErrors: RobotDetail = {
            ...mockRobotDetail,
            errorLogs: [],
        };
        const router = createRouterWithRobots("/robots/rbt-001", [robotWithoutErrors]);
        render(<RouterProvider router={router} />);
        
        // Error Logs section should not be present
        expect(screen.queryByText(/Error Logs/i)).not.toBeInTheDocument();
    });

    it("displays performance metrics", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText(/Tasks Completed/i)).toBeInTheDocument();
        // "15" might appear in multiple places, so check it's near "Tasks Completed"
        const tasksCompletedText = screen.getByText(/Tasks Completed/i);
        expect(tasksCompletedText.closest('p')?.textContent).toContain('15');
        
        expect(screen.getByText(/Tasks Failed/i)).toBeInTheDocument();
        // "2" might appear in multiple places, so check it's near "Tasks Failed"
        const tasksFailedText = screen.getByText(/Tasks Failed/i);
        expect(tasksFailedText.closest('p')?.textContent).toContain('2');
        
        expect(screen.getByText(/Battery Efficiency/i)).toBeInTheDocument();
        expect(screen.getByText(/85\.5%/i)).toBeInTheDocument();
    });

    it("displays maintenance dates", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText(/Last Maintenance/i)).toBeInTheDocument();
        expect(screen.getByText(/2025-11-15/i)).toBeInTheDocument();
        expect(screen.getByText(/Next Maintenance Due/i)).toBeInTheDocument();
        expect(screen.getByText(/2026-01-15/i)).toBeInTheDocument();
    });

    it("displays tether information", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText(/Tether Information/i)).toBeInTheDocument();
        expect(screen.getByText(/Tethered/i)).toBeInTheDocument();
        // Check for Max Length with context to avoid matching other "50" values
        const maxLength = screen.getByText(/Max Length:/i);
        expect(maxLength.closest('p')?.textContent).toContain('50');
        // Check for Current Extension with context
        const currentExtension = screen.getByText(/Current Extension:/i);
        expect(currentExtension.closest('p')?.textContent).toContain('32.5');
    });

    it("displays current task when present", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText(/Current Task/i)).toBeInTheDocument();
        // "Patrol Route A" appears in Current Task and Task History, so check it's in Current Task section
        const currentTaskLabel = screen.getByText(/Current Task:/i);
        expect(currentTaskLabel.closest('p')?.textContent).toContain('Patrol Route A');
    });
});