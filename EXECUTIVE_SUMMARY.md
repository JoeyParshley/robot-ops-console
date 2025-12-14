# Robot Operations Console - Executive Summary

**2-Minute Read for Hiring Managers**

---

## What It Is

A desktop application for monitoring and controlling tethered flying robots. Operators can view fleet status, control individual robots, and receive real-time telemetry data. Built as a proof-of-concept to demonstrate frontend engineering capabilities for robotics interfaces.

**Tech Stack**: React + TypeScript, Electron (desktop), WebSocket (real-time data), Material UI

---

## Why It Matters

This project directly addresses the interface layer that connects human operators to autonomous systems—a critical component for any robotics venture. It demonstrates:

- **Product Thinking**: Focus on operator workflows and safety-critical UI patterns
- **Technical Depth**: Modern React patterns, real-time data handling, desktop deployment
- **Alignment**: Relevant to developing groundbreaking technologies that improve people's lives

---

## Key Technical Highlights

### TypeScript
- **Why**: Type safety prevents errors in safety-critical robot commands
- **Example**: Can't accidentally send invalid status values to robots ([`RobotStatus` type](src/types/robot.ts#L1))
- **Benefit**: Catches bugs at compile-time, not runtime
- **See**: [`src/types/robot.ts`](src/types/robot.ts#L1-L102) for comprehensive type definitions

### Custom Hooks
- **[`useTelemetry`](src/hooks/useTelemetry.ts#L44-L50)**: Manages WebSocket connections and real-time data streaming ([connection logic](src/hooks/useTelemetry.ts#L115-L169))
- **[`useRobotControls`](src/hooks/useRobotControls.ts#L25-L40)**: Handles robot commands with loading states and confirmations ([example: handleStart](src/hooks/useRobotControls.ts#L79-L86))
- **Why**: Reusable business logic separated from UI components
- **Tests**: [`useTelemetry.test.ts`](src/hooks/useTelemetry.test.ts), [`useRobotControls.test.ts`](src/hooks/useRobotControls.test.ts)

### State Management
- **Choice**: React Context API (not Redux)
- **Why**: Simple state scope, built into React, easy to maintain
- **When Redux?**: Would use if we needed middleware, complex async flows, or >100 robots
- **See**: [`RobotStateProvider`](src/context/RobotStateContext.tsx#L17-L36) implementation with [`updateRobotStatus`](src/context/RobotStateContext.tsx#L20-L26) function

### Electron
- **Why**: Desktop deployment for operator console environments
- **Security**: Implemented best practices (context isolation, CSP, secure IPC) - see [`configureSecurity`](electron/main.ts#L287-L324)
- **Features**: Window state persistence, error handling, production-ready packaging
- **See**: [`electron/main.ts`](electron/main.ts#L326-L582) for main process implementation

---

## Development Approach

- **Test-Driven Development**: Comprehensive test coverage for hooks and components
- **GitHub Projects**: Used to track weekend sprint progress
- **Cursor AI**: Assisted with rapid prototyping and learning unfamiliar patterns
- **Time**: Built independently over a weekend

---

## What to Explore

1. **Code Quality**: Check [`src/hooks/`](src/hooks/) for custom hook implementations
   - [`useTelemetry.ts`](src/hooks/useTelemetry.ts) - WebSocket real-time data
   - [`useRobotControls.ts`](src/hooks/useRobotControls.ts) - Robot command handling
2. **Type Safety**: Review [`src/types/robot.ts`](src/types/robot.ts) for comprehensive type definitions
3. **Testing**: See test files for test-driven development examples
   - [`useTelemetry.test.ts`](src/hooks/useTelemetry.test.ts)
   - [`useRobotControls.test.ts`](src/hooks/useRobotControls.test.ts)
   - [`RobotStateContext.test.tsx`](src/context/RobotStateContext.test.tsx)
4. **Architecture**: Examine how Context API and hooks compose together
   - [`src/context/RobotStateContext.tsx`](src/context/RobotStateContext.tsx) - State management
   - [`src/pages/FleetOverviewPage.tsx`](src/pages/FleetOverviewPage.tsx) - Hook composition example
   - [`src/pages/RobotDetailPage.tsx`](src/pages/RobotDetailPage.tsx) - Multiple hooks in action

---

## Quick Demo

1. Clone the repository
2. Run `npm install && cd server && npm install && cd ..`
3. Start simulator: `cd server && npm start`
4. Start app: `npm run electron:dev`

Or explore the code directly—all components are well-documented with TypeScript types.

---

**Full Documentation**: See [README.md](README.md) for complete technical details and [STUDY_GUIDE.md](STUDY_GUIDE.md) for learning resources.
