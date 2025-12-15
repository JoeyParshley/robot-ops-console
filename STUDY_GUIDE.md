# Study Guide: Technical Concepts & Interview Preparation

This guide covers the key technical concepts used in the Robot Operations Console project, designed to help you confidently discuss them in interviews.

---

## Table of Contents

1. [Custom Hooks](#custom-hooks)
2. [State Management](#state-management)
3. [TypeScript Benefits](#typescript-benefits)
4. [Electron Architecture](#electron-architecture)
5. [Component Composition](#component-composition)
6. [Frontend Performance Techniques](#frontend-performance-techniques)
7. [Other Interview Topics](#other-interview-topics)

---

## Custom Hooks

### What Are Custom Hooks?

Custom hooks are JavaScript functions that start with `use` and can call other hooks. They allow you to extract component logic into reusable functions.

### Why Use Custom Hooks?

1. **Reusability**: Share logic between components
2. **Separation of Concerns**: Business logic separate from UI
3. **Testability**: Test logic independently from components
4. **Readability**: Components focus on rendering, hooks handle logic

### What is Telemetry?

**Telemetry** is the automatic collection and transmission of data from remote or inaccessible sources. In robotics, telemetry refers to real-time sensor data and status information sent from robots to monitoring systems.

**In This Project:**
Telemetry includes real-time data about each robot's:
- **Position**: Current location in 3D space (x, y, z coordinates)
- **Orientation**: How the robot is tilted/rotated (roll, pitch, yaw angles)
- **Velocity**: Speed and direction of movement (vx, vy, vz)
- **Battery Level**: Current battery percentage
- **Status**: Current operational state (idle, active, charging, error)
- **Heartbeat**: Last time the robot sent a signal (confirms it's alive)

**Why Telemetry Matters:**
- **Real-time Monitoring**: Operators need to see what robots are doing right now
- **Safety**: Detect problems immediately (low battery, errors, out of bounds)
- **Decision Making**: Operators use telemetry to make control decisions
- **Debugging**: Historical telemetry helps diagnose issues

**How It Works in This Project:**
1. Robots send telemetry data via WebSocket (real-time, bidirectional)
2. `useTelemetry` hook receives and processes the data
3. UI components display the telemetry (position on map, battery gauge, status indicators)
4. Data updates continuously (typically every 100-500ms)

**Example Telemetry Data Structure:**
```typescript
interface TelemetryUpdate {
    robotId: string;
    timestamp: string;
    position: { x: number; y: number; z: number };
    orientation: { roll: number; pitch: number; yaw: number };
    velocity: { vx: number; vy: number; vz: number };
    battery: number; // 0-100
    status: "idle" | "active" | "charging" | "error";
    lastHeartbeat: string;
}
```

**Interview Talking Points:**
- Telemetry is real-time sensor data from robots
- WebSocket is used for continuous, bidirectional communication
- Operators use telemetry to monitor and control robots
- Critical for safety and operational awareness

### Example: `useTelemetry` Hook

**What it does:**
- Manages WebSocket connection to telemetry server
- Handles reconnection logic with exponential backoff
- Processes incoming telemetry messages
- Provides connection state (connected, connecting, error)

**Key Implementation Details:**

```typescript
export const useTelemetry = ({ url, robotId, autoConnect, reconnect }) => {
    const [allRobots, setAllRobots] = useState<Map<string, TelemetryUpdate>>(new Map());
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    
    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => disconnect();
    }, [autoConnect]);
    
    return { telemetry, connected, connect, disconnect };
};
```

**Interview Talking Points:**
- Uses `useRef` to persist WebSocket instance across re-renders
- Uses `useEffect` for side effects (connection lifecycle)
- Returns an object with state and functions (standard hook pattern)
- Handles cleanup in `useEffect` return function

### Example: `useRobotControls` Hook

**What it does:**
- Manages robot control actions (start, pause, emergency stop)
- Handles UI state (loading, snackbar notifications, confirmation dialogs)
- Simulates API calls with proper error handling

**Key Implementation Details:**

```typescript
export const useRobotControls = ({ robotId, initialStatus, onStatusChange }) => {
    const [robotStatus, setRobotStatus] = useState<RobotStatus>(initialStatus);
    const [controlState, setControlState] = useState<ControlState>({...});
    
    const handleStart = useCallback(async () => {
        await simulateAction('Start', async () => {
            // API call simulation
            updateStatus('active');
        });
    }, [robotId, simulateAction, updateStatus]);
    
    return { robotStatus, loading, handlers: { handleStart, ... } };
};
```

**Interview Talking Points:**
- Uses `useCallback` to memoize functions (prevents unnecessary re-renders)
- Combines multiple pieces of state into a single object
- Provides a clean API for components to use

### Common Hook Patterns

1. **State + Effects**: `useState` + `useEffect` for data fetching
2. **Refs for Persistence**: `useRef` for values that don't trigger re-renders
3. **Memoization**: `useCallback` and `useMemo` for performance
4. **Custom Return API**: Return objects with clear property names

### Interview Questions You Might Get

**Q: Why not just put this logic in the component?**
A: Reusability and testability. If multiple components need the same logic, a custom hook avoids duplication. Also, hooks can be tested independently with React Testing Library.

**Q: When would you use `useCallback` in a custom hook?**
A: When returning functions that are used as dependencies in other hooks or passed to child components. It prevents unnecessary re-renders.

**Q: How do you test custom hooks?**
A: Use `renderHook` from React Testing Library, or test them indirectly through components. For `useTelemetry`, we mock WebSocket connections.

**Q: What is telemetry and why is it important?**
A: Telemetry is real-time sensor data sent from robots (position, orientation, velocity, battery, status). It's critical for operators to monitor robot state, make control decisions, and detect problems immediately. In this project, we use WebSocket for continuous, real-time telemetry streaming.

### Understanding Stale Closures

**What is a Stale Closure?**

A **stale closure** occurs when a function captures an old value of a variable from an outer scope, instead of the current value. This is a common bug in React hooks, especially with `useEffect`, `useCallback`, and `useMemo`.

**The Problem:**

When you create a closure (a function that references variables from an outer scope), it "captures" the values at the time it was created. If those values change later, but the closure still references the old values, you have a stale closure.

**Simple Example:**

```typescript
// BAD - Stale closure
const Counter = () => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            console.log(count); // Always logs 0! (stale closure)
            setCount(count + 1); // Always sets to 1! (stale closure)
        }, 1000);
        
        return () => clearInterval(interval);
    }, []); // Empty deps - closure never updates
    
    return <div>{count}</div>;
};
```

**Why This Happens:**

1. `useEffect` runs once (empty dependency array `[]`)
2. The closure captures `count = 0` when created
3. Even when `count` updates to 1, 2, 3..., the closure still sees `count = 0`
4. The closure is "stale" - it has old data

**The Fix: Functional Updates**

```typescript
// GOOD - Functional update avoids stale closure
const Counter = () => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prevCount => prevCount + 1); // Uses latest value
        }, 1000);
        
        return () => clearInterval(interval);
    }, []); // Empty deps OK - using functional update
    
    return <div>{count}</div>;
};
```

**Or Include Dependencies:**

```typescript
// GOOD - Include dependencies
const Counter = () => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            console.log(count); // Always has latest value
            setCount(count + 1);
        }, 1000);
        
        return () => clearInterval(interval);
    }, [count]); // Recreate closure when count changes
    
    return <div>{count}</div>;
};
```

**Real Example from This Project:**

In `useTelemetry`, we avoid stale closures by using refs:

```typescript
// From useTelemetry.ts - Avoiding stale closures
const connect = useCallback(() => {
    // ... WebSocket setup ...
    
    ws.onclose = (event) => {
        // BAD - Would be stale closure if we used reconnect directly
        // reconnect(); // ❌ Might use old reconnect value
        
        // GOOD - Use ref to get current value
        if (shouldReconnectRef.current && event.code !== 1000) {
            // shouldReconnectRef.current always has latest value
            reconnectTimeoutRef.current = setTimeout(() => {
                reconnectAttemptsRef.current++;
                connect(); // Recursive call uses latest connect function
            }, delay);
        }
    };
}, [url, processMessage, reconnectInterval]);
```

**Common Stale Closure Patterns:**

#### 1. Missing Dependencies in useEffect

```typescript
// BAD - Stale closure
const RobotList = ({ robots }) => {
    const [filter, setFilter] = useState('');
    
    useEffect(() => {
        // filter is stale - always sees initial value ''
        const filtered = robots.filter(r => r.name.includes(filter));
        console.log(filtered); // Always uses filter = ''
    }, []); // Missing 'filter' and 'robots' in deps
    
    return <div>...</div>;
};

// GOOD - Include dependencies
useEffect(() => {
    const filtered = robots.filter(r => r.name.includes(filter));
    console.log(filtered); // Always has latest values
}, [robots, filter]); // All dependencies included
```

#### 2. Stale Closure in useCallback

```typescript
// BAD - Stale closure
const RobotCard = ({ robot, onUpdate }) => {
    const [status, setStatus] = useState(robot.status);
    
    const handleClick = useCallback(() => {
        // robot is stale - always sees initial robot value
        onUpdate(robot.id, status); // robot might be outdated
    }, []); // Missing 'robot' and 'status' in deps
    
    return <div onClick={handleClick}>...</div>;
};

// GOOD - Include dependencies
const handleClick = useCallback(() => {
    onUpdate(robot.id, status); // Always has latest values
}, [robot, status, onUpdate]); // All dependencies included

// BETTER - Use functional update if possible
const handleClick = useCallback(() => {
    setStatus(prevStatus => {
        onUpdate(robot.id, prevStatus); // prevStatus is always current
        return prevStatus;
    });
}, [robot, onUpdate]); // status not needed with functional update
```

#### 3. Stale Closure in Event Handlers

```typescript
// BAD - Stale closure
const RobotControls = ({ robotId }) => {
    const [count, setCount] = useState(0);
    
    const handleStart = () => {
        // count is stale - always sees initial value 0
        console.log(`Starting robot ${robotId} with count ${count}`);
        // count is always 0, even if state updated
    };
    
    return <button onClick={handleStart}>Start</button>;
};

// GOOD - Use functional update or include in handler
const handleStart = () => {
    setCount(prevCount => {
        console.log(`Starting robot ${robotId} with count ${prevCount}`);
        return prevCount;
    });
};
```

#### 4. Stale Closure with Refs

```typescript
// BAD - Trying to access state in callback
const useTelemetry = ({ robotId }) => {
    const [connected, setConnected] = useState(false);
    
    const connect = useCallback(() => {
        const ws = new WebSocket(url);
        
        ws.onopen = () => {
            // connected might be stale
            if (connected) { // ❌ Might be false even if we just set it
                console.log('Already connected');
            }
            setConnected(true);
        };
    }, []); // Missing 'connected' - but we don't want to recreate on every change
    
    // GOOD - Use ref for values that don't need to trigger re-renders
    const connectedRef = useRef(false);
    
    const connect = useCallback(() => {
        const ws = new WebSocket(url);
        
        ws.onopen = () => {
            // connectedRef.current always has latest value
            if (connectedRef.current) {
                console.log('Already connected');
            }
            connectedRef.current = true;
            setConnected(true); // Update state for UI
        };
    }, []); // No stale closure - ref always has latest value
};
```

**How to Identify Stale Closures:**

1. **ESLint Warning**: React Hook useEffect/useCallback has missing dependencies
2. **Unexpected Behavior**: Function uses old values instead of current ones
3. **State Not Updating**: Updates seem to be ignored
4. **Console Logs Show Old Values**: Logging shows outdated state

**Solutions:**

1. **Include All Dependencies**: Add all referenced variables to dependency array
   ```typescript
   useEffect(() => {
       // Uses: robots, filter, sortBy
   }, [robots, filter, sortBy]); // Include all
   ```

2. **Use Functional Updates**: For state setters, use functional form
   ```typescript
   setCount(prevCount => prevCount + 1); // Always has latest value
   ```

3. **Use Refs for Values**: For values that don't need to trigger re-renders
   ```typescript
   const valueRef = useRef(value);
   valueRef.current = value; // Always update ref
   // Use valueRef.current in closures
   ```

4. **Extract to useCallback**: If function is used in multiple places
   ```typescript
   const handler = useCallback(() => {
       // logic
   }, [dependencies]);
   ```

**Interview Talking Points:**

- **"A stale closure is when a function captures old values from an outer scope instead of current ones"**
- **"Common in `useEffect`, `useCallback`, and `useMemo` when dependencies are missing"**
- **"Fix by including all dependencies, using functional updates, or using refs for values that don't need re-renders"**
- **"ESLint's exhaustive-deps rule helps catch stale closures"**
- **"In `useTelemetry`, we use refs to avoid stale closures while keeping dependency arrays minimal"**

---

## State Management

### React Context API

**What it is:**
- Built-in React feature for sharing state across components
- Avoids "prop drilling" (passing props through many levels)

**When to use:**
- Shared state needed by multiple components
- State that doesn't change frequently
- Simple state (not complex async flows)

**Example from Project:**

```typescript
// Create context
const RobotStateContext = createContext<RobotStateContextType | undefined>(undefined);

// Provider component
export const RobotStateProvider = ({ children, initialRobots }) => {
    const [robots, setRobots] = useState<RobotDetail[]>(initialRobots);
    
    const updateRobotStatus = useCallback((robotId: string, newStatus: RobotStatus) => {
        setRobots(prevRobots =>
            prevRobots.map(robot =>
                robot.id === robotId ? { ...robot, status: newStatus } : robot
            )
        );
    }, []);
    
    return (
        <RobotStateContext.Provider value={{ robots, updateRobotStatus, getRobot }}>
            {children}
        </RobotStateContext.Provider>
    );
};

// Custom hook to use context
export const useRobotState = () => {
    const context = useContext(RobotStateContext);
    if (!context) {
        throw new Error('useRobotState must be used within RobotStateProvider');
    }
    return context;
};
```

**Interview Talking Points:**
- Context is for "global" state (shared across many components)
- Each context should have a single responsibility
- Use `useCallback` for context functions to prevent unnecessary re-renders
- Always provide a custom hook for using context (better error messages)

### Context API vs. Redux

**When to use Context:**
- Simple state (few updates, not high-frequency)
- Small to medium apps
- State doesn't need middleware or time-travel debugging

**When to use Redux:**
- Complex state with many reducers
- Need middleware (logging, API calls, side effects)
- Time-travel debugging needed
- Large team with established Redux patterns

### What is Middleware?

**Middleware** is code that runs between when an action is dispatched and when it reaches the reducer. It allows you to intercept, modify, or enhance actions before they update state.

**Think of it as:**
```
Action Dispatched → Middleware → Reducer → State Updated
```

**Common Middleware Use Cases:**

1. **API Calls (Redux Thunk/Saga):**
   - Dispatch an action to fetch data
   - Middleware makes the API call
   - Dispatch success/error actions based on result
   - Reducer updates state with the data

2. **Logging:**
   - Log every action for debugging
   - Track state changes over time
   - Debug production issues

3. **Async Operations:**
   - Handle promises, async/await
   - Cancel in-flight requests
   - Retry failed requests

4. **Side Effects:**
   - Save to localStorage
   - Send analytics events
   - Update external systems

**Example: Without Middleware (Context API):**

```typescript
// In Context - you handle API calls directly in the component or hook
const RobotProvider = ({ children }) => {
    const [robots, setRobots] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const fetchRobots = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/robots');
            const data = await response.json();
            setRobots(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <RobotContext.Provider value={{ robots, loading, fetchRobots }}>
            {children}
        </RobotContext.Provider>
    );
};
```

**Problems with this approach:**
- API logic mixed with state management
- Hard to test API calls separately
- Difficult to add retry logic, request cancellation
- No centralized way to handle all API calls
- Can't easily add logging, analytics, etc.

**Example: With Middleware (Redux + Redux Thunk):**

```typescript
// Action creator (returns a function, not an object)
const fetchRobots = () => {
    return async (dispatch, getState) => {
        dispatch({ type: 'FETCH_ROBOTS_START' });
        
        try {
            const response = await fetch('/api/robots');
            const data = await response.json();
            dispatch({ type: 'FETCH_ROBOTS_SUCCESS', payload: data });
        } catch (error) {
            dispatch({ type: 'FETCH_ROBOTS_ERROR', payload: error.message });
        }
    };
};

// Redux Thunk middleware intercepts the function
// Makes the API call, then dispatches the actual actions
// Reducer handles the actions and updates state
```

**Benefits of middleware:**
- **Separation of concerns**: API logic separate from state updates
- **Reusability**: Same middleware can handle all API calls
- **Testability**: Test API logic independently
- **Composability**: Chain multiple middleware (logging + API + analytics)
- **Centralized**: All side effects in one place

**Common Redux Middleware:**

1. **Redux Thunk:**
   - Allows action creators to return functions (not just objects)
   - Handles async operations
   - Most common for API calls

2. **Redux Saga:**
   - More powerful than Thunk
   - Uses generators for complex async flows
   - Better for complex scenarios (cancellation, race conditions)

3. **Redux Logger:**
   - Logs every action and state change
   - Great for debugging

4. **Custom Middleware:**
   - Write your own for specific needs
   - Example: Analytics tracking, error reporting

**When Do You Need Middleware?**

You need middleware when you have:

1. **Complex Async Flows:**
   - Multiple API calls that depend on each other
   - Need to cancel requests
   - Retry logic with exponential backoff
   - Race conditions to handle

2. **Side Effects:**
   - Save to localStorage on every state change
   - Send analytics events
   - Sync with external systems
   - WebSocket connections

3. **Cross-Cutting Concerns:**
   - Logging all actions
   - Error handling
   - Request deduplication
   - Caching

4. **Complex State Updates:**
   - Update multiple parts of state from one action
   - Conditional updates based on current state
   - Transform data before storing

**For This Project:**

We **don't need middleware** because:
- API calls are simple (one request at a time)
- No complex async flows
- Side effects are minimal
- State updates are straightforward

We **would need middleware** if:
- We needed to batch multiple API calls
- We wanted automatic retry logic for all API calls
- We needed to log all state changes
- We had complex async flows (fetch robots → fetch their telemetry → update UI)
- We wanted to sync state with localStorage automatically

**For This Project:**
- Chose Context because state is simple (robot fleet data)
- If we needed API middleware or complex async flows, would migrate to Redux
- Performance is fine with < 100 robots

### Other State Management Options

**Zustand:**
- Lightweight alternative to Redux
- Good for medium complexity
- Simpler API than Redux

**Jotai/Recoil:**
- Atomic state management
- Good for fine-grained reactivity
- More complex setup

**For This Project:**
- Context was sufficient
- Could migrate to Zustand if state grows

### Interview Questions

**Q: Why Context API instead of Redux?**
A: The state scope is simple—just robot fleet data with infrequent updates. Context is built into React, reduces dependencies, and is easier to understand. If we needed middleware or complex async flows, we'd migrate to Redux.

**Q: How do you prevent unnecessary re-renders with Context?**
A: Split contexts by concern (don't put everything in one context), use `useCallback` for context functions, and use `useMemo` for computed values. Also, keep context values stable (don't create new objects on every render).

**Q: When would you migrate from Context to Redux?**
A: When we need middleware, complex async flows, time-travel debugging, or when performance becomes an issue with many consumers.

**Q: What is middleware and when do you need it?**
A: Middleware is code that runs between dispatching an action and updating state. It's useful for API calls, logging, async operations, and side effects. In this project, we don't need it because our API calls are simple and handled directly in hooks. We'd need middleware if we had complex async flows, needed automatic retry logic, wanted centralized logging, or had to handle multiple dependent API calls.

---

## TypeScript Benefits

### Why TypeScript for This Project?

1. **Safety-Critical Operations**: In robotics, type errors can cause incorrect commands. TypeScript catches these at compile-time.

2. **Complex Data Structures**: Robot telemetry involves nested objects. TypeScript provides autocomplete and validation.

3. **Refactoring Confidence**: As requirements evolve, TypeScript ensures changes propagate correctly.

4. **Self-Documenting**: Types serve as inline documentation.

### Key TypeScript Features Used

**Union Types:**
```typescript
type RobotStatus = "idle" | "active" | "charging" | "error";
// Can't accidentally use invalid status
```

**Interfaces:**
```typescript
interface TelemetryUpdate {
    robotId: string;
    position: Position;
    orientation: Orientation;
    velocity: Velocity;
    battery: number;
    status: RobotStatus;
}
```

**Generic Types:**
```typescript
const [robots, setRobots] = useState<RobotDetail[]>([]);
// TypeScript knows robots is an array of RobotDetail
```

**Type Guards:**
```typescript
if (error instanceof Error) {
    // TypeScript knows error is Error here
    console.log(error.message);
}
```

### Interface vs. Type: When to Use Each

**The Short Answer:**
- Use `interface` for object shapes (most common)
- Use `type` for unions, intersections, and advanced type operations

**Detailed Comparison:**

#### 1. Object Shapes (Both Work, Prefer Interface)

```typescript
// Both are valid and equivalent for simple objects
interface Robot {
    id: string;
    name: string;
}

type Robot = {
    id: string;
    name: string;
};
```

**Why prefer `interface` for objects?**
- Better error messages
- Supports declaration merging (useful for extending library types)
- More idiomatic for object shapes
- Slightly better performance in some TypeScript versions

#### 2. Union Types (Type Only)

```typescript
// ✅ TYPE - Union types work
type RobotStatus = "idle" | "active" | "charging" | "error";
type ID = string | number;
type Result<T> = T | Error;

// ❌ INTERFACE - Can't do unions
interface Status = "idle" | "active";  // Syntax error
```

**Why `type` for unions?**
- `interface` can only describe object shapes
- Union types are a fundamental `type` feature
- Used extensively in this project for status values

#### 3. Extending/Inheritance

```typescript
// Interface - uses 'extends' keyword
interface Robot {
    id: string;
    name: string;
}

interface RobotDetail extends Robot {
    position: Position;
    metrics: PerformanceMetrics;
}

// Type - uses intersection (&)
type Robot = {
    id: string;
    name: string;
};

type RobotDetail = Robot & {
    position: Position;
    metrics: PerformanceMetrics;
};
```

**Both work, but `interface` is more readable for inheritance.**

#### 4. Declaration Merging (Interface Only)

```typescript
// ✅ INTERFACE - Declarations automatically merge
interface Robot {
    id: string;
}

interface Robot {
    name: string;  // Merges with above
}

// Now Robot has both id and name
const robot: Robot = {
    id: "rbt-001",
    name: "Robot 1"
};

// ❌ TYPE - Can't redeclare
type Robot = { id: string; };
type Robot = { name: string; };  // Error: Duplicate identifier
```

**When is declaration merging useful?**
- Extending library types (e.g., adding properties to `Window`)
- Augmenting third-party type definitions
- Building up types incrementally

#### 5. Advanced Type Operations (Type Only)

```typescript
// ✅ TYPE - Mapped types, conditional types, etc.
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

type Optional<T> = {
    [P in keyof T]?: T[P];
};

type RobotReadonly = Readonly<Robot>;

// ❌ INTERFACE - Can't do mapped types
```

**Examples from This Project:**

```typescript
// TYPE - Union type (from robot.ts)
export type RobotStatus = "idle" | "active" | "charging" | "error";

// INTERFACE - Object shapes (from robot.ts)
export interface Robot {
    id: string;
    name: string;
    status: RobotStatus;
    battery: number;
}

// INTERFACE - Extending (from robot.ts)
export interface RobotDetail extends Robot {
    currentPosition: Position;
    currentOrientation: Orientation;
    currentVelocity: Velocity;
}
```

**Decision Guide:**

| Use Case | Use `interface` | Use `type` |
|----------|-----------------|------------|
| Object shapes | ✅ Preferred | ✅ Works |
| Union types | ❌ Can't | ✅ Required |
| Intersection types | ❌ Can't | ✅ Required |
| Extending types | ✅ `extends` | ✅ `&` operator |
| Declaration merging | ✅ Supported | ❌ Not supported |
| Mapped types | ❌ Can't | ✅ Required |
| Primitive aliases | ❌ Can't | ✅ Required |

**Best Practice:**
- Default to `interface` for object shapes
- Use `type` for unions, intersections, and advanced operations
- Be consistent within a project

### Interview Questions

**Q: What are the main benefits of TypeScript?**
A: Type safety (catch errors at compile-time), better IDE support (autocomplete, refactoring), self-documenting code, and easier refactoring.

**Q: When would you use `interface` vs `type`?**
A: For most cases, they're interchangeable. However, there are key differences:

**When to use `interface`:**
- **Object shapes** (most common use case)
- When you need **declaration merging** (multiple declarations combine)
- When you want to **extend** other interfaces
- Better error messages in some cases

**When to use `type`:**
- **Union types** (e.g., `"idle" | "active" | "error"`)
- **Intersection types** (combining multiple types)
- **Primitive types** (string, number aliases)
- **Mapped types** and advanced type operations

**Examples from this project:**

```typescript
// TYPE - Union type (can't use interface for this)
type RobotStatus = "idle" | "active" | "charging" | "error";

// INTERFACE - Object shape
interface Robot {
    id: string;
    name: string;
    status: RobotStatus;
    battery: number;
}

// INTERFACE - Can extend other interfaces
interface RobotDetail extends Robot {
    currentPosition: Position;
    metrics: PerformanceMetrics;
}

// TYPE - Union type (not possible with interface)
type StatusOrError = RobotStatus | Error;

// TYPE - Intersection type (combining types)
type RobotWithMetadata = Robot & {
    metadata: { version: string; };
};
```

**Key Differences:**

1. **Declaration Merging** (interface only):
```typescript
// Interface - declarations merge
interface Robot {
    id: string;
}
interface Robot {
    name: string;  // Merges with above - Robot now has both id and name
}

// Type - error if you try to redeclare
type Robot = { id: string; };
type Robot = { name: string; };  // ❌ Error: Duplicate identifier
```

2. **Extending** (both work, but interface is more common):
```typescript
// Interface - extends keyword
interface RobotDetail extends Robot {
    position: Position;
}

// Type - intersection (same result, different syntax)
type RobotDetail = Robot & {
    position: Position;
};
```

3. **Union Types** (type only):
```typescript
// Type - union works
type Status = "idle" | "active" | "error";

// Interface - can't do unions
interface Status = "idle" | "active";  // ❌ Syntax error
```

**For This Project:**
- Used `interface` for all object shapes (Robot, Position, TelemetryUpdate, etc.)
- Used `type` for union types (RobotStatus)
- This follows common TypeScript conventions

**Q: How does TypeScript help with refactoring?**
A: When you change a type, TypeScript shows all places that need updating. This prevents bugs and makes refactoring safe.

---

## Electron Architecture

### What is Electron?

Electron allows you to build desktop applications using web technologies (HTML, CSS, JavaScript). It combines Chromium (browser) and Node.js.

### Main Process vs. Renderer Process

**Main Process:**
- One per application
- Creates and manages windows
- Has access to Node.js APIs
- File: `electron/main.ts`

**Renderer Process:**
- One per window
- Runs your React app
- Sandboxed (no Node.js access by default)
- Files: Your React components

### Security Best Practices

**1. Context Isolation:**
```typescript
webPreferences: {
    contextIsolation: true,  // Isolates preload from web content
    nodeIntegration: false,  // Prevents renderer from accessing Node.js
}
```

**2. Preload Script:**
- Only way to safely expose APIs to renderer
- Runs in isolated context
- Can expose specific functions via `contextBridge`

**3. Content Security Policy (CSP):**
```typescript
'Content-Security-Policy': "default-src 'self'"
```

**4. Block External Navigation:**
```typescript
mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
});
```

### IPC (Inter-Process Communication)

**Pattern:**
1. Renderer sends message via `window.electronAPI.someMethod()`
2. Preload script exposes method via `contextBridge.exposeInMainWorld()`
3. Main process handles via `ipcMain.handle()`

**Example:**
```typescript
// preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
    getVersion: () => ipcRenderer.invoke('get-version')
});

// main.ts
ipcMain.handle('get-version', () => {
    return app.getVersion();
});
```

### Interview Questions

**Q: Why Electron for this project?**
A: Desktop deployment for operator console environments. Operators need a dedicated app, not a browser tab. Electron provides native window management and can integrate with system APIs if needed.

**Q: What are the security concerns with Electron?**
A: Main risks are XSS attacks and Node.js access in renderer. We mitigate with context isolation, disabling node integration, CSP, and blocking external navigation.

**Q: How do you communicate between main and renderer processes?**
A: Via IPC (Inter-Process Communication). Preload script exposes safe APIs via `contextBridge`, renderer calls them, main process handles via `ipcMain`.

---

## Component Composition

### What is Composition?

Composition is building complex components by combining simpler ones, rather than using inheritance.

### Composition Patterns in This Project

**1. Page Components Compose Smaller Components:**
```typescript
<FleetOverviewPage>
    <RobotTableRow robot={robot} />
    <StatusIndicator status={status} />
</FleetOverviewPage>
```

**2. Hooks Composition:**
```typescript
const { robots } = useRobotState();        // Context
const { telemetry } = useTelemetry();      // WebSocket
const { handlers } = useRobotControls();   // Controls
```

### Hooks Composition Explained

**What is Hooks Composition?**

Hooks composition is the practice of combining multiple custom hooks in a single component to build complex functionality from simpler, reusable pieces. Each hook handles a specific concern, and together they provide all the functionality the component needs.

**Why Compose Hooks?**

1. **Separation of Concerns**: Each hook handles one responsibility
2. **Reusability**: Hooks can be reused across different components
3. **Testability**: Each hook can be tested independently
4. **Readability**: Component code is cleaner and easier to understand
5. **Maintainability**: Changes to one hook don't affect others

**Pattern: Multiple Hooks in One Component**

```typescript
// Component composes multiple hooks, each handling a different concern
const RobotDetailPage = () => {
    // 1. Router hooks - navigation and URL params
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // 2. Context hook - shared robot state
    const { robots, updateRobotStatus } = useRobotState();
    
    // 3. Telemetry hook - real-time WebSocket data
    const {
        telemetry: robotTelemetry,
        connected,
        connecting,
        error: telemetryError,
    } = useTelemetry({
        robotId: id,
        autoConnect: true,
        reconnect: true,
    });
    
    // 4. Controls hook - robot control actions
    const {
        robotStatus,
        loading,
        handlers,
        snackbar,
        confirmDialog,
    } = useRobotControls({
        robotId: id || '',
        initialStatus: foundRobot?.status || 'idle',
        onStatusChange: (newStatus) => {
            updateRobotStatus(id, newStatus);
        },
    });
    
    // Combine data from multiple hooks
    const robot = {
        ...foundRobot,
        status: robotStatus || foundRobot.status,
        battery: robotTelemetry?.battery ?? foundRobot.battery,
    };
    
    return (/* JSX using all the composed data */);
};
```

**Real Example from RobotDetailPage:**

```typescript
// From src/pages/RobotDetailPage.tsx
export const RobotDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // Hook 1: Get robot data from context
    const { robots, updateRobotStatus } = useRobotState();
    
    // Hook 2: Get real-time telemetry via WebSocket
    const {
        telemetry: robotTelemetry,
        connected,
        connecting,
        error: telemetryError,
    } = useTelemetry({
        robotId: id,
        url: 'ws://localhost:8080',
        autoConnect: true,
        reconnect: true,
    });
    
    // Hook 3: Get control handlers and UI state
    const {
        robotStatus,
        loading,
        handlers,
        snackbar,
        confirmDialog,
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
    
    // Merge data from multiple hooks
    const robot = foundRobot ? {
        ...foundRobot,
        currentPosition: telemetry?.position ?? foundRobot.currentPosition,
        battery: telemetry?.battery ?? foundRobot.battery,
        status: telemetry?.status ?? (robotStatus || foundRobot.status),
    } : null;
};
```

**Real Example from FleetOverviewPage:**

```typescript
// From src/pages/FleetOverviewPage.tsx
export const FleetOverviewPage = ({ robots: robotsProp }) => {
    const navigate = useNavigate();
    
    // Single hook for fleet-wide telemetry
    const {
        allRobots: telemetryMap,
        connected,
        connecting,
        error: telemetryError,
    } = useTelemetry({
        url: 'ws://localhost:8080',
        autoConnect: true,
        reconnect: true,
    });
    
    // Merge telemetry with static robot data
    const robots = robotsProp.map(robot => {
        const telemetry = telemetryMap.get(robot.id);
        return telemetry ? {
            ...robot,
            battery: telemetry.battery,
            status: telemetry.status,
            lastHeartbeat: telemetry.lastHeartbeat,
        } : robot;
    });
};
```

**Common Hooks Composition Patterns:**

#### 1. Data Fetching + State Management
```typescript
const { robots } = useRobotState();           // Static data
const { telemetry } = useTelemetry();        // Real-time data
// Combine both sources
```

#### 2. State + Actions
```typescript
const { robots } = useRobotState();          // Read state
const { handlers } = useRobotControls();    // Actions/commands
// State and actions work together
```

#### 3. Multiple Data Sources
```typescript
const { robots } = useRobotState();          // From context
const { telemetry } = useTelemetry();       // From WebSocket
const { user } = useAuth();                  // From auth context
// Combine all data sources
```

#### 4. UI State + Business Logic
```typescript
const { loading, error } = useFetch();        // UI state
const { data } = useRobotState();            // Business data
const { handlers } = useRobotControls();    // Business logic
// Separate UI concerns from business logic
```

**Benefits of This Pattern:**

1. **Single Responsibility**: Each hook does one thing well
   - `useTelemetry` → WebSocket connection
   - `useRobotControls` → Control actions
   - `useRobotState` → Shared state

2. **Easy to Test**: Test each hook independently
   ```typescript
   // Test telemetry hook separately
   test('useTelemetry connects to WebSocket', () => {
       const { result } = renderHook(() => useTelemetry({}));
       // Test telemetry logic
   });
   
   // Test controls hook separately
   test('useRobotControls handles start action', () => {
       const { result } = renderHook(() => useRobotControls({}));
       // Test control logic
   });
   ```

3. **Reusable Across Components**: Same hooks work in different pages
   ```typescript
   // FleetOverviewPage uses useTelemetry
   const { allRobots } = useTelemetry({});
   
   // RobotDetailPage uses same hook with different config
   const { telemetry } = useTelemetry({ robotId: id });
   ```

4. **Clear Data Flow**: Easy to see where data comes from
   ```typescript
   // Data flow is explicit
   const robots = useRobotState().robots;        // From context
   const telemetry = useTelemetry().telemetry;   // From WebSocket
   const handlers = useRobotControls().handlers; // From controls hook
   ```

**Composing Hooks with Dependencies:**

Sometimes hooks depend on each other:

```typescript
const RobotDetailPage = () => {
    // Step 1: Get robot ID from URL
    const { id } = useParams<{ id: string }>();
    
    // Step 2: Get robot data (depends on id)
    const { robots } = useRobotState();
    const foundRobot = robots.find(r => r.id === id);
    
    // Step 3: Get telemetry (depends on id)
    const { telemetry } = useTelemetry({ robotId: id });
    
    // Step 4: Get controls (depends on foundRobot)
    const { handlers } = useRobotControls({
        robotId: id || '',
        initialStatus: foundRobot?.status || 'idle',
    });
    
    // Step 5: Combine all data
    const robot = {
        ...foundRobot,
        ...telemetry,
        status: handlers.robotStatus,
    };
};
```

**Interview Talking Points:**

- **"Hooks composition allows us to build complex functionality from simple, reusable pieces"**
- **"Each hook handles one concern: `useTelemetry` for WebSocket, `useRobotControls` for actions, `useRobotState` for shared data"**
- **"This makes components easier to read, test, and maintain"**
- **"Hooks can be reused across different components with different configurations"**
- **"The component orchestrates multiple hooks, combining their data and functionality"**

### How `useRobotState` Demonstrates Composition

**`useRobotState` itself is built through composition** - it composes built-in React hooks to create a custom state management solution.

#### The Provider: Composing Built-in Hooks

The `RobotStateProvider` component composes multiple built-in hooks:

```typescript
// From src/context/RobotStateContext.tsx
export const RobotStateProvider = ({ children, initialRobots }) => {
    // 1. Compose useState - manages robot array state
    const [robots, setRobots] = useState<RobotDetail[]>(initialRobots);
    
    // 2. Compose useCallback - memoizes update function
    const updateRobotStatus = useCallback((robotId: string, newStatus: RobotStatus) => {
        setRobots(prevRobots =>
            prevRobots.map(robot =>
                robot.id === robotId ? { ...robot, status: newStatus } : robot
            )
        );
    }, []); // Empty deps - function never changes
    
    // 3. Compose useCallback - memoizes getter function
    const getRobot = useCallback((robotId: string) => {
        return robots.find(robot => robot.id === robotId);
    }, [robots]); // Depends on robots
    
    // 4. Compose Context.Provider - shares composed state
    return (
        <RobotStateContext.Provider value={{ robots, updateRobotStatus, getRobot }}>
            {children}
        </RobotStateContext.Provider>
    );
};
```

**Composition Breakdown:**

1. **`useState`** → Manages the robots array state
2. **`useCallback`** (x2) → Memoizes functions to prevent unnecessary re-renders
3. **`Context.Provider`** → Shares the composed state with child components

Together, these built-in hooks compose a complete state management solution.

#### The Custom Hook: Composing useContext

The `useRobotState` hook composes `useContext` to access the composed state:

```typescript
// From src/context/RobotStateContext.tsx
export const useRobotState = () => {
    // Compose useContext - accesses the context value
    const context = useContext(RobotStateContext);
    
    // Error handling if used outside provider
    if (!context) {
        throw new Error('useRobotState must be used within a RobotStateProvider');
    }
    
    // Return the composed state (robots, updateRobotStatus, getRobot)
    return context;
};
```

**What This Composes:**

- **`useContext`** → Accesses the context value created by the provider
- **Error handling** → Ensures hook is used correctly
- **Type safety** → Returns properly typed context value

#### Complete Composition Flow

```
Built-in Hooks (React)
    ↓
    ├─ useState → manages state
    ├─ useCallback → memoizes functions
    └─ useContext → accesses context
    ↓
Composed in RobotStateProvider
    ↓
    ├─ robots (from useState)
    ├─ updateRobotStatus (from useCallback)
    └─ getRobot (from useCallback)
    ↓
Exposed via Context.Provider
    ↓
Accessed via useRobotState (composes useContext)
    ↓
Used in Components
```

#### Why This is Composition

**1. Building Complex from Simple:**
- Simple: `useState` manages one piece of state
- Simple: `useCallback` memoizes one function
- Complex: Together they create a state management system

**2. Separation of Concerns:**
- `useState` → State management
- `useCallback` → Performance optimization
- `useContext` → State sharing
- Each hook has one job

**3. Reusability:**
- The composed `useRobotState` can be used in any component
- Components don't need to know about `useState` or `useCallback`
- They just call `useRobotState()` and get everything they need

**4. Abstraction:**
- Components don't see the internal implementation
- They get a clean API: `{ robots, updateRobotStatus, getRobot }`
- The complexity is hidden inside the hook

#### Real Usage Example

```typescript
// Component uses the composed hook
const RobotDetailPage = () => {
    // This single hook call composes:
    // - useState (for robots array)
    // - useCallback (for updateRobotStatus and getRobot)
    // - useContext (to access the context)
    const { robots, updateRobotStatus, getRobot } = useRobotState();
    
    // Component doesn't need to know about:
    // - How state is stored (useState)
    // - How functions are memoized (useCallback)
    // - How context works (useContext)
    // It just uses the composed API
};
```

**Interview Talking Points:**

- **"`useRobotState` demonstrates composition because it's built by composing `useState`, `useCallback`, and `useContext`"**
- **"The provider composes built-in hooks to create state management, and the custom hook composes `useContext` to access it"**
- **"This abstraction means components don't need to know about the internal implementation - they just use the composed API"**
- **"Composition allows us to build complex functionality (state management) from simple pieces (built-in hooks)"**

**3. Material UI Composition:**
```typescript
<Paper>
    <Typography>Title</Typography>
    <Table>
        <TableBody>
            <TableRow>...</TableRow>
        </TableBody>
    </Table>
</Paper>
```

### Benefits of Composition

1. **Reusability**: Components can be reused across pages
2. **Testability**: Smaller components are easier to test
3. **Maintainability**: Changes to one component don't affect others
4. **Readability**: Clear separation of concerns

### Composition vs. Inheritance

**Composition (React):**
- Build complex components from simple ones
- Use props to pass data and behavior
- More flexible and easier to test

**Inheritance (OOP):**
- Extend classes to add functionality
- Less flexible, harder to test
- Not used in React (except for Error Boundaries)

### Interview Questions

**Q: How does composition work in React?**
A: Build complex components by combining simpler ones. Pass data via props, use children for layout, and compose hooks for logic.

**Q: Why is composition preferred over inheritance in React?**
A: More flexible, easier to test, and clearer data flow. Inheritance creates tight coupling; composition is loose.

**Q: Give an example of composition in your project.**
A: `FleetOverviewPage` composes `RobotTableRow` components. Each row is reusable and testable independently. We also compose hooks: `useRobotState` for shared robot data, `useTelemetry` for real-time WebSocket updates, and `useRobotControls` for control actions. In `RobotDetailPage`, we compose all three hooks together—the context hook provides static data, the telemetry hook provides real-time updates, and the controls hook handles user actions. This separation makes each piece testable and reusable.

**Q: How does hooks composition work?**
A: Hooks composition is combining multiple custom hooks in a component. Each hook handles one concern—like `useTelemetry` for WebSocket connections, `useRobotControls` for actions, and `useRobotState` for shared data. The component orchestrates them, combining their return values. This pattern provides separation of concerns, reusability, and testability. For example, `RobotDetailPage` composes router hooks (`useParams`, `useNavigate`), context hooks (`useRobotState`), telemetry hooks (`useTelemetry`), and control hooks (`useRobotControls`) to build the complete functionality.

---

## Frontend Performance Techniques

Performance optimization is critical for real-time applications like the Robot Operations Console. This section covers techniques to improve rendering, reduce bundle size, optimize data handling, and measure performance.

### Performance Optimization Philosophy

**Key Principles:**
1. **Measure First**: Use profiling tools to identify actual bottlenecks
2. **Optimize Incrementally**: Fix one issue at a time and measure impact
3. **Avoid Premature Optimization**: Don't optimize code that isn't a problem
4. **Consider Trade-offs**: Every optimization has costs (complexity, memory, etc.)

**When to Optimize:**
- User reports slowness or lag
- Profiling shows bottlenecks
- Bundle size is too large
- Memory leaks detected
- Re-renders are excessive

---

### React Rendering Optimizations

#### What is a Memoized Component?

**Definition:**

A **memoized component** is a React component wrapped with `React.memo()` that only re-renders when its props actually change. It "remembers" the previous render result and reuses it if props are the same.

**Think of it like this:**
- **Normal component**: Re-renders every time the parent re-renders (even if props didn't change)
- **Memoized component**: "Smart" component that checks if props changed before re-rendering

**Simple Analogy:**

Imagine you're a chef making the same dish:
- **Normal component**: You remake the dish every time, even if the order is identical
- **Memoized component**: You check if the order is the same as last time, and if so, you reuse the previous dish

**Basic Example:**

```typescript
// Normal component - re-renders every time parent renders
const RobotCard = ({ robot }) => {
    console.log('RobotCard rendering'); // Logs every time parent renders
    return <div>{robot.name}</div>;
};

// Memoized component - only re-renders if props change
const RobotCard = React.memo(({ robot }) => {
    console.log('RobotCard rendering'); // Only logs when robot prop changes
    return <div>{robot.name}</div>;
});
```

**How React.memo Works:**

1. **First Render**: Component renders normally
2. **Parent Re-renders**: React.memo compares new props with previous props
3. **Props Same?** → Skip re-render, reuse previous result ✅
4. **Props Different?** → Re-render component ❌

**What "Shallow Comparison" Means:**

React.memo does a **shallow comparison** of props:

```typescript
// Shallow comparison checks:
prevProps.robot === nextProps.robot  // Same object reference?
prevProps.onSelect === nextProps.onSelect  // Same function reference?

// If all props are the same (by reference), skip re-render
// If any prop is different, re-render
```

**Important:** It compares **references**, not values:

```typescript
// These are considered DIFFERENT (different object references):
const robot1 = { id: '1', name: 'Robot 1' };
const robot2 = { id: '1', name: 'Robot 1' }; // Same values, but new object

// These are considered SAME (same object reference):
const robot = { id: '1', name: 'Robot 1' };
// Using same robot object
```

**Visual Example:**

```typescript
// Parent component
const RobotList = ({ robots }) => {
    const [selected, setSelected] = useState(null);
    
    return (
        <div>
            <button onClick={() => setSelected('something')}>
                Select
            </button>
            {robots.map(robot => (
                <RobotCard key={robot.id} robot={robot} />
            ))}
        </div>
    );
};

// Without React.memo:
// - User clicks button → selected state changes
// - RobotList re-renders
// - All RobotCard components re-render (even though robot props didn't change) ❌

// With React.memo:
// - User clicks button → selected state changes
// - RobotList re-renders
// - React.memo checks: robot prop hasn't changed
// - RobotCard components skip re-render ✅
```

**When to Use Memoized Components:**

✅ **Use React.memo when:**
- Component renders frequently with same props
- Component is expensive to render (complex calculations, many children)
- Parent re-renders often but props don't change
- Component is in a list and parent state changes affect other items

❌ **Don't use React.memo when:**
- Component always receives new props (memo won't help)
- Component is cheap to render (overhead not worth it)
- Props are objects/arrays recreated every render (memo won't help)
- You haven't measured performance issues

**Example: When Memoization Helps**

```typescript
// Parent re-renders frequently (e.g., every 100ms from WebSocket)
const FleetOverviewPage = () => {
    const [selectedId, setSelectedId] = useState(null);
    const { robots } = useTelemetry(); // Updates frequently
    
    return (
        <div>
            {robots.map(robot => (
                <RobotCard 
                    key={robot.id} 
                    robot={robot}  // robot object reference stays same
                    isSelected={robot.id === selectedId}
                />
            ))}
        </div>
    );
};

// Memoized - only re-renders when robot or isSelected changes
const RobotCard = React.memo(({ robot, isSelected }) => {
    // Expensive rendering logic
    return <ComplexRobotDisplay robot={robot} selected={isSelected} />;
});
```

**Example: When Memoization Doesn't Help**

```typescript
// Parent always creates new objects
const RobotList = ({ robots }) => {
    return robots.map(robot => (
        <RobotCard 
            key={robot.id}
            robot={{ ...robot, timestamp: Date.now() }}  // New object every render!
        />
    ));
};

// Memoization won't help - robot prop is always a new object
const RobotCard = React.memo(({ robot }) => {
    return <div>{robot.name}</div>;
});
// React.memo sees: prevProps.robot !== nextProps.robot (different references)
// So it re-renders anyway - memoization is useless here
```

**Custom Comparison Function:**

You can provide a custom comparison function for more control:

```typescript
const RobotCard = React.memo(({ robot, onSelect }) => {
    return <div onClick={() => onSelect(robot.id)}>{robot.name}</div>;
}, (prevProps, nextProps) => {
    // Custom comparison - return true if props are equal (skip re-render)
    // Return false if props are different (re-render)
    
    // Only compare what matters
    return prevProps.robot.id === nextProps.robot.id &&
           prevProps.robot.status === nextProps.robot.status;
    // Ignore other changes (like robot.name if it doesn't affect rendering)
});
```

**Common Misconceptions:**

1. **"Memoization prevents ALL re-renders"** ❌
   - No, it only prevents re-renders when props are the same
   - Component still re-renders if props change or state changes

2. **"I should memoize everything"** ❌
   - No, memoization has overhead (comparison cost)
   - Only use when you've measured a performance benefit

3. **"Memoization works with new objects"** ❌
   - No, shallow comparison checks references
   - New objects = different references = re-render anyway

4. **"Memoization is the same as useMemo"** ❌
   - `React.memo` memoizes component renders
   - `useMemo` memoizes computed values
   - Different purposes

**Summary:**

- **Memoized component** = Component wrapped with `React.memo()`
- **Purpose** = Skip re-renders when props haven't changed
- **How it works** = Shallow comparison of prop references
- **When to use** = Expensive components with stable props
- **Key requirement** = Props must have stable references (use `useCallback`, `useMemo`)

#### 1. React.memo - Prevent Unnecessary Re-renders

**What it does:**
Prevents a component from re-rendering if its props haven't changed (shallow comparison).

**When to use:**
- Component renders frequently with same props
- Component is expensive to render
- Parent re-renders often but props don't change

**Example:**
```typescript
// Without memo - re-renders every time parent updates
const RobotCard = ({ robot, onSelect }) => {
    return (
        <div onClick={() => onSelect(robot.id)}>
            <h3>{robot.name}</h3>
            <StatusIndicator status={robot.status} />
        </div>
    );
};

// With memo - only re-renders if robot or onSelect changes
const RobotCard = React.memo(({ robot, onSelect }) => {
    return (
        <div onClick={() => onSelect(robot.id)}>
            <h3>{robot.name}</h3>
            <StatusIndicator status={robot.status} />
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function (optional)
    return prevProps.robot.id === nextProps.robot.id &&
           prevProps.robot.status === nextProps.robot.status;
});
```

**Interview Talking Points:**
- `React.memo` does shallow comparison by default
- Use custom comparison function for deep equality checks
- Only helps if parent re-renders frequently
- Don't wrap every component - measure first

#### 2. useMemo - Memoize Expensive Calculations

**What it does:**
Memoizes the result of an expensive computation, recalculating only when dependencies change.

**When to use:**
- Expensive calculations (filtering, sorting, aggregations)
- Derived data that depends on other state
- Preventing object/array recreation in dependencies

**Example:**
```typescript
// Without useMemo - recalculates on every render
const RobotList = ({ robots, filter, sortBy }) => {
    const filtered = robots.filter(r => r.name.includes(filter));
    const sorted = filtered.sort((a, b) => {
        if (sortBy === 'battery') return b.battery - a.battery;
        return a.name.localeCompare(b.name);
    });
    
    return <div>{sorted.map(r => <RobotCard key={r.id} robot={r} />)}</div>;
};

// With useMemo - only recalculates when robots, filter, or sortBy changes
const RobotList = ({ robots, filter, sortBy }) => {
    const sorted = useMemo(() => {
        const filtered = robots.filter(r => r.name.includes(filter));
        return filtered.sort((a, b) => {
            if (sortBy === 'battery') return b.battery - a.battery;
            return a.name.localeCompare(b.name);
        });
    }, [robots, filter, sortBy]);
    
    return <div>{sorted.map(r => <RobotCard key={r.id} robot={r} />)}</div>;
};
```

**Common Pitfalls:**
- Memoizing values that are cheap to compute
- Missing dependencies (causes stale closures)
- Memoizing objects/arrays that are recreated anyway

**Interview Talking Points:**
- `useMemo` is for expensive computations, not for every calculation
- Always include all dependencies in the dependency array
- If the computation is cheap, `useMemo` overhead might be worse

#### 3. useCallback - Memoize Functions

**What it does:**
Returns a memoized version of a callback function that only changes when dependencies change.

**When to use:**
- Functions passed as props to memoized components
- Functions used as dependencies in other hooks
- Event handlers that are recreated on every render

**Example:**
```typescript
// Without useCallback - new function on every render
const RobotList = ({ robots }) => {
    const [selected, setSelected] = useState(new Set());
    
    const handleSelect = (robotId) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(robotId)) {
                next.delete(robotId);
            } else {
                next.add(robotId);
            }
            return next;
        });
    };
    
    // handleSelect is recreated every render, causing RobotCard to re-render
    return robots.map(robot => (
        <RobotCard 
            key={robot.id} 
            robot={robot} 
            onSelect={handleSelect}  // New function reference
        />
    ));
};

// With useCallback - same function reference unless dependencies change
const RobotList = ({ robots }) => {
    const [selected, setSelected] = useState(new Set());
    
    const handleSelect = useCallback((robotId) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(robotId)) {
                next.delete(robotId);
            } else {
                next.add(robotId);
            }
            return next;
        });
    }, []); // Empty deps - function never changes
    
    return robots.map(robot => (
        <RobotCard 
            key={robot.id} 
            robot={robot} 
            onSelect={handleSelect}  // Stable function reference
        />
    ));
};
```

**Interview Talking Points:**
- `useCallback` prevents function recreation, helping `React.memo` work
- Only useful if the function is passed to a memoized component
- Use functional updates (`setState(prev => ...)`) to avoid dependencies

### Deep Dive: useCallback, React.memo, and Functional Updates

#### 1. How useCallback Prevents Function Recreation

**The Problem: Function Recreation**

Every time a component re-renders, functions defined inside it are recreated:

```typescript
// BAD - Function recreated on every render
const RobotList = ({ robots }) => {
    const [selected, setSelected] = useState(new Set());
    
    // This function is recreated every time RobotList renders
    const handleSelect = (robotId) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(robotId)) {
                next.delete(robotId);
            } else {
                next.add(robotId);
            }
            return next;
        });
    };
    
    return robots.map(robot => (
        <RobotCard 
            key={robot.id} 
            robot={robot} 
            onSelect={handleSelect}  // New function reference every render
        />
    ));
};
```

**Why This Matters:**

Even if `robot` hasn't changed, `RobotCard` receives a new `onSelect` function reference. If `RobotCard` is memoized with `React.memo`, it will still re-render because the prop reference changed.

**The Solution: useCallback**

```typescript
// GOOD - Function reference stays the same
const RobotList = ({ robots }) => {
    const [selected, setSelected] = useState(new Set());
    
    // Function reference only changes if dependencies change
    const handleSelect = useCallback((robotId) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(robotId)) {
                next.delete(robotId);
            } else {
                next.add(robotId);
            }
            return next;
        });
    }, []); // Empty deps - function never changes
    
    return robots.map(robot => (
        <RobotCard 
            key={robot.id} 
            robot={robot} 
            onSelect={handleSelect}  // Same function reference
        />
    ));
};
```

**How It Works:**

1. First render: `useCallback` creates the function and stores it
2. Subsequent renders: `useCallback` returns the same function reference (if deps unchanged)
3. `React.memo` sees the same function reference → skips re-render

#### 2. How useCallback Helps React.memo Work

**React.memo Comparison:**

`React.memo` does a **shallow comparison** of props:

```typescript
// React.memo internally does something like:
if (prevProps.robot === nextProps.robot && 
    prevProps.onSelect === nextProps.onSelect) {
    // Props are the same, skip re-render
    return prevComponentInstance;
}
// Props changed, re-render
```

**The Problem Without useCallback:**

```typescript
// Parent component
const RobotList = ({ robots }) => {
    // handleSelect is recreated every render
    const handleSelect = (robotId) => { /* ... */ };
    
    return robots.map(robot => (
        <RobotCard 
            robot={robot} 
            onSelect={handleSelect}  // New reference every time
        />
    ));
};

// Child component (memoized)
const RobotCard = React.memo(({ robot, onSelect }) => {
    return <div onClick={() => onSelect(robot.id)}>{robot.name}</div>;
});
```

**What Happens:**

1. Parent renders → creates new `handleSelect` function
2. Parent passes new `handleSelect` to `RobotCard`
3. `React.memo` compares: `prevProps.onSelect !== nextProps.onSelect` (different references!)
4. `React.memo` says "props changed" → re-renders `RobotCard` ❌

**The Solution With useCallback:**

```typescript
// Parent component
const RobotList = ({ robots }) => {
    // handleSelect reference stays the same
    const handleSelect = useCallback((robotId) => { /* ... */ }, []);
    
    return robots.map(robot => (
        <RobotCard 
            robot={robot} 
            onSelect={handleSelect}  // Same reference
        />
    ));
};

// Child component (memoized)
const RobotCard = React.memo(({ robot, onSelect }) => {
    return <div onClick={() => onSelect(robot.id)}>{robot.name}</div>;
});
```

**What Happens:**

1. Parent renders → `useCallback` returns same `handleSelect` reference
2. Parent passes same `handleSelect` to `RobotCard`
3. `React.memo` compares: `prevProps.onSelect === nextProps.onSelect` (same reference!)
4. `React.memo` says "props unchanged" → skips re-render ✅

**Visual Example:**

```typescript
// Render 1
const handleSelect1 = useCallback(() => {}, []); // Creates function A
<RobotCard onSelect={handleSelect1} /> // Reference: A

// Render 2 (parent re-renders, but deps unchanged)
const handleSelect2 = useCallback(() => {}, []); // Returns same function A
<RobotCard onSelect={handleSelect2} /> // Reference: A (same!)

// React.memo sees: A === A → skip re-render ✅

// Without useCallback:
// Render 1
const handleSelect1 = () => {}; // Creates function A
<RobotCard onSelect={handleSelect1} /> // Reference: A

// Render 2
const handleSelect2 = () => {}; // Creates function B (new!)
<RobotCard onSelect={handleSelect2} /> // Reference: B (different!)

// React.memo sees: A !== B → re-render ❌
```

#### 3. When useCallback is Actually Useful

**Important: useCallback is only useful in specific scenarios**

**Scenario 1: Function Passed to Memoized Component** ✅

```typescript
// GOOD - useCallback helps here
const RobotList = ({ robots }) => {
    const handleSelect = useCallback((id) => {
        // ...
    }, []);
    
    return robots.map(robot => (
        <RobotCard 
            robot={robot} 
            onSelect={handleSelect}  // Passed to memoized component
        />
    ));
};

const RobotCard = React.memo(({ robot, onSelect }) => {
    // Memoized - useCallback prevents unnecessary re-renders
});
```

**Scenario 2: Function Used as Dependency in Other Hooks** ✅

```typescript
// GOOD - useCallback helps here
const RobotList = ({ robots }) => {
    const handleSelect = useCallback((id) => {
        // ...
    }, [robots]); // Depends on robots
    
    useEffect(() => {
        // Some effect that uses handleSelect
        console.log('handleSelect changed');
    }, [handleSelect]); // handleSelect is a dependency
    // Without useCallback, this effect would run on every render
};
```

**Scenario 3: Function Not Passed to Memoized Component** ❌

```typescript
// BAD - useCallback doesn't help here
const RobotList = ({ robots }) => {
    const handleSelect = useCallback((id) => {
        // ...
    }, []); // Unnecessary - RobotCard is not memoized
    
    return robots.map(robot => (
        <RobotCard 
            robot={robot} 
            onSelect={handleSelect}  // RobotCard will re-render anyway
        />
    ));
};

const RobotCard = ({ robot, onSelect }) => {
    // Not memoized - will re-render when parent re-renders
    // useCallback doesn't help here
};
```

**When NOT to Use useCallback:**

1. **Function not passed as prop** - If the function is only used locally
2. **Child component not memoized** - If `RobotCard` isn't wrapped in `React.memo`
3. **Dependencies change frequently** - If deps change often, `useCallback` recreates anyway
4. **Simple functions** - The overhead of `useCallback` might be worse than just recreating

**Example of Unnecessary useCallback:**

```typescript
// BAD - Unnecessary useCallback
const RobotList = ({ robots }) => {
    const handleClick = useCallback(() => {
        console.log('Clicked'); // Simple function, no dependencies
    }, []);
    
    // handleClick is only used locally, not passed to memoized component
    return (
        <div onClick={handleClick}>
            {robots.map(robot => <RobotCard key={robot.id} robot={robot} />)}
        </div>
    );
};
// RobotCard is not memoized, so useCallback doesn't help
```

#### 4. Functional Updates to Avoid Dependencies

**The Problem: Dependencies in useCallback**

Sometimes you need to use state or props in your callback, which requires adding them as dependencies:

```typescript
// BAD - Requires 'count' in dependencies
const Counter = () => {
    const [count, setCount] = useState(0);
    
    const increment = useCallback(() => {
        setCount(count + 1); // Uses 'count' - must be in deps
    }, [count]); // Recreates every time count changes
    
    return <button onClick={increment}>Count: {count}</button>;
};
```

**Problem:** Every time `count` changes, `increment` is recreated, which defeats the purpose of `useCallback` if you're trying to keep a stable reference.

**The Solution: Functional Updates**

```typescript
// GOOD - No dependencies needed
const Counter = () => {
    const [count, setCount] = useState(0);
    
    const increment = useCallback(() => {
        setCount(prevCount => prevCount + 1); // Functional update
    }, []); // Empty deps - function never changes!
    
    return <button onClick={increment}>Count: {count}</button>;
};
```

**How Functional Updates Work:**

```typescript
// Instead of:
setCount(count + 1); // Uses current 'count' value

// Use:
setCount(prevCount => prevCount + 1); // React passes current value
```

React calls your function with the current state value, so you don't need to capture it in the closure.

**Real Example from This Project:**

```typescript
// From RobotStateContext.tsx
export const RobotStateProvider = ({ children, initialRobots }) => {
    const [robots, setRobots] = useState<RobotDetail[]>(initialRobots);
    
    // GOOD - Functional update avoids 'robots' dependency
    const updateRobotStatus = useCallback((robotId: string, newStatus: RobotStatus) => {
        setRobots(prevRobots =>  // React passes current robots
            prevRobots.map(robot =>
                robot.id === robotId ? { ...robot, status: newStatus } : robot
            )
        );
    }, []); // Empty deps - function never changes!
    
    // If we used robots directly, we'd need:
    // }, [robots]); // Would recreate every time robots changes
};
```

**Benefits of Functional Updates:**

1. **Stable Function Reference**: Empty dependency array means function never changes
2. **Always Current Value**: React ensures you get the latest state
3. **Better Performance**: Fewer function recreations
4. **Avoids Stale Closures**: No risk of using old state values

**When to Use Functional Updates:**

✅ **Use functional updates when:**
- Updating state based on previous state
- Want to avoid dependencies in `useCallback`
- Need stable function references for `React.memo`

❌ **Don't use functional updates when:**
- Setting state to a specific value (not based on previous)
- Need to use other values (props, other state) in the update

**Example: When NOT to Use Functional Update**

```typescript
// BAD - Functional update not appropriate here
const RobotCard = ({ robot, onUpdate }) => {
    const [status, setStatus] = useState(robot.status);
    
    const handleUpdate = useCallback(() => {
        // We need 'robot' prop, can't use functional update
        setStatus(robot.status); // Setting to specific value
        onUpdate(robot.id, robot.status); // Uses 'robot' prop
    }, [robot, onUpdate]); // Must include dependencies
};
```

**Summary:**

1. **useCallback prevents function recreation** → Same function reference across renders
2. **Helps React.memo work** → Memoized components see same prop references
3. **Only useful when** → Function passed to memoized component or used as hook dependency
4. **Functional updates** → Avoid dependencies by using `setState(prev => ...)` pattern
5. **Result** → Stable function references, fewer re-renders, better performance

**Interview Talking Points:**

- **"useCallback prevents function recreation by returning the same function reference when dependencies don't change"**
- **"This helps React.memo work because memoized components compare prop references - same reference means skip re-render"**
- **"useCallback is only useful if the function is passed to a memoized component or used as a dependency in other hooks"**
- **"Functional updates (setState(prev => ...)) let us avoid dependencies in useCallback, keeping function references stable"**
- **"In RobotStateContext, we use functional updates in updateRobotStatus so the function never needs to be recreated"**

#### 4. Virtualization - Render Only Visible Items

**What it does:**
Only renders components that are currently visible in the viewport, dramatically reducing DOM nodes.

**When to use:**
- Large lists (100+ items)
- Tables with many rows
- Long scrollable content

**Example with react-window:**
```typescript
import { FixedSizeList } from 'react-window';

// Without virtualization - renders all 1000 robots
const RobotList = ({ robots }) => {
    return (
        <div style={{ height: '600px', overflow: 'auto' }}>
            {robots.map(robot => (
                <RobotCard key={robot.id} robot={robot} />
            ))}
        </div>
    );
};

// With virtualization - only renders ~20 visible items
import { FixedSizeList } from 'react-window';

const RobotList = ({ robots }) => {
    const Row = ({ index, style }) => (
        <div style={style}>
            <RobotCard robot={robots[index]} />
        </div>
    );
    
    return (
        <FixedSizeList
            height={600}
            itemCount={robots.length}
            itemSize={100}
            width="100%"
        >
            {Row}
        </FixedSizeList>
    );
};
```

**Benefits:**
- Reduces initial render time
- Lower memory usage
- Smooth scrolling even with thousands of items

**Libraries:**
- `react-window` - Lightweight, simple API
- `react-virtualized` - More features, larger bundle

**Interview Talking Points:**
- Essential for lists with 100+ items
- Works by measuring container height and calculating visible range
- Only renders items in viewport + small buffer

---

### State Management Optimizations

#### 1. Split Contexts to Reduce Re-renders

**Problem:**
Single large context causes all consumers to re-render when any value changes.

**Solution:**
Split contexts by concern or update frequency.

**Example:**
```typescript
// BAD - All consumers re-render when any value changes
const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [robots, setRobots] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [theme, setTheme] = useState('light');
    
    return (
        <AppContext.Provider value={{ robots, selectedId, theme, setSelectedId, setTheme }}>
            {children}
        </AppContext.Provider>
    );
};

// GOOD - Split by update frequency
const RobotDataContext = createContext();
const RobotSelectionContext = createContext();
const ThemeContext = createContext();

const AppProvider = ({ children }) => {
    const [robots, setRobots] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [theme, setTheme] = useState('light');
    
    return (
        <RobotDataContext.Provider value={robots}>
            <RobotSelectionContext.Provider value={{ selectedId, setSelectedId }}>
                <ThemeContext.Provider value={{ theme, setTheme }}>
                    {children}
                </ThemeContext.Provider>
            </RobotSelectionContext.Provider>
        </RobotDataContext.Provider>
    );
};
```

**Interview Talking Points:**
- Split contexts by update frequency (frequent vs. infrequent)
- Split by concern (data vs. UI state)
- Each context should have a single responsibility

#### 2. Normalize State Structure

**Problem:**
Nested arrays make updates expensive (need to find and update item).

**Solution:**
Use normalized structure (Map or object with IDs as keys).

**Example:**
```typescript
// BAD - Array structure, O(n) to find/update
const [robots, setRobots] = useState([
    { id: '1', name: 'Robot 1', status: 'active' },
    { id: '2', name: 'Robot 2', status: 'idle' },
]);

const updateRobot = (id, updates) => {
    setRobots(robots.map(r => 
        r.id === id ? { ...r, ...updates } : r
    )); // O(n) operation
};

// GOOD - Normalized Map structure, O(1) lookup
const [robots, setRobots] = useState(new Map([
    ['1', { id: '1', name: 'Robot 1', status: 'active' }],
    ['2', { id: '2', name: 'Robot 2', status: 'idle' }],
]));

const updateRobot = (id, updates) => {
    setRobots(prev => {
        const next = new Map(prev);
        const robot = next.get(id);
        if (robot) {
            next.set(id, { ...robot, ...updates });
        }
        return next;
    }); // O(1) operation
};
```

**Benefits:**
- O(1) lookup instead of O(n)
- Easier to update single items
- Better for large datasets

---

### Bundle Size Optimizations

#### 1. Code Splitting with React.lazy

**What it does:**
Lazy loads components, splitting them into separate chunks loaded on demand.

**When to use:**
- Large components not needed immediately
- Route-based code splitting
- Heavy third-party libraries

**Example:**
```typescript
// Without code splitting - all code in initial bundle
import RobotDetailPage from './pages/RobotDetailPage';
import FleetOverviewPage from './pages/FleetOverviewPage';

// With code splitting - pages loaded on demand
const RobotDetailPage = React.lazy(() => import('./pages/RobotDetailPage'));
const FleetOverviewPage = React.lazy(() => import('./pages/FleetOverviewPage'));

function App() {
    return (
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/robot/:id" element={<RobotDetailPage />} />
                    <Route path="/" element={<FleetOverviewPage />} />
                </Routes>
            </Suspense>
        </Router>
    );
}
```

**Benefits:**
- Smaller initial bundle
- Faster initial load time
- Load code only when needed

**Interview Talking Points:**
- Use `React.lazy` for route-based splitting
- Always wrap with `Suspense` for loading states
- Consider preloading critical routes

#### 2. Tree Shaking

**What it does:**
Removes unused code from the bundle during build.

**How to enable:**
- Use ES modules (import/export)
- Configure bundler (Vite, Webpack) for tree shaking
- Import specific functions, not entire modules

**Example:**
```typescript
// BAD - Imports entire library
import _ from 'lodash';
const filtered = _.filter(robots, r => r.status === 'active');

// GOOD - Imports only needed function
import filter from 'lodash/filter';
const filtered = filter(robots, r => r.status === 'active');

// BEST - Use native or smaller alternatives
const filtered = robots.filter(r => r.status === 'active');
```

**Interview Talking Points:**
- Modern bundlers (Vite, Webpack 5) tree shake by default
- Use ES modules, not CommonJS
- Prefer smaller, focused libraries

#### 3. Dynamic Imports

**What it does:**
Loads modules at runtime instead of build time.

**Example:**
```typescript
// Load heavy library only when needed
const handleExport = async () => {
    const { exportToPDF } = await import('./utils/pdfExporter');
    exportToPDF(robots);
};

// Load component on user interaction
const handleShowChart = async () => {
    const Chart = (await import('./components/Chart')).default;
    setChartComponent(<Chart data={telemetry} />);
};
```

---

### Network Optimizations

#### 1. Debouncing and Throttling

**Debouncing:**
Delays function execution until after a period of inactivity.

**Use cases:**
- Search input
- Resize handlers
- Scroll events

**Example:**
```typescript
// Debounced search - only searches after user stops typing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => clearTimeout(handler);
    }, [value, delay]);
    
    return debouncedValue;
};

const SearchInput = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    
    useEffect(() => {
        onSearch(debouncedQuery);
    }, [debouncedQuery, onSearch]);
    
    return <input value={query} onChange={e => setQuery(e.target.value)} />;
};
```

**Throttling:**
Limits function execution to at most once per time period.

**Use cases:**
- Scroll handlers
- Mouse move events
- Window resize

**Example:**
```typescript
// Throttled scroll handler
const useThrottle = (callback, delay) => {
    const lastRun = useRef(Date.now());
    
    return useCallback((...args) => {
        if (Date.now() - lastRun.current >= delay) {
            callback(...args);
            lastRun.current = Date.now();
        }
    }, [callback, delay]);
};
```

#### 2. Request Deduplication

**Problem:**
Multiple components request the same data simultaneously.

**Solution:**
Cache in-flight requests, return the same promise.

**Example:**
```typescript
const requestCache = new Map();

const fetchRobot = async (robotId) => {
    // Check if request is already in flight
    if (requestCache.has(robotId)) {
        return requestCache.get(robotId);
    }
    
    // Create new request
    const promise = fetch(`/api/robots/${robotId}`)
        .then(res => res.json())
        .finally(() => {
            // Remove from cache after completion
            requestCache.delete(robotId);
        });
    
    requestCache.set(robotId, promise);
    return promise;
};
```

#### 3. Request Batching

**Problem:**
Multiple small requests create overhead.

**Solution:**
Batch multiple requests into a single request.

**Example:**
```typescript
// Instead of 10 separate requests
robots.forEach(robot => fetch(`/api/robots/${robot.id}/status`));

// Batch into single request
const batchRequest = async (robotIds) => {
    const response = await fetch('/api/robots/batch-status', {
        method: 'POST',
        body: JSON.stringify({ robotIds }),
    });
    return response.json();
};
```

---

### Real-Time Data Optimizations

#### 1. Throttle WebSocket Updates

**Problem:**
WebSocket sends updates faster than UI can render.

**Solution:**
Throttle updates to reasonable rate (e.g., 10 updates/second).

**Example:**
```typescript
const useThrottledTelemetry = (telemetry, throttleMs = 100) => {
    const [throttled, setThrottled] = useState(telemetry);
    const lastUpdate = useRef(Date.now());
    
    useEffect(() => {
        const now = Date.now();
        if (now - lastUpdate.current >= throttleMs) {
            setThrottled(telemetry);
            lastUpdate.current = now;
        } else {
            const timeout = setTimeout(() => {
                setThrottled(telemetry);
                lastUpdate.current = Date.now();
            }, throttleMs - (now - lastUpdate.current));
            
            return () => clearTimeout(timeout);
        }
    }, [telemetry, throttleMs]);
    
    return throttled;
};
```

#### 2. Batch State Updates

**Problem:**
Multiple rapid state updates cause multiple re-renders.

**Solution:**
Batch updates using functional updates or `unstable_batchedUpdates`.

**Example:**
```typescript
// BAD - Multiple re-renders
robots.forEach(robot => {
    updateRobotStatus(robot.id, robot.status); // Each call triggers re-render
});

// GOOD - Single re-render with batched update
setRobots(prevRobots => {
    const updates = new Map();
    robots.forEach(robot => {
        updates.set(robot.id, robot.status);
    });
    
    const next = new Map(prevRobots);
    updates.forEach((status, id) => {
        const robot = next.get(id);
        if (robot) {
            next.set(id, { ...robot, status });
        }
    });
    return next;
});
```

#### 3. Selective Updates

**Problem:**
Updating all robots when only one changes.

**Solution:**
Only update the specific robot that changed.

**Example:**
```typescript
// BAD - Updates entire robots array
const handleTelemetryUpdate = (update) => {
    setRobots(robots.map(robot =>
        robot.id === update.robotId
            ? { ...robot, ...update }
            : robot
    ));
};

// GOOD - Only updates specific robot using normalized structure
const handleTelemetryUpdate = (update) => {
    setRobots(prev => {
        const next = new Map(prev);
        const robot = next.get(update.robotId);
        if (robot) {
            next.set(update.robotId, { ...robot, ...update });
        }
        return next;
    });
};
```

---

### Memory Management

#### 1. Cleanup Event Listeners

**Always clean up:**
- Event listeners
- Subscriptions
- Timers
- WebSocket connections

**Example:**
```typescript
useEffect(() => {
    const handleResize = () => {
        // Update layout
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
        window.removeEventListener('resize', handleResize);
    };
}, []);
```

#### 2. Avoid Memory Leaks in Closures

**Problem:**
Closures hold references to large objects.

**Solution:**
Clear references when done, use refs for mutable values.

**Example:**
```typescript
// BAD - Closure holds reference
useEffect(() => {
    const largeData = fetchLargeDataset();
    setTimeout(() => {
        processData(largeData); // largeData kept in memory
    }, 5000);
}, []);

// GOOD - Clear reference
useEffect(() => {
    let largeData = fetchLargeDataset();
    const timeout = setTimeout(() => {
        processData(largeData);
        largeData = null; // Clear reference
    }, 5000);
    
    return () => {
        clearTimeout(timeout);
        largeData = null;
    };
}, []);
```

#### 3. Limit History/Log Size

**Problem:**
Unbounded arrays grow indefinitely.

**Solution:**
Limit array size, remove old entries.

**Example:**
```typescript
const MAX_HISTORY = 100;

const addToHistory = (entry) => {
    setHistory(prev => {
        const next = [...prev, entry];
        // Keep only last MAX_HISTORY entries
        return next.slice(-MAX_HISTORY);
    });
};
```

---

### Performance Measurement

#### 1. React DevTools Profiler

**How to use:**
1. Install React DevTools browser extension
2. Open Profiler tab
3. Click "Record"
4. Interact with app
5. Stop recording
6. Analyze flamegraph

**What to look for:**
- Components that render frequently
- Long render times
- Unnecessary re-renders
- Components that could be memoized

#### 2. Chrome DevTools Performance

**How to use:**
1. Open Chrome DevTools
2. Go to Performance tab
3. Click Record
4. Interact with app
5. Stop recording
6. Analyze timeline

**What to look for:**
- Long tasks (blocking main thread)
- Layout shifts
- Memory leaks (growing heap)
- Network requests

#### 3. Lighthouse

**What it measures:**
- Performance score
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

**How to use:**
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select categories
4. Click "Analyze page load"

#### 4. Bundle Analyzer

**Tools:**
- `vite-bundle-visualizer` for Vite
- `webpack-bundle-analyzer` for Webpack

**What it shows:**
- Bundle size breakdown
- Largest dependencies
- Duplicate dependencies
- Opportunities for code splitting

**Example:**
```bash
# Install
npm install --save-dev vite-bundle-visualizer

# Add to vite.config.ts
import { visualizer } from 'vite-bundle-visualizer';

export default {
  plugins: [
    visualizer({ open: true })
  ]
}
```

---

### Performance Checklist

Use this checklist when optimizing:

**Rendering:**
- [ ] Used `React.memo` for expensive components
- [ ] Used `useMemo` for expensive calculations
- [ ] Used `useCallback` for stable function references
- [ ] Implemented virtualization for large lists
- [ ] Split contexts to reduce re-renders
- [ ] Normalized state structure

**Bundle:**
- [ ] Implemented code splitting
- [ ] Removed unused dependencies
- [ ] Used tree shaking effectively
- [ ] Analyzed bundle size

**Network:**
- [ ] Debounced search inputs
- [ ] Throttled scroll/resize handlers
- [ ] Implemented request caching
- [ ] Batched multiple requests

**Memory:**
- [ ] Cleaned up event listeners
- [ ] Cleaned up subscriptions
- [ ] Cleaned up timers
- [ ] Limited array/object sizes
- [ ] Checked for memory leaks

**Measurement:**
- [ ] Profiled with React DevTools
- [ ] Checked Chrome Performance tab
- [ ] Ran Lighthouse audit
- [ ] Analyzed bundle size

---

### Interview Questions

**Q: What is a memoized component?**
A: A memoized component is wrapped with `React.memo()` and only re-renders when its props actually change. It does a shallow comparison of prop references - if props are the same, it reuses the previous render result. This prevents unnecessary re-renders when the parent updates but props haven't changed. It's useful for expensive components that receive stable props.

**Q: When would you use `React.memo`?**
A: When a component receives the same props frequently but the parent re-renders often. Measure first to confirm it helps. Not needed if props change every render. Also useful for components in lists where parent state changes affect other items, or expensive components that render frequently.

**Q: What's the difference between `useMemo` and `useCallback`?**
A: `useMemo` memoizes a value (result of computation), `useCallback` memoizes a function (function reference). Both prevent recreation when dependencies don't change.

**Q: How do you optimize a list with 1000 items?**
A: Use virtualization (react-window) to only render visible items. Also normalize state structure, memoize list items, and consider pagination or infinite scroll.

**Q: What causes unnecessary re-renders in React?**
A: New object/array references in props, context values changing, parent re-renders, missing memoization. Use React DevTools Profiler to identify.

**Q: How do you measure performance?**
A: React DevTools Profiler for component renders, Chrome Performance tab for runtime performance, Lighthouse for metrics, bundle analyzer for bundle size.

**Q: When should you optimize?**
A: After measuring and identifying bottlenecks. Don't optimize prematurely. Profile first, then optimize the actual problems.

---

## Other Interview Topics

### Test-Driven Development (TDD)

**What it is:**
Write tests before writing code. Red → Green → Refactor cycle.

**Benefits:**
- Forces you to think about API design first
- Ensures code is testable
- Catches regressions early

**Example from Project:**
- Wrote tests for `useTelemetry` hook first
- Tests defined the expected API
- Then implemented to make tests pass

### WebSocket vs. REST API

**WebSocket:**
- Real-time, bidirectional communication
- Used for live telemetry streaming
- Persistent connection

**REST API:**
- Request/response pattern
- Used for robot commands (start, stop)
- Stateless

**When to use each:**
- WebSocket: Real-time data (telemetry, chat, notifications)
- REST: Commands, CRUD operations, one-time requests


### Error Handling

**Patterns:**
- Try/catch for async operations
- Error boundaries for React components
- User-friendly error messages
- Logging for debugging

**Example:**
```typescript
try {
    await actionFn();
    setSnackbar({ open: true, message: 'Success', severity: 'success' });
} catch (error) {
    setSnackbar({ open: true, message: error.message, severity: 'error' });
}
```

### Code Organization

**Structure:**
```
src/
  components/     # Reusable UI components
  hooks/          # Custom hooks
  context/        # Context providers
  pages/          # Page components
  types/          # TypeScript types
  mock/           # Mock data
```

**Principles:**
- Group by feature or type (chose type for this project)
- Keep related files together
- Clear naming conventions

---

## Quick Reference: Key Concepts

| Concept | Key Point | Example |
|---------|-----------|---------|
| Custom Hooks | Extract reusable logic | `useTelemetry`, `useRobotControls` |
| Context API | Shared state without prop drilling | `RobotStateContext` |
| TypeScript | Type safety at compile-time | `RobotStatus` union type |
| Electron | Desktop apps with web tech | Main process + renderer process |
| Composition | Build complex from simple | Page → Components → Hooks |
| TDD | Tests before code | `useTelemetry.test.ts` |

---

## Practice Questions

1. **Explain how `useTelemetry` hook works.**
2. **Why did you choose Context API over Redux?**
3. **How does TypeScript help in safety-critical applications?**
4. **What security measures did you implement in Electron?**
5. **How does component composition improve maintainability?**
6. **Walk me through the data flow from WebSocket to UI.**
7. **How would you scale this app to handle 1000 robots?**
8. **What would you do differently if building this again?**

---

## Skill Assessments

These assessments help you verify your understanding through practical exercises. Try to complete them without looking at the codebase first, then compare your solutions.

### Assessment 1: Implement a Custom Hook

**Challenge**: Create a `useDebounce` hook that delays updating a value until the user stops typing.

**Requirements:**
- Takes a `value` and `delay` (in milliseconds) as parameters
- Returns the debounced value
- Should use `useState` and `useEffect`
- Should clean up the timeout on unmount

**Solution Template:**
```typescript
export const useDebounce = (value: string, delay: number) => {
    // Your implementation here
};
```

**Expected Usage:**
```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);
// debouncedSearch updates 300ms after user stops typing
```

**Check Your Solution:**
- Does it use `useState` to store the debounced value?
- Does it use `useEffect` with `value` and `delay` as dependencies?
- Does it clear the timeout in the cleanup function?
- Does it return the debounced value?

---

### Assessment 2: Fix TypeScript Errors

**Challenge**: Identify and fix the TypeScript errors in this code:

```typescript
interface Robot {
    id: string;
    status: "idle" | "active" | "charging" | "error";
    battery: number;
}

function updateRobotStatus(robotId: string, newStatus: string) {
    const robot = robots.find(r => r.id === robotId);
    if (robot) {
        robot.status = newStatus;  // Error 1
        robot.battery = "100%";     // Error 2
    }
}

function getRobotById(id: number): Robot {  // Error 3
    return robots.find(r => r.id === id);
}
```

**Issues to Fix:**
1. Type mismatch for `newStatus` parameter
2. Type mismatch for `battery` assignment
3. Type mismatch for `id` parameter

**Solution Checklist:**
- Change `newStatus` parameter type to `Robot["status"]`
- Change `battery` assignment to a number
- Change `id` parameter type to `string`
- Consider return type for `find()` (could be `undefined`)

---

### Assessment 3: Debug a WebSocket Hook

**Challenge**: Find the bugs in this `useTelemetry` implementation:

```typescript
export const useTelemetry = ({ url, autoConnect }) => {
    const [connected, setConnected] = useState(false);
    const [data, setData] = useState(null);
    
    useEffect(() => {
        if (autoConnect) {
            const ws = new WebSocket(url);
            
            ws.onopen = () => setConnected(true);
            ws.onmessage = (event) => setData(JSON.parse(event.data));
            ws.onerror = () => setConnected(false);
        }
    }, [url]);
    
    return { connected, data };
};
```

**Bugs to Find:**
1. Missing cleanup (WebSocket not closed on unmount)
2. Missing dependency in `useEffect` array
3. No error handling for `JSON.parse`
4. WebSocket reference not persisted (could create multiple connections)

**Solution Checklist:**
- Use `useRef` to store WebSocket instance
- Add cleanup function to close WebSocket
- Add `autoConnect` to dependency array
- Wrap `JSON.parse` in try/catch
- Return disconnect function

---

### Assessment 4: Optimize Context Re-renders

**Challenge**: This context causes unnecessary re-renders. Optimize it:

```typescript
const RobotContext = createContext();

export const RobotProvider = ({ children }) => {
    const [robots, setRobots] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    
    const updateRobot = (id, updates) => {
        setRobots(robots.map(r => 
            r.id === id ? { ...r, ...updates } : r
        ));
    };
    
    const getRobot = (id) => {
        return robots.find(r => r.id === id);
    };
    
    return (
        <RobotContext.Provider value={{
            robots,
            selectedId,
            setSelectedId,
            updateRobot,
            getRobot
        }}>
            {children}
        </RobotContext.Provider>
    );
};
```

**Optimization Tasks:**
1. Memoize the `updateRobot` function
2. Memoize the `getRobot` function
3. Split context if needed (robots vs. selectedId)
4. Memoize the context value object

**Solution Checklist:**
- Use `useCallback` for `updateRobot` and `getRobot`
- Use `useMemo` for the context value object
- Consider splitting into `RobotDataContext` and `RobotSelectionContext`

---

### Assessment 5: Component Composition Challenge

**Challenge**: Refactor this monolithic component using composition:

```typescript
const RobotDetailPage = ({ robotId }) => {
    const [robot, setRobot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [telemetry, setTelemetry] = useState(null);
    const [controls, setControls] = useState({ loading: false });
    
    useEffect(() => {
        fetch(`/api/robots/${robotId}`)
            .then(res => res.json())
            .then(data => {
                setRobot(data);
                setLoading(false);
            })
            .catch(err => setError(err));
    }, [robotId]);
    
    // ... 100+ more lines of logic
    
    return (
        <div>
            {/* Complex JSX with all logic inline */}
        </div>
    );
};
```

**Refactoring Tasks:**
1. Extract data fetching into a custom hook
2. Extract telemetry logic into `useTelemetry` hook
3. Extract controls logic into `useRobotControls` hook
4. Break UI into smaller components
5. Use composition to combine them

**Solution Checklist:**
- Create `useRobotData(robotId)` hook
- Use existing `useTelemetry` hook
- Use existing `useRobotControls` hook
- Create `<RobotHeader />`, `<RobotTelemetry />`, `<RobotControls />` components
- Compose them in the page component

---

### Assessment 6: Electron Security Audit

**Challenge**: Identify security vulnerabilities in this Electron setup:

```typescript
// main.ts
const mainWindow = new BrowserWindow({
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    }
});

mainWindow.loadURL('https://example.com');

// preload.ts
window.electronAPI = {
    readFile: (path) => require('fs').readFileSync(path),
    execute: (cmd) => require('child_process').exec(cmd)
};
```

**Security Issues to Identify:**
1. `nodeIntegration: true` exposes Node.js to renderer
2. `contextIsolation: false` removes security boundary
3. Loading external URL without validation
4. Preload exposes dangerous APIs (file system, command execution)
5. No Content Security Policy

**Solution Checklist:**
- Set `nodeIntegration: false`
- Set `contextIsolation: true`
- Use `contextBridge.exposeInMainWorld()` in preload
- Block external navigation
- Add Content Security Policy
- Validate and sanitize all IPC inputs

---

### Assessment 7: Performance Optimization

**Challenge**: This component re-renders too frequently. Optimize it:

```typescript
const RobotTable = ({ robots }) => {
    const [filter, setFilter] = useState('');
    const [sortBy, setSortBy] = useState('id');
    
    const filteredRobots = robots.filter(robot => 
        robot.name.toLowerCase().includes(filter.toLowerCase())
    );
    
    const sortedRobots = filteredRobots.sort((a, b) => {
        if (sortBy === 'id') return a.id.localeCompare(b.id);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return 0;
    });
    
    return (
        <table>
            {sortedRobots.map(robot => (
                <RobotRow key={robot.id} robot={robot} />
            ))}
        </table>
    );
};

const RobotRow = ({ robot }) => {
    const expensiveCalculation = () => {
        // Simulates expensive computation
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
            result += i;
        }
        return result;
    };
    
    return (
        <tr>
            <td>{robot.name}</td>
            <td>{expensiveCalculation()}</td>
        </tr>
    );
};
```

**Optimization Tasks:**
1. Memoize filtered/sorted arrays
2. Memoize the `RobotRow` component
3. Memoize expensive calculations
4. Consider virtualization for large lists

**Solution Checklist:**
- Use `useMemo` for `filteredRobots` and `sortedRobots`
- Wrap `RobotRow` with `React.memo`
- Use `useMemo` for `expensiveCalculation` result
- Add proper dependency arrays

---

### Assessment 8: Testing Scenario

**Challenge**: Write tests for this custom hook:

```typescript
export const useCounter = (initialValue = 0, step = 1) => {
    const [count, setCount] = useState(initialValue);
    
    const increment = () => setCount(c => c + step);
    const decrement = () => setCount(c => c - step);
    const reset = () => setCount(initialValue);
    
    return { count, increment, decrement, reset };
};
```

**Test Requirements:**
1. Test initial value
2. Test increment functionality
3. Test decrement functionality
4. Test reset functionality
5. Test custom step value

**Solution Template:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
    // Your tests here
});
```

**Solution Checklist:**
- Use `renderHook` from React Testing Library
- Use `act()` wrapper for state updates
- Test all return values and functions
- Test edge cases (negative numbers, zero)

---

### Assessment 9: Architecture Decision

**Challenge**: You need to add real-time notifications to the app. Choose the best approach and justify:

**Scenario**: When a robot's battery drops below 20%, show a notification. When an emergency stop occurs, show an alert. Notifications should persist until dismissed.

**Options:**
1. Add notification state to existing `RobotStateContext`
2. Create a separate `NotificationContext`
3. Use a custom `useNotifications` hook with local state
4. Use a third-party library (react-toastify, notistack)

**Decision Framework:**
- Who needs access to notifications? (Global vs. local)
- How complex is the notification logic?
- Do notifications need to persist across navigation?
- Performance considerations?

**Solution Checklist:**
- Consider if notifications are global (Context) or local (hook)
- Evaluate if you need notification queue/history
- Consider if notifications should survive page navigation
- Think about notification types (success, error, warning, info)

---

### Assessment 10: Code Review Exercise

**Challenge**: Review this code and provide feedback:

```typescript
export const RobotList = ({ robots }) => {
    const [selected, setSelected] = useState([]);
    
    const handleSelect = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(s => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    };
    
    const handleSelectAll = () => {
        if (selected.length === robots.length) {
            setSelected([]);
        } else {
            setSelected(robots.map(r => r.id));
        }
    };
    
    return (
        <div>
            <button onClick={handleSelectAll}>
                {selected.length === robots.length ? 'Deselect All' : 'Select All'}
            </button>
            {robots.map(robot => (
                <div key={robot.id} onClick={() => handleSelect(robot.id)}>
                    {robot.name} {selected.includes(robot.id) ? '✓' : ''}
                </div>
            ))}
        </div>
    );
};
```

**Review Checklist:**
- **Performance**: Is `selected.includes()` efficient for large lists?
- **TypeScript**: Are types properly defined?
- **Accessibility**: Is keyboard navigation supported?
- **UX**: Is the selection feedback clear?
- **Code Quality**: Can logic be extracted to a custom hook?

**Suggested Improvements:**
- Use `Set` instead of array for O(1) lookup
- Extract to `useSelection` hook
- Add TypeScript types
- Add keyboard handlers (Space, Enter)
- Add ARIA attributes for accessibility
- Consider using checkboxes for better semantics

---

## Self-Assessment Checklist

After completing the assessments, verify your understanding:

### Custom Hooks
- [ ] Can implement a custom hook from scratch
- [ ] Understand when to use `useCallback` and `useMemo`
- [ ] Know how to handle cleanup in `useEffect`
- [ ] Can test custom hooks with React Testing Library

### TypeScript
- [ ] Can identify and fix type errors
- [ ] Understand when to use `interface` vs `type`
- [ ] Can create proper union types and type guards
- [ ] Know how to type React hooks and components

### State Management
- [ ] Can optimize Context to prevent unnecessary re-renders
- [ ] Understand when to use Context vs. local state
- [ ] Know when to migrate from Context to Redux
- [ ] Can split contexts for better performance

### Electron
- [ ] Can identify security vulnerabilities
- [ ] Understand main vs. renderer process
- [ ] Know how to properly set up IPC communication
- [ ] Can implement secure preload scripts

### Performance
- [ ] Can identify performance bottlenecks
- [ ] Know when to use memoization
- [ ] Understand React rendering optimization
- [ ] Can profile and measure performance

### Testing
- [ ] Can write tests for custom hooks
- [ ] Can test components with user interactions
- [ ] Understand mocking strategies
- [ ] Know how to test async operations

---

## Whiteboarding Practice

These exercises simulate real interview whiteboarding scenarios. Practice drawing diagrams, explaining your thought process out loud, and writing code on a whiteboard or shared document.

### Whiteboarding Tips

1. **Clarify Requirements First**: Ask questions about edge cases, constraints, and expected behavior
2. **Think Out Loud**: Explain your thought process as you work
3. **Start Simple**: Begin with a basic solution, then optimize
4. **Draw Diagrams**: Visualize data flow, component structure, or system architecture
5. **Write Pseudocode**: Outline your approach before writing actual code
6. **Test Your Solution**: Walk through examples to verify correctness

---

### Whiteboard Exercise 1: Design a Real-Time Dashboard

**Problem**: Design a system to display real-time telemetry data for 1000 robots. Each robot sends updates every 100ms. Users can filter by status, search by name, and sort by battery level.

**What to Discuss:**
1. **Data Flow**: How does telemetry get from robots to the UI?
2. **State Management**: Where do you store the data? (Context, Redux, local state?)
3. **Performance**: How do you handle 1000 robots updating 10 times per second?
4. **UI Components**: What components do you need? Draw the component tree.
5. **Optimization**: What techniques prevent the UI from lagging?

**Approach:**
- Start by drawing the data flow diagram
- Discuss WebSocket connection management
- Explain state management choice (Context vs. Redux vs. local state)
- Describe virtualization for rendering large lists
- Discuss memoization strategies
- Mention debouncing/throttling for filters

**Key Points to Cover:**
- WebSocket connection pooling or single connection with filtering
- Virtual scrolling (react-window, react-virtualized)
- Memoization of filtered/sorted lists
- Debouncing search input
- Optimistic updates vs. server state

---

### Whiteboard Exercise 2: Implement `usePrevious` Hook

**Problem**: Write a custom hook that returns the previous value of a prop or state.

**Requirements:**
- Takes a value as input
- Returns the previous value
- First render should return `undefined`
- Should work with any type

**Approach:**
1. Clarify: "Should it work with objects? Arrays? Primitives?"
2. Think: "I need to store the previous value somewhere that persists across renders"
3. Solution: Use `useRef` to store previous value, `useEffect` to update it

**Code to Write:**
```typescript
function usePrevious<T>(value: T): T | undefined {
    // Your implementation
}
```

**Test Cases to Walk Through:**
- `usePrevious(5)` → initially `undefined`, then `5` when value changes to `10`
- `usePrevious({ name: 'Robot' })` → should handle object references correctly

**Follow-up Questions:**
- "What if the value is an object and we mutate it?"
- "How would you handle arrays?"
- "Can you make it work with a custom comparison function?"

---

### Whiteboard Exercise 3: Design a Robot Command Queue

**Problem**: Design a system to queue robot commands when the robot is busy. Commands should execute in order, with priority support. If a command fails, it should retry up to 3 times.

**What to Design:**
1. **Data Structure**: What data structure for the queue? (Array, Priority Queue, Linked List?)
2. **State Management**: Where does the queue live? (Hook, Context, Redux?)
3. **Command Interface**: What does a command look like?
4. **Execution Logic**: How do you process the queue?
5. **Error Handling**: How do you handle failures and retries?

**Approach:**
- Draw a state diagram (idle → queued → executing → success/failure)
- Design the command interface (type, payload, priority, retries)
- Explain the queue processing logic
- Discuss priority queue implementation
- Walk through error handling and retry logic

**Code Structure:**
```typescript
interface Command {
    id: string;
    type: 'start' | 'stop' | 'pause' | 'emergency';
    robotId: string;
    priority: number;
    retries: number;
    maxRetries: number;
}

// Design the hook/class structure
```

**Key Points:**
- Priority queue (heap) vs. simple array
- Async command execution
- Retry logic with exponential backoff
- Queue state management
- UI feedback for queued commands

---

### Whiteboard Exercise 4: Optimize Re-renders in a Large List

**Problem**: You have a component that renders 500 robot cards. Each card shows name, status, battery, and location. When one robot's status updates, all 500 cards re-render. Optimize this.

**What to Discuss:**
1. **Problem Identification**: Why are all cards re-rendering?
2. **Solutions**: What techniques can prevent unnecessary re-renders?
3. **Trade-offs**: What are the costs of each solution?
4. **Implementation**: How would you implement each solution?

**Approach:**
- Draw the component tree
- Identify the re-render cause (Context update, prop changes)
- Discuss `React.memo` for components
- Explain `useMemo` for expensive calculations
- Discuss splitting Context to reduce scope
- Mention virtualization for rendering

**Code to Write:**
```typescript
// Before: All cards re-render
const RobotCard = ({ robot }) => {
    return <div>{robot.name} {robot.status}</div>;
};

// After: Optimized version
// Your solution here
```

**Solutions to Discuss:**
1. Wrap `RobotCard` with `React.memo`
2. Use `useMemo` for expensive calculations
3. Split Context (robot data vs. selected robot)
4. Use virtualization (only render visible cards)
5. Normalize data structure (easier to update single items)

---

### Whiteboard Exercise 5: Design a WebSocket Reconnection System

**Problem**: Design a WebSocket hook that automatically reconnects with exponential backoff. It should:
- Reconnect after connection drops
- Increase delay between retries (1s, 2s, 4s, 8s, max 30s)
- Stop retrying after 10 failed attempts
- Allow manual reconnect
- Emit connection state changes

**What to Design:**
1. **State Management**: What state do you need? (connected, connecting, error, retryCount)
2. **Reconnection Logic**: How do you implement exponential backoff?
3. **Cleanup**: How do you prevent memory leaks?
4. **API Design**: What should the hook return?

**Approach:**
- Draw a state machine diagram
- Explain exponential backoff calculation
- Discuss cleanup in `useEffect`
- Design the hook interface
- Walk through edge cases

**Code Structure:**
```typescript
function useWebSocket(url: string, options?: {
    autoReconnect?: boolean;
    maxRetries?: number;
    maxDelay?: number;
}) {
    // Design the implementation
    return {
        connected: boolean;
        connecting: boolean;
        error: Error | null;
        reconnect: () => void;
        disconnect: () => void;
    };
}
```

**Key Points:**
- `useRef` for WebSocket instance and timeout IDs
- `useEffect` for connection lifecycle
- Exponential backoff: `Math.min(initialDelay * 2^attempt, maxDelay)`
- Cleanup all timeouts on unmount
- State updates for connection status

---

### Whiteboard Exercise 6: Implement Debounced Search

**Problem**: Implement a search input that only triggers a search after the user stops typing for 300ms. The search should be cancellable if the user types again.

**Requirements:**
- Debounce delay of 300ms
- Cancel previous search if user types again
- Show loading state during search
- Handle empty search (show all results)

**Approach:**
1. Clarify: "What happens if user types 'robot', waits 300ms, then types '1'?"
2. Think: "I need a timer that resets on each keystroke"
3. Solution: Use `useState` for input, `useEffect` with timeout, cleanup on unmount

**Code to Write:**
```typescript
function SearchInput({ onSearch }) {
    // Your implementation
    // Should call onSearch(query) 300ms after user stops typing
}
```

**Walk Through:**
- User types 'r' → timer starts (300ms)
- User types 'o' (after 100ms) → cancel previous timer, start new (300ms)
- User types 'b' (after 200ms) → cancel previous timer, start new (300ms)
- User stops typing → after 300ms, call `onSearch('rob')`

**Follow-up:**
- "How would you make the delay configurable?"
- "What if the search is async? How do you handle race conditions?"
- "How would you test this?"

---

### Whiteboard Exercise 7: Design a Multi-Robot Control System

**Problem**: Design a system where operators can select multiple robots and send the same command to all of them simultaneously. Commands should execute in parallel, but you need to track individual success/failure.

**What to Design:**
1. **Selection State**: How do you track selected robots?
2. **Command Execution**: How do you send commands to multiple robots?
3. **Status Tracking**: How do you track each robot's command status?
4. **UI Feedback**: How do you show progress for each robot?
5. **Error Handling**: What if some succeed and some fail?

**Approach:**
- Draw the component hierarchy
- Design the data structure for tracking command status
- Explain Promise.all vs. Promise.allSettled
- Discuss UI patterns (progress bars, status indicators)
- Walk through error scenarios

**Code Structure:**
```typescript
interface CommandStatus {
    robotId: string;
    status: 'pending' | 'executing' | 'success' | 'error';
    error?: string;
}

// Design the hook/function
function useMultiRobotCommand() {
    // Your implementation
}
```

**Key Points:**
- Use `Set` for selected robot IDs (O(1) lookup)
- `Promise.allSettled` to handle partial failures
- State structure: `Map<robotId, CommandStatus>`
- UI: Progress indicators per robot
- Rollback strategy for partial failures

---

### Whiteboard Exercise 8: Implement a Custom `useFetch` Hook

**Problem**: Create a custom hook that fetches data from an API with loading, error, and data states. It should support:
- Automatic fetch on mount
- Manual refetch
- Request cancellation
- Error retry logic

**Requirements:**
- Loading state while fetching
- Error state if fetch fails
- Data state on success
- Ability to cancel in-flight requests
- Optional retry on error

**Approach:**
1. Clarify: "Should it fetch immediately or only when called?"
2. Think: "I need useState for data/loading/error, useEffect for fetch, AbortController for cancellation"
3. Solution: Combine useState, useEffect, useRef for AbortController

**Code to Write:**
```typescript
function useFetch<T>(url: string, options?: {
    immediate?: boolean;
    retries?: number;
}) {
    // Your implementation
    return {
        data: T | null;
        loading: boolean;
        error: Error | null;
        refetch: () => void;
    };
}
```

**Walk Through:**
- Initial state: `{ data: null, loading: true, error: null }`
- Fetch starts → `loading: true`
- Success → `{ data: result, loading: false, error: null }`
- Error → `{ data: null, loading: false, error: Error }`
- Component unmounts → cancel request with AbortController

**Follow-up:**
- "How would you add caching?"
- "What about request deduplication?"
- "How would you handle authentication tokens?"

---

### Whiteboard Exercise 9: Design a Telemetry Data Aggregation System

**Problem**: You receive telemetry updates for 100 robots every 100ms. You need to:
- Calculate average battery level across all robots
- Find robots with battery < 20%
- Count robots by status (idle, active, charging, error)
- Update these calculations efficiently without re-rendering everything

**What to Design:**
1. **Data Structure**: How do you store telemetry data?
2. **Computed Values**: How do you calculate aggregates?
3. **Performance**: How do you avoid recalculating on every update?
4. **State Updates**: How do you update UI efficiently?

**Approach:**
- Draw data flow diagram
- Explain memoization strategy
- Discuss data normalization
- Design the aggregation functions
- Explain selective re-renders

**Code Structure:**
```typescript
interface AggregatedStats {
    averageBattery: number;
    lowBatteryRobots: string[];
    statusCounts: Record<RobotStatus, number>;
}

// Design the hook/function
function useTelemetryAggregation(telemetry: Map<string, TelemetryUpdate>) {
    // Your implementation
}
```

**Key Points:**
- Use `useMemo` for expensive calculations
- Normalize data structure (Map for O(1) lookup)
- Only recalculate when relevant data changes
- Separate concerns (raw data vs. computed stats)
- Consider Web Workers for heavy calculations

---

### Whiteboard Exercise 10: System Design - Scale to 10,000 Robots

**Problem**: Your current system handles 100 robots. How would you scale it to handle 10,000 robots with the same real-time requirements?

**What to Discuss:**
1. **Bottlenecks**: What are the current bottlenecks?
2. **Architecture Changes**: What architectural changes are needed?
3. **Data Management**: How do you handle 10,000 robots' data?
4. **UI Performance**: How do you render 10,000 items?
5. **Backend Changes**: What backend changes are needed?

**Approach:**
- Draw current architecture
- Identify bottlenecks (WebSocket messages, rendering, state updates)
- Propose solutions (pagination, virtualization, data pagination, server-side filtering)
- Discuss trade-offs
- Explain migration path

**Topics to Cover:**

**Frontend:**
- Virtual scrolling (only render visible items)
- Pagination or infinite scroll
- Server-side filtering/sorting
- Data pagination (load robots in chunks)
- WebSocket message throttling
- State management optimization (normalize data, split contexts)

**Backend:**
- WebSocket connection management
- Message batching
- Server-side aggregation
- Database indexing
- Caching strategies

**Architecture:**
- Microservices for robot management
- Message queue for commands
- Redis for real-time state
- CDN for static assets
- Load balancing

**Key Points:**
- Don't try to render 10,000 items at once
- Use virtualization (react-window)
- Implement pagination or infinite scroll
- Server-side filtering/sorting
- Batch WebSocket messages
- Normalize state structure
- Consider Web Workers for heavy computations

---

### Whiteboard Exercise 11: Implement a Command History System

**Problem**: Design a system to track all commands sent to robots. Operators should be able to:
- View command history
- Undo the last command
- See which commands succeeded/failed
- Filter history by robot, command type, or date

**What to Design:**
1. **Data Structure**: How do you store command history?
2. **State Management**: Where does history live?
3. **Undo Logic**: How do you implement undo?
4. **UI Components**: What components do you need?
5. **Persistence**: Should history persist across sessions?

**Approach:**
- Design the command history data structure
- Explain undo/redo pattern (command pattern)
- Draw the component structure
- Discuss state management (Context, Redux, local storage)
- Walk through undo implementation

**Code Structure:**
```typescript
interface CommandHistoryEntry {
    id: string;
    robotId: string;
    command: RobotCommand;
    timestamp: Date;
    status: 'pending' | 'success' | 'error';
    undoable: boolean;
}

// Design the hook/context
function useCommandHistory() {
    // Your implementation
    return {
        history: CommandHistoryEntry[];
        undo: () => void;
        redo: () => void;
        clear: () => void;
    };
}
```

**Key Points:**
- Stack data structure for undo/redo
- Command pattern for undoable actions
- Immutable history (don't mutate past entries)
- Filtering with `useMemo`
- Local storage for persistence
- Limit history size (memory management)

---

### Whiteboard Exercise 12: Debug a Memory Leak

**Problem**: Your React app's memory usage keeps growing. Users report the app becomes slow after running for 30 minutes. You suspect a memory leak. How do you debug and fix it?

**What to Discuss:**
1. **Symptoms**: What indicates a memory leak?
2. **Common Causes**: What typically causes leaks in React?
3. **Debugging Tools**: How do you identify the leak?
4. **Solutions**: How do you fix common leak patterns?

**Approach:**
- List common memory leak causes in React
- Explain debugging tools (Chrome DevTools, React DevTools)
- Walk through code patterns that cause leaks
- Provide solutions for each pattern

**Common Leak Patterns:**

1. **Event Listeners Not Cleaned Up:**
```typescript
// BAD
useEffect(() => {
    window.addEventListener('resize', handleResize);
    // Missing cleanup!
}, []);

// GOOD
useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}, []);
```

2. **Subscriptions Not Unsubscribed:**
```typescript
// BAD
useEffect(() => {
    const subscription = telemetryService.subscribe(handleUpdate);
    // Missing cleanup!
}, []);

// GOOD
useEffect(() => {
    const subscription = telemetryService.subscribe(handleUpdate);
    return () => subscription.unsubscribe();
}, []);
```

3. **Timers Not Cleared:**
```typescript
// BAD
useEffect(() => {
    setInterval(() => updateData(), 1000);
    // Missing cleanup!
}, []);

// GOOD
useEffect(() => {
    const interval = setInterval(() => updateData(), 1000);
    return () => clearInterval(interval);
}, []);
```

4. **Closures Holding References:**
```typescript
// BAD - closure holds reference to large object
useEffect(() => {
    const largeData = fetchLargeDataset();
    setTimeout(() => {
        processData(largeData); // largeData kept in memory
    }, 5000);
}, []);

// GOOD - clear reference when done
useEffect(() => {
    const largeData = fetchLargeDataset();
    const timeout = setTimeout(() => {
        processData(largeData);
        largeData = null; // Clear reference
    }, 5000);
    return () => {
        clearTimeout(timeout);
        largeData = null;
    };
}, []);
```

**Debugging Steps:**
1. Use Chrome DevTools Memory Profiler
2. Take heap snapshots before/after operations
3. Look for detached DOM nodes
4. Check for event listeners that weren't removed
5. Use React DevTools Profiler
6. Check for components that don't unmount

---

## Whiteboarding Best Practices

### Before You Start
- **Ask Questions**: Clarify requirements, edge cases, constraints
- **Restate the Problem**: Confirm your understanding
- **Estimate Complexity**: Discuss time/space complexity upfront

### During the Exercise
- **Think Out Loud**: Explain your reasoning
- **Draw Diagrams**: Visualize the problem
- **Start Simple**: Get a working solution first
- **Iterate**: Optimize after the basic solution works
- **Test**: Walk through examples to verify

### Common Patterns to Know
- **Custom Hooks**: `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
- **State Management**: Context API, when to use Redux
- **Performance**: Memoization, virtualization, code splitting
- **Async Operations**: Promises, async/await, error handling
- **Data Structures**: Arrays, Maps, Sets, when to use each

### Red Flags to Avoid
- ❌ Jumping to code without understanding the problem
- ❌ Not asking clarifying questions
- ❌ Ignoring edge cases
- ❌ Not testing your solution
- ❌ Getting defensive about feedback
- ❌ Not explaining your thought process

---

**Remember**: The goal isn't to memorize answers, but to understand the concepts deeply enough to discuss them naturally. Use this guide as a reference, but speak from your own experience building the project.
