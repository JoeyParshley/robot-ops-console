import { useState, useEffect, useRef, useCallback } from 'react';
import type { Position, Orientation, Velocity, RobotStatus } from '../types/robot';

export interface TelemetryUpdate {
    robotId: string;
    timestamp: string;
    position: Position;
    orientation: Orientation;
    velocity: Velocity;
    battery: number;
    status: RobotStatus;
    lastHeartbeat: string;
}

export interface UseTelemetryOptions {
    url?: string; // WebSocket URL (default: 'ws://localhost:8080')
    robotId?: string; // Optional: filter to specific robot
    autoConnect?: boolean; // Auto-connect on mount (default: true)
    reconnect?: boolean; // Auto-reconnect on disconnect (default: true)
    reconnectInterval?: number; // Max reconnect interval in ms (default: 30000)
}

export interface UseTelemetryReturn {
    // Telemetry data
    telemetry: Map<string, TelemetryUpdate> | TelemetryUpdate | null;
    
    // All robots telemetry (always available, even when robotId is specified)
    allRobots: Map<string, TelemetryUpdate>;
    
    // Connection state
    connected: boolean;
    connecting: boolean;
    error: Error | null;
    
    // Actions
    connect: () => void;
    disconnect: () => void;
    sendCommand: (robotId: string, action: 'start' | 'pause' | 'resume' | 'returnToDock' | 'emergencyStop') => void;
}

const MAX_RECONNECT_INTERVAL = 30000; // 30 seconds
const INITIAL_RECONNECT_DELAY = 1000; // 1 second

export const useTelemetry = ({
    url = 'ws://localhost:8080',
    robotId,
    autoConnect = true,
    reconnect = true,
    reconnectInterval = MAX_RECONNECT_INTERVAL,
}: UseTelemetryOptions = {}): UseTelemetryReturn => {
    const [allRobots, setAllRobots] = useState<Map<string, TelemetryUpdate>>(new Map());
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const wsRef = useRef<WebSocket | null>(null);

    // Use number, not NodeJS.Timeout, for browser compatibility
    const reconnectTimeoutRef = useRef<number | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const shouldReconnectRef = useRef(reconnect);

    // Update reconnect flag when prop changes
    useEffect(() => {
        shouldReconnectRef.current = reconnect;
    }, [reconnect]);

    // Process incoming WebSocket messages
    const processMessage = useCallback((message: MessageEvent) => {
        try {
            const data = JSON.parse(message.data);

            switch (data.type) {
                case 'initial_state':
                    // Initial robot states on connection
                    const initialMap = new Map<string, TelemetryUpdate>();
                    data.data.forEach((update: TelemetryUpdate) => {
                        initialMap.set(update.robotId, update);
                    });
                    setAllRobots(initialMap);
                    break;

                case 'telemetry':
                    // Periodic telemetry updates
                    setAllRobots(prev => {
                        const updated = new Map(prev);
                        data.data.forEach((update: TelemetryUpdate) => {
                            updated.set(update.robotId, update);
                        });
                        return updated;
                    });
                    break;

                case 'command_ack':
                    // Command acknowledgment - could be used to update UI
                    console.log(`[Telemetry] Command acknowledged: ${data.action} for robot ${data.robotId}`);
                    break;

                case 'error':
                    // Error message from server
                    console.error(`[Telemetry] Server error: ${data.message}`);
                    setError(new Error(data.message));
                    break;

                default:
                    console.warn(`[Telemetry] Unknown message type: ${data.type}`);
            }
        } catch (err) {
            console.error('[Telemetry] Error parsing message:', err);
            setError(err instanceof Error ? err : new Error('Failed to parse message'));
        }
    }, []);

    // Connect to WebSocket server
    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
            return; // Already connected or connecting
        }

        setConnecting(true);
        setError(null);

        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('[Telemetry] Connected to WebSocket server');
                setConnected(true);
                setConnecting(false);
                setError(null);
                reconnectAttemptsRef.current = 0;
            };

            ws.onmessage = processMessage;

            ws.onerror = (event) => {
                console.error('[Telemetry] WebSocket error:', event);
                setError(new Error('WebSocket connection error'));
                setConnecting(false);
            };

            ws.onclose = (event) => {
                console.log('[Telemetry] WebSocket closed', event.code, event.reason);
                setConnected(false);
                setConnecting(false);

                // Attempt reconnection if enabled and not a normal closure
                if (shouldReconnectRef.current && event.code !== 1000) {
                    const delay = Math.min(
                        INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
                        reconnectInterval
                    );
                    
                    console.log(`[Telemetry] Attempting reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    }, delay);
                }
            };

            wsRef.current = ws;
        } catch (err) {
            console.error('[Telemetry] Failed to create WebSocket:', err);
            setError(err instanceof Error ? err : new Error('Failed to create WebSocket connection'));
            setConnecting(false);
        }
    }, [url, processMessage, reconnectInterval]);

    // Disconnect from WebSocket server
    const disconnect = useCallback(() => {
        shouldReconnectRef.current = false;
        
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close(1000, 'Client disconnect');
            wsRef.current = null;
        }

        setConnected(false);
        setConnecting(false);
        reconnectAttemptsRef.current = 0;
    }, []);

    // Send command to robot via WebSocket
    const sendCommand = useCallback((
        targetRobotId: string,
        action: 'start' | 'pause' | 'resume' | 'returnToDock' | 'emergencyStop'
    ) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'command',
                robotId: targetRobotId,
                action,
            }));
            console.log(`[Telemetry] Sent command: ${action} for robot ${targetRobotId}`);
        } else {
            console.warn('[Telemetry] Cannot send command: WebSocket not connected');
            setError(new Error('WebSocket not connected'));
        }
    }, []);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    // Get telemetry for specific robot or all robots
    const telemetry = robotId 
        ? (allRobots.get(robotId) || null)
        : (allRobots.size > 0 ? allRobots : null);

    return {
        telemetry,
        allRobots,
        connected,
        connecting,
        error,
        connect,
        disconnect,
        sendCommand,
    };
};