import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RobotStateProvider, useRobotState } from './RobotStateContext';
import type { RobotDetail } from '../types/robot';

// Test component that uses the context
const TestComponent = ({ robotId }: { robotId: string }) => {
    const { robots, getRobot, updateRobotStatus } = useRobotState();
    const robot = getRobot(robotId);

    return (
        <div>
            <div data-testid="robot-count">{robots.length}</div>
            {robot && (
                <div>
                    <div data-testid="robot-name">{robot.name}</div>
                    <div data-testid="robot-status">{robot.status}</div>
                    <button
                        data-testid="update-status"
                        onClick={() => updateRobotStatus(robotId, 'active')}
                    >
                        Update Status
                    </button>
                </div>
            )}
        </div>
    );
};

describe('RobotStateContext', () => {
    const mockRobots: RobotDetail[] = [
        {
            id: 'rbt-001',
            name: 'Atlas-01',
            status: 'idle',
            battery: 100,
            location: 'Lab A',
            lastHeartbeat: '2024-01-01T00:00:00Z',
            currentTask: 'Test Task',
            tether: {
                isTethered: true,
                tetherLength: 50,
                anchorPoint: { x: 0, y: 0, z: 0 },
                currentTetherExtension: 25,
            },
            flightArea: {
                minX: -25,
                maxX: 25,
                minY: -25,
                maxY: 25,
                minZ: 0,
                maxZ: 15,
            },
            currentPosition: { x: 0, y: 0, z: 0 },
            currentOrientation: { roll: 0, pitch: 0, yaw: 0 },
            currentVelocity: { vx: 0, vy: 0, vz: 0 },
            statusHistory: [],
            taskHistory: [],
            errorLogs: [],
            metrics: {
                uptime: 0,
                totalFlightTime: 0,
                tasksCompleted: 0,
                tasksFailed: 0,
                averageBatteryEfficiency: 100,
            },
            firmwareVersion: 'v1.0.0',
            hardwareModel: 'Atlas Pro',
        },
        {
            id: 'rbt-002',
            name: 'Atlas-02',
            status: 'active',
            battery: 90,
            location: 'Lab B',
            lastHeartbeat: '2024-01-01T00:00:00Z',
            currentTask: 'Patrol',
            tether: {
                isTethered: false,
                tetherLength: 0,
                anchorPoint: { x: 0, y: 0, z: 0 },
                currentTetherExtension: 0,
            },
            flightArea: {
                minX: -25,
                maxX: 25,
                minY: -25,
                maxY: 25,
                minZ: 0,
                maxZ: 15,
            },
            currentPosition: { x: 1, y: 2, z: 3 },
            currentOrientation: { roll: 0, pitch: 0, yaw: 0 },
            currentVelocity: { vx: 0, vy: 0, vz: 0 },
            statusHistory: [],
            taskHistory: [],
            errorLogs: [],
            metrics: {
                uptime: 0,
                totalFlightTime: 0,
                tasksCompleted: 0,
                tasksFailed: 0,
                averageBatteryEfficiency: 100,
            },
            firmwareVersion: 'v1.0.0',
            hardwareModel: 'Atlas Pro',
        },
    ];

    describe('RobotStateProvider', () => {
        it('should provide robots to children', () => {
            render(
                <RobotStateProvider initialRobots={mockRobots}>
                    <TestComponent robotId="rbt-001" />
                </RobotStateProvider>
            );

            expect(screen.getByTestId('robot-count')).toHaveTextContent('2');
            expect(screen.getByTestId('robot-name')).toHaveTextContent('Atlas-01');
            expect(screen.getByTestId('robot-status')).toHaveTextContent('idle');
        });

        it('should allow getting a robot by ID', () => {
            render(
                <RobotStateProvider initialRobots={mockRobots}>
                    <TestComponent robotId="rbt-002" />
                </RobotStateProvider>
            );

            expect(screen.getByTestId('robot-name')).toHaveTextContent('Atlas-02');
            expect(screen.getByTestId('robot-status')).toHaveTextContent('active');
        });

        it('should return undefined for non-existent robot', () => {
            render(
                <RobotStateProvider initialRobots={mockRobots}>
                    <TestComponent robotId="rbt-999" />
                </RobotStateProvider>
            );

            expect(screen.queryByTestId('robot-name')).not.toBeInTheDocument();
        });

        it('should update robot status', async () => {
            render(
                <RobotStateProvider initialRobots={mockRobots}>
                    <TestComponent robotId="rbt-001" />
                </RobotStateProvider>
            );

            expect(screen.getByTestId('robot-status')).toHaveTextContent('idle');

            const updateButton = screen.getByTestId('update-status');
            updateButton.click();

            await waitFor(() => {
                expect(screen.getByTestId('robot-status')).toHaveTextContent('active');
            });
        });

        it('should only update the specified robot', async () => {
            const TwoRobotsComponent = () => {
                const { robots, updateRobotStatus } = useRobotState();
                return (
                    <div>
                        <div data-testid="robot-1-status">{robots.find(r => r.id === 'rbt-001')?.status}</div>
                        <div data-testid="robot-2-status">{robots.find(r => r.id === 'rbt-002')?.status}</div>
                        <button
                            data-testid="update-robot-1"
                            onClick={() => updateRobotStatus('rbt-001', 'active')}
                        >
                            Update Robot 1
                        </button>
                    </div>
                );
            };

            render(
                <RobotStateProvider initialRobots={mockRobots}>
                    <TwoRobotsComponent />
                </RobotStateProvider>
            );

            expect(screen.getByTestId('robot-1-status')).toHaveTextContent('idle');
            expect(screen.getByTestId('robot-2-status')).toHaveTextContent('active');

            screen.getByTestId('update-robot-1').click();

            await waitFor(() => {
                expect(screen.getByTestId('robot-1-status')).toHaveTextContent('active');
            });
            expect(screen.getByTestId('robot-2-status')).toHaveTextContent('active'); // Unchanged
        });
    });

    describe('useRobotState', () => {
        it('should throw error when used outside provider', () => {
            // Suppress console.error for this test
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                render(<TestComponent robotId="rbt-001" />);
            }).toThrow('useRobotState must be used within a RobotStateProvider');

            consoleSpy.mockRestore();
        });
    });
});

