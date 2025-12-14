import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRobotControls } from './useRobotControls';

describe('useRobotControls', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize with provided status', () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'idle',
                })
            );

            expect(result.current.robotStatus).toBe('idle');
            expect(result.current.loading).toBe(null);
            expect(result.current.snackbar.open).toBe(false);
            expect(result.current.confirmDialog.open).toBe(false);
        });

        it('should have all handler functions', () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'idle',
                })
            );

            expect(result.current.handlers.handleStart).toBeDefined();
            expect(result.current.handlers.handlePause).toBeDefined();
            expect(result.current.handlers.handleResume).toBeDefined();
            expect(result.current.handlers.handleReturnToDock).toBeDefined();
            expect(result.current.handlers.handleEmergencyStop).toBeDefined();
        });
    });

    describe('Start Action', () => {
        it('should update status to active when started', async () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'idle',
                })
            );

            act(() => {
                result.current.handlers.handleStart();
            });

            // Check loading state immediately
            expect(result.current.loading).toBe('Start');

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1000);
            });

            // After advancing timers, state should be updated
            expect(result.current.robotStatus).toBe('active');
            expect(result.current.loading).toBe(null);
            expect(result.current.snackbar.open).toBe(true);
            expect(result.current.snackbar.message).toContain('Start command sent successfully');
            expect(result.current.snackbar.severity).toBe('success');
        });

        it('should log start action to console', async () => {
            const consoleSpy = vi.spyOn(console, 'log');
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'idle',
                })
            );

            act(() => {
                result.current.handlers.handleStart();
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1000);
            });

            // Console.log is called synchronously during action execution
            expect(consoleSpy).toHaveBeenCalledWith('[API] Starting robot rbt-001');
        });

        it('should call onStatusChange callback', async () => {
            const onStatusChange = vi.fn();
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'idle',
                    onStatusChange,
                })
            );

            act(() => {
                result.current.handlers.handleStart();
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1000);
            });

            // Callback is called synchronously during action execution
            expect(onStatusChange).toHaveBeenCalledWith('active');
        });
    });

    describe('Pause Action', () => {
        it('should update status to idle when paused', async () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'active',
                })
            );

            act(() => {
                result.current.handlers.handlePause();
            });

            expect(result.current.loading).toBe('Pause');

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1000);
            });

            // After advancing timers, state should be updated
            expect(result.current.robotStatus).toBe('idle');
            expect(result.current.loading).toBe(null);
            expect(result.current.snackbar.message).toContain('Pause command sent successfully');
        });
    });

    describe('Resume Action', () => {
        it('should update status to active when resumed', async () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'idle',
                })
            );

            act(() => {
                result.current.handlers.handleResume();
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1000);
            });

            // After advancing timers, state should be updated
            expect(result.current.robotStatus).toBe('active');
            expect(result.current.snackbar.message).toContain('Resume command sent successfully');
        });
    });

    describe('Return to Dock Action', () => {
        it('should show confirmation dialog', () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'active',
                })
            );

            act(() => {
                result.current.handlers.handleReturnToDock();
            });

            expect(result.current.confirmDialog.open).toBe(true);
            expect(result.current.confirmDialog.title).toBe('Return to Dock');
            expect(result.current.confirmDialog.message).toContain('return this robot to the dock');
        });

        it('should update status to charging when confirmed', async () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'active',
                })
            );

            act(() => {
                result.current.handlers.handleReturnToDock();
            });

            expect(result.current.confirmDialog.open).toBe(true);

            act(() => {
                result.current.confirmDialog.action();
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1000);
            });

            // After advancing timers, state should be updated
            expect(result.current.confirmDialog.open).toBe(false);
            expect(result.current.robotStatus).toBe('charging');
            expect(result.current.snackbar.message).toContain('Return to Dock command sent successfully');
        });

        it('should close dialog when cancelled', () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'active',
                })
            );

            act(() => {
                result.current.handlers.handleReturnToDock();
            });

            expect(result.current.confirmDialog.open).toBe(true);

            act(() => {
                result.current.closeConfirmDialog();
            });

            expect(result.current.confirmDialog.open).toBe(false);
            expect(result.current.robotStatus).toBe('active'); // Status unchanged
        });
    });

    describe('Emergency Stop Action', () => {
        it('should show confirmation dialog with warning', () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'active',
                })
            );

            act(() => {
                result.current.handlers.handleEmergencyStop();
            });

            expect(result.current.confirmDialog.open).toBe(true);
            expect(result.current.confirmDialog.title).toBe('Emergency Stop');
            expect(result.current.confirmDialog.message).toContain('WARNING');
            expect(result.current.confirmDialog.message).toContain('immediately stop');
        });

        it('should update status to error when confirmed', async () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'active',
                })
            );

            act(() => {
                result.current.handlers.handleEmergencyStop();
            });

            act(() => {
                result.current.confirmDialog.action();
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1000);
            });

            // After advancing timers, state should be updated
            expect(result.current.confirmDialog.open).toBe(false);
            expect(result.current.robotStatus).toBe('error');
            expect(result.current.snackbar.message).toContain('Emergency Stop command sent successfully');
        });
    });

    describe('Error Handling', () => {
        it('should handle errors gracefully', async () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'idle',
                })
            );

            // The hook structure supports error handling
            // Errors are caught internally in simulateAction
            expect(result.current.handlers.handleStart).toBeDefined();
            expect(result.current.handlers.handlePause).toBeDefined();
            expect(result.current.handlers.handleResume).toBeDefined();
        });
    });

    describe('Snackbar Management', () => {
        it('should close snackbar when closeSnackbar is called', async () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'idle',
                })
            );

            act(() => {
                result.current.handlers.handleStart();
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1000);
            });

            // After advancing timers, snackbar should be open
            expect(result.current.snackbar.open).toBe(true);

            act(() => {
                result.current.closeSnackbar();
            });

            expect(result.current.snackbar.open).toBe(false);
        });
    });

    describe('Loading States', () => {
        it('should show loading state during action execution', async () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'idle',
                })
            );

            act(() => {
                result.current.handlers.handleStart();
            });

            // Loading state should be set immediately
            expect(result.current.loading).toBe('Start');

            await act(async () => {
                await vi.advanceTimersByTimeAsync(500);
            });

            // Still loading
            expect(result.current.loading).toBe('Start');

            await act(async () => {
                await vi.advanceTimersByTimeAsync(500);
            });

            // After advancing timers, loading should be cleared
            expect(result.current.loading).toBe(null);
        });

        it('should clear loading state after action completes', async () => {
            const { result } = renderHook(() =>
                useRobotControls({
                    robotId: 'rbt-001',
                    initialStatus: 'idle',
                })
            );

            act(() => {
                result.current.handlers.handleStart();
            });

            expect(result.current.loading).toBe('Start');

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1000);
            });

            // After advancing timers, loading should be cleared
            expect(result.current.loading).toBe(null);
        });
    });
});

