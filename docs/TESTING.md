# Testing Guide

This guide covers all aspects of testing the Robot Ops Console application, including automated tests, manual testing, and telemetry simulator testing.

---

## 🧪 Automated Tests

### Running Tests

**Run all tests once:**
```bash
npm test
```

**Run tests in watch mode (auto-rerun on file changes):**
```bash
npm run test:watch
```

**Run tests with coverage:**
```bash
npm test -- --coverage
```

**Run a specific test file:**
```bash
npm test -- src/pages/FleetOverviewPage.test.tsx
```

**Run tests matching a pattern:**
```bash
npm test -- --grep "FleetOverviewPage"
```

### Test Files

- `src/pages/FleetOverviewPage.test.tsx` - Tests for the fleet overview page
- `src/pages/RobotDetailPage.test.tsx` - Tests for the robot detail page

### Test Coverage

Current test coverage includes:

- ✅ Fleet overview rendering
- ✅ Robot detail page rendering
- ✅ Navigation between pages
- ✅ URL routing and parameters
- ✅ Invalid robot ID handling
- ✅ Operator control buttons
- ✅ Control button enable/disable logic
- ✅ Data display (telemetry, history, metrics)
- ✅ Edge cases (empty data, missing fields)

### Expected Test Behavior

**Note:** The tests will show WebSocket connection errors in the console. This is **expected behavior** because:
- Tests run in a JSDOM environment without a real WebSocket server
- The `useTelemetry` hook attempts to connect but fails gracefully
- The app falls back to mock data, which is what we test

These errors don't indicate test failures - they're just console logs from the WebSocket connection attempts.

---

## 🖱️ Manual Testing

### 1. Start the Application

**Terminal 1 - Start Telemetry Simulator:**
```bash
cd server
npm start
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

### 2. Test Fleet Overview Page

1. **Open the app** in your browser (usually `http://localhost:5173`)

2. **Verify Simulator Connection:**
   - ✅ Green banner at top: "Telemetry Simulator Running"
   - ✅ Pulsing animation on the banner
   - ✅ "Live" chip in green (top right)
   - ✅ Banner shows count of robots receiving data

3. **Verify Robot Data:**
   - ✅ Robot table displays all robots
   - ✅ Status chips show correct colors (green=active, blue=idle, etc.)
   - ✅ Battery bars update in real-time
   - ✅ Last heartbeat timestamps update
   - ✅ Green dot (●) appears next to robots with live data

4. **Test Navigation:**
   - ✅ Click any robot row → navigates to detail page
   - ✅ URL changes to `/robots/[robot-id]`

### 3. Test Robot Detail Page

1. **Navigate to a robot** (click a row in fleet overview)

2. **Verify Simulator Connection:**
   - ✅ Green banner: "Telemetry Simulator Running — Receiving live telemetry data for [Robot Name]"
   - ✅ "Live" chip in header

3. **Verify Real-time Updates:**
   - ✅ Position (x, y, z) values update
   - ✅ Orientation (roll, pitch, yaw) values update
   - ✅ Velocity (vx, vy, vz) values update
   - ✅ Battery level updates
   - ✅ Status changes reflect in real-time
   - ✅ Last heartbeat updates

4. **Test Operator Controls:**
   - ✅ **Start** button: Enabled when robot is `idle`, disabled otherwise
   - ✅ **Pause** button: Enabled when robot is `active`, disabled otherwise
   - ✅ **Resume** button: Enabled when robot is `idle`, disabled otherwise
   - ✅ **Return to Dock** button: Enabled when not `charging` or `error`
   - ✅ **Emergency Stop** button: Enabled when not `error`
   - ✅ Clicking buttons shows loading state
   - ✅ Success message appears after action
   - ✅ Confirmation dialog appears for "Return to Dock" and "Emergency Stop"

5. **Verify Data Display:**
   - ✅ All telemetry data visible
   - ✅ Status history table shows entries
   - ✅ Task history table shows entries
   - ✅ Error logs display (if any)
   - ✅ Performance metrics visible
   - ✅ Maintenance dates visible

6. **Test Navigation:**
   - ✅ "Back" button returns to fleet overview
   - ✅ Browser back button works
   - ✅ Direct URL access works (e.g., `/robots/rbt-001`)

### 4. Test Without Simulator

1. **Stop the telemetry simulator** (Ctrl+C in Terminal 1)

2. **Verify Fallback Behavior:**
   - ✅ Yellow "Offline" chip appears
   - ✅ Warning message: "Using mock data (WebSocket unavailable)"
   - ✅ App still functions normally
   - ✅ Static mock data displayed
   - ✅ No real-time updates

3. **Restart Simulator:**
   - ✅ App automatically reconnects
   - ✅ Green banner reappears
   - ✅ Real-time updates resume

---

## 🔌 Telemetry Simulator Testing

### 1. Health Check

**Test HTTP health endpoint:**
```bash
curl http://localhost:8080/health
```

**Expected response:**
```json
{"status":"ok"}
```

### 2. Robot List API

**Get list of robots:**
```bash
curl http://localhost:8080/api/robots
```

