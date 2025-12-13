import React from "react";
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    LinearProgress,
    Box,
} from "@mui/material";
import type { Robot } from "../types/robot";

interface FleetOverviewPageProps {
    robots: Robot[];
    onRobotSelected: (robotId: string) => void;
}

const getStatusChipColor = (status: Robot["status"]) => {
    switch (status) {
        case "active":
            return "success";
        case "idle":
            return "info";
        case "charging":
            return "warning";
        case "error":
            return "error";
        default:
            return "default";
    }
};

export const FleetOverviewPage: React.FC<FleetOverviewPageProps> = ({
    robots,
    onRobotSelected,
}) => {
    return (
        <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Fleet Overview</Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>Simulated Fleet of robots with status, battery and last heartbeat.</Typography>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Robot</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Battery</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Tether</TableCell>
                        <TableCell>Flight Area</TableCell>
                        <TableCell>Last Heartbeat</TableCell>
                        <TableCell>Current Task</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {robots.map((robot) => (
                        <TableRow
                            key={robot.id}
                            hover
                            sx={{ cursor: "pointer" }}
                            onClick={() => onRobotSelected(robot.id)}
                        >
                            <TableCell>{robot.name}</TableCell>
                            <TableCell>
                                <Chip
                                    size="small"
                                    label={robot.status.toUpperCase()}
                                    color={getStatusChipColor(robot.status) as any}
                                />
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 80 }}>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={robot.battery} 
                                        />
                                    </Box>
                                    <Typography variant="body2">
                                        {`${robot.battery.toFixed(0)}%`}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>{robot.location}</TableCell>
                            <TableCell>
                                {robot.tether.isTethered ? (
                                    <Box>
                                        <Typography variant="body2">
                                            {robot.tether.currentTetherExtension.toFixed(1)}m / {robot.tether.tetherLength}m
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Anchor: ({robot.tether.anchorPoint.x}, {robot.tether.anchorPoint.y}, {robot.tether.anchorPoint.z})
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Untethered</Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {robot.flightArea.minX} to {robot.flightArea.maxX} × {robot.flightArea.minY} to {robot.flightArea.maxY} × {robot.flightArea.minZ} to {robot.flightArea.maxZ}m
                                </Typography>
                            </TableCell>
                            <TableCell>{new Date(robot.lastHeartbeat).toLocaleTimeString()}</TableCell>
                            <TableCell>{robot.currentTask ?? "__"}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
};