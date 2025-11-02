import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import { AppLayout } from './components/layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import CleaningDashboard from './pages/dashboards/CleaningDashboard'
import CleaningJobs from './pages/cleaning/CleaningJobs'
import CreateCleaningJob from './pages/cleaning/CreateCleaningJob'
import CleaningJobDetails from './pages/cleaning/CleaningJobDetails'
import Properties from './pages/Properties'
import Workers from './pages/Workers'
import Financial from './pages/Financial'
import Certificates from './pages/Certificates'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider position="top-right">
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CleaningDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CleaningJobs />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/new"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateCleaningJob />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CleaningJobDetails />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/properties"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Properties />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workers"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Workers />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/financial"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Financial />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Certificates />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
  )
}

export default App
