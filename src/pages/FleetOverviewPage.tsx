import { useNavigate } from "react-router-dom";
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
    Tooltip,
    CircularProgress,
    Snackbar,
    Alert,
} from "@mui/material";
import type { Robot } from "../types/robot";
import { useTelemetry } from "../hooks/useTelemetry";

interface FleetOverviewPageProps {
    robots: Robot[];
    // Removed: onRobotSelected: (robotId: string) => void;
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

export const FleetOverviewPage = ({
    robots: robotsProp,
}: FleetOverviewPageProps) => {
    const navigate = useNavigate();

    // Use telemetry hook for fleet-wide real-time updates
    const {
        allRobots: telemetryMap,
        connected,
        connecting,
        error: telemetryError,
    } = useTelemetry({
        url: 'ws://localhost:8080',
        autoConnect: true,
        reconnect: true,
    });

    // Merge telemetry data with robot data (fallback to mock data if WebSocket unavailable)
    const robots = robotsProp.map(robot => {
        const telemetry = telemetryMap.get(robot.id);
        if (telemetry) {
            return {
                ...robot,
                battery: telemetry.battery,
                status: telemetry.status,
                lastHeartbeat: telemetry.lastHeartbeat,
            };
        }
        return robot;
    });

    // Count robots with live telemetry
    const liveRobotCount = Array.from(telemetryMap.keys()).length;

    return (
        <Box>
            {/* Simulator Status Banner */}
            {connected && (
                <Alert 
                    severity="success" 
                    icon={
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: 'success.main',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                '@keyframes pulse': {
                                    '0%, 100%': {
                                        opacity: 1,
                                    },
                                    '50%': {
                                        opacity: 0.5,
                                    },
                                },
                            }}
                        />
                    }
                    sx={{ 
                        mb: 2,
                        '& .MuiAlert-icon': {
                            alignItems: 'center',
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            <strong>Telemetry Simulator Running</strong> — Receiving live data from {liveRobotCount} robot{liveRobotCount !== 1 ? 's' : ''}
                        </Typography>
                        <Chip
                            size="small"
                            label="LIVE"
                            color="success"
                            sx={{ 
                                fontWeight: 'bold',
                                animation: connected ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                            }}
                        />
                    </Box>
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h5" gutterBottom>Fleet Overview</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Simulated Fleet of robots with status, battery and last heartbeat.</Typography>
                    </Box>
                    {/* Connection Status Indicator */}
                    <Tooltip title={
                        connecting ? 'Connecting to telemetry server...' :
                        connected ? 'Connected to real-time telemetry' :
                        telemetryError ? `Connection error: ${telemetryError.message}` :
                        'Using mock data (WebSocket unavailable)'
                    }>
                        <Chip
                            size="small"
                            label={connecting ? 'Connecting...' : connected ? 'Live' : 'Offline'}
                            color={
                                connecting ? 'default' :
                                connected ? 'success' :
                                telemetryError ? 'error' : 'warning'
                            }
                            icon={connecting ? <CircularProgress size={16} /> : undefined}
                        />
                    </Tooltip>
                </Box>

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
                            onClick={() => navigate(`/robots/${robot.id}`)}
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
                            <TableCell>
                                {new Date(robot.lastHeartbeat).toLocaleTimeString()}
                                {telemetryMap.has(robot.id) && (
                                    <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                                        ●
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>{robot.currentTask ?? "__"}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* WebSocket Error Feedback */}
            <Snackbar
                open={!!telemetryError && !connected && !connecting}
                autoHideDuration={8000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert 
                    severity="warning" 
                    sx={{ width: '100%' }}
                    action={
                        <Box>
                            <Typography variant="caption" sx={{ mr: 1 }}>
                                Using mock data
                            </Typography>
                        </Box>
                    }
                >
                    WebSocket unavailable: {telemetryError?.message || 'Connection failed'}
                </Alert>
            </Snackbar>
        </Paper>
        </Box>
    );
};