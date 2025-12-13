import React from 'react';
import { Button, Box, Paper, Typography, Chip, LinearProgress } from '@mui/material';
import type { RobotDetail } from '../types/robot';

interface RobotDetailPageProps {
    robot: RobotDetail;
    onBack: () => void;
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

export const RobotDetailPage = ({
    robot,
    onBack
}: RobotDetailPageProps) => {
    return (
        <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Button variant="outlined" color="primary" onClick={onBack}>
                    Back
                </Button>
                <Typography variant="h5">{robot.name}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color='text.secondary'>
                    ID: {robot.id}
                </Typography>
                <Typography variant="body2" color='text.secondary'>
                    Location: {robot.location}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
                <Chip 
                    label={robot.status.toUpperCase()} 
                    color={getStatusChipColor(robot.status) as any} 
                />
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                        variant="determinate" 
                        value={robot.battery} 
                    />
                    <Typography variant="body2">
                        {robot.battery.toFixed(0)}%
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};