# Operator Controls Implementation Guide

This document outlines the step-by-step implementation of operator control handlers for the Robot Ops Console, including the use of custom hooks and state management patterns.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Implementation Steps](#implementation-steps)
4. [Custom Hooks Pattern](#custom-hooks-pattern)
5. [State Management Pattern](#state-management-pattern)
6. [Key Concepts](#key-concepts)
7. [Code Structure](#code-structure)
8. [Testing Strategy](#testing-strategy)
9. [Future Enhancements](#future-enhancements)

---

## Overview

The operator controls feature allows users to send commands to robots (Start, Pause, Resume, Return to Dock, Emergency Stop) with proper feedback, loading states, and confirmation dialogs for critical actions.

### Key Features Implemented

- ✅ Handler functions for each control action
- ✅ Confirmation dialogs for critical actions (Emergency Stop, Return to Dock)
- ✅ Logging actions to console (prepared for API calls)
- ✅ Robot status updates based on actions
- ✅ Loading states during action execution
- ✅ Success/error feedback via Snackbar
- ✅ Custom hooks for reusable logic
- ✅ Context-based state management

---

## Architecture Decisions

### 1. Custom Hooks Pattern

**Why Custom Hooks?**
- **Separation of Concerns**: Business logic separated from UI components
- **Reusability**: Control logic can be reused across components
- **Testability**: Hooks can be tested independently
- **Maintainability**: Centralized control logic is easier to update

**Implementation**: `useRobotControls` hook encapsulates all control-related state and handlers.

### 2. Context-Based State Management

**Why Context API?**
- **Global State**: Robot status needs to be shared across components
- **Simplicity**: No need for external state management library for this use case
- **React Native**: Works well with React's built-in patterns
- **Future-Proof**: Easy to migrate to Redux/Zustand if needed

**Implementation**: `RobotStateContext` provides robot state and update functions.

---

## Implementation Steps

### Step 1: Create Custom Hook (`useRobotControls`)

**File**: `src/hooks/useRobotControls.ts`

**Purpose**: Encapsulate all robot control logic in a reusable hook.

**Key Features**:
- Manages loading state
- Handles snackbar (success/error) messages
- Manages confirmation dialogs
- Provides handler functions for all control actions
- Simulates API calls with delays

**Code Structure**:
```typescript
export const useRobotControls = ({ robotId, initialStatus, onStatusChange }) => {
    // State management
    const [robotStatus, setRobotStatus] = useState<RobotStatus>(initialStatus);
    const [controlState, setControlState] = useState<ControlState>({...});
    
    // Handler functions
    const handleStart = useCallback(async () => {...}, []);
    const handlePause = useCallback(async () => {...}, []);
    // ... other handlers
    
    // Return state and handlers
    return {
        robotStatus,
        loading,
        snackbar,
        confirmDialog,
        handlers: { handleStart, handlePause, ... },
        closeSnackbar,
        closeConfirmDialog,
    };
};
```

**Benefits**:
- All control logic in one place
- Easy to test
- Can be reused in other components
- Clear API surface

### Step 2: Create State Management Context

**File**: `src/context/RobotStateContext.tsx`

**Purpose**: Provide global robot state management.

**Key Features**:
- Stores robot list
- Provides `updateRobotStatus` function
- Provides `getRobot` helper function
- Uses React Context API

**Code Structure**:
```typescript
const RobotStateContext = createContext<RobotStateContextType | undefined>(undefined);

export const RobotStateProvider = ({ children, initialRobots }) => {
    const [robots, setRobots] = useState<RobotDetail[]>(initialRobots);
    
    const updateRobotStatus = useCallback((robotId, newStatus) => {
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
```

**Benefits**:
- Centralized state management
- Easy to access robot data from any component
- Automatic re-renders when state changes
- Type-safe with TypeScript

### Step 3: Refactor Component to Use Hook and Context

**File**: `src/pages/RobotDetailPage.tsx`

**Changes Made**:
1. Removed inline state management
2. Imported and used `useRobotControls` hook
3. Imported and used `useRobotState` context (with fallback)
4. Simplified component code

**Before**:
```typescript
const [robotStatus, setRobotStatus] = useState<RobotStatus | null>(...);
const [loading, setLoading] = useState<string | null>(null);
const [snackbar, setSnackbar] = useState({...});
// ... 100+ lines of handler logic
```

**After**:
```typescript
const {
    robotStatus,
    loading,
    snackbar,
    confirmDialog,
    handlers,
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
```

**Benefits**:
- Component is much cleaner
- Logic is testable separately
- Easier to understand component's purpose
- Better separation of concerns

### Step 4: Integrate Context Provider in App

**File**: `src/App.tsx`

**Changes Made**:
- Wrapped app with `RobotStateProvider`
- Passed initial robot data to provider

**Code**:
```typescript
function App() {
  return (
    <RobotStateProvider initialRobots={mockRobotDetails}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Routes>
          {/* routes */}
        </Routes>
      </Container>
    </RobotStateProvider>
  )
}
```

**Benefits**:
- Global state available to all components
- Single source of truth for robot data
- Easy to add more global state later

---

## Custom Hooks Pattern

### What is a Custom Hook?

A custom hook is a JavaScript function that:
- Starts with "use" (React convention)
- Can call other hooks
- Encapsulates reusable logic
- Returns state and/or functions

### Why Use Custom Hooks?

1. **Code Reusability**: Share logic between components
2. **Separation of Concerns**: Business logic separate from UI
3. **Testability**: Test logic independently
4. **Readability**: Components become more declarative

### Our Custom Hook: `useRobotControls`

**Responsibilities**:
- Manage robot status state
- Handle loading states
- Manage UI feedback (snackbar)
- Manage confirmation dialogs
- Provide action handlers
- Simulate API calls

**API Surface**:
```typescript
const {
    robotStatus,        // Current robot status
    loading,           // Current loading action (or null)
    snackbar,          // Snackbar state { open, message, severity }
    confirmDialog,     // Dialog state { open, title, message, action }
    handlers: {        // Action handlers
        handleStart,
        handlePause,
        handleResume,
        handleReturnToDock,
        handleEmergencyStop,
    },
    closeSnackbar,     // Close snackbar function
    closeConfirmDialog, // Close dialog function
} = useRobotControls({
    robotId: string,
    initialStatus: RobotStatus,
    onStatusChange?: (newStatus: RobotStatus) => void,
});
```

### Hook Implementation Details

**State Management**:
```typescript
const [robotStatus, setRobotStatus] = useState<RobotStatus>(initialStatus);
const [controlState, setControlState] = useState<ControlState>({
    loading: null,
    snackbar: { open: false, message: '', severity: 'success' },
    confirmDialog: { open: false, title: '', message: '', action: () => {} },
});
```

**Action Simulation**:
```typescript
const simulateAction = useCallback(async (actionName, actionFn) => {
    setControlState(prev => ({ ...prev, loading: actionName }));
    try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        await actionFn();
        setControlState(prev => ({
            ...prev,
            loading: null,
            snackbar: { open: true, message: `${actionName} command sent successfully`, severity: 'success' },
        }));
    } catch (error) {
        // Error handling
    }
}, []);
```

**Handler Functions**:
```typescript
const handleStart = useCallback(async () => {
    await simulateAction('Start', async () => {
        console.log(`[API] Starting robot ${robotId}`);
        updateStatus('active');
    });
}, [robotId, simulateAction, updateStatus]);
```

---

## State Management Pattern

### Context API Overview

React Context provides a way to pass data through the component tree without prop drilling.

**Components**:
1. **Context**: Created with `createContext()`
2. **Provider**: Wraps components and provides value
3. **Consumer/Hook**: Accesses context value

### Our Context: `RobotStateContext`

**Purpose**: Manage robot fleet state globally.

**Structure**:
```typescript
// 1. Define context type
interface RobotStateContextType {
    robots: RobotDetail[];
    updateRobotStatus: (robotId: string, newStatus: RobotStatus) => void;
    getRobot: (robotId: string) => RobotDetail | undefined;
}

// 2. Create context
const RobotStateContext = createContext<RobotStateContextType | undefined>(undefined);

// 3. Create provider component
export const RobotStateProvider = ({ children, initialRobots }) => {
    const [robots, setRobots] = useState<RobotDetail[]>(initialRobots);
    
    const updateRobotStatus = useCallback((robotId, newStatus) => {
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

// 4. Create custom hook to use context
export const useRobotState = () => {
    const context = useContext(RobotStateContext);
    if (!context) {
        throw new Error('useRobotState must be used within a RobotStateProvider');
    }
    return context;
};
```

### Using the Context

**In Components**:
```typescript
// Option 1: Use context (if available)
try {
    const { robots, updateRobotStatus } = useRobotState();
    // Use context
} catch {
    // Fallback to props
    robots = robotsProp;
}

// Option 2: Direct usage
const { robots, updateRobotStatus } = useRobotState();
updateRobotStatus('rbt-001', 'active');
```

**Benefits**:
- No prop drilling
- Centralized state
- Easy to update from anywhere
- Type-safe

---

## Key Concepts

### 1. useCallback Hook

**Purpose**: Memoize functions to prevent unnecessary re-renders.

**Usage**:
```typescript
const handleStart = useCallback(async () => {
    // function body
}, [robotId, simulateAction, updateStatus]);
```

**Why**: Prevents function recreation on every render, improving performance.

### 2. useState Hook

**Purpose**: Manage component state.

**Usage**:
```typescript
const [robotStatus, setRobotStatus] = useState<RobotStatus>(initialStatus);
```

**Why**: React's built-in state management.

### 3. useContext Hook

**Purpose**: Access context values.

**Usage**:
```typescript
const context = useContext(RobotStateContext);
```

**Why**: Access global state without prop drilling.

### 4. Error Boundaries (Future)

**Purpose**: Catch errors in component tree.

**Implementation**: Wrap providers in error boundary for production.

---

## Code Structure

### File Organization

```
src/
├── hooks/
│   └── useRobotControls.ts      # Custom hook for robot controls
├── context/
│   └── RobotStateContext.tsx    # Global state management
├── pages/
│   └── RobotDetailPage.tsx      # Component using hook and context
└── App.tsx                        # App with context provider
```

### Data Flow

```
App (RobotStateProvider)
    ↓
RobotDetailPage
    ↓
useRobotControls hook
    ↓
RobotStateContext (updateRobotStatus)
    ↓
All components re-render with new state
```

### State Updates Flow

1. User clicks control button
2. Handler function called (from `useRobotControls`)
3. Loading state set
4. API call simulated
5. Status updated via `onStatusChange` callback
6. Context updated via `updateRobotStatus`
7. Component re-renders with new status
8. Success message shown

---

## Testing Strategy

### Testing Custom Hooks

**Approach**: Use `@testing-library/react-hooks` or render hook in component.

**Example**:
```typescript
import { renderHook, act } from '@testing-library/react';

it('updates status on start', async () => {
    const { result } = renderHook(() => useRobotControls({
        robotId: 'rbt-001',
        initialStatus: 'idle',
    }));
    
    await act(async () => {
        await result.current.handlers.handleStart();
    });
    
    expect(result.current.robotStatus).toBe('active');
});
```

### Testing Context

**Approach**: Wrap component in provider during tests.

**Example**:
```typescript
const wrapper = ({ children }) => (
    <RobotStateProvider initialRobots={mockRobots}>
        {children}
    </RobotStateProvider>
);

render(<RobotDetailPage />, { wrapper });
```

### Testing Components

**Approach**: Test component behavior, not implementation.

**Focus**:
- User interactions
- UI updates
- State changes
- Error handling

---

## Future Enhancements

### 1. Real API Integration

**Current**: Console logging with `[API]` prefix

**Future**: Replace with actual API calls:
```typescript
// In useRobotControls.ts
const handleStart = useCallback(async () => {
    await simulateAction('Start', async () => {
        await api.startRobot(robotId); // Real API call
        updateStatus('active');
    });
}, [robotId, simulateAction, updateStatus]);
```

### 2. Optimistic Updates

**Current**: Update after API call completes

**Future**: Update immediately, rollback on error:
```typescript
const handleStart = useCallback(async () => {
    const previousStatus = robotStatus;
    updateStatus('active'); // Optimistic update
    
    try {
        await api.startRobot(robotId);
    } catch (error) {
        updateStatus(previousStatus); // Rollback
        throw error;
    }
}, []);
```

### 3. WebSocket Integration

**Current**: Manual status updates

**Future**: Real-time updates via WebSocket:
```typescript
useEffect(() => {
    const ws = new WebSocket(`ws://api/robots/${robotId}/status`);
    ws.onmessage = (event) => {
        const { status } = JSON.parse(event.data);
        updateStatus(status);
    };
    return () => ws.close();
}, [robotId]);
```

### 4. Error Recovery

**Current**: Show error message

**Future**: Retry logic, exponential backoff:
```typescript
const retryWithBackoff = async (fn, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
};
```

### 5. Command Queue

**Current**: One action at a time

**Future**: Queue multiple commands:
```typescript
const [commandQueue, setCommandQueue] = useState<Command[]>([]);

const queueCommand = (command: Command) => {
    setCommandQueue(prev => [...prev, command]);
};

useEffect(() => {
    if (commandQueue.length > 0 && !loading) {
        executeCommand(commandQueue[0]);
    }
}, [commandQueue, loading]);
```

### 6. State Persistence

**Current**: State lost on refresh

**Future**: Persist to localStorage or backend:
```typescript
useEffect(() => {
    localStorage.setItem('robotState', JSON.stringify(robots));
}, [robots]);

// On mount
const savedState = localStorage.getItem('robotState');
if (savedState) {
    setRobots(JSON.parse(savedState));
}
```

---

## Summary

### What We Built

1. **Custom Hook** (`useRobotControls`): Encapsulates all control logic
2. **Context Provider** (`RobotStateContext`): Global state management
3. **Refactored Component**: Clean, maintainable, testable
4. **Full Feature Set**: Loading states, confirmations, feedback

### Key Takeaways

- **Custom Hooks**: Separate business logic from UI
- **Context API**: Manage global state without prop drilling
- **useCallback**: Optimize performance with memoized functions
- **Separation of Concerns**: Each piece has a single responsibility
- **Testability**: Logic can be tested independently

### Best Practices Applied

✅ Single Responsibility Principle  
✅ DRY (Don't Repeat Yourself)  
✅ Separation of Concerns  
✅ Type Safety (TypeScript)  
✅ Error Handling  
✅ User Feedback  
✅ Loading States  
✅ Confirmation Dialogs  

---

## Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Material-UI Components](https://mui.com/components/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: December 2025  
**Author**: Robot Ops Console Development Team

