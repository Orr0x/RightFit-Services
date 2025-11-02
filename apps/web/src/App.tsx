import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import { AppLayout } from './components/layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Properties from './pages/Properties'
import WorkOrders from './pages/WorkOrders'
import Contractors from './pages/Contractors'
import Certificates from './pages/Certificates'
import Financial from './pages/Financial'
import Tenants from './pages/Tenants'
import CleaningDashboard from './pages/dashboards/CleaningDashboard'
import MaintenanceDashboard from './pages/dashboards/MaintenanceDashboard'
import CleaningJobs from './pages/cleaning/CleaningJobs'
import CreateCleaningJob from './pages/cleaning/CreateCleaningJob'
import CleaningJobDetails from './pages/cleaning/CleaningJobDetails'
import MaintenanceJobs from './pages/maintenance/MaintenanceJobs'
import CreateMaintenanceJob from './pages/maintenance/CreateMaintenanceJob'

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
              path="/work-orders"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <WorkOrders />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contractors"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Contractors />
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
              path="/tenants"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Tenants />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboards/cleaning"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CleaningDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboards/maintenance"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MaintenanceDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cleaning/jobs"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CleaningJobs />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cleaning/jobs/new"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateCleaningJob />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cleaning/jobs/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CleaningJobDetails />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance/jobs"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MaintenanceJobs />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance/jobs/new"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateMaintenanceJob />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/cleaning" element={<Navigate to="/cleaning/jobs" replace />} />
            <Route path="/maintenance" element={<Navigate to="/maintenance/jobs" replace />} />
            <Route path="/" element={<Navigate to="/properties" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
  )
}

export default App
