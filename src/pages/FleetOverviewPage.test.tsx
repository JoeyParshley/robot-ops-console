import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FleetOverviewPage } from "./FleetOverviewPage";
import type { Robot } from "../types/robot";

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
            <FleetOverviewPage robots={mockRobots} onRobotSelected={vi.fn()} />
        );

        expect(screen.getByText("RoboOne")).toBeInTheDocument();
        expect(screen.getByText("RoboTwo")).toBeInTheDocument();
    });

    it("displays tether information for tethered robots", () => {
        render(
            <FleetOverviewPage robots={mockRobots} onRobotSelected={vi.fn()} />
        );

        // Check that tether extension and length are displayed
        expect(screen.getByText(/25\.5m \/ 50m/)).toBeInTheDocument();
        expect(screen.getByText(/5\.2m \/ 40m/)).toBeInTheDocument();
    });

    it("displays flight area boundaries", () => {
        render(
            <FleetOverviewPage robots={mockRobots} onRobotSelected={vi.fn()} />
        );

        // Check that flight area is displayed (format: "minX to maxX × minY to maxY × minZ to maxZm")
        expect(screen.getByText(/-25 to 25 × -25 to 25 × 0 to 15m/)).toBeInTheDocument();
        expect(screen.getByText(/-20 to 20 × -20 to 20 × 0 to 12m/)).toBeInTheDocument();
    });

    it("calls onRobotSelected when a robot row is clicked", () => {
        const handleRobotSelected = vi.fn();
        render(
            <FleetOverviewPage robots={mockRobots} onRobotSelected={handleRobotSelected} />
        );

        fireEvent.click(screen.getByText("RoboOne").closest("tr")!);
        expect(handleRobotSelected).toHaveBeenCalledWith("rbt-001");
    });

    // it calls onRobotSelected with correct robot ID when clicking first robot row
    it("calls onRobotSelected with correct robot ID when clicking first robot row", () => {
        const handleRobotSelected = vi.fn();
        render(
            <FleetOverviewPage robots={mockRobots} onRobotSelected={handleRobotSelected} />
        );

        const firstRow = screen.getByText(/roboone/i).closest("tr");
        fireEvent.click(firstRow!);
        
        expect(handleRobotSelected).toHaveBeenCalledTimes(1);
        expect(handleRobotSelected).toHaveBeenCalledWith("rbt-001");
    });

    it("calls onRobotSelected with correct robot ID when clicking second robot row", () => {
        const handleRobotSelected = vi.fn();
        render(
            <FleetOverviewPage robots={mockRobots} onRobotSelected={handleRobotSelected} />
        );

        const secondRow = screen.getByText(/robotwo/i).closest("tr");
        fireEvent.click(secondRow!);

        expect(handleRobotSelected).toHaveBeenCalledTimes(1);
        expect(handleRobotSelected).toHaveBeenCalledWith("rbt-002");
    });

    // it call onRobotSelected when clicking anywhere on the row
    it("calls onRobotSelected when clicking anywhere on the row", () => {
        const handleRobotSelected = vi.fn();
        render(
            <FleetOverviewPage robots={mockRobots} onRobotSelected={handleRobotSelected} />
        );

        // Click on different parts of the row
        const row = screen.getByText(/roboone/i).closest("tr")!;
        const statusCell = screen.getByText(/active/i)!;
        const batteryCell = screen.getByText(/85%/i)!;
        
        fireEvent.click(row);
        expect(handleRobotSelected).toHaveBeenCalledWith("rbt-001");
        handleRobotSelected.mockClear();

        fireEvent.click(statusCell);
        expect(handleRobotSelected).toHaveBeenCalledWith("rbt-001");
        handleRobotSelected.mockClear();

        fireEvent.click(batteryCell);
        expect(handleRobotSelected).toHaveBeenCalledWith("rbt-001");
    });
});