# Study Guide: Technical Concepts & Interview Preparation

This guide covers the key technical concepts used in the Robot Operations Console project, designed to help you confidently discuss them in interviews.

---

## Table of Contents

1. [Custom Hooks](#custom-hooks)
2. [State Management](#state-management)
3. [TypeScript Benefits](#typescript-benefits)
4. [Electron Architecture](#electron-architecture)
5. [Component Composition](#component-composition)
6. [Other Interview Topics](#other-interview-topics)

---

## Custom Hooks

### What Are Custom Hooks?

Custom hooks are JavaScript functions that start with `use` and can call other hooks. They allow you to extract component logic into reusable functions.

### Why Use Custom Hooks?

1. **Reusability**: Share logic between components
2. **Separation of Concerns**: Business logic separate from UI
3. **Testability**: Test logic independently from components
4. **Readability**: Components focus on rendering, hooks handle logic

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

### Interview Questions

**Q: What are the main benefits of TypeScript?**
A: Type safety (catch errors at compile-time), better IDE support (autocomplete, refactoring), self-documenting code, and easier refactoring.

**Q: When would you use `interface` vs `type`?**
A: Generally interchangeable. `interface` can be extended and merged. `type` is better for unions and intersections. For this project, used `interface` for object shapes, `type` for unions.

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
A: `FleetOverviewPage` composes `RobotTableRow` components. Each row is reusable and testable independently. We also compose hooks: `useRobotState` for data, `useTelemetry` for real-time updates.

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

### Performance Optimization

**Techniques Used:**
- `useCallback` for memoized functions
- `useMemo` for computed values (if needed)
- React.memo for component memoization (if needed)

**When to optimize:**
- Only after identifying bottlenecks
- Profile first, optimize second
- Don't premature optimize

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

**Remember**: The goal isn't to memorize answers, but to understand the concepts deeply enough to discuss them naturally. Use this guide as a reference, but speak from your own experience building the project.
