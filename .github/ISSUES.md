# GitHub Issues for Robot Ops Console

This file contains GitHub issue templates for the next development steps. Copy and paste these into GitHub Issues.

---

## Issue #1: Implement React Router Navigation

**Priority:** High  
**Type:** Feature  
**Labels:** `enhancement`, `routing`, `navigation`

### Description

Currently, `BrowserRouter` is set up in `main.tsx` but not being used. The app uses state-based navigation instead of proper routing. We need to implement React Router v7 to enable proper URL-based navigation.

### Acceptance Criteria

- [x] Replace state-based navigation in `App.tsx` with React Router routes
- [x] Add route for `/` (fleet overview page)
- [x] Add route for `/robots/:id` (robot detail page)
- [x] Update `FleetOverviewPage` to use `useNavigate()` hook instead of callback props
- [x] Update `RobotDetailPage` to use `useNavigate()` for back navigation
- [x] Handle invalid robot IDs (404 or redirect to fleet overview)
- [x] Add tests for routing behavior
- [x] Browser back/forward buttons work correctly
- [x] Direct URL access to robot detail pages works

### Technical Notes

- React Router v7 is already installed (`react-router-dom@^7.10.1`)
- `BrowserRouter` is already set up in `main.tsx`
- Need to update `App.tsx` to use `<Routes>` and `<Route>` components
- Consider using `useParams()` to get robot ID from URL
- Update tests to use `MemoryRouter` for testing routing

### Related Files

- `src/App.tsx`
- `src/pages/FleetOverviewPage.tsx`
- `src/pages/RobotDetailPage.tsx`
- `src/pages/FleetOverviewPage.test.tsx`
- `src/pages/RobotDetailPage.test.tsx`

---

## Issue #2: Create Mock RobotDetail Data

**Priority:** Medium  
**Type:** Feature  
**Labels:** `data`, `mocking`, `testing`

### Description

The `RobotDetailPage` component expects `RobotDetail` objects with rich telemetry data, but we only have `Robot[]` mock data. We need to create comprehensive mock `RobotDetail` data that includes all the extended fields.

### Acceptance Criteria

- [x] Create `mockRobotDetails` array in `src/mock/robots.ts`
- [x] Include all `RobotDetail` fields:
  - [x] Real-time telemetry (position, orientation, velocity)
  - [x] Status history entries
  - [x] Task history entries
  - [x] Error logs
  - [x] Performance metrics
  - [x] Firmware version, hardware model
  - [x] Maintenance dates
- [x] Create mock data for at least 2-3 robots with different states
- [x] Ensure mock data is realistic and varied
- [x] Update any existing code that needs to use `RobotDetail` instead of `Robot`

### Technical Notes

- `RobotDetail` extends `Robot` with additional fields (see `src/types/robot.ts`)
- Mock data should be realistic (e.g., valid timestamps, reasonable telemetry values)
- Consider creating a helper function to convert `Robot` to `RobotDetail` if needed

### Related Files

- `src/mock/robots.ts`
- `src/types/robot.ts`
- `src/pages/RobotDetailPage.tsx`

---

## Issue #3: Enhance RobotDetailPage with Full Data Display

**Priority:** High  
**Type:** Feature  
**Labels:** `enhancement`, `ui`, `telemetry`

### Description

The `RobotDetailPage` currently only displays basic information (name, ID, location, status, battery). It should display all the rich data available in `RobotDetail`, including telemetry, history, metrics, and operator controls.

### Acceptance Criteria

- [x] Display real-time telemetry:
  - [x] Current position (x, y, z)
  - [x] Current orientation (roll, pitch, yaw)
  - [x] Current velocity (vx, vy, vz)
- [x] Display status history in a table or timeline
- [x] Display task history with status indicators
- [x] Display error logs with severity indicators
- [x] Display performance metrics:
  - [x] Uptime
  - [x] Total flight time
  - [x] Tasks completed/failed
  - [x] Average battery efficiency
- [x] Display metadata:
  - [x] Firmware version
  - [x] Hardware model
  - [x] Last maintenance date
  - [x] Next maintenance due date
- [x] Add operator control buttons:
  - [x] Start
  - [x] Pause
  - [x] Resume
  - [x] Return to Dock
  - [x] Emergency Stop
- [x] Controls should be visually distinct (e.g., Emergency Stop in red)
- [x] Controls should be disabled/enabled based on robot status
- [x] Add appropriate MUI components for data visualization (Tables, Cards, etc.)
- [x] Ensure responsive layout

### Technical Notes

- Use MUI components for consistent styling
- Consider using `Card` or `Paper` components to group related information
- Telemetry values should be formatted appropriately (e.g., "10.5 m", "45.0°")
- Status history and task history could use MUI `Table` or `Timeline` components
- Error logs should use color coding for severity (warning=yellow, error=orange, critical=red)

### Related Files

- `src/pages/RobotDetailPage.tsx`
- `src/pages/RobotDetailPage.test.tsx`
- `src/types/robot.ts`

---

## Issue #4: Add Tests for Routing and Navigation

**Priority:** Medium  
**Type:** Testing  
**Labels:** `testing`, `routing`, `tdd`

### Description

After implementing React Router, we need comprehensive tests to ensure routing works correctly, including navigation, URL parameters, and edge cases.

### Acceptance Criteria

- [x] Test navigation from fleet overview to robot detail page
- [x] Test back navigation from robot detail to fleet overview
- [x] Test direct URL access to robot detail page (valid ID)
- [x] Test handling of invalid robot IDs (404 or redirect)
- [x] Test browser back/forward button behavior
- [x] Test that URL updates correctly when navigating
- [x] Update existing tests to work with React Router
- [x] Use `MemoryRouter` in tests for isolated testing
- [x] Test that `useNavigate()` is called with correct paths

### Technical Notes

- Use `@testing-library/react` with `MemoryRouter` for routing tests
- May need to wrap components in router context for testing
- Consider using `createMemoryRouter` from React Router v7 for more control
- Test both programmatic navigation and user interactions

### Related Files

- `src/pages/FleetOverviewPage.test.tsx`
- `src/pages/RobotDetailPage.test.tsx`
- `src/App.tsx` (may need App.test.tsx)

---

## Issue #5: Add Tests for Enhanced RobotDetailPage

**Priority:** Medium  
**Type:** Testing  
**Labels:** `testing`, `tdd`, `ui`

### Description

After enhancing `RobotDetailPage` with telemetry, history, and controls, we need comprehensive tests to ensure all new features work correctly.

### Acceptance Criteria

- [x] Test that all telemetry data is displayed correctly
- [x] Test that status history is rendered
- [x] Test that task history is rendered with correct status indicators
- [x] Test that error logs are displayed with severity indicators
- [x] Test that performance metrics are displayed
- [x] Test that metadata (firmware, hardware, maintenance) is displayed
- [x] Test that operator control buttons are rendered
- [x] Test that control buttons are enabled/disabled based on robot status
- [x] Test that clicking control buttons triggers appropriate handlers (if implemented)
- [x] Test edge cases (empty history, no errors, etc.)

### Technical Notes

- Follow existing test patterns in `RobotDetailPage.test.tsx`
- Use `screen.getByText()` and similar queries to verify content
- Test both presence and absence of elements based on data
- Consider testing formatting of numeric values

### Related Files

- `src/pages/RobotDetailPage.test.tsx`
- `src/pages/RobotDetailPage.tsx`

---

## Issue #6: Implement Operator Control Handlers

**Priority:** Low  
**Type:** Feature  
**Labels:** `feature`, `controls`, `backend-integration`

### Description

The operator control buttons (Start, Pause, Resume, Return to Dock, Emergency Stop) need to have actual functionality. For now, these can log actions or show confirmation dialogs, but the structure should be ready for backend integration.

### Acceptance Criteria

- [x] Implement handler functions for each control action
- [x] Add confirmation dialog for critical actions (Emergency Stop, Return to Dock)
- [x] Log actions to console (or prepare for API calls)
- [x] Update robot status appropriately (if using local state)
- [x] Disable controls that don't make sense for current robot status
- [x] Show loading states during action execution
- [x] Show success/error feedback to user
- [x] Add tests for control handlers

### Technical Notes

- For POC, handlers can be stubs that log actions
- Consider using MUI `Dialog` for confirmations
- Use MUI `Snackbar` or `Alert` for feedback
- Structure code to easily swap in real API calls later
- Consider using a state management solution if needed

### Related Files

- `src/pages/RobotDetailPage.tsx`
- `src/pages/RobotDetailPage.test.tsx`

---

## Issue #7: Create useTelemetry Hook and Wire Real-time UI

**Priority:** High  
**Type:** Feature  
**Labels:** `feature`, `websocket`, `real-time`, `telemetry`, `hooks`

### Description

Create a custom React hook (`useTelemetry`) that connects to the WebSocket telemetry simulator service and provides real-time telemetry data to components. Wire this hook into the existing UI components to display live, updating telemetry data instead of static mock data.

### Acceptance Criteria

- [ ] Create `useTelemetry` hook in `src/hooks/useTelemetry.ts`
- [ ] Hook connects to WebSocket server (`ws://localhost:8080` by default)
- [ ] Hook manages WebSocket connection lifecycle (connect, disconnect, reconnect)
- [ ] Hook provides telemetry data for all robots or a specific robot
- [ ] Hook handles connection states (connecting, connected, disconnected, error)
- [ ] Hook handles reconnection logic with exponential backoff
- [ ] Hook sends control commands via WebSocket
- [ ] Hook processes incoming messages:
  - [ ] `initial_state` messages
  - [ ] `telemetry` update messages
  - [ ] `command_ack` confirmations
  - [ ] `error` messages
- [ ] Update `RobotDetailPage` to use `useTelemetry` for real-time data
- [ ] Update `FleetOverviewPage` to use `useTelemetry` for fleet-wide updates
- [ ] Real-time updates to:
  - [ ] Position (x, y, z coordinates)
  - [ ] Orientation (roll, pitch, yaw)
  - [ ] Velocity (vx, vy, vz)
  - [ ] Battery level
  - [ ] Robot status
  - [ ] Last heartbeat timestamp
- [ ] Integrate WebSocket commands with existing control handlers
- [ ] Show connection status indicator in UI
- [ ] Handle WebSocket errors gracefully with user feedback
- [ ] Fallback to mock data when WebSocket is unavailable
- [ ] Add loading states during initial connection
- [ ] Add tests for `useTelemetry` hook
- [ ] Add tests for real-time UI updates
- [ ] Update existing tests to work with WebSocket integration

### Technical Notes

- Use native `WebSocket` API (built into browsers)
- Consider using `useEffect` for connection management
- Use `useRef` to store WebSocket instance
- Implement reconnection logic with exponential backoff (e.g., 1s, 2s, 4s, 8s, max 30s)
- Store telemetry data in state (Map or object keyed by robotId)
- Merge telemetry updates with existing robot data
- Consider using `useCallback` for command sending function
- Handle WebSocket close events and attempt reconnection
- Show connection status badge/indicator in UI (e.g., green=connected, yellow=connecting, red=disconnected)
- For development, allow toggling between WebSocket and mock data
- Consider creating a WebSocket context provider for shared connection across components
- Update `useRobotControls` to optionally send commands via WebSocket
- Handle race conditions (e.g., multiple rapid commands)

### Hook API Design

```typescript
interface UseTelemetryOptions {
  url?: string; // WebSocket URL (default: 'ws://localhost:8080')
  robotId?: string; // Optional: filter to specific robot
  autoConnect?: boolean; // Auto-connect on mount (default: true)
  reconnect?: boolean; // Auto-reconnect on disconnect (default: true)
}

interface UseTelemetryReturn {
  // Telemetry data
  telemetry: Map<string, TelemetryUpdate> | TelemetryUpdate | null;
  
  // Connection state
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  sendCommand: (robotId: string, action: string) => void;
  
  // All robots telemetry (if robotId not specified)
  allRobots: Map<string, TelemetryUpdate>;
}
```

