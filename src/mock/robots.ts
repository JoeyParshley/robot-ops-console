import type { Robot } from '../types/robot';

export const mockRobots: Robot[] = [
    {
        id: 'rbt-001',
        name: 'Atlas-01',
        status: 'active',
        battery: 76,
        location: 'Lab A',
        lastHeartbeat: '2025-12-11T15:23:10Z',
        currentTask: 'Patrol Route A',
    },
    {
        id: 'rbt-002',
        name: 'Atlas-02',
        status: 'charging',
        battery: 45,
        location: 'Charging Station 1',
        lastHeartbeat: '2025-12-11T15:23:10Z',
        currentTask: 'Charging',
    },
    {
        id: 'rbt-003',
        name: 'Hermes-01',
        status: 'idle',
        battery: 89,
        location: 'Warehouse B',
        lastHeartbeat: '2025-12-11T15:23:10Z',
    },
    {
        id: 'rbt-004',
        name: 'Scout-01',
        status: 'error',
        battery: 20,
        location: 'Sector 7G',
        lastHeartbeat: '2025-12-11T15:23:10Z',
        currentTask: 'Diagnostics',
    }
];