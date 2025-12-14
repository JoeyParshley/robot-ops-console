# Building a Simple POC: Step-by-Step Guide

This guide walks through building a simple proof-of-concept application similar to the Robot Operations Console, starting from scratch with Vite.

---

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Basic knowledge of React and TypeScript
- Code editor (VS Code recommended)

---

## Step 1: Initialize Project with Vite

### Create React + TypeScript Project

```bash
npm create vite@latest robot-ops-poc -- --template react-ts
cd robot-ops-poc
npm install
```

**What this does:**
- Creates a new Vite project with React and TypeScript
- Sets up basic project structure
- Installs dependencies

**Why Vite?**
- Fast development server (HMR - Hot Module Replacement)
- Fast builds
- Great TypeScript support
- Modern tooling out of the box

---

## Step 2: Install Additional Dependencies

```bash
# UI Component Library
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# Routing
npm install react-router-dom

# Type definitions (if needed)
npm install --save-dev @types/react-router-dom
```

**What each does:**
- **Material UI**: Pre-built components for faster UI development
- **React Router**: Client-side routing for multi-page apps
- **Type definitions**: TypeScript support for React Router

---

## Step 3: Project Structure

Create the following folder structure:

```
src/
  components/     # Reusable UI components
  hooks/          # Custom hooks
  context/         # Context providers (if needed)
  pages/          # Page components
  types/          # TypeScript type definitions
  mock/           # Mock data
  App.tsx         # Main app component
  main.tsx        # Entry point
```

**Create folders:**
```bash
mkdir -p src/components src/hooks src/pages src/types src/mock
```

---

## Step 4: Define Types

Create `src/types/robot.ts`:

```typescript
export type RobotStatus = "idle" | "active" | "charging" | "error";

export interface Robot {
    id: string;
    name: string;
    status: RobotStatus;
    battery: number; // 0-100
    location: string;
}

export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface TelemetryUpdate {
    robotId: string;
    timestamp: string;
    position: Position;
    battery: number;
    status: RobotStatus;
}
```

**Why start with types?**
- Defines the data model
- TypeScript will catch errors early
- Serves as documentation

---

## Step 5: Create Mock Data

Create `src/mock/robots.ts`:

```typescript
import type { Robot } from '../types/robot';

export const mockRobots: Robot[] = [
    {
        id: 'robot-1',
        name: 'Alpha',
        status: 'active',
        battery: 85,
        location: 'Warehouse A'
    },
    {
        id: 'robot-2',
        name: 'Beta',
        status: 'idle',
        battery: 92,
        location: 'Warehouse B'
    },
    {
        id: 'robot-3',
        name: 'Gamma',
        status: 'charging',
        battery: 45,
        location: 'Dock Station 1'
    }
];
```

**Why mock data?**
- Allows development without backend
- Easy to test UI
- Can be replaced with real API later

---

## Step 6: Create a Custom Hook

Create `src/hooks/useRobots.ts`:

```typescript
import { useState, useEffect } from 'react';
import type { Robot } from '../types/robot';
import { mockRobots } from '../mock/robots';

export const useRobots = () => {
    const [robots, setRobots] = useState<Robot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setRobots(mockRobots);
            setLoading(false);
        }, 1000);
    }, []);

    const updateRobotStatus = (robotId: string, newStatus: Robot['status']) => {
        setRobots(prevRobots =>
            prevRobots.map(robot =>
                robot.id === robotId ? { ...robot, status: newStatus } : robot
            )
        );
    };

    return { robots, loading, updateRobotStatus };
};
```

**What this does:**
- Manages robot data state
- Simulates API loading
- Provides function to update robot status
- Returns clean API for components

---

## Step 7: Create Components

### Simple Robot Card Component

Create `src/components/RobotCard.tsx`:

```typescript
import { Card, CardContent, Typography, Chip, LinearProgress } from '@mui/material';
import type { Robot } from '../types/robot';

interface RobotCardProps {
    robot: Robot;
}

export const RobotCard = ({ robot }: RobotCardProps) => {
    const getStatusColor = (status: Robot['status']) => {
        switch (status) {
            case 'active': return 'success';
            case 'idle': return 'info';
            case 'charging': return 'warning';
            case 'error': return 'error';
            default: return 'default';
        }
    };

    return (
        <Card sx={{ minWidth: 275, margin: 2 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    {robot.name}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                    {robot.location}
                </Typography>
                <Chip 
                    label={robot.status} 
                    color={getStatusColor(robot.status) as any}
                    sx={{ mb: 2 }}
                />
                <Typography variant="body2" sx={{ mb: 1 }}>
                    Battery: {robot.battery}%
                </Typography>
                <LinearProgress 
                    variant="determinate" 
                    value={robot.battery} 
                    sx={{ height: 8, borderRadius: 4 }}
                />
            </CardContent>
        </Card>
    );
};
```