### Integration Points

1. **RobotDetailPage**:
   - Use `useTelemetry({ robotId: id })` to get real-time data for current robot
   - Merge telemetry updates with existing robot data
   - Update position, orientation, velocity displays in real-time
   - Update battery progress bar in real-time
   - Update status chip when status changes
   - Update last heartbeat timestamp

2. **FleetOverviewPage**:
   - Use `useTelemetry()` to get all robots' telemetry
   - Update battery levels in table
   - Update status indicators
   - Update last heartbeat timestamps
   - Highlight rows when status changes

3. **useRobotControls Hook**:
   - Integrate with WebSocket to send commands
   - Listen for `command_ack` messages to confirm actions
   - Update local state based on server responses

### Error Handling

- **Connection failures**: Show error message, attempt reconnection
- **Invalid messages**: Log error, continue processing other messages
- **Command failures**: Show error feedback, don't update local state
- **Network errors**: Graceful degradation to mock data
- **Server unavailable**: Show connection status, allow manual retry

### Performance Considerations

- Debounce rapid telemetry updates if needed
- Use `useMemo` for derived data calculations
- Avoid unnecessary re-renders when telemetry updates
- Consider using `React.memo` for child components that receive telemetry

### Testing Strategy

- Mock WebSocket in tests using `vi.fn()` or `@testing-library/react-hooks`
- Test connection lifecycle (connect, disconnect, reconnect)
- Test message handling (initial_state, telemetry, command_ack, error)
- Test command sending
- Test error scenarios (connection failure, invalid messages)
- Test reconnection logic
- Test UI updates when telemetry changes
- Test fallback to mock data when WebSocket unavailable

### Related Files

- `src/hooks/useTelemetry.ts` (new file)
- `src/pages/RobotDetailPage.tsx`
- `src/pages/FleetOverviewPage.tsx`
- `src/hooks/useRobotControls.ts`
- `src/context/RobotStateContext.tsx` (may need updates)
- `src/pages/RobotDetailPage.test.tsx`
- `src/pages/FleetOverviewPage.test.tsx`
- `server/telemetry-simulator.js` (reference implementation)
- `docs/TELEMETRY_SIMULATOR.md` (API documentation)

### Dependencies

- WebSocket API (native browser API, no additional dependencies needed)
- Telemetry simulator service must be running (see `server/` directory)

### Example Usage

```typescript
// In RobotDetailPage
const { id } = useParams<{ id: string }>();
const { telemetry, connected, sendCommand } = useTelemetry({ 
  robotId: id,
  url: 'ws://localhost:8080'
});

// Merge telemetry with robot data
const robotWithTelemetry = robot ? {
  ...robot,
  currentPosition: telemetry?.position || robot.currentPosition,
  currentOrientation: telemetry?.orientation || robot.currentOrientation,
  currentVelocity: telemetry?.velocity || robot.currentVelocity,
  battery: telemetry?.battery ?? robot.battery,
  status: telemetry?.status || robot.status,
  lastHeartbeat: telemetry?.lastHeartbeat || robot.lastHeartbeat,
} : null;

// Send commands via WebSocket
const handleStart = () => {
  sendCommand(id || '', 'start');
};
```

---

## Issue #8: Basic Electron Integration (MVP)

**Priority:** High  
**Type:** Feature  
**Labels:** `enhancement`, `electron`, `desktop`, `mvp`

### Description

Set up the foundational Electron wrapper to run the Robot Ops Console as a desktop application. This MVP focuses on getting the basic Electron window working with the existing React app, establishing the development workflow, and verifying that all core functionality (navigation, WebSocket connections) works correctly in the Electron context.

### Acceptance Criteria

