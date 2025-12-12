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
    },
    {
        id: "rbt-002",
        name: "RoboTwo",
        status: "charging",
        battery: 45,
        location: "Charging Station 3",
        lastHeartbeat: "2024-06-01T11:58:00Z",
        currentTask: "Awaiting Assignment",
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
});