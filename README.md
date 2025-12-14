# Robot Operations Console

A real-time monitoring and control interface for tethered flying robots, built as a proof-of-concept to demonstrate modern frontend engineering practices for robotics operator dashboards.

---

## 🎯 Executive Summary

**Robot Operations Console** is a React + TypeScript desktop application that provides operators with real-time fleet monitoring, individual robot control, and live telemetry visualization. Built independently over a weekend to explore UI patterns for robotics operations, this project demonstrates:

- **TypeScript-first development** for type safety and maintainability
- **Custom React hooks** for reusable business logic (`useTelemetry`, `useRobotControls`)
- **Context-based state management** for shared robot fleet data
- **Electron desktop deployment** for operator console environments
- **Test-driven development** with comprehensive test coverage
- **Modern tooling**: Vite, React Router v7, Material UI

This showcases the interface layer that connects human operators to autonomous systems—a critical component for any robotics venture.

**[📄 Quick Summary for Hiring Manager →](EXECUTIVE_SUMMARY.md)**

---

## 🚀 What It Does

**Robot Operations Console** provides operators with:

- **Fleet Overview**: Real-time status monitoring of multiple tethered flying robots with battery levels, location, tether status, and flight area boundaries
- **Robot Detail Pages**: Individual robot control panels with telemetry visualization, operator controls (start, pause, emergency stop), and diagnostic information
- **Live Telemetry**: WebSocket-based real-time data streaming showing position, orientation, velocity, and health metrics
- **Desktop Deployment**: Electron-based standalone application optimized for operator console environments

The app demonstrates UI patterns critical for robotics operations: clarity under pressure, real-time data visualization, and reliable control interfaces that operators can trust.

---

## 💻 Technical Architecture & Design Decisions

### TypeScript: Why It Matters for This Application

TypeScript was chosen as the foundation for this project because:

1. **Safety-Critical Operations**: In robotics, type errors can lead to incorrect commands being sent to robots. TypeScript catches these at compile-time:
   ```typescript
   // TypeScript ensures we can't accidentally send invalid status values
   type RobotStatus = "idle" | "active" | "charging" | "error";
   const updateRobotStatus = (robotId: string, newStatus: RobotStatus) => { ... }
   ```

2. **Complex Data Structures**: Robot telemetry involves nested objects (Position, Orientation, Velocity). TypeScript provides autocomplete and validation:
   ```typescript
   interface TelemetryUpdate {
       robotId: string;
       position: Position;  // { x, y, z }
       orientation: Orientation;  // { roll, pitch, yaw }
       velocity: Velocity;  // { vx, vy, vz }
       battery: number;
       status: RobotStatus;
   }
   ```

3. **Refactoring Confidence**: As requirements evolve (common in zero-to-one products), TypeScript ensures changes propagate correctly across the codebase.

4. **Self-Documenting Code**: Types serve as inline documentation, making the codebase easier for new team members to understand.

**Key TypeScript Files:**
- `src/types/robot.ts` - Comprehensive type definitions for all robot data structures
- All hooks and components are fully typed with interfaces

### Custom Hooks: Encapsulating Business Logic

Custom hooks were used to separate business logic from UI components, following React best practices for reusability and testability.

#### `useTelemetry` Hook

**Purpose**: Manages WebSocket connections and real-time telemetry data streaming.

**Why a Custom Hook?**
- **Reusability**: Used in both `FleetOverviewPage` (all robots) and `RobotDetailPage` (single robot)
- **Separation of Concerns**: WebSocket logic isolated from UI components
- **Testability**: Can be tested independently with mock WebSocket connections
- **State Management**: Handles connection state, reconnection logic, and error handling

**Key Features:**
```typescript
const { telemetry, connected, connecting, error, connect, disconnect } = useTelemetry({
    url: 'ws://localhost:8080',
    robotId: 'robot-1',  // Optional: filter to specific robot
    autoConnect: true,
    reconnect: true,
    reconnectInterval: 30000
});
```

**Implementation Highlights:**
- Automatic reconnection with exponential backoff
- Handles multiple robots' telemetry simultaneously
- Graceful error handling and connection state management
- Supports filtering to specific robot or all robots

