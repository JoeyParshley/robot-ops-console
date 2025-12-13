# React Router Navigation Implementation Guide

This document explains the tasks and concepts involved in implementing React Router navigation for the Robot Ops Console project. It serves as both a learning resource and a reference for similar implementations.

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Key Concepts](#key-concepts)
3. [Implementation Tasks](#implementation-tasks)
4. [Code Examples](#code-examples)
5. [Testing Strategy](#testing-strategy)
6. [Learning Resources](#learning-resources)
7. [Common Pitfalls](#common-pitfalls)

---

## Problem Statement

### Before Implementation

The application used **state-based navigation**:
- `App.tsx` maintained `selectedRobotId` in component state
- `FleetOverviewPage` received an `onRobotSelected` callback prop
- Clicking a robot updated state, but the URL didn't change
- Direct URL access to robot detail pages didn't work
- Browser back/forward buttons didn't work
- No way to share links to specific robots

### After Implementation

The application uses **URL-based navigation** with React Router:
- URLs reflect the current page (`/` for fleet, `/robots/:id` for details)
- Direct URL access works
- Browser history works correctly
- Links can be shared and bookmarked
- Better user experience and SEO-friendly

---

## Key Concepts

### 1. React Router v7

React Router is a library for handling routing in React applications. It allows you to:
- Map URLs to components
- Navigate programmatically
- Access URL parameters
- Manage browser history

**Key Components:**
- `<BrowserRouter>` - Provides routing context (wraps the app)
- `<Routes>` - Container for route definitions
- `<Route>` - Defines a URL pattern and component to render
- `useNavigate()` - Hook for programmatic navigation
- `useParams()` - Hook for accessing URL parameters

### 2. URL Parameters

Dynamic segments in URLs are defined with `:paramName`:
- Route: `/robots/:id`
- URL: `/robots/rbt-001`
- Parameter: `id = "rbt-001"`

### 3. Navigation Patterns

**Declarative Navigation:**
- Using `<Link>` components (not used in this implementation)

**Programmatic Navigation:**
- Using `useNavigate()` hook to navigate in response to events

---

## Implementation Tasks

### Task 1: Set Up Routes in App.tsx

**What:** Replace state management with route definitions.

**Before:**
```tsx
const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null);
```

**After:**
```tsx
<Routes>
  <Route path="/" element={<FleetOverviewPage robots={mockRobots} />} />
  <Route path="/robots/:id" element={<RobotDetailPage robots={mockRobots} />} />
</Routes>
```

**Key Points:**
- Routes are defined declaratively
- Each route maps a URL pattern to a component
- The `:id` syntax creates a URL parameter

### Task 2: Update FleetOverviewPage to Use useNavigate()

**What:** Replace callback prop with React Router's navigation hook.

**Before:**
```tsx
interface FleetOverviewPageProps {
  robots: Robot[];
  onRobotSelected: (robotId: string) => void; // ❌ Callback prop
}

onClick={() => onRobotSelected(robot.id)}
```

**After:**
```tsx
interface FleetOverviewPageProps {
  robots: Robot[]; // ✅ No callback needed
}

const navigate = useNavigate(); // ✅ Get navigation function
onClick={() => navigate(`/robots/${robot.id}`)} // ✅ Navigate to URL
```

**Key Points:**
- `useNavigate()` returns a function to change the URL
- Navigation updates the URL, which triggers route matching
- No need to pass callbacks through props

### Task 3: Update RobotDetailPage to Use useParams() and useNavigate()

**What:** Extract robot ID from URL and handle navigation.

**Before:**
```tsx
interface RobotDetailPageProps {
  robot: RobotDetail; // ❌ Robot passed as prop
  onBack: () => void; // ❌ Callback prop
}
```

**After:**
```tsx
interface RobotDetailPageProps {
  robots: Robot[]; // ✅ Array of robots
}

const { id } = useParams<{ id: string }>(); // ✅ Get ID from URL
const navigate = useNavigate(); // ✅ Get navigation function
const robot = robots.find(r => r.id === id); // ✅ Find robot by ID
```

**Key Points:**
- `useParams()` extracts URL parameters
- Component finds the robot from the array using the ID
- Navigation is handled internally, no callbacks needed

### Task 4: Handle Invalid Robot IDs

**What:** Show an error message when a robot ID doesn't exist.

**Implementation:**
```tsx
if (!robot) {
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h5" color="error">
        Robot not found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Robot ID "{id}" does not exist in the fleet.
      </Typography>
      <Button onClick={() => navigate('/')}>
        Back to Fleet Overview
      </Button>
    </Paper>
  );
}
```

**Key Points:**
- Check if robot exists after finding by ID
- Provide user-friendly error message
- Offer navigation back to safety

### Task 5: Update Tests for Routing

**What:** Modify tests to work with React Router.

**Challenge:** React Router hooks (`useNavigate`, `useParams`) require router context.

**Solution:** Wrap test components in router providers.

**For FleetOverviewPage:**
```tsx
import { MemoryRouter } from 'react-router-dom';

render(
  <MemoryRouter>
    <FleetOverviewPage robots={mockRobots} />
  </MemoryRouter>
);
```

**For RobotDetailPage:**
```tsx
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

const router = createMemoryRouter([
  {
    path: "/robots/:id",
    element: <RobotDetailPage robots={mockRobots} />,
  },
], {
  initialEntries: ["/robots/rbt-001"],
});

render(<RouterProvider router={router} />);
```

**Key Points:**
- `MemoryRouter` provides router context without browser history
- `createMemoryRouter` allows setting initial URL for testing
- Tests can verify navigation behavior

---

## Code Examples

### Complete App.tsx

```tsx
import { Routes, Route } from 'react-router-dom'
import { Container } from '@mui/material'
import { FleetOverviewPage } from './pages/FleetOverviewPage'
import { RobotDetailPage } from './pages/RobotDetailPage'
import { mockRobots } from './mock/robots'

function App() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Routes>
        <Route
          path="/"
          element={<FleetOverviewPage robots={mockRobots} />} 
        />
        <Route
          path="/robots/:id"
          element={<RobotDetailPage robots={mockRobots} />}
        />
      </Routes>
    </Container>
  )
}
```

### Navigation in FleetOverviewPage

```tsx
import { useNavigate } from "react-router-dom";

export const FleetOverviewPage = ({ robots }: FleetOverviewPageProps) => {
  const navigate = useNavigate();

  return (
    <TableBody>
      {robots.map((robot) => (
        <TableRow
          key={robot.id}
          onClick={() => navigate(`/robots/${robot.id}`)}
        >
          {/* ... */}
        </TableRow>
      ))}
    </TableBody>
  );
};
```

### URL Parameter Extraction in RobotDetailPage

```tsx
import { useParams, useNavigate } from 'react-router-dom';

export const RobotDetailPage = ({ robots }: RobotDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const robot = robots.find(r => r.id === id);

  if (!robot) {
    // Error handling...
  }

  return (
    <Button onClick={() => navigate('/')}>
      Back
    </Button>
  );
};
```

---

## Testing Strategy

### Why Tests Needed Updates

React Router hooks require router context. Without it, you get errors like:
```
Error: useNavigate() may be used only in the context of a <Router> component.
```

### Testing Approaches

**1. MemoryRouter (Simple)**
- Use for components that navigate but don't need specific routes
- Good for `FleetOverviewPage` which just calls `navigate()`

**2. createMemoryRouter (Advanced)**
- Use when you need to test route matching and URL parameters
- Good for `RobotDetailPage` which uses `useParams()`
- Allows setting initial URL path

### Test Example

```tsx
it("renders robot detail page", () => {
  const router = createMemoryRouter([
    {
      path: "/robots/:id",
      element: <RobotDetailPage robots={mockRobots} />,
    },
  ], {
    initialEntries: ["/robots/rbt-001"],
  });
  
  render(<RouterProvider router={router} />);
  
  expect(screen.getByText("Atlas-01")).toBeInTheDocument();
});
```

---

## Learning Resources

### Official Documentation

1. **React Router v7 Documentation**
   - URL: https://reactrouter.com/
   - Start here for official API reference
   - Includes migration guides and examples

2. **React Router Getting Started**
   - URL: https://reactrouter.com/en/main/start/overview
   - Great introduction to routing concepts

3. **React Router Hooks**
   - `useNavigate`: https://reactrouter.com/en/main/hooks/use-navigate
   - `useParams`: https://reactrouter.com/en/main/hooks/use-params
   - `useLocation`: https://reactrouter.com/en/main/hooks/use-location

### Tutorials and Guides

4. **React Router Tutorial (React Router Docs)**
   - URL: https://reactrouter.com/en/main/start/tutorial
   - Step-by-step tutorial building a routing app

5. **Testing React Router Components**
   - URL: https://reactrouter.com/en/main/start/testing
   - Official guide on testing with React Router

6. **React Router v6 Migration Guide** (v7 is similar)
   - URL: https://reactrouter.com/en/main/upgrading/v5
   - Helpful if migrating from older versions

### Articles and Blog Posts

7. **"React Router v6: The Complete Guide"**
   - Search for articles on Medium, Dev.to, or CSS-Tricks
   - Many comprehensive guides available

8. **"Testing React Router with React Testing Library"**
   - Search for Kent C. Dodds articles on testing
   - Excellent testing patterns

### Video Tutorials

9. **React Router Tutorial (YouTube)**
   - Search: "React Router v7 tutorial"
   - Visual learners may prefer video format

10. **Testing React Router (YouTube)**
    - Search: "testing react router components"
    - Watch how others test routing

### Books

11. **"Learning React" by Alex Banks and Eve Porcello**
    - Chapter on routing
    - Good foundational resource

12. **"Full Stack React" by Anthony Accomazzo et al.**
    - Covers routing in depth

### Practice Resources

13. **React Router Examples**
    - URL: https://github.com/remix-run/react-router/tree/main/examples
    - Real-world examples from the React Router team

14. **CodeSandbox Templates**
    - Search: "react router" on CodeSandbox
    - Interactive examples you can modify

---

## Common Pitfalls

### 1. Forgetting Router Context

**Error:**
```
useNavigate() may be used only in the context of a <Router> component.
```

**Solution:**
- Ensure `BrowserRouter` wraps your app in `main.tsx`
- Wrap test components in `MemoryRouter` or use `createMemoryRouter`

### 2. Using useParams() Outside Route Component

**Problem:**
- `useParams()` only works inside components rendered by a `<Route>`

**Solution:**
- Make sure the component using `useParams()` is rendered via a route
- Pass data through props if needed elsewhere

### 3. Not Handling Missing Parameters

**Problem:**
- `useParams()` can return `undefined` if parameter doesn't exist

**Solution:**
```tsx
const { id } = useParams<{ id: string }>();
if (!id) {
  // Handle missing parameter
}
```

### 4. Testing Without Router Context

**Problem:**
- Tests fail with router-related errors

**Solution:**
- Always wrap components in router providers for tests
- Use `createMemoryRouter` when testing URL parameters

### 5. Navigation in useEffect Without Dependencies

**Problem:**
- Infinite navigation loops

**Solution:**
- Be careful with navigation in `useEffect`
- Include proper dependencies or use conditions

### 6. Not Handling Invalid Routes

**Problem:**
- Users can navigate to invalid URLs

**Solution:**
- Always validate data from URL parameters
- Show error messages for invalid states
- Provide navigation back to valid routes

---

## Summary

### What We Learned

1. **React Router** provides URL-based navigation for React apps
2. **Routes** map URLs to components declaratively
3. **Hooks** (`useNavigate`, `useParams`) enable programmatic navigation
4. **Testing** requires router context (MemoryRouter or createMemoryRouter)
5. **Error handling** is important for invalid URLs/parameters

### Key Takeaways

- URL-based navigation is better than state-based for shareable, bookmarkable pages
- React Router hooks require router context (BrowserRouter in app, MemoryRouter in tests)
- Always validate URL parameters and handle edge cases
- Tests need special setup to work with routing

### Next Steps

After mastering React Router basics, consider learning:
- Nested routes
- Route loaders and actions (React Router v7 features)
- Protected routes (authentication)
- Route transitions and animations
- Code splitting with routes

---

## Questions to Test Understanding

1. Why do we use `useNavigate()` instead of callback props?
2. What's the difference between `MemoryRouter` and `createMemoryRouter`?
3. How does `useParams()` get the `id` from the URL `/robots/rbt-001`?
4. Why do tests need router context?
5. What happens if a user navigates to `/robots/invalid-id`?

---

*This document was created as part of the Robot Ops Console project to document the React Router navigation implementation.*

