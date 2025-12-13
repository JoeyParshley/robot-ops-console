import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Box, Paper, Typography, Chip, LinearProgress } from '@mui/material';
import type { Robot } from '../types/robot';

interface RobotDetailPageProps {
    robots: Robot[];
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
        <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Button variant="outlined" color="primary" onClick={() => navigate('/')}>
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