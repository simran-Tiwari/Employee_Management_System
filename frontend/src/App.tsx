import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { StatsProvider } from './context/StatsContext'
import AppRouter from './routes/AppRouter'
import ToastContainer from './components/ToastContainer'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <StatsProvider>
            <AppRouter />
            <ToastContainer />
          </StatsProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