- [ ] Install Electron and required dependencies (`electron`, `electron-vite` or `vite-plugin-electron`)
- [ ] Create Electron main process file (`electron/main.ts`)
- [ ] Create Electron preload script (`electron/preload.ts`) with context isolation
- [ ] Configure Electron to load from Vite dev server in development (`http://localhost:5173`)
- [ ] Set up development workflow: `npm run electron:dev` to run Electron with hot reload
- [ ] Configure basic window (default size 1920x1080, minimum 1280x720)
- [ ] Set window title: "Robot Ops Console"
- [ ] Application window opens and displays the React app correctly
- [ ] React Router navigation works correctly in Electron context
- [ ] All existing UI components render and function properly
- [ ] WebSocket connections to telemetry simulator work correctly in Electron
- [ ] Connection status indicators function correctly
- [ ] Operator controls function correctly
- [ ] Test application launch and basic functionality
- [ ] Test navigation flows work correctly
- [ ] Test WebSocket connections in Electron context
- [ ] Update README with basic Electron development instructions
- [ ] Add Electron build artifacts to `.gitignore` (`out/`, `dist-electron/`)

### Technical Notes

- Use `electron-vite` or `vite-plugin-electron` for seamless Vite integration
- Enable context isolation and disable `nodeIntegration` for security
- Use preload script for any IPC communication if needed
- Load from dev server in development, will handle production build in Issue #9
- WebSocket should work normally in Electron renderer process

### Related Files

- `package.json` (add Electron dependencies and dev script)
- `vite.config.ts` (add Electron plugin configuration)
- `electron/main.ts` (new - main process)
- `electron/preload.ts` (new - preload script)
- `README.md` (update with Electron dev instructions)
- `.gitignore` (add Electron build artifacts)

### Estimated Effort: 3-4 hours

---

## Issue #9: Electron Production Build & Packaging

**Priority:** High  
**Type:** Feature  
**Labels:** `enhancement`, `electron`, `build`, `packaging`, `distribution`

### Description

Set up production builds and packaging for the Electron application. This includes configuring the build system to create distributable packages for macOS, Windows, and Linux, ensuring the production build loads correctly from bundled files, and setting up proper application metadata and icons.

### Acceptance Criteria

- [ ] Integrate Electron build with existing Vite build process
- [ ] Configure Electron to load from `file://` protocol in production (bundled files)
- [ ] Ensure production Vite build is properly packaged in Electron
- [ ] Handle Vite asset paths correctly in Electron context
- [ ] Ensure all static assets (images, fonts, etc.) load correctly in production
- [ ] Set up `electron-builder` or `electron-forge` for packaging
- [ ] Configure build for macOS (.app or .dmg)
- [ ] Configure build for Windows (.exe or installer)
- [ ] Configure build for Linux (.AppImage, .deb, or .rpm)
- [ ] Create application icons for all platforms (or placeholder icons)
- [ ] Set up proper application metadata (name, version, description, author)
- [ ] Add production build script: `npm run electron:build`
- [ ] Test production build runs without dev server
- [ ] Test production build on at least one target platform
- [ ] Verify no console errors or warnings in production builds
- [ ] Update README with production build instructions

### Technical Notes

- Use `electron-builder` (recommended) or `electron-forge` for packaging
- Configure `electron-builder` in `package.json` or separate config file
- Ensure Vite `base` path is correct for Electron (usually `./`)
- Test production build thoroughly - file paths work differently than dev server
- Icons can be placeholders initially, refined in Issue #10

### Related Files

- `package.json` (add electron-builder config and build script)
- `vite.config.ts` (ensure production build config is correct)
- `electron/main.ts` (update to handle production file loading)
- `electron/icons/` (new - application icons)
- `README.md` (update with build instructions)

### Estimated Effort: 2-3 hours

---

## Issue #10: Electron UX Enhancements

**Priority:** Medium  
**Type:** Feature  
**Labels:** `enhancement`, `electron`, `ux`, `menu`, `window-management`

### Description

Enhance the Electron application with polished UX features including window state persistence, application menu, keyboard shortcuts, and improved window management. This makes the desktop application feel native and professional.

### Acceptance Criteria