**Location**: `src/hooks/useTelemetry.ts`

#### `useRobotControls` Hook

**Purpose**: Manages robot control actions (start, pause, emergency stop) with UI state (loading, confirmations, notifications).

**Why a Custom Hook?**
- **Complex State Management**: Combines robot status, loading states, snackbar notifications, and confirmation dialogs
- **Consistent UX**: Ensures all control actions follow the same pattern (loading → success/error feedback)
- **Reusability**: Can be used in any component that needs robot controls
- **Testability**: Business logic separated from UI rendering

**Key Features:**
```typescript
const {
    robotStatus,
    loading,
    snackbar,
    confirmDialog,
    handlers: { handleStart, handlePause, handleEmergencyStop },
    closeSnackbar,
    closeConfirmDialog
} = useRobotControls({
    robotId: 'robot-1',
    initialStatus: 'idle',
    onStatusChange: (newStatus) => { /* update context */ }
});
```

**Implementation Highlights:**
- Simulates API calls with proper loading states
- Confirmation dialogs for critical actions (emergency stop, return to dock)
- Success/error notifications via Material UI Snackbar
- Callback support for status updates

**Location**: `src/hooks/useRobotControls.ts`

**Testing**: Both hooks have comprehensive test suites (`useTelemetry.test.ts`, `useRobotControls.test.ts`)

### State Management: Context API vs. Redux

**Decision: React Context API**

For this application, React Context API was chosen over Redux or other state management libraries because:

1. **Scope**: The state is relatively simple (robot fleet data, status updates). No need for complex middleware, time-travel debugging, or Redux DevTools.

2. **Performance**: With a small number of robots (typically < 100), Context API performance is sufficient. The state updates are infrequent (status changes, not high-frequency re-renders).

3. **Simplicity**: Context API is built into React, reducing dependencies and complexity.

4. **Future Flexibility**: If the app grows to require Redux features (middleware, complex async flows), migration is straightforward.

**Implementation:**

```typescript
// src/context/RobotStateContext.tsx
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
```

**Usage Pattern:**
- Context provides shared robot fleet data
- Custom hooks (`useTelemetry`, `useRobotControls`) manage their own local state
- Components combine context data with hook data for rendering

**When Would We Use Redux?**
- If we needed middleware for API calls, logging, or side effects
- If state updates became complex (undo/redo, time-travel debugging)
- If we needed to share state across multiple Electron windows
- If performance became an issue with many robots (> 100)

### Component Composition

The application uses composition patterns throughout:

1. **Page Components** compose multiple smaller components:
   ```typescript
   <FleetOverviewPage>
       <RobotTableRow />  // Reusable row component
       <StatusIndicator /> // Reusable status component
   </FleetOverviewPage>
   ```

2. **Hooks Composition**: Components compose multiple hooks:
   ```typescript
   const { robots } = useRobotState();  // Context
   const { telemetry } = useTelemetry();  // WebSocket
   const { handlers } = useRobotControls();  // Controls
   ```

3. **Material UI Composition**: Uses MUI's composition patterns for consistent styling and behavior.

**Benefits:**
- **Reusability**: Components can be reused across pages
- **Testability**: Smaller components are easier to test
- **Maintainability**: Changes to one component don't affect others
- **Readability**: Clear separation of concerns

---

## 🛠️ Development Tools & Workflow

### Why Cursor AI?

Cursor was used as the primary development environment for this project because:

1. **Rapid Prototyping**: AI-assisted coding enabled quick iteration on UI patterns and component structure
2. **TypeScript Assistance**: Cursor's AI understands TypeScript deeply, helping catch type errors early
3. **Code Generation**: Generated boilerplate for hooks, components, and tests, allowing focus on business logic
4. **Learning Tool**: When implementing unfamiliar patterns (Electron security, WebSocket reconnection), Cursor provided explanations alongside code
5. **Time Efficiency**: Built this weekend project in significantly less time than traditional development

**Balance**: While AI assisted with structure and boilerplate, all architectural decisions, business logic, and testing strategies were made manually to ensure understanding and maintainability.

### GitHub Project Management

This project was managed using GitHub Projects to track progress and organize work:

- **Weekend Sprint Planning**: Created issues for major features (Fleet Overview, Robot Detail Page, Telemetry, Electron Setup)
- **Progress Tracking**: Used project board to visualize completion status
- **Documentation**: Linked documentation tasks to code implementation
- **Testing**: Separate issues for test coverage to ensure TDD approach

This demonstrates ability to:
- Break down work into manageable tasks
- Track progress systematically
- Maintain documentation alongside code
- Use project management tools effectively

---

## 📦 Technology Stack

**Core:**
- React 19.2.0 + TypeScript 5.9.3
- Vite 7.2.4 (build tool)
- React Router v7 (navigation)
- Material UI 7.3.6 (component library)

**Desktop:**
- Electron 33.0.0 (desktop app framework)
- electron-builder (packaging)

**Testing:**
- Vitest 4.0.15 (test runner)
- React Testing Library (component testing)
- jsdom (DOM simulation)

**Development:**
- ESLint (code quality)
- TypeScript ESLint (type checking)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

2. **Start telemetry simulator (Terminal 1):**
   ```bash
   cd server
   npm start
   ```

3. **Start frontend (Terminal 2):**
   ```bash
   npm run dev
   ```

4. **Or run as Electron desktop app:**
   ```bash
   npm run electron:dev
   ```

The app will be available at `http://localhost:5173` (or the Electron window will open). The telemetry simulator provides live WebSocket data on port 8080.

---

## 🧪 Testing

Built with test-driven development. Run tests with:

```bash
npm run test
npm run test:watch
```

**Test Coverage:**
- Custom hooks (`useTelemetry`, `useRobotControls`)
- Context providers (`RobotStateContext`)
- Page components (`FleetOverviewPage`, `RobotDetailPage`)

See [docs/TESTING.md](docs/TESTING.md) for comprehensive testing documentation.

---

## 📚 Documentation

- [Executive Summary](EXECUTIVE_SUMMARY.md) - Quick overview for hiring managers
- [Testing Guide](docs/TESTING.md) - Testing strategies and examples
- [Electron Desktop App](docs/BUILDING_DESKTOP_APP.md) - Desktop deployment guide
- [Security Practices](docs/ELECTRON_SECURITY.md) - Electron security implementation
- [Telemetry Simulator](docs/TELEMETRY_SIMULATOR.md) - WebSocket server documentation
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Study Guide](STUDY_GUIDE.md) - Technical concepts and interview preparation

---

## 🏗️ Building for Production

**Desktop Applications:**
```bash
npm run electron:dist        # Current platform
npm run electron:dist:mac    # macOS
npm run electron:dist:win    # Windows
npm run electron:dist:linux  # Linux
```

Built applications are output to the `release/` directory.

---

## 🎓 Learning Resources

For a comprehensive guide on the technical concepts used in this project, see [STUDY_GUIDE.md](STUDY_GUIDE.md). It covers:
- Custom hooks implementation and patterns
- State management decisions
- TypeScript benefits and usage
- Electron architecture
- Component composition
- Interview preparation topics

---

## 📧 Sharing This Project

**For Recruiters/Hiring Managers:**

This project demonstrates:
- **Initiative**: Self-directed exploration of domain-relevant challenges
- **Technical Depth**: Modern React patterns, real-time data handling, desktop deployment
- **Product Thinking**: Focus on operator workflows and user experience
- **Alignment**: Direct relevance to robotics operations and zero-to-one product development

**Recommended Sharing:**
1. **GitHub Repository**: Share the repo link (they can explore code, commits, and project management)
2. **Electron App** (Optional): If they want to run it locally, provide build instructions or a pre-built binary
3. **Executive Summary**: Point them to `EXECUTIVE_SUMMARY.md` for a 2-minute overview

See [EMAIL_TEMPLATE.md](EMAIL_TEMPLATE.md) for a ready-to-use email template.

---

*Built with React, TypeScript, and Electron. Demonstrating modern frontend patterns for robotics operations interfaces.*
