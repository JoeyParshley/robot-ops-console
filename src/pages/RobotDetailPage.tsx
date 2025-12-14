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
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar,
    Alert,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import type { RobotDetail } from '../types/robot';
import { useRobotControls } from '../hooks/useRobotControls';
import { useRobotState } from '../context/RobotStateContext';
import { useTelemetry, type TelemetryUpdate } from '../hooks/useTelemetry';

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
    robots: robotsProp,
}: RobotDetailPageProps) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Try to use context, fallback to props
    let robots: RobotDetail[];
    let updateRobotStatus: ((robotId: string, newStatus: any) => void) | undefined;
    
    try {
        const context = useRobotState();
        robots = context.robots;
        updateRobotStatus = context.updateRobotStatus;
    } catch {
        // Context not available, use props
        robots = robotsProp;
    }

        // Find robot by ID
        const foundRobot = robots.find(r => r.id === id);

        // Use telemetry hook for real-time data
        const {
            telemetry: robotTelemetry,
            connected,
            connecting,
            error: telemetryError,
            sendCommand: sendTelemetryCommand,
        } = useTelemetry({
            robotId: id,
            url: 'ws://localhost:8080',
            autoConnect: true,
            reconnect: true,
        });
    
        // Use custom hook for robot controls
        const {
            robotStatus,
            loading,
            snackbar,
            confirmDialog,
            handlers,
            closeSnackbar,
            closeConfirmDialog,
        } = useRobotControls({
            robotId: id || '',
            initialStatus: foundRobot?.status || 'idle',
            onStatusChange: (newStatus) => {
                if (updateRobotStatus && id) {
                    updateRobotStatus(id, newStatus);
                }
            },
        });
    
        // Merge telemetry data with robot data (fallback to mock data if WebSocket unavailable)
        const telemetry = robotTelemetry && typeof robotTelemetry === 'object' && 'robotId' in robotTelemetry
            ? robotTelemetry as TelemetryUpdate
            : null;
        
        const robot = foundRobot ? {
            ...foundRobot,
            // Use real-time telemetry if available, otherwise use mock data
            currentPosition: telemetry?.position ?? foundRobot.currentPosition,
            currentOrientation: telemetry?.orientation ?? foundRobot.currentOrientation,
            currentVelocity: telemetry?.velocity ?? foundRobot.currentVelocity,
            battery: telemetry?.battery ?? foundRobot.battery,
            status: telemetry?.status ?? (robotStatus || foundRobot.status),
            lastHeartbeat: telemetry?.lastHeartbeat ?? foundRobot.lastHeartbeat,
        } as RobotDetail : null;

    // Handle invalid robot ID
    if (!robot) {
        return (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <Button variant="outlined" color="primary" onClick={() => navigate('/')}>
                    Back
                </Button>
                <Typography variant="h4">Unknown Robot</Typography>
                <Chip 
                    label="NOT FOUND"
                    color="error"
                />
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
            </Paper>
        );
    }

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
                            <strong>Telemetry Simulator Running</strong> — Receiving live telemetry data for {robot.name}
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

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="outlined" color="primary" onClick={() => navigate('/')}>
                        Back
                    </Button>
                    <Typography variant="h4">{robot.name}</Typography>
                    <Chip 
                        label={robot.status.toUpperCase()} 
                        color={getStatusChipColor(robot.status) as any} 
                    />
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

                {/* Operator Controls */}
                <Box sx={{ mb: 3 }}>
                    <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Operator Controls</Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 2, 
                                mt: 2,
                                flexDirection: { xs: 'column', sm: 'row' }
                            }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={robot.status !== 'idle' || loading !== null || (!connected && !connecting)}
                                    onClick={() => {
                                        handlers.handleStart();
                                        if (connected && id) {
                                            sendTelemetryCommand(id, 'start');
                                        }
                                    }}
                                    startIcon={loading === 'Start' ? <CircularProgress size={16} color="inherit" /> : null}
                                    sx={{ flex: { xs: 1, sm: '0 1 auto' } }}
                                >
                                    {loading === 'Start' ? 'Starting...' : 'Start'}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={robot.status !== 'active' || loading !== null || (!connected && !connecting)}
                                    onClick={() => {
                                        handlers.handlePause();
                                        if (connected && id) {
                                            sendTelemetryCommand(id, 'pause');
                                        }
                                    }}
                                    startIcon={loading === 'Pause' ? <CircularProgress size={16} color="inherit" /> : null}
                                    sx={{ flex: { xs: 1, sm: '0 1 auto' } }}
                                >
                                    {loading === 'Pause' ? 'Pausing...' : 'Pause'}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={robot.status !== 'idle' || loading !== null || (!connected && !connecting)}
                                    onClick={() => {
                                        handlers.handleResume();
                                        if (connected && id) {
                                            sendTelemetryCommand(id, 'resume');
                                        }
                                    }}
                                    startIcon={loading === 'Resume' ? <CircularProgress size={16} color="inherit" /> : null}
                                    sx={{ flex: { xs: 1, sm: '0 1 auto' } }}
                                >
                                    {loading === 'Resume' ? 'Resuming...' : 'Resume'}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="info"
                                    disabled={robot.status === 'charging' || robot.status === 'error' || loading !== null || (!connected && !connecting)}
                                    onClick={() => {
                                        handlers.handleReturnToDock();
                                        if (connected && id) {
                                            sendTelemetryCommand(id, 'returnToDock');
                                        }
                                    }}
                                    startIcon={loading === 'Return to Dock' ? <CircularProgress size={16} color="inherit" /> : null}
                                    sx={{ flex: { xs: 1, sm: '0 1 auto' } }}
                                >
                                    {loading === 'Return to Dock' ? 'Returning...' : 'Return to Dock'}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="large"
                                    disabled={robot.status === 'error' || loading !== null || (!connected && !connecting)}
                                    onClick={() => {
                                        handlers.handleEmergencyStop();
                                        if (connected && id) {
                                            sendTelemetryCommand(id, 'emergencyStop');
                                        }
                                    }}
                                    startIcon={loading === 'Emergency Stop' ? <CircularProgress size={16} color="inherit" /> : null}
                                    sx={{
                                        fontWeight: 'bold',
                                        minWidth: { xs: '100%', sm: 180 },
                                        fontSize: '1rem',
                                        py: 1.5,
                                        border: '2px solid',
                                        borderColor: 'error.dark',
                                        boxShadow: 4,
                                        '&:hover': {
                                            boxShadow: 6,
                                            borderColor: 'error.dark',
                                        },
                                        '&:disabled': {
                                            borderColor: 'transparent',
                                        },
                                        flex: { xs: 1, sm: '0 1 auto' }
                                    }}
                                >
                                    {loading === 'Emergency Stop' ? 'Stopping...' : 'Emergency Stop'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
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

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={closeConfirmDialog}
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
            >
                <DialogTitle id="confirm-dialog-title">
                    {confirmDialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-dialog-description">
                        {confirmDialog.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirmDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmDialog.action} 
                        color={confirmDialog.title === 'Emergency Stop' ? 'error' : 'primary'}
                        variant="contained"
                        autoFocus
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success/Error Feedback Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={closeSnackbar} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

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
                        <Button 
                            color="inherit" 
                            size="small" 
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    }
                >
                    Using mock data: {telemetryError?.message || 'WebSocket unavailable'}
                </Alert>
            </Snackbar>
        </Box>
    );
};