**Expected response:**
```json
[
  {
    "id": "rbt-001",
    "name": "Atlas-01",
    "status": "active",
    ...
  },
  ...
]
```

### 3. WebSocket Connection Test

**Using a WebSocket client (e.g., `wscat`):**

```bash
# Install wscat (if not installed)
npm install -g wscat

# Connect to simulator
wscat -c ws://localhost:8080
```

**Expected behavior:**
- Connection established
- Receives `initial_state` message with all robot data
- Receives periodic `telemetry` update messages

**Send a command:**
```json
{"type":"command","robotId":"rbt-001","action":"start"}
```

**Expected response:**
```json
{"type":"command_ack","robotId":"rbt-001","action":"start"}
```

### 4. Browser DevTools Testing

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Filter by WS (WebSocket)**
4. **Reload the page**
5. **Click on the WebSocket connection**
6. **Verify:**
   - ✅ Connection established to `ws://localhost:8080`
   - ✅ Messages being received (initial_state, telemetry)
   - ✅ Commands being sent when clicking control buttons

### 5. Console Logging

**Check browser console for:**
- ✅ `[Telemetry] Connected to WebSocket server`
- ✅ `[Telemetry] Sent command: [action] for robot [id]`
- ✅ `[Telemetry] Command acknowledged: [action] for robot [id]`

**Check simulator terminal for:**
- ✅ `Client connected`
- ✅ `Received command: [action] for robot [id]`
- ✅ Periodic telemetry updates being sent

---

## 🐛 Troubleshooting Tests

### Tests Fail with WebSocket Errors

**Problem:** Tests show WebSocket connection errors

**Solution:** This is expected! Tests run without a WebSocket server. The app gracefully falls back to mock data, which is what we test.

### Tests Timeout

**Problem:** Some tests timeout waiting for async operations

**Solution:** 
- Increase timeout in test: `it('test name', async () => { ... }, { timeout: 10000 })`
- Use `waitFor` from `@testing-library/react` for async assertions
- Ensure `act()` wraps state updates

### Simulator Won't Start

**Problem:** `Error: listen EADDRINUSE: address already in use :::8080`

**Solution:**
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=8081 npm start
```

### Frontend Can't Connect to Simulator

**Problem:** Frontend shows "Offline" even when simulator is running

**Solution:**
1. Verify simulator is running: `curl http://localhost:8080/health`
2. Check browser console for connection errors
3. Verify WebSocket URL in `useTelemetry` hook matches simulator port
4. Check firewall/network settings

### Real-time Updates Not Showing

**Problem:** Data doesn't update in real-time

**Solution:**
1. Check browser console for WebSocket messages
2. Verify simulator is sending updates (check simulator terminal)
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check that `connected` state is `true` in React DevTools

---

## 📊 Test Checklist

### Automated Tests
- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `npm run build`
- [ ] No linting errors: Check ESLint output

### Manual Testing - Fleet Overview
- [ ] Simulator connection indicator shows "Live"
- [ ] Green banner appears when connected
- [ ] Robot data displays correctly
- [ ] Real-time updates work (battery, status, heartbeat)
- [ ] Navigation to detail page works
- [ ] Fallback to mock data works when simulator offline

### Manual Testing - Robot Detail
- [ ] All robot data displays correctly
- [ ] Real-time telemetry updates (position, orientation, velocity)
- [ ] Operator controls work correctly
- [ ] Confirmation dialogs appear for critical actions
- [ ] Success/error messages appear
- [ ] Navigation back to fleet overview works
- [ ] Direct URL access works

### Telemetry Simulator
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Robot list API returns data
- [ ] WebSocket connection established
- [ ] Telemetry updates sent periodically
- [ ] Commands received and acknowledged
- [ ] Multiple clients can connect simultaneously

---

## 🔍 Debugging Tips

1. **Use React DevTools:**
   - Install React DevTools browser extension
   - Inspect component state and props
   - Check `useTelemetry` hook state

2. **Use Browser DevTools:**
   - Network tab: Monitor WebSocket messages
   - Console tab: Check for errors and logs
   - Application tab: Check WebSocket connections

3. **Add Console Logs:**
   ```typescript
   // In useTelemetry hook
   console.log('Telemetry state:', { connected, telemetry, error });
   
   // In components
   console.log('Robot data:', robot);
   ```

4. **Check Simulator Logs:**
   - Monitor simulator terminal output
   - Look for connection/disconnection messages
   - Check for command processing logs

---

## 📝 Writing New Tests

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(
      <MemoryRouter>
        <YourComponent />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Testing WebSocket Integration

When testing components that use `useTelemetry`, mock the WebSocket:

```typescript
import { vi } from 'vitest';

// Mock WebSocket
global.WebSocket = vi.fn(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: WebSocket.OPEN,
})) as any;
```

### Testing Async Operations

```typescript
import { waitFor } from '@testing-library/react';

it('should update after async operation', async () => {
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

---

## 🎯 Next Steps

- [ ] Add tests for `useTelemetry` hook
- [ ] Add tests for `useRobotControls` hook
- [ ] Add integration tests for WebSocket communication
- [ ] Add E2E tests with Playwright or Cypress
- [ ] Add performance tests for real-time updates
- [ ] Add accessibility tests

