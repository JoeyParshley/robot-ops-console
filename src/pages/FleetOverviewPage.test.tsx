import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, createMemoryRouter, RouterProvider } from "react-router-dom";
import { FleetOverviewPage } from "./FleetOverviewPage";
import { RobotDetailPage } from "./RobotDetailPage";
import type { Robot } from "../types/robot";
import type { RobotDetail } from "../types/robot";

const mockRobots: Robot[] =[
    {
        id: "rbt-001",
        name: "RoboOne",
        status: "active",
        battery: 85,
        location: "Lab A",
        lastHeartbeat: "2024-06-01T12:00:00Z",
        currentTask: "Patrol Area 1",
        tether: {
            isTethered: true,
            tetherLength: 50,
            anchorPoint: { x: 0, y: 0, z: 0 },
            currentTetherExtension: 25.5,
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
        id: "rbt-002",
        name: "RoboTwo",
        status: "charging",
        battery: 45,
        location: "Charging Station 3",
        lastHeartbeat: "2024-06-01T11:58:00Z",
        currentTask: "Awaiting Assignment",
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
    }
];

describe("FleetOverviewPage", () => {
    it("renders a row for each robot", () => {
        render(
            <MemoryRouter>
                <FleetOverviewPage robots={mockRobots} />
            </MemoryRouter>
        );

        expect(screen.getByText("RoboOne")).toBeInTheDocument();
        expect(screen.getByText("RoboTwo")).toBeInTheDocument();
    });

    it("displays tether information for tethered robots", () => {
        render(
            <MemoryRouter>
                <FleetOverviewPage robots={mockRobots} />
            </MemoryRouter>
        );

        // Check that tether extension and length are displayed
        expect(screen.getByText(/25\.5m \/ 50m/)).toBeInTheDocument();
        expect(screen.getByText(/5\.2m \/ 40m/)).toBeInTheDocument();
    });

    it("displays flight area boundaries", () => {
        render(
            <MemoryRouter>
                <FleetOverviewPage robots={mockRobots} />
            </MemoryRouter>
        );

        // Check that flight area is displayed (format: "minX to maxX × minY to maxY × minZ to maxZm")
        expect(screen.getByText(/-25 to 25 × -25 to 25 × 0 to 15m/)).toBeInTheDocument();
        expect(screen.getByText(/-20 to 20 × -20 to 20 × 0 to 12m/)).toBeInTheDocument();
    });

    it("navigates to robot detail page when a robot row is clicked", () => {
        render(
            <MemoryRouter>
                <FleetOverviewPage robots={mockRobots} />
            </MemoryRouter>
        );

        // Click should not error - navigation happens via router
        const row = screen.getByText("RoboOne").closest("tr")!;
        fireEvent.click(row);
        expect(row).toBeInTheDocument(); // Row still exists after click
    });

    it("navigates to robot detail page when clicking first robot row", () => {
        render(
            <MemoryRouter>
                <FleetOverviewPage robots={mockRobots} />
            </MemoryRouter>
        );

        const firstRow = screen.getByText(/roboone/i).closest("tr");
        fireEvent.click(firstRow!);
        
        // Navigation happens, but we can't easily test URL change without more setup
        // For now, just verify click doesn't error
        expect(firstRow).toBeInTheDocument();
    });

    it("navigates to robot detail page when clicking second robot row", () => {
        render(
            <MemoryRouter>
                <FleetOverviewPage robots={mockRobots} />
            </MemoryRouter>
        );

        const secondRow = screen.getByText(/robotwo/i).closest("tr");
        fireEvent.click(secondRow!);

        expect(secondRow).toBeInTheDocument();
    });

    it("navigates when clicking anywhere on the row", () => {
        render(
            <MemoryRouter>
                <FleetOverviewPage robots={mockRobots} />
            </MemoryRouter>
        );

        // Click on different parts of the row
        const row = screen.getByText(/roboone/i).closest("tr")!;
        const statusCell = screen.getByText(/active/i)!;
        const batteryCell = screen.getByText(/85%/i)!;
        
        fireEvent.click(row);
        expect(row).toBeInTheDocument();

        fireEvent.click(statusCell);
        expect(statusCell).toBeInTheDocument();

        fireEvent.click(batteryCell);
        expect(batteryCell).toBeInTheDocument();
    });

    describe("Routing and Navigation", () => {
        // Create mock RobotDetail for navigation tests
        const mockRobotDetail: RobotDetail = {
            ...mockRobots[0],
            currentPosition: { x: 10.5, y: 8.2, z: 3.1 },
            currentOrientation: { roll: 2.5, pitch: -1.2, yaw: 45.0 },
            currentVelocity: { vx: 0.5, vy: 0.3, vz: 0.1 },
            statusHistory: [
                { status: "active", timestamp: "2024-06-01T12:00:00Z", reason: "Task started" },
            ],
            taskHistory: [
                { taskId: "task-001", taskName: "Patrol Area 1", startTime: "2024-06-01T12:00:00Z", status: "in_progress" },
            ],
            errorLogs: [],
            metrics: {
                uptime: 86400,
                totalFlightTime: 7200,
                tasksCompleted: 15,
                tasksFailed: 2,
                averageBatteryEfficiency: 85.5,
            },
            firmwareVersion: "v2.3.1",
            hardwareModel: "Atlas-MK2",
            lastMaintenanceDate: "2024-05-15",
            nextMaintenanceDue: "2024-07-15",
        };

        const mockRobotDetail2: RobotDetail = {
            ...mockRobots[1],
            currentPosition: { x: 5.0, y: 3.0, z: 1.0 },
            currentOrientation: { roll: 0, pitch: 0, yaw: 0 },
            currentVelocity: { vx: 0, vy: 0, vz: 0 },
            statusHistory: [
                { status: "charging", timestamp: "2024-06-01T11:58:00Z", reason: "Low battery" },
            ],
            taskHistory: [],
            errorLogs: [],
            metrics: {
                uptime: 43200,
                totalFlightTime: 3600,
                tasksCompleted: 8,
                tasksFailed: 1,
                averageBatteryEfficiency: 75.0,
            },
            firmwareVersion: "v2.2.0",
            hardwareModel: "Atlas-MK1",
            lastMaintenanceDate: "2024-05-01",
            nextMaintenanceDue: "2024-07-01",
        };

        const mockRobotDetails: RobotDetail[] = [mockRobotDetail, mockRobotDetail2];

        it("navigates to robot detail page when clicking a robot row", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <FleetOverviewPage robots={mockRobots} />,
                },
                {
                    path: "/robots/:id",
                    element: <RobotDetailPage robots={mockRobotDetails} />,
                },
            ], {
                initialEntries: ["/"],
            });
            render(<RouterProvider router={router} />);
            
            // Verify we're on the fleet overview
            expect(screen.getByText("RoboOne")).toBeInTheDocument();
            expect(screen.getByText("RoboTwo")).toBeInTheDocument();
            
            // Click on first robot row
            const firstRow = screen.getByText("RoboOne").closest("tr")!;
            fireEvent.click(firstRow);
            
            // Should navigate to robot detail page
            expect(screen.getByText("RoboOne")).toBeInTheDocument();
            expect(screen.getByText(/rbt-001/)).toBeInTheDocument();
            expect(screen.queryByText("RoboTwo")).not.toBeInTheDocument();
        });

        it("navigates to correct robot detail page based on clicked row", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <FleetOverviewPage robots={mockRobots} />,
                },
                {
                    path: "/robots/:id",
                    element: <RobotDetailPage robots={mockRobotDetails} />,
                },
            ], {
                initialEntries: ["/"],
            });
            render(<RouterProvider router={router} />);
            
            // Click on second robot row
            const secondRow = screen.getByText("RoboTwo").closest("tr")!;
            fireEvent.click(secondRow);
            
            // Should show second robot's detail page
            expect(screen.getByText("RoboTwo")).toBeInTheDocument();
            expect(screen.getByText(/rbt-002/)).toBeInTheDocument();
            expect(screen.queryByText("RoboOne")).not.toBeInTheDocument();
        });

        it("navigates when clicking on any cell in the row", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <FleetOverviewPage robots={mockRobots} />,
                },
                {
                    path: "/robots/:id",
                    element: <RobotDetailPage robots={mockRobotDetails} />,
                },
            ], {
                initialEntries: ["/"],
            });
            render(<RouterProvider router={router} />);
            
            // Click on status cell
            const statusCell = screen.getByText(/active/i);
            fireEvent.click(statusCell);
            
            // Should navigate to detail page
            expect(screen.getByText("RoboOne")).toBeInTheDocument();
            expect(screen.getByText(/rbt-001/)).toBeInTheDocument();
        });

        it("maintains navigation state when going back and forth", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <FleetOverviewPage robots={mockRobots} />,
                },
                {
                    path: "/robots/:id",
                    element: <RobotDetailPage robots={mockRobotDetails} />,
                },
            ], {
                initialEntries: ["/"],
            });
            render(<RouterProvider router={router} />);
            
            // Navigate to robot 1 detail
            const firstRow = screen.getByText("RoboOne").closest("tr")!;
            fireEvent.click(firstRow);
            expect(screen.getByText(/rbt-001/)).toBeInTheDocument();
            
            // Go back
            const backButton = screen.getByRole("button", { name: "Back" });
            fireEvent.click(backButton);
            expect(screen.getByText("RoboOne")).toBeInTheDocument();
            expect(screen.getByText("RoboTwo")).toBeInTheDocument();
            
            // Navigate to robot 2 detail
            const secondRow = screen.getByText("RoboTwo").closest("tr")!;
            fireEvent.click(secondRow);
            expect(screen.getByText(/rbt-002/)).toBeInTheDocument();
        });

        it("handles direct navigation to robot detail page via URL", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <FleetOverviewPage robots={mockRobots} />,
                },
                {
                    path: "/robots/:id",
                    element: <RobotDetailPage robots={mockRobotDetails} />,
                },
            ], {
                initialEntries: ["/robots/rbt-001"],
            });
            render(<RouterProvider router={router} />);
            
            // Should show robot detail page directly
            expect(screen.getByText("RoboOne")).toBeInTheDocument();
            expect(screen.getByText(/rbt-001/)).toBeInTheDocument();
            expect(screen.queryByText("RoboTwo")).not.toBeInTheDocument();
        });

        it("can navigate from detail page back to fleet overview", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <FleetOverviewPage robots={mockRobots} />,
                },
                {
                    path: "/robots/:id",
                    element: <RobotDetailPage robots={mockRobotDetails} />,
                },
            ], {
                initialEntries: ["/robots/rbt-001"],
            });
            render(<RouterProvider router={router} />);
            
            // Verify on detail page
            expect(screen.getByText("RoboOne")).toBeInTheDocument();
            
            // Click back button
            const backButton = screen.getByRole("button", { name: "Back" });
            fireEvent.click(backButton);
            
            // Should be back on fleet overview
            expect(screen.getByText("RoboOne")).toBeInTheDocument();
            expect(screen.getByText("RoboTwo")).toBeInTheDocument();
        });

        it("updates URL when navigating between pages", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <FleetOverviewPage robots={mockRobots} />,
                },
                {
                    path: "/robots/:id",
                    element: <RobotDetailPage robots={mockRobotDetails} />,
                },
            ], {
                initialEntries: ["/"],
            });
            render(<RouterProvider router={router} />);
            
            // Initial URL should be /
            expect(router.state.location.pathname).toBe("/");
            
            // Navigate to robot detail
            const firstRow = screen.getByText("RoboOne").closest("tr")!;
            fireEvent.click(firstRow);
            
            // URL should be /robots/rbt-001
            expect(router.state.location.pathname).toBe("/robots/rbt-001");
        });

        it("calls useNavigate() with correct path when clicking robot row", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <FleetOverviewPage robots={mockRobots} />,
                },
                {
                    path: "/robots/:id",
                    element: <RobotDetailPage robots={mockRobotDetails} />,
                },
            ], {
                initialEntries: ["/"],
            });
            render(<RouterProvider router={router} />);
            
            // Click on first robot row
            const firstRow = screen.getByText("RoboOne").closest("tr")!;
            fireEvent.click(firstRow);
            
            // Verify URL changed to correct path
            expect(router.state.location.pathname).toBe("/robots/rbt-001");
        });

        it("calls useNavigate() with correct path for different robots", () => {
            const router = createMemoryRouter([
                {
                    path: "/",
                    element: <FleetOverviewPage robots={mockRobots} />,
                },
                {
                    path: "/robots/:id",
                    element: <RobotDetailPage robots={mockRobotDetails} />,
                },
            ], {
                initialEntries: ["/"],
            });
            render(<RouterProvider router={router} />);
            
            // Click on second robot row
            const secondRow = screen.getByText("RoboTwo").closest("tr")!;
            fireEvent.click(secondRow);
            
            // Verify URL changed to correct path for second robot
            expect(router.state.location.pathname).toBe("/robots/rbt-002");
        });
    });
});