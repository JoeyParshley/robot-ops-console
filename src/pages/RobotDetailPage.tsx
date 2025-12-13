import { useParams, useNavigate } from 'react-router-dom';
import { 
    Button, 
    Box, 
    Paper, 
    Typography, 
    Chip, 
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent
} from '@mui/material';
import type { RobotDetail } from '../types/robot';

interface RobotDetailPageProps {
    robots: RobotDetail[];
}

const getStatusChipColor = (status: RobotDetail["status"]) => {
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

const getSeverityColor = (severity: "warning" | "error" | "critical") => {
    switch (severity) {
        case "warning":
            return "warning";
        case "error":
            return "error";
        case "critical":
            return "error";
        default:
            return "default";
    }
};

const formatDuration = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
};

const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
};

export const RobotDetailPage = ({
    robots,
}: RobotDetailPageProps) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Find robot by ID
    const robot = robots.find(r => r.id === id);

    // Handle invalid robot ID
    if (!robot) {
        return (
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h5" color="error">
                    Robot not found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Robot ID "{id}" does not exist in the fleet.
                </Typography>
                <Button 
                    variant="outlined" 
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Back to Fleet Overview
                </Button>
            </Paper>
        );
    }

    return (
        <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <Button variant="outlined" color="primary" onClick={() => navigate('/')}>
                        Back
                    </Button>
                    <Typography variant="h4">{robot.name}</Typography>
                    <Chip 
                        label={robot.status.toUpperCase()} 
                        color={getStatusChipColor(robot.status) as any} 
                    />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Basic Information */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                        <Box sx={{ flex: 1 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>ID:</strong> {robot.id}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Location:</strong> {robot.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Hardware Model:</strong> {robot.hardwareModel}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Firmware Version:</strong> {robot.firmwareVersion}
                                </Typography>
                                {robot.currentTask && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        <strong>Current Task:</strong> {robot.currentTask}
                                    </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Last Heartbeat:</strong> {formatDateTime(robot.lastHeartbeat)}
                                </Typography>
                            </CardContent>
                        </Card>
                        </Box>

                        {/* Battery & Performance */}
                        <Box sx={{ flex: 1 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Battery & Performance</Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={robot.battery}
                                            sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                                        />
                                        <Typography variant="body2" sx={{ minWidth: 50 }}>
                                            {robot.battery.toFixed(0)}%
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Uptime:</strong> {formatDuration(robot.metrics.uptime)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Total Flight Time:</strong> {formatDuration(robot.metrics.totalFlightTime)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Tasks Completed:</strong> {robot.metrics.tasksCompleted}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Tasks Failed:</strong> {robot.metrics.tasksFailed}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Battery Efficiency:</strong> {robot.metrics.averageBatteryEfficiency.toFixed(1)}%
                                </Typography>
                            </CardContent>
                        </Card>
                        </Box>
                    </Box>

                    {/* Real-time Telemetry */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                        <Box sx={{ flex: 1 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Position</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>X:</strong> {robot.currentPosition.x.toFixed(2)} m
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Y:</strong> {robot.currentPosition.y.toFixed(2)} m
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Z:</strong> {robot.currentPosition.z.toFixed(2)} m
                                </Typography>
                            </CardContent>
                        </Card>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Orientation</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Roll:</strong> {robot.currentOrientation.roll.toFixed(1)}°
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Pitch:</strong> {robot.currentOrientation.pitch.toFixed(1)}°
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Yaw:</strong> {robot.currentOrientation.yaw.toFixed(1)}°
                                </Typography>
                            </CardContent>
                        </Card>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Velocity</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Vx:</strong> {robot.currentVelocity.vx.toFixed(2)} m/s
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Vy:</strong> {robot.currentVelocity.vy.toFixed(2)} m/s
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Vz:</strong> {robot.currentVelocity.vz.toFixed(2)} m/s
                                </Typography>
                            </CardContent>
                        </Card>
                        </Box>
                    </Box>

                    {/* Tether Information */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                        <Box sx={{ flex: 1 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Tether Information</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Status:</strong> {robot.tether.isTethered ? 'Tethered' : 'Untethered'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Max Length:</strong> {robot.tether.tetherLength} m
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Current Extension:</strong> {robot.tether.currentTetherExtension.toFixed(1)} m
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Anchor Point:</strong> ({robot.tether.anchorPoint.x}, {robot.tether.anchorPoint.y}, {robot.tether.anchorPoint.z})
                                </Typography>
                            </CardContent>
                        </Card>
                        </Box>

                        {/* Maintenance */}
                        <Box sx={{ flex: 1 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Maintenance</Typography>
                                {robot.lastMaintenanceDate && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Last Maintenance:</strong> {robot.lastMaintenanceDate}
                                    </Typography>
                                )}
                                {robot.nextMaintenanceDue && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Next Maintenance Due:</strong> {robot.nextMaintenanceDue}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                        </Box>
                    </Box>

                    {/* Status History */}
                    <Box>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Status History</Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Timestamp</TableCell>
                                                <TableCell>Reason</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {robot.statusHistory.slice(0, 10).map((entry, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Chip 
                                                            label={entry.status.toUpperCase()} 
                                                            size="small"
                                                            color={getStatusChipColor(entry.status) as any}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{formatDateTime(entry.timestamp)}</TableCell>
                                                    <TableCell>{entry.reason || 'N/A'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Task History */}
                    <Box>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Task History</Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Task ID</TableCell>
                                                <TableCell>Task Name</TableCell>
                                                <TableCell>Start Time</TableCell>
                                                <TableCell>End Time</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {robot.taskHistory.slice(0, 10).map((task) => (
                                                <TableRow key={task.taskId}>
                                                    <TableCell>{task.taskId}</TableCell>
                                                    <TableCell>{task.taskName}</TableCell>
                                                    <TableCell>{formatDateTime(task.startTime)}</TableCell>
                                                    <TableCell>{task.endTime ? formatDateTime(task.endTime) : 'In Progress'}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={task.status.toUpperCase()} 
                                                            size="small"
                                                            color={
                                                                task.status === 'completed' ? 'success' :
                                                                task.status === 'failed' ? 'error' :
                                                                task.status === 'in_progress' ? 'info' : 'default'
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Error Logs */}
                    {robot.errorLogs.length > 0 && (
                        <Box>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Error Logs</Typography>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Error Code</TableCell>
                                                    <TableCell>Message</TableCell>
                                                    <TableCell>Timestamp</TableCell>
                                                    <TableCell>Severity</TableCell>
                                                    <TableCell>Resolved</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {robot.errorLogs.map((error, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{error.errorCode}</TableCell>
                                                        <TableCell>{error.message}</TableCell>
                                                        <TableCell>{formatDateTime(error.timestamp)}</TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={error.severity.toUpperCase()} 
                                                                size="small"
                                                                color={getSeverityColor(error.severity) as any}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={error.resolved ? 'Yes' : 'No'} 
                                                                size="small"
                                                                color={error.resolved ? 'success' : 'error'}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};
