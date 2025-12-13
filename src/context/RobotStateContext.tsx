import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { RobotDetail, RobotStatus } from '../types/robot';

interface RobotStateContextType {
    robots: RobotDetail[];
    updateRobotStatus: (robotId: string, newStatus: RobotStatus) => void;
    getRobot: (robotId: string) => RobotDetail | undefined;
}

const RobotStateContext = createContext<RobotStateContextType | undefined>(undefined);

interface RobotStateProviderProps {
    children: ReactNode;
    initialRobots: RobotDetail[];
}

export const RobotStateProvider = ({ children, initialRobots }: RobotStateProviderProps) => {
    const [robots, setRobots] = useState<RobotDetail[]>(initialRobots);

    const updateRobotStatus = useCallback((robotId: string, newStatus: RobotStatus) => {
        setRobots(prevRobots =>
            prevRobots.map(robot =>
                robot.id === robotId ? { ...robot, status: newStatus } : robot
            )
        );
    }, []);

    const getRobot = useCallback((robotId: string) => {
        return robots.find(robot => robot.id === robotId);
    }, [robots]);

    return (
        <RobotStateContext.Provider value={{ robots, updateRobotStatus, getRobot }}>
            {children}
        </RobotStateContext.Provider>
    );
};

export const useRobotState = () => {
    const context = useContext(RobotStateContext);
    if (!context) {
        throw new Error('useRobotState must be used within a RobotStateProvider');
    }
    return context;
};

