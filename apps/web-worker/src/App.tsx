import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import WorkerLayout from './components/layout/WorkerLayout'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import WorkerDashboard from './pages/dashboard/WorkerDashboard'
import JobDetails from './pages/jobs/JobDetails'
import MyJobs from './pages/jobs/MyJobs'
import MySchedule from './pages/schedule/MySchedule'
import ManageAvailability from './pages/availability/ManageAvailability'
import WorkerProfile from './pages/profile/WorkerProfile'
import WorkHistory from './pages/history/WorkHistory'
import MyReportedIssues from './pages/issues/MyReportedIssues'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <WorkerLayout>
                  <WorkerDashboard />
                </WorkerLayout>
              </ProtectedRoute>
            }
          />

          {/* Job Details */}
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <WorkerLayout>
                  <JobDetails />
                </WorkerLayout>
              </ProtectedRoute>
            }
          />

          {/* My Jobs */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <WorkerLayout>
                  <MyJobs />
                </WorkerLayout>
              </ProtectedRoute>
            }
          />

          {/* My Reported Issues */}
          <Route
            path="/my-issues"
            element={
              <ProtectedRoute>
                <WorkerLayout>
                  <MyReportedIssues />
                </WorkerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <WorkerLayout>
                  <MySchedule />
                </WorkerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/availability"
            element={
              <ProtectedRoute>
                <WorkerLayout>
                  <ManageAvailability />
                </WorkerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <WorkerLayout>
                  <WorkerProfile />
                </WorkerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <WorkerLayout>
                  <WorkHistory />
                </WorkerLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
