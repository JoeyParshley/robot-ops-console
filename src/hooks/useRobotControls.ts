import { useState, useCallback } from 'react';
import type { RobotStatus } from '../types/robot';

interface UseRobotControlsOptions {
    robotId: string;
    initialStatus: RobotStatus;
    onStatusChange?: (newStatus: RobotStatus) => void;
}

interface ControlState {
    loading: string | null;
    snackbar: {
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    };
    confirmDialog: {
        open: boolean;
        title: string;
        message: string;
        action: () => void;
    };
}

export const useRobotControls = ({ robotId, initialStatus, onStatusChange }: UseRobotControlsOptions) => {
    const [robotStatus, setRobotStatus] = useState<RobotStatus>(initialStatus);
    const [controlState, setControlState] = useState<ControlState>({
        loading: null,
        snackbar: {
            open: false,
            message: '',
            severity: 'success',
        },
        confirmDialog: {
            open: false,
            title: '',
            message: '',
            action: () => {},
        },
    });

    // Simulate API call delay
    const simulateAction = useCallback(async (
        actionName: string,
        actionFn: () => Promise<void> | void
    ) => {
        setControlState(prev => ({ ...prev, loading: actionName }));
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            await actionFn();
            setControlState(prev => ({
                ...prev,
                loading: null,
                snackbar: {
                    open: true,
                    message: `${actionName} command sent successfully`,
                    severity: 'success',
                },
            }));
        } catch (error) {
            setControlState(prev => ({
                ...prev,
                loading: null,
                snackbar: {
                    open: true,
                    message: `Failed to ${actionName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    severity: 'error',
                },
            }));
        }
    }, []);

    const updateStatus = useCallback((newStatus: RobotStatus) => {
        setRobotStatus(newStatus);
        onStatusChange?.(newStatus);
    }, [onStatusChange]);

    const handleStart = useCallback(async () => {
        await simulateAction('Start', async () => {
            console.log(`[API] Starting robot ${robotId}`);
            // TODO: Replace with actual API call
            // await api.startRobot(robotId);
            updateStatus('active');
        });
    }, [robotId, simulateAction, updateStatus]);

    const handlePause = useCallback(async () => {
        await simulateAction('Pause', async () => {
            console.log(`[API] Pausing robot ${robotId}`);
            // TODO: Replace with actual API call
            // await api.pauseRobot(robotId);
            updateStatus('idle');
        });
    }, [robotId, simulateAction, updateStatus]);

    const handleResume = useCallback(async () => {
        await simulateAction('Resume', async () => {
            console.log(`[API] Resuming robot ${robotId}`);
            // TODO: Replace with actual API call
            // await api.resumeRobot(robotId);
            updateStatus('active');
        });
    }, [robotId, simulateAction, updateStatus]);

    const handleReturnToDock = useCallback(() => {
        setControlState(prev => ({
            ...prev,
            confirmDialog: {
                open: true,
                title: 'Return to Dock',
                message: `Are you sure you want to return this robot to the dock? The robot will navigate to the nearest charging station.`,
                action: async () => {
                    setControlState(prev => ({ ...prev, confirmDialog: { ...prev.confirmDialog, open: false } }));
                    await simulateAction('Return to Dock', async () => {
                        console.log(`[API] Returning robot ${robotId} to dock`);
                        // TODO: Replace with actual API call
                        // await api.returnToDock(robotId);
                        updateStatus('charging');
                    });
                },
            },
        }));
    }, [robotId, simulateAction, updateStatus]);

    const handleEmergencyStop = useCallback(() => {
        setControlState(prev => ({
            ...prev,
            confirmDialog: {
                open: true,
                title: 'Emergency Stop',
                message: `WARNING: This will immediately stop the robot and may cause damage. Are you absolutely sure you want to execute an emergency stop?`,
                action: async () => {
                    setControlState(prev => ({ ...prev, confirmDialog: { ...prev.confirmDialog, open: false } }));
                    await simulateAction('Emergency Stop', async () => {
                        console.log(`[API] EMERGENCY STOP for robot ${robotId}`);
                        // TODO: Replace with actual API call
                        // await api.emergencyStop(robotId);
                        updateStatus('error');
                    });
                },
            },
        }));
    }, [robotId, simulateAction, updateStatus]);

    const closeSnackbar = useCallback(() => {
        setControlState(prev => ({
            ...prev,
            snackbar: { ...prev.snackbar, open: false },
        }));
    }, []);

    const closeConfirmDialog = useCallback(() => {
        setControlState(prev => ({
            ...prev,
            confirmDialog: { ...prev.confirmDialog, open: false },
        }));
    }, []);

    return {
        robotStatus,
        loading: controlState.loading,
        snackbar: controlState.snackbar,
        confirmDialog: controlState.confirmDialog,
        handlers: {
            handleStart,
            handlePause,
            handleResume,
            handleReturnToDock,
            handleEmergencyStop,
        },
        closeSnackbar,
        closeConfirmDialog,
    };
};

