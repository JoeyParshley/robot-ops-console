import { useState } from 'react'
import { Container } from '@mui/material'
import { FleetOverviewPage } from './pages/FleetOverviewPage'
import { mockRobots } from './mock/robots'
import './App.css'

function App() {
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null)

  const handleRobotSelected = (robotId: string) => {
    setSelectedRobotId(robotId)
    console.log('Selected robot:', robotId)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <FleetOverviewPage 
        robots={mockRobots} 
        onRobotSelected={handleRobotSelected}
      />
    </Container>
  )
}

export default App
