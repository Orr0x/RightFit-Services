import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import { AppLayout } from './components/layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import MaintenanceDashboard from './pages/dashboards/MaintenanceDashboard'
import MaintenanceJobs from './pages/maintenance/MaintenanceJobs'
import CreateMaintenanceJob from './pages/maintenance/CreateMaintenanceJob'
import MaintenanceJobDetails from './pages/MaintenanceJobDetails'
import Properties from './pages/Properties'
import PropertyDetails from './pages/PropertyDetails'
import AddProperty from './pages/AddProperty'
import EditProperty from './pages/EditProperty'
import Customers from './pages/Customers'
import CustomerDetails from './pages/CustomerDetails'
import AddCustomer from './pages/AddCustomer'
import EditCustomer from './pages/EditCustomer'
import MaintenanceContracts from './pages/MaintenanceContracts'
import Invoices from './pages/Invoices'
import InvoiceDetails from './pages/InvoiceDetails'
import CreateInvoice from './pages/CreateInvoice'
import EditInvoice from './pages/EditInvoice'
import Quotes from './pages/Quotes'
import QuoteDetails from './pages/QuoteDetails'
import CreateQuote from './pages/CreateQuote'
import EditQuote from './pages/EditQuote'
import Workers from './pages/Workers'
import WorkerDetails from './pages/WorkerDetails'
import Contractors from './pages/Contractors'
import Financial from './pages/Financial'
import Certificates from './pages/Certificates'
import PropertyCalendar from './pages/PropertyCalendar'
import ChecklistTemplates from './pages/ChecklistTemplates'
import WorkerReports from './pages/WorkerReports'

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
                    <MaintenanceDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MaintenanceJobs />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/new"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateMaintenanceJob />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MaintenanceJobDetails />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id/edit"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateMaintenanceJob />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker-reports"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <WorkerReports />
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
              path="/properties/new"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AddProperty />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/properties/:id/edit"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EditProperty />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/properties/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PropertyDetails />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Customers />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/new"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AddCustomer />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:id/edit"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EditCustomer />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CustomerDetails />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MaintenanceContracts />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts/new"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="container mx-auto px-4 py-8">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
                        <h1 className="text-2xl font-bold mb-4">Create New Contract</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Contract creation page coming soon! This feature will allow you to create new maintenance contracts with customers.
                        </p>
                        <button
                          onClick={() => window.history.back()}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Go Back
                        </button>
                      </div>
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="container mx-auto px-4 py-8">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
                        <h1 className="text-2xl font-bold mb-4">Contract Details</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Contract details page coming soon! This feature will show full contract information, linked properties, jobs, and invoices.
                        </p>
                        <button
                          onClick={() => window.history.back()}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Go Back
                        </button>
                      </div>
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Invoices />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/new"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateInvoice />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/:id/edit"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EditInvoice />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <InvoiceDetails />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Quotes />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes/new"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateQuote />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes/:id/edit"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EditQuote />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuoteDetails />
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
              path="/workers/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <WorkerDetails />
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
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PropertyCalendar />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/checklist-templates"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ChecklistTemplates />
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
