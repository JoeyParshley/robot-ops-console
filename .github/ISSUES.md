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

- [ ] Replace state-based navigation in `App.tsx` with React Router routes
- [ ] Add route for `/` (fleet overview page)
- [ ] Add route for `/robots/:id` (robot detail page)
- [ ] Update `FleetOverviewPage` to use `useNavigate()` hook instead of callback props
- [ ] Update `RobotDetailPage` to use `useNavigate()` for back navigation
- [ ] Handle invalid robot IDs (404 or redirect to fleet overview)
- [ ] Add tests for routing behavior
- [ ] Browser back/forward buttons work correctly
- [ ] Direct URL access to robot detail pages works

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

- [ ] Create `mockRobotDetails` array in `src/mock/robots.ts`
- [ ] Include all `RobotDetail` fields:
  - [ ] Real-time telemetry (position, orientation, velocity)
  - [ ] Status history entries
  - [ ] Task history entries
  - [ ] Error logs
  - [ ] Performance metrics
  - [ ] Firmware version, hardware model
  - [ ] Maintenance dates
- [ ] Create mock data for at least 2-3 robots with different states
- [ ] Ensure mock data is realistic and varied
- [ ] Update any existing code that needs to use `RobotDetail` instead of `Robot`

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

- [ ] Display real-time telemetry:
  - [ ] Current position (x, y, z)
  - [ ] Current orientation (roll, pitch, yaw)
  - [ ] Current velocity (vx, vy, vz)
- [ ] Display status history in a table or timeline
- [ ] Display task history with status indicators
- [ ] Display error logs with severity indicators
- [ ] Display performance metrics:
  - [ ] Uptime
  - [ ] Total flight time
  - [ ] Tasks completed/failed
  - [ ] Average battery efficiency
- [ ] Display metadata:
  - [ ] Firmware version
  - [ ] Hardware model
  - [ ] Last maintenance date
  - [ ] Next maintenance due date
- [ ] Add operator control buttons:
  - [ ] Start
  - [ ] Pause
  - [ ] Resume
  - [ ] Return to Dock
  - [ ] Emergency Stop
- [ ] Controls should be visually distinct (e.g., Emergency Stop in red)
- [ ] Controls should be disabled/enabled based on robot status
- [ ] Add appropriate MUI components for data visualization (Tables, Cards, etc.)
- [ ] Ensure responsive layout

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

- [ ] Test navigation from fleet overview to robot detail page
- [ ] Test back navigation from robot detail to fleet overview
- [ ] Test direct URL access to robot detail page (valid ID)
- [ ] Test handling of invalid robot IDs (404 or redirect)
- [ ] Test browser back/forward button behavior
- [ ] Test that URL updates correctly when navigating
- [ ] Update existing tests to work with React Router
- [ ] Use `MemoryRouter` in tests for isolated testing
- [ ] Test that `useNavigate()` is called with correct paths

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

- [ ] Test that all telemetry data is displayed correctly
- [ ] Test that status history is rendered
- [ ] Test that task history is rendered with correct status indicators
- [ ] Test that error logs are displayed with severity indicators
- [ ] Test that performance metrics are displayed
- [ ] Test that metadata (firmware, hardware, maintenance) is displayed
- [ ] Test that operator control buttons are rendered
- [ ] Test that control buttons are enabled/disabled based on robot status
- [ ] Test that clicking control buttons triggers appropriate handlers (if implemented)
- [ ] Test edge cases (empty history, no errors, etc.)

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

- [ ] Implement handler functions for each control action
- [ ] Add confirmation dialog for critical actions (Emergency Stop, Return to Dock)
- [ ] Log actions to console (or prepare for API calls)
- [ ] Update robot status appropriately (if using local state)
- [ ] Disable controls that don't make sense for current robot status
- [ ] Show loading states during action execution
- [ ] Show success/error feedback to user
- [ ] Add tests for control handlers

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

## Summary

**Total Issues:** 6

**Priority Breakdown:**
- High: 2 issues (Router navigation, Enhanced RobotDetailPage)
- Medium: 3 issues (Mock data, Routing tests, RobotDetailPage tests)
- Low: 1 issue (Control handlers)

**Estimated Effort:**
- Issue #1: 2-3 hours
- Issue #2: 1 hour
- Issue #3: 3-4 hours
- Issue #4: 2 hours
- Issue #5: 2-3 hours
- Issue #6: 2-3 hours

**Total Estimated Time:** 12-16 hours