**What this does:**
- Displays robot information
- Uses Material UI components
- Shows battery level with progress bar
- Status chip with color coding

---

## Step 8: Create Pages

### Fleet Overview Page

Create `src/pages/FleetOverviewPage.tsx`:

```typescript
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import { useRobots } from '../hooks/useRobots';
import { RobotCard } from '../components/RobotCard';

export const FleetOverviewPage = () => {
    const { robots, loading } = useRobots();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Robot Fleet Overview
            </Typography>
            <Grid container spacing={2}>
                {robots.map(robot => (
                    <Grid item xs={12} sm={6} md={4} key={robot.id}>
                        <RobotCard robot={robot} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
```

**What this does:**
- Uses the `useRobots` hook to get data
- Shows loading state
- Renders robot cards in a grid
- Composes components together

---

## Step 9: Set Up Routing

Update `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import { FleetOverviewPage } from './pages/FleetOverviewPage';

function App() {
    return (
        <BrowserRouter>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Routes>
                    <Route path="/" element={<FleetOverviewPage />} />
                </Routes>
            </Container>
        </BrowserRouter>
    );
}

export default App;
```

**What this does:**
- Sets up React Router
- Defines routes
- Wraps app in router context

---

## Step 10: Add Material UI Theme (Optional)

Create `src/theme.ts`:

```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'dark', // or 'light'
        primary: {
            main: '#1976d2',
        },
    },
});
```

Update `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { theme } from './theme';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
);
```

---

## Step 11: Run the Application

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

**What you should see:**
- List of robots in a grid
- Each robot shows name, location, status, and battery
- Material UI styling

---

## Step 12: Add Real-time Updates (Optional)

### Simple WebSocket Hook

Create `src/hooks/useTelemetry.ts`:

```typescript
import { useState, useEffect, useRef } from 'react';
import type { TelemetryUpdate } from '../types/robot';

export const useTelemetry = (url: string = 'ws://localhost:8080') => {
    const [telemetry, setTelemetry] = useState<TelemetryUpdate | null>(null);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => {
            setConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setTelemetry(data);
        };

        ws.onclose = () => {
            setConnected(false);
        };

        wsRef.current = ws;

        return () => {
            ws.close();
        };
    }, [url]);

    return { telemetry, connected };
};
```

**Note**: You'll need a WebSocket server running. For a simple POC, you can skip this step or use a mock.

---

## Step 13: Add Testing (Optional)

Install testing dependencies:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

Create `src/hooks/useRobots.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRobots } from './useRobots';

describe('useRobots', () => {
    it('should load robots', async () => {
        const { result } = renderHook(() => useRobots());

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.robots.length).toBeGreaterThan(0);
    });
});
```

Run tests:
```bash
npm run test
```

---

## Step 14: Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

---

## Next Steps

1. **Add More Features:**
   - Robot detail page
   - Control buttons (start, stop)
   - Real-time telemetry updates
   - Error handling

2. **Improve Architecture:**
   - Add Context API for global state
   - Create more custom hooks
   - Add error boundaries

3. **Add Electron (Desktop App):**
   ```bash
   npm install --save-dev electron electron-builder
   ```
   See `docs/BUILDING_DESKTOP_APP.md` for details.

4. **Connect to Real Backend:**
   - Replace mock data with API calls
   - Add authentication
   - Handle errors gracefully

---

## Common Issues & Solutions

### Issue: TypeScript errors
**Solution**: Make sure types are properly imported and match your data structure.

### Issue: Material UI styles not working
**Solution**: Ensure `@emotion/react` and `@emotion/styled` are installed.

### Issue: Routing not working
**Solution**: Make sure `BrowserRouter` wraps your app in `App.tsx`.

### Issue: Hooks not updating
**Solution**: Check dependencies in `useEffect` and `useCallback`.

---

## Key Takeaways

1. **Start Simple**: Begin with types, then mock data, then components
2. **Use Hooks**: Extract logic into custom hooks for reusability
3. **Compose Components**: Build complex UIs from simple components
4. **TypeScript First**: Define types early to catch errors
5. **Iterate**: Add features incrementally

---

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)

---

**Remember**: This is a learning process. Don't worry about making it perfect on the first try. Build, test, iterate, and learn!
