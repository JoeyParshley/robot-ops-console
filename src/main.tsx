import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter, HashRouter } from 'react-router-dom'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {main: '#90caf9'},
    secondary: {main: '#f48fb1'},
  },
});

// Use HashRouter for Electron (file:// protocol) to avoid path issues
// Use BrowserRouter for web (http:// protocol)
const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </StrictMode>,
)