- [ ] Implement window state persistence (remember size/position on restart)
- [ ] Handle window close behavior appropriately
- [ ] Support fullscreen mode (useful for operator consoles)
- [ ] Prevent window from being resized below minimum dimensions
- [ ] Set appropriate window background color during loading
- [ ] Create application menu bar (File, Edit, View, Window, Help)
- [ ] Add standard menu items:
  - [ ] File > Quit (with Cmd+Q / Ctrl+Q shortcut)
  - [ ] View > Reload (for development, Cmd+R / Ctrl+R)
  - [ ] View > Toggle Developer Tools (for debugging, Cmd+Option+I / Ctrl+Shift+I)
  - [ ] Window > Minimize, Maximize, Close
- [ ] Add "About" dialog with version information
- [ ] Disable or customize menu items appropriately for production builds
- [ ] Create proper application icons (replace placeholders from Issue #9)
- [ ] Test window resize, minimize, maximize, close behaviors
- [ ] Test application menu functionality
- [ ] Test keyboard shortcuts work correctly
- [ ] Update documentation with UX features

### Technical Notes

- Use `electron-window-state` or similar for window state persistence
- Use Electron's `Menu` API for application menu
- Platform-specific menu items (e.g., macOS app menu)
- Icons should be in multiple sizes for different platforms
- Consider using `electron-store` for persistent settings if needed

### Related Files

- `electron/main.ts` (add menu and window state management)
- `electron/icons/` (create proper icons)
- `package.json` (may need additional dependencies)

### Estimated Effort: 2-3 hours

---

## Issue #11: Electron Security & Error Handling

**Priority:** Medium  
**Type:** Feature  
**Labels:** `enhancement`, `electron`, `security`, `error-handling`, `diagnostics`

### Description

Implement security best practices and robust error handling for the Electron application. This includes ensuring proper security configuration, handling Electron-specific errors gracefully, and providing user-friendly feedback for failures.

### Acceptance Criteria

- [ ] Verify context isolation is enabled (should be done in Issue #8, verify here)
- [ ] Verify `nodeIntegration` is disabled in renderer (should be done in Issue #8, verify here)
- [ ] Use preload scripts for any IPC communication
- [ ] Configure Content Security Policy appropriately
- [ ] Handle CORS and network security correctly
- [ ] Run Electron security checklist and address any warnings
- [ ] Handle Electron-specific errors gracefully
- [ ] Show user-friendly error messages for critical failures
- [ ] Handle cases where telemetry simulator is not running
- [ ] Provide clear feedback when application cannot connect to services
- [ ] Log errors to console (optional: log to file for diagnostics)
- [ ] Test error scenarios (connection failures, invalid states)
- [ ] Verify no security warnings in Electron security checklist
- [ ] Update documentation with security considerations

### Technical Notes

- Review Electron security best practices: https://www.electronjs.org/docs/latest/tutorial/security
- Use context isolation (default in modern Electron)
- Validate all IPC messages if using IPC
- Consider using `electron-log` for file-based logging if needed
- Test with Electron's security warnings enabled

### Related Files

- `electron/main.ts` (verify security settings)
- `electron/preload.ts` (ensure secure IPC if needed)
- `README.md` (document security considerations)

### Estimated Effort: 1-2 hours


---

## Summary

**Total Issues:** 11

**Priority Breakdown:**
- High: 5 issues (Router navigation, Enhanced RobotDetailPage, useTelemetry hook, Electron MVP, Electron production build)
- Medium: 5 issues (Mock data, Routing tests, RobotDetailPage tests, Electron UX, Electron security)
- Low: 1 issue (Control handlers)

**Estimated Effort:**
- Issue #1: 2-3 hours
- Issue #2: 1 hour
- Issue #3: 3-4 hours
- Issue #4: 2 hours
- Issue #5: 2-3 hours
- Issue #6: 2-3 hours
- Issue #7: 4-5 hours
- Issue #8: 3-4 hours (Electron MVP)
- Issue #9: 2-3 hours (Electron production build)
- Issue #10: 2-3 hours (Electron UX)
- Issue #11: 1-2 hours (Electron security)

**Total Estimated Time:** 24-33 hours

