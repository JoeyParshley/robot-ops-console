import { Routes, Route } from 'react-router-dom'
import { Container } from '@mui/material'
import { FleetOverviewPage } from './pages/FleetOverviewPage'
import { RobotDetailPage } from './pages/RobotDetailPage'
import { mockRobots, mockRobotDetails } from './mock/robots'
import './App.css'

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
          element={<RobotDetailPage robots={mockRobotDetails} />}
        />
      </Routes>
    </Container>
  )
}

export default App
