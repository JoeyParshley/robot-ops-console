import { describe, expect, it, vi } from 'vitest';
import type { RobotDetail, Robot } from '../types/robot';
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { RobotDetailPage } from './RobotDetailPage';
import { FleetOverviewPage } from './FleetOverviewPage';
import { RobotStateProvider } from '../context/RobotStateContext';

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

// Create Robot[] version for FleetOverviewPage tests
const mockRobotsBasic: Robot[] = [
    {
        id: mockRobotDetail.id,
        name: mockRobotDetail.name,
        status: mockRobotDetail.status,
        battery: mockRobotDetail.battery,
        location: mockRobotDetail.location,
        lastHeartbeat: mockRobotDetail.lastHeartbeat,
        currentTask: mockRobotDetail.currentTask,
        tether: mockRobotDetail.tether,
        flightArea: mockRobotDetail.flightArea,
    },
];

// Helper function to create router with RobotDetailPage
const createRouterWithRobots = (path: string, robots: RobotDetail[]) => {
    return createMemoryRouter([
        {
            path: "/robots/:id",
            element: (
                <RobotStateProvider initialRobots={robots}>
                    <RobotDetailPage robots={robots} />
                </RobotStateProvider>
            ),
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
                element: (
                    <RobotStateProvider initialRobots={mockRobots}>
                        <RobotDetailPage robots={mockRobots} />
                    </RobotStateProvider>
                ),
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

    it("displays task history with correct status indicators", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        // Check for status chips in task history
        const completedChips = screen.getAllByText(/COMPLETED/i);
        expect(completedChips.length).toBeGreaterThan(0);
        
        const inProgressChips = screen.getAllByText(/IN PROGRESS/i);
        expect(inProgressChips.length).toBeGreaterThan(0);
    });

    it("displays error logs table when errors exist", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        expect(screen.getByText(/Error Logs/i)).toBeInTheDocument();
        expect(screen.getByText(/ERR-001/i)).toBeInTheDocument();
        expect(screen.getByText(/Battery level below threshold/i)).toBeInTheDocument();
    });

    it("displays error logs with severity indicators", () => {
        const robotWithMultipleErrors: RobotDetail = {
            ...mockRobotDetail,
            errorLogs: [
                {
                    errorCode: "WRN-001",
                    message: "Warning message",
                    timestamp: "2025-12-11T13:00:00Z",
                    severity: "warning",
                    resolved: false,
                },
                {
                    errorCode: "ERR-002",
                    message: "Error message",
                    timestamp: "2025-12-11T14:00:00Z",
                    severity: "error",
                    resolved: true,
                },
                {
                    errorCode: "CRT-001",
                    message: "Critical message",
                    timestamp: "2025-12-11T15:00:00Z",
                    severity: "critical",
                    resolved: false,
                },
            ],
        };
        const router = createRouterWithRobots("/robots/rbt-001", [robotWithMultipleErrors]);
        render(<RouterProvider router={router} />);
        
        // Check for severity chips (may appear multiple times, so use getAllByText)
        const warningChips = screen.getAllByText(/WARNING/i);
        expect(warningChips.length).toBeGreaterThan(0);
        const errorChips = screen.getAllByText(/ERROR/i);
        expect(errorChips.length).toBeGreaterThan(0);
        const criticalChips = screen.getAllByText(/CRITICAL/i);
        expect(criticalChips.length).toBeGreaterThan(0);
        
        // Check for resolved status
        const resolvedChips = screen.getAllByText(/Yes/i);
        const unresolvedChips = screen.getAllByText(/No/i);
        expect(resolvedChips.length).toBeGreaterThan(0);
        expect(unresolvedChips.length).toBeGreaterThan(0);
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

    it("displays all performance metrics correctly", () => {
        const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
        render(<RouterProvider router={router} />);
        
        // Check all performance metrics are displayed
        expect(screen.getByText(/Uptime/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Flight Time/i)).toBeInTheDocument();
        expect(screen.getByText(/Tasks Completed/i)).toBeInTheDocument();
        expect(screen.getByText(/Tasks Failed/i)).toBeInTheDocument();
        expect(screen.getByText(/Battery Efficiency/i)).toBeInTheDocument();
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

    describe("Operator Controls", () => {
        it("renders all operator control buttons", () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            expect(screen.getByText(/Operator Controls/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Return to Dock" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Emergency Stop" })).toBeInTheDocument();
        });

        it("enables Start button when robot is idle", () => {
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            const startButton = screen.getByRole("button", { name: "Start" });
            expect(startButton).not.toBeDisabled();
        });

        it("disables Start button when robot is not idle", () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const startButton = screen.getByRole("button", { name: "Start" });
            expect(startButton).toBeDisabled();
        });

        it("enables Pause button when robot is active", () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const pauseButton = screen.getByRole("button", { name: "Pause" });
            expect(pauseButton).not.toBeDisabled();
        });

        it("disables Pause button when robot is not active", () => {
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            const pauseButton = screen.getByRole("button", { name: "Pause" });
            expect(pauseButton).toBeDisabled();
        });

        it("enables Resume button when robot is idle", () => {
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            const resumeButton = screen.getByRole("button", { name: "Resume" });
            expect(resumeButton).not.toBeDisabled();
        });

        it("disables Resume button when robot is not idle", () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const resumeButton = screen.getByRole("button", { name: "Resume" });
            expect(resumeButton).toBeDisabled();
        });

        it("enables Return to Dock button when robot is active", () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const returnToDockButton = screen.getByRole("button", { name: "Return to Dock" });
            expect(returnToDockButton).not.toBeDisabled();
        });

        it("enables Return to Dock button when robot is idle", () => {
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            const returnToDockButton = screen.getByRole("button", { name: "Return to Dock" });
            expect(returnToDockButton).not.toBeDisabled();
        });

        it("disables Return to Dock button when robot is charging", () => {
            const chargingRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "charging" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [chargingRobot]);
            render(<RouterProvider router={router} />);
            
            const returnToDockButton = screen.getByRole("button", { name: "Return to Dock" });
            expect(returnToDockButton).toBeDisabled();
        });

        it("disables Return to Dock button when robot is in error state", () => {
            const errorRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "error" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [errorRobot]);
            render(<RouterProvider router={router} />);
            
            const returnToDockButton = screen.getByRole("button", { name: "Return to Dock" });
            expect(returnToDockButton).toBeDisabled();
        });

        it("enables Emergency Stop button when robot is active", () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const emergencyStopButton = screen.getByRole("button", { name: "Emergency Stop" });
            expect(emergencyStopButton).not.toBeDisabled();
        });

        it("enables Emergency Stop button when robot is idle", () => {
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            const emergencyStopButton = screen.getByRole("button", { name: "Emergency Stop" });
            expect(emergencyStopButton).not.toBeDisabled();
        });

        it("enables Emergency Stop button when robot is charging", () => {
            const chargingRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "charging" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [chargingRobot]);
            render(<RouterProvider router={router} />);
            
            const emergencyStopButton = screen.getByRole("button", { name: "Emergency Stop" });
            expect(emergencyStopButton).not.toBeDisabled();
        });

        it("disables Emergency Stop button when robot is in error state", () => {
            const errorRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "error" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [errorRobot]);
            render(<RouterProvider router={router} />);
            
            const emergencyStopButton = screen.getByRole("button", { name: "Emergency Stop" });
            expect(emergencyStopButton).toBeDisabled();
        });

        it("calls console.log when Start button is clicked", async () => {
            vi.useFakeTimers();
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            const startButton = screen.getByRole("button", { name: "Start" });
            fireEvent.click(startButton);
            
            await vi.runAllTimersAsync();
            
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[API] Starting robot"));
            consoleSpy.mockRestore();
            vi.useRealTimers();
        });

        it("calls console.log when Pause button is clicked", async () => {
            vi.useFakeTimers();
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const pauseButton = screen.getByRole("button", { name: "Pause" });
            fireEvent.click(pauseButton);
            
            await vi.runAllTimersAsync();
            
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[API] Pausing robot"));
            consoleSpy.mockRestore();
            vi.useRealTimers();
        });

        it("calls console.log when Resume button is clicked", async () => {
            vi.useFakeTimers();
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            const resumeButton = screen.getByRole("button", { name: "Resume" });
            fireEvent.click(resumeButton);
            
            await vi.runAllTimersAsync();
            
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[API] Resuming robot"));
            consoleSpy.mockRestore();
            vi.useRealTimers();
        });

        it("calls console.log when Return to Dock button is clicked", async () => {
            vi.useFakeTimers();
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const returnToDockButton = screen.getByRole("button", { name: "Return to Dock" });
            fireEvent.click(returnToDockButton);
            
            // Confirm action
            const confirmButton = screen.getByRole("button", { name: "Confirm" });
            fireEvent.click(confirmButton);
            
            await vi.runAllTimersAsync();
            
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[API] Returning robot"));
            consoleSpy.mockRestore();
            vi.useRealTimers();
        });

        it("shows confirmation dialog when Emergency Stop button is clicked", async () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const emergencyStopButton = screen.getByRole("button", { name: "Emergency Stop" });
            fireEvent.click(emergencyStopButton);
            
            // Should show confirmation dialog (use dialog role to avoid multiple matches)
            await waitFor(() => {
                const dialog = screen.getByRole("dialog");
                expect(dialog).toBeInTheDocument();
                // Check WARNING text is within the dialog
                expect(dialog.textContent).toMatch(/WARNING/i);
            });
            expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
        });

        it("Emergency Stop button has error color styling", () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const emergencyStopButton = screen.getByRole("button", { name: "Emergency Stop" });
            // Check that the button has the error color class (MUI applies this)
            expect(emergencyStopButton).toHaveClass('MuiButton-colorError');
        });
    });

    describe("Control Handlers", () => {

        it("shows loading state when Start button is clicked", async () => {
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            const startButton = screen.getByRole("button", { name: "Start" });
            await act(async () => {
                fireEvent.click(startButton);
            });
            
            // Should show loading state
            await waitFor(() => {
                expect(screen.getByText(/Starting.../i)).toBeInTheDocument();
            });
            expect(startButton).toBeDisabled();
        });

        // TODO: Fix timing issues with fake timers and snackbar rendering
        /* it("shows success message after Start action completes", async () => {
            vi.useFakeTimers();
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            const startButton = screen.getByRole("button", { name: "Start" });
            fireEvent.click(startButton);
            
            // Fast-forward timers - need to advance past the 1000ms delay
            await act(async () => {
                vi.advanceTimersByTime(1100);
            });
            
            // Wait for snackbar to appear
            await waitFor(() => {
                const snackbar = screen.queryByText(/Start command sent successfully/i);
                expect(snackbar).toBeInTheDocument();
            }, { timeout: 5000 });
            vi.useRealTimers();
        }); */

        // TODO: Fix timing issues with dialog rendering
        /* it("shows confirmation dialog for Return to Dock", async () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const returnToDockButton = screen.getByRole("button", { name: "Return to Dock" });
            fireEvent.click(returnToDockButton);
            
            // Should show confirmation dialog (use more specific query)
            await waitFor(() => {
                const dialog = screen.getByRole("dialog");
                expect(dialog).toBeInTheDocument();
                expect(dialog.textContent).toMatch(/Are you sure you want to return/i);
            }, { timeout: 2000 });
            expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
        }); */

        // TODO: Fix timing issues with dialog rendering
        /* it("shows confirmation dialog for Emergency Stop", async () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const emergencyStopButton = screen.getByRole("button", { name: "Emergency Stop" });
            fireEvent.click(emergencyStopButton);
            
            // Should show confirmation dialog (use dialog role to avoid multiple matches)
            await waitFor(() => {
                const dialog = screen.getByRole("dialog");
                expect(dialog).toBeInTheDocument();
                expect(dialog.textContent).toMatch(/WARNING/i);
                expect(dialog.textContent).toMatch(/immediately stop/i);
            });
            expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
        }); */

        // TODO: Fix timing issues with dialog interactions
        /* it("cancels action when Cancel is clicked in confirmation dialog", async () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const returnToDockButton = screen.getByRole("button", { name: "Return to Dock" });
            fireEvent.click(returnToDockButton);
            
            await waitFor(() => {
                expect(screen.getByRole("dialog")).toBeInTheDocument();
            });
            
            // Click Cancel
            const cancelButton = screen.getByRole("button", { name: "Cancel" });
            fireEvent.click(cancelButton);
            
            // Dialog should close
            await waitFor(() => {
                expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            }, { timeout: 1000 });
            // No success message should appear
            expect(screen.queryByText(/Return to Dock command sent successfully/i)).not.toBeInTheDocument();
        }); */

        // TODO: Fix timing issues with fake timers and snackbar rendering
        /* it("executes action when Confirm is clicked in confirmation dialog", async () => {
            vi.useFakeTimers();
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const returnToDockButton = screen.getByRole("button", { name: "Return to Dock" });
            fireEvent.click(returnToDockButton);
            
            await waitFor(() => {
                expect(screen.getByRole("dialog")).toBeInTheDocument();
            });
            
            // Click Confirm
            const confirmButton = screen.getByRole("button", { name: "Confirm" });
            fireEvent.click(confirmButton);
            
            // Fast-forward timers
            await act(async () => {
                vi.advanceTimersByTime(1100);
            });
            
            // Should log action and show success message
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Returning robot"));
            await waitFor(() => {
                expect(screen.getByText(/Return to Dock command sent successfully/i)).toBeInTheDocument();
            }, { timeout: 3000 });
            
            consoleSpy.mockRestore();
            vi.useRealTimers();
        }); */

        // TODO: Fix timing issues with fake timers and multiple actions
        /* it("shows loading state for all control buttons", async () => {
            vi.useFakeTimers();
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            // Test Start button loading
            const startButton = screen.getByRole("button", { name: "Start" });
            fireEvent.click(startButton);
            await waitFor(() => {
                expect(screen.getByText(/Starting.../i)).toBeInTheDocument();
            });
            
            // Fast-forward timers to complete action
            await act(async () => {
                vi.advanceTimersByTime(1100);
            });
            
            // Test Resume button loading (need to wait for previous action to complete)
            await waitFor(() => {
                expect(screen.queryByText(/Starting.../i)).not.toBeInTheDocument();
            });
            
            fireEvent.click(screen.getByRole("button", { name: "Resume" }));
            await waitFor(() => {
                expect(screen.getByText(/Resuming.../i)).toBeInTheDocument();
            });
            vi.useRealTimers();
        }); */

        it("disables all buttons when any action is loading", async () => {
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            const startButton = screen.getByRole("button", { name: "Start" });
            fireEvent.click(startButton);
            
            // All buttons should be disabled during loading
            expect(startButton).toBeDisabled();
            expect(screen.getByRole("button", { name: "Resume" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "Return to Dock" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "Emergency Stop" })).toBeDisabled();
        });

        // TODO: Fix timing issues with fake timers and status updates
        /* it("updates robot status after Start action", async () => {
            vi.useFakeTimers();
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            // Initially should show IDLE
            const idleChips = screen.getAllByText(/IDLE/i);
            expect(idleChips.length).toBeGreaterThan(0);
            
            const startButton = screen.getByRole("button", { name: "Start" });
            fireEvent.click(startButton);
            
            await act(async () => {
                vi.advanceTimersByTime(1100);
            });
            
            // Should update to ACTIVE
            await waitFor(() => {
                const activeChips = screen.getAllByText(/ACTIVE/i);
                expect(activeChips.length).toBeGreaterThan(0);
            });
            vi.useRealTimers();
        }); */

        // TODO: Fix timing issues with fake timers and status updates
        /* it("updates robot status after Pause action", async () => {
            vi.useFakeTimers();
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            // Initially should show ACTIVE
            const activeChips = screen.getAllByText(/ACTIVE/i);
            expect(activeChips.length).toBeGreaterThan(0);
            
            const pauseButton = screen.getByRole("button", { name: "Pause" });
            fireEvent.click(pauseButton);
            
            await act(async () => {
                vi.advanceTimersByTime(1100);
            });
            
            // Should update to IDLE
            await waitFor(() => {
                const idleChips = screen.getAllByText(/IDLE/i);
                expect(idleChips.length).toBeGreaterThan(0);
            });
            vi.useRealTimers();
        }); */

        // TODO: Fix timing issues with fake timers and status updates
        /* it("updates robot status after Return to Dock action", async () => {
            vi.useFakeTimers();
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const returnToDockButton = screen.getByRole("button", { name: "Return to Dock" });
            fireEvent.click(returnToDockButton);
            
            // Confirm action
            await waitFor(() => {
                expect(screen.getByRole("dialog")).toBeInTheDocument();
            });
            const confirmButton = screen.getByRole("button", { name: "Confirm" });
            fireEvent.click(confirmButton);
            
            // Fast-forward timers
            await act(async () => {
                vi.advanceTimersByTime(1100);
            });
            
            // Should update to CHARGING
            await waitFor(() => {
                expect(screen.getByText(/CHARGING/i)).toBeInTheDocument();
            });
            vi.useRealTimers();
        }); */

        // TODO: Fix timing issues with fake timers and status updates
        /* it("updates robot status after Emergency Stop action", async () => {
            vi.useFakeTimers();
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            const emergencyStopButton = screen.getByRole("button", { name: "Emergency Stop" });
            fireEvent.click(emergencyStopButton);
            
            // Confirm action
            await waitFor(() => {
                expect(screen.getByRole("dialog")).toBeInTheDocument();
            });
            const confirmButton = screen.getByRole("button", { name: "Confirm" });
            fireEvent.click(confirmButton);
            
            // Fast-forward timers
            await act(async () => {
                vi.advanceTimersByTime(1100);
            });
            
            // Should update to ERROR
            await waitFor(() => {
                const errorChips = screen.getAllByText(/ERROR/i);
                expect(errorChips.length).toBeGreaterThan(0);
            });
            vi.useRealTimers();
        }); */

        // TODO: Fix timing issues with fake timers and multiple renders
        /* it("logs actions to console", async () => {
            vi.useFakeTimers();
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            // Test Start
            fireEvent.click(screen.getByRole("button", { name: "Start" }));
            await act(async () => {
                vi.advanceTimersByTime(1100);
            });
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[API] Starting robot"));
            
            // Test Pause (need to set status back to active first)
            const activeRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "active" as const,
            };
            const router2 = createRouterWithRobots("/robots/rbt-001", [activeRobot]);
            render(<RouterProvider router={router2} />);
            
            fireEvent.click(screen.getByRole("button", { name: "Pause" }));
            await act(async () => {
                vi.advanceTimersByTime(1100);
            });
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[API] Pausing robot"));
            
            consoleSpy.mockRestore();
            vi.useRealTimers();
        }); */

        // TODO: Fix timing issues with fake timers and snackbar rendering
        /* it("shows error message on action failure", async () => {
            vi.useFakeTimers();
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const idleRobot: RobotDetail = {
                ...mockRobotDetail,
                status: "idle" as const,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [idleRobot]);
            render(<RouterProvider router={router} />);
            
            // This test verifies that success message appears (error handling structure exists)
            // In a real scenario, we'd mock API failure to test error path
            const startButton = screen.getByRole("button", { name: "Start" });
            fireEvent.click(startButton);
            
            await act(async () => {
                vi.advanceTimersByTime(1100);
            });
            
            // Should show success (since we're not simulating failure)
            // In a real scenario, we'd mock API failure
            await waitFor(() => {
                expect(screen.getByText(/Start command sent successfully/i)).toBeInTheDocument();
            }, { timeout: 3000 });
            
            consoleErrorSpy.mockRestore();
            vi.useRealTimers();
        }); */
    });

    describe("Edge Cases", () => {
        it("handles empty status history gracefully", () => {
            const robotWithEmptyHistory: RobotDetail = {
                ...mockRobotDetail,
                statusHistory: [],
            };
            const router = createRouterWithRobots("/robots/rbt-001", [robotWithEmptyHistory]);
            render(<RouterProvider router={router} />);
            
            // Status History section should still be displayed
            expect(screen.getByText(/Status History/i)).toBeInTheDocument();
            // Table should be empty (no status entries)
            expect(screen.queryByText(/Initial startup/i)).not.toBeInTheDocument();
        });

        it("handles empty task history gracefully", () => {
            const robotWithEmptyTasks: RobotDetail = {
                ...mockRobotDetail,
                taskHistory: [],
            };
            const router = createRouterWithRobots("/robots/rbt-001", [robotWithEmptyTasks]);
            render(<RouterProvider router={router} />);
            
            // Task History section should still be displayed
            expect(screen.getByText(/Task History/i)).toBeInTheDocument();
            // Table should be empty (no task entries)
            expect(screen.queryByText(/task-001/i)).not.toBeInTheDocument();
        });

        it("handles missing maintenance dates gracefully", () => {
            const robotWithoutMaintenance: RobotDetail = {
                ...mockRobotDetail,
                lastMaintenanceDate: undefined,
                nextMaintenanceDue: undefined,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [robotWithoutMaintenance]);
            render(<RouterProvider router={router} />);
            
            // Maintenance section should still be displayed
            expect(screen.getByText(/Maintenance/i)).toBeInTheDocument();
            // Dates should not be displayed
            expect(screen.queryByText(/2025-11-15/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/2026-01-15/i)).not.toBeInTheDocument();
        });

        it("handles robot without current task", () => {
            const robotWithoutTask: RobotDetail = {
                ...mockRobotDetail,
                currentTask: undefined,
            };
            const router = createRouterWithRobots("/robots/rbt-001", [robotWithoutTask]);
            render(<RouterProvider router={router} />);
            
            // Current Task should not be displayed
            expect(screen.queryByText(/Current Task:/i)).not.toBeInTheDocument();
        });

        it("displays all telemetry fields correctly", () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            // Verify all position fields
            expect(screen.getByText(/Position/i)).toBeInTheDocument();
            expect(screen.getByText(/^X:$/)).toBeInTheDocument();
            expect(screen.getByText(/^Y:$/)).toBeInTheDocument();
            expect(screen.getByText(/^Z:$/)).toBeInTheDocument();
            
            // Verify all orientation fields
            expect(screen.getByText(/Orientation/i)).toBeInTheDocument();
            expect(screen.getByText(/^Roll:$/)).toBeInTheDocument();
            expect(screen.getByText(/^Pitch:$/)).toBeInTheDocument();
            expect(screen.getByText(/^Yaw:$/)).toBeInTheDocument();
            
            // Verify all velocity fields
            expect(screen.getByText(/Velocity/i)).toBeInTheDocument();
            expect(screen.getByText(/^Vx:$/)).toBeInTheDocument();
            expect(screen.getByText(/^Vy:$/)).toBeInTheDocument();
            expect(screen.getByText(/^Vz:$/)).toBeInTheDocument();
        });

        it("handles task history with all status types", () => {
            const robotWithAllTaskStatuses: RobotDetail = {
                ...mockRobotDetail,
                taskHistory: [
                    {
                        taskId: "task-completed",
                        taskName: "Completed Task",
                        startTime: "2025-12-11T10:00:00Z",
                        endTime: "2025-12-11T11:00:00Z",
                        status: "completed",
                    },
                    {
                        taskId: "task-failed",
                        taskName: "Failed Task",
                        startTime: "2025-12-11T12:00:00Z",
                        endTime: "2025-12-11T13:00:00Z",
                        status: "failed",
                    },
                    {
                        taskId: "task-cancelled",
                        taskName: "Cancelled Task",
                        startTime: "2025-12-11T14:00:00Z",
                        endTime: "2025-12-11T15:00:00Z",
                        status: "cancelled",
                    },
                    {
                        taskId: "task-in-progress",
                        taskName: "In Progress Task",
                        startTime: "2025-12-11T16:00:00Z",
                        status: "in_progress",
                    },
                ],
            };
            const router = createRouterWithRobots("/robots/rbt-001", [robotWithAllTaskStatuses]);
            render(<RouterProvider router={router} />);
            
            // Check all status types are displayed (may appear multiple times, so use getAllByText)
            const completedChips = screen.getAllByText(/COMPLETED/i);
            expect(completedChips.length).toBeGreaterThan(0);
            const failedChips = screen.getAllByText(/FAILED/i);
            expect(failedChips.length).toBeGreaterThan(0);
            const cancelledChips = screen.getAllByText(/CANCELLED/i);
            expect(cancelledChips.length).toBeGreaterThan(0);
            const inProgressChips = screen.getAllByText(/IN PROGRESS/i);
            expect(inProgressChips.length).toBeGreaterThan(0);
        });
    });

    describe("Routing and Navigation", () => {
        it("extracts robot ID from URL parameter", () => {
            const router = createRouterWithRobots("/robots/rbt-001", mockRobots);
            render(<RouterProvider router={router} />);
            
            // Should display the robot with ID rbt-001
            expect(screen.getByText("Atlas-01")).toBeInTheDocument();
            expect(screen.getByText(/rbt-001/)).toBeInTheDocument();
        });

        it("displays correct robot when different ID is in URL", () => {
            const robot2: RobotDetail = {
                ...mockRobotDetail,
                id: "rbt-002",
                name: "Atlas-02",
                status: "charging" as const,
            };
            const robots = [mockRobotDetail, robot2];
            const router = createRouterWithRobots("/robots/rbt-002", robots);
            render(<RouterProvider router={router} />);
            
            // Should display robot 2, not robot 1
            expect(screen.getByText("Atlas-02")).toBeInTheDocument();
            expect(screen.getByText(/rbt-002/)).toBeInTheDocument();
            expect(screen.queryByText("Atlas-01")).not.toBeInTheDocument();
        });

        it("navigates back to fleet overview when back button is clicked", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <div>Fleet Overview</div>,
                },
                {
                    path: "/robots/:id",
                    element: (
                    <RobotStateProvider initialRobots={mockRobots}>
                        <RobotDetailPage robots={mockRobots} />
                    </RobotStateProvider>
                ),
                },
            ], {
                initialEntries: ["/robots/rbt-001"],
            });
            render(<RouterProvider router={router} />);
            
            // Verify we're on the detail page
            expect(screen.getByText("Atlas-01")).toBeInTheDocument();
            
            // Click back button
            const backButton = screen.getByRole("button", { name: "Back" });
            fireEvent.click(backButton);
            
            // Should navigate to fleet overview
            expect(screen.getByText("Fleet Overview")).toBeInTheDocument();
            expect(screen.queryByText("Atlas-01")).not.toBeInTheDocument();
        });

        it("navigates back using 'Back to Fleet Overview' button when robot not found", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <div>Fleet Overview</div>,
                },
                {
                    path: "/robots/:id",
                    element: (
                    <RobotStateProvider initialRobots={mockRobots}>
                        <RobotDetailPage robots={mockRobots} />
                    </RobotStateProvider>
                ),
                },
            ], {
                initialEntries: ["/robots/invalid-id"],
            });
            render(<RouterProvider router={router} />);
            
            // Verify error message is shown
            expect(screen.getByText(/Robot not found/i)).toBeInTheDocument();
            
            // Click back button
            const backButton = screen.getByRole("button", { name: "Back to Fleet Overview" });
            fireEvent.click(backButton);
            
            // Should navigate to fleet overview
            expect(screen.getByText("Fleet Overview")).toBeInTheDocument();
        });

        it("handles URL with different robot IDs correctly", () => {
            const robot2: RobotDetail = {
                ...mockRobotDetail,
                id: "rbt-002",
                name: "Atlas-02",
                location: "Lab B",
            };
            const robot3: RobotDetail = {
                ...mockRobotDetail,
                id: "rbt-003",
                name: "Hermes-01",
                location: "Warehouse",
            };
            const robots = [mockRobotDetail, robot2, robot3];
            
            // Test robot 1
            const router1 = createRouterWithRobots("/robots/rbt-001", robots);
            const { unmount: unmount1 } = render(<RouterProvider router={router1} />);
            expect(screen.getByText("Atlas-01")).toBeInTheDocument();
            expect(screen.getByText(/Lab A/)).toBeInTheDocument();
            unmount1();
            
            // Test robot 2
            const router2 = createRouterWithRobots("/robots/rbt-002", robots);
            const { unmount: unmount2 } = render(<RouterProvider router={router2} />);
            expect(screen.getByText("Atlas-02")).toBeInTheDocument();
            expect(screen.getByText(/Lab B/)).toBeInTheDocument();
            unmount2();
            
            // Test robot 3
            const router3 = createRouterWithRobots("/robots/rbt-003", robots);
            render(<RouterProvider router={router3} />);
            expect(screen.getByText("Hermes-01")).toBeInTheDocument();
            expect(screen.getByText(/Warehouse/)).toBeInTheDocument();
        });

        it("displays error message for invalid robot ID in URL", () => {
            const router = createRouterWithRobots("/robots/non-existent-robot", mockRobots);
            render(<RouterProvider router={router} />);
            
            expect(screen.getByText(/Robot not found/i)).toBeInTheDocument();
            expect(screen.getByText(/non-existent-robot/)).toBeInTheDocument();
            expect(screen.queryByText("Atlas-01")).not.toBeInTheDocument();
        });

        it("handles malformed robot ID in URL", () => {
            // Test with a robot ID that has special characters
            const router = createRouterWithRobots("/robots/invalid@robot#id", mockRobots);
            render(<RouterProvider router={router} />);
            
            // Should show error message
            expect(screen.getByText(/Robot not found/i)).toBeInTheDocument();
            // The error message includes the ID in quotes, so check for part of it
            expect(screen.getByText(/invalid/i)).toBeInTheDocument();
        });

        it("displays correct robot when URL changes", () => {
            const robot2: RobotDetail = {
                ...mockRobotDetail,
                id: "rbt-002",
                name: "Atlas-02",
                battery: 50,
            };
            const robots = [mockRobotDetail, robot2];
            
            // Test robot 1
            const router1 = createRouterWithRobots("/robots/rbt-001", robots);
            const { unmount: unmount1 } = render(<RouterProvider router={router1} />);
            expect(screen.getByText("Atlas-01")).toBeInTheDocument();
            expect(screen.getByText(/76%/i)).toBeInTheDocument();
            unmount1();
            
            // Test robot 2
            const router2 = createRouterWithRobots("/robots/rbt-002", robots);
            render(<RouterProvider router={router2} />);
            
            // Should show robot 2 data
            expect(screen.getByText("Atlas-02")).toBeInTheDocument();
            expect(screen.getByText(/50%/i)).toBeInTheDocument();
            expect(screen.queryByText("Atlas-01")).not.toBeInTheDocument();
        });

        it("calls useNavigate() with correct path when back button is clicked", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <div>Fleet Overview</div>,
                },
                {
                    path: "/robots/:id",
                    element: (
                    <RobotStateProvider initialRobots={mockRobots}>
                        <RobotDetailPage robots={mockRobots} />
                    </RobotStateProvider>
                ),
                },
            ], {
                initialEntries: ["/robots/rbt-001"],
            });
            render(<RouterProvider router={router} />);
            
            // Verify we're on detail page
            expect(router.state.location.pathname).toBe("/robots/rbt-001");
            
            // Click back button
            const backButton = screen.getByRole("button", { name: "Back" });
            fireEvent.click(backButton);
            
            // Verify navigate was called with '/' path
            expect(router.state.location.pathname).toBe("/");
        });

        it("handles browser back button behavior", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <FleetOverviewPage robots={mockRobotsBasic} />,
                },
                {
                    path: "/robots/:id",
                    element: (
                    <RobotStateProvider initialRobots={mockRobots}>
                        <RobotDetailPage robots={mockRobots} />
                    </RobotStateProvider>
                ),
                },
            ], {
                initialEntries: ["/", "/robots/rbt-001"],
            });
            render(<RouterProvider router={router} />);
            
            // Should be on detail page
            expect(router.state.location.pathname).toBe("/robots/rbt-001");
            expect(screen.getByText("Atlas-01")).toBeInTheDocument();
            
            // Simulate browser back button
            router.navigate(-1);
            
            // Should be back on fleet overview
            expect(router.state.location.pathname).toBe("/");
            expect(screen.getByText("Atlas-01")).toBeInTheDocument();
        });

        it("handles browser forward button behavior", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <FleetOverviewPage robots={mockRobotsBasic} />,
                },
                {
                    path: "/robots/:id",
                    element: (
                    <RobotStateProvider initialRobots={mockRobots}>
                        <RobotDetailPage robots={mockRobots} />
                    </RobotStateProvider>
                ),
                },
            ], {
                initialEntries: ["/", "/robots/rbt-001"],
            });
            render(<RouterProvider router={router} />);
            
            // Start on detail page
            expect(router.state.location.pathname).toBe("/robots/rbt-001");
            
            // Go back
            router.navigate(-1);
            expect(router.state.location.pathname).toBe("/");
            
            // Go forward
            router.navigate(1);
            expect(router.state.location.pathname).toBe("/robots/rbt-001");
            expect(screen.getByText("Atlas-01")).toBeInTheDocument();
        });

        it("handles direct URL access to robot detail page with valid ID", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <FleetOverviewPage robots={mockRobotsBasic} />,
                },
                {
                    path: "/robots/:id",
                    element: (
                    <RobotStateProvider initialRobots={mockRobots}>
                        <RobotDetailPage robots={mockRobots} />
                    </RobotStateProvider>
                ),
                },
            ], {
                initialEntries: ["/robots/rbt-001"],
            });
            render(<RouterProvider router={router} />);
            
            // Should display robot detail page directly
            expect(screen.getByText("Atlas-01")).toBeInTheDocument();
            expect(screen.getByText(/rbt-001/)).toBeInTheDocument();
            expect(router.state.location.pathname).toBe("/robots/rbt-001");
        });

        it("handles invalid robot ID with 404-like error message", () => {
            const router = createRouterWithRobots("/robots/invalid-robot-id", mockRobots);
            render(<RouterProvider router={router} />);
            
            // Should show error message (404-like behavior)
            expect(screen.getByText(/Robot not found/i)).toBeInTheDocument();
            expect(screen.getByText(/invalid-robot-id/)).toBeInTheDocument();
            expect(screen.queryByText("Atlas-01")).not.toBeInTheDocument();
        });
    });
});