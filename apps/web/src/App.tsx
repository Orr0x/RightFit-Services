import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
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

function App() {
  return (
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
            <Route path="/" element={<Navigate to="/properties" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
