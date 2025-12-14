import { memo } from 'react';
import {
    TableRow,
    TableCell,
    Chip,
    LinearProgress,
    Box,
    Typography,
} from '@mui/material';
import type { Robot } from '../types/robot';

interface RobotTableRowProps {
    robot: Robot;
    isLive: boolean; // Whether robot has live telemetry
    onSelect: (robotId: string) => void;
}

const getStatusChipColor = (status: Robot['status']) => {
    switch (status) {
        case 'active':
            return 'success';
        case 'idle':
            return 'info';
        case 'charging':
            return 'warning';
        case 'error':
            return 'error';
        default:
            return 'default';
    }
};

export const RobotTableRow = memo(({ robot, isLive, onSelect }: RobotTableRowProps) => {
    const handleClick = () => {
        onSelect(robot.id);
    };

    return (
        <TableRow
            hover
            sx={{ cursor: 'pointer' }}
            onClick={handleClick}
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
                    <Typography variant="body2" color="text.secondary">
                        Untethered
                    </Typography>
                )}
            </TableCell>
            <TableCell>
                <Typography variant="body2">
                    {robot.flightArea.minX} to {robot.flightArea.maxX} × {robot.flightArea.minY} to {robot.flightArea.maxY} × {robot.flightArea.minZ} to {robot.flightArea.maxZ}m
                </Typography>
            </TableCell>
            <TableCell>
                {new Date(robot.lastHeartbeat).toLocaleTimeString()}
                {isLive && (
                    <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                        ●
                    </Typography>
                )}
            </TableCell>
            <TableCell>{robot.currentTask ?? '__'}</TableCell>
        </TableRow>
    );
});

RobotTableRow.displayName = 'RobotTableRow';
