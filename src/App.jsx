import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AppRoutes from './pages/index'
import { Toaster } from './components/ui/toaster'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </Router>
  )
}

export default App