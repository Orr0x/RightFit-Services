# Story: Worker Dashboard & Job Management

**Story IDs**: WA-001 through WA-007
**Epic**: Worker Web Application - Phase 1 & 2
**Total Points**: 22 points
**Duration**: 5 days

---

## Stories Overview

This document covers the foundational stories for the Worker App:
1. WA-001: Project Setup (2 pts)
2. WA-002: Authentication (3 pts)
3. WA-003: Layout & Navigation (3 pts)
4. WA-004: Worker Dashboard (4 pts)
5. WA-005: Job Card Component (2 pts)
6. WA-006: Job Details Page (5 pts)
7. WA-007: Job Checklist (3 pts)

---

## WA-001: Project Setup & Structure

### User Story
As a **developer**, I want to **set up a new Worker Web App project** so that **I have a foundation to build worker-facing features**.

### Acceptance Criteria
```gherkin
GIVEN I am setting up a new web application
WHEN I run the setup commands
THEN I should have:
  - A new app at apps/web-worker/
  - Running on port 5178
  - TypeScript configured with strict mode
  - ESLint and Prettier configured
  - React Router setup
  - Shared UI components imported
  - Vite build system configured
```

### Technical Implementation

#### Package.json
```json
{
  "name": "@rightfit/web-worker",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite --port 5178 --host",
    "build": "tsc && vite build",
    "preview": "vite preview --port 5178",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write src"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "date-fns": "^2.30.0",
    "browser-image-compression": "^2.0.2",
    "@mui/icons-material": "^5.14.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0"
  }
}
```

#### Vite Config
```typescript
// apps/web-worker/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5178,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

#### App.tsx (Initial)
```typescript
// apps/web-worker/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import Layout from './components/layout/Layout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </Router>
  )
}

export default App
```

### Files to Create
- apps/web-worker/package.json
- apps/web-worker/vite.config.ts
- apps/web-worker/tsconfig.json
- apps/web-worker/src/App.tsx
- apps/web-worker/src/main.tsx
- apps/web-worker/index.html
- apps/web-worker/.gitignore
- apps/web-worker/.env.example

### Test Commands
```bash
cd apps/web-worker
npm install
npm run dev      # Should start on port 5178
npm run build    # Should compile TypeScript
npm run lint     # Should pass linting
```

---

## WA-002: Worker Authentication

### User Story
As a **worker**, I want to **log in with my credentials** so that **I can access my jobs and schedule**.

### Acceptance Criteria
```gherkin
GIVEN I am a worker with valid credentials
WHEN I visit the worker app
THEN I should see a login page

WHEN I enter my email and password
AND I click "Log In"
THEN I should be authenticated
AND I should be redirected to my dashboard

GIVEN I check "Remember Me"
WHEN I close and reopen the app
THEN I should still be logged in

GIVEN I am logged in
WHEN I click "Logout"
THEN I should be logged out
AND I should be redirected to the login page

GIVEN I forget my password
WHEN I click "Forgot Password"
THEN I should be able to reset it via email
```

### Technical Implementation

#### AuthContext
```typescript
// apps/web-worker/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Worker } from '../types/worker'

interface AuthContextType {
  worker: Worker | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [worker, setWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if worker is already logged in
    const storedWorker = localStorage.getItem('worker')
    const token = localStorage.getItem('token')

    if (storedWorker && token) {
      setWorker(JSON.parse(storedWorker))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      throw new Error('Invalid credentials')
    }

    const data = await response.json()

    // Store worker and token
    localStorage.setItem('worker', JSON.stringify(data.worker))
    localStorage.setItem('token', data.token)
    setWorker(data.worker)
  }

  const logout = () => {
    localStorage.removeItem('worker')
    localStorage.removeItem('token')
    setWorker(null)
  }

  return (
    <AuthContext.Provider value={{
      worker,
      login,
      logout,
      isAuthenticated: !!worker,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

#### Login Page
```typescript
// apps/web-worker/src/pages/auth/Login.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input, Card, Spinner } from '../../components/ui'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">RightFit Worker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Log in to manage your jobs
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="worker@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Remember me</span>
            </label>
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Log In'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
```

### Files to Create
- apps/web-worker/src/contexts/AuthContext.tsx
- apps/web-worker/src/pages/auth/Login.tsx
- apps/web-worker/src/pages/auth/ForgotPassword.tsx
- apps/web-worker/src/lib/auth.ts
- apps/web-worker/src/types/worker.ts

### Testing
- Test login with valid credentials
- Test login with invalid credentials
- Test "Remember Me" functionality
- Test logout
- Test password reset flow
- Test auto-redirect when not authenticated

---

## WA-004: Worker Dashboard

### User Story
As a **worker**, I want to **see my today's jobs and stats** so that **I know what work I have scheduled**.

### Acceptance Criteria
```gherkin
GIVEN I am logged in as a worker
WHEN I view my dashboard
THEN I should see:
  - A welcome message with my first name
  - Today's date
  - Number of jobs today
  - Hours worked this week
  - Total jobs completed
  - List of today's jobs

WHEN I have no jobs today
THEN I should see "No jobs scheduled today"

WHEN I click on a job
THEN I should be taken to the job details page

WHEN I click "View Schedule"
THEN I should be taken to my full schedule

WHEN I click "Manage Availability"
THEN I should be taken to availability management
```

### Technical Implementation

#### Worker Dashboard Component
```typescript
// apps/web-worker/src/pages/dashboard/WorkerDashboard.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Card, Button, Spinner } from '../../components/ui'
import JobCard from '../../components/jobs/JobCard'
import { workersAPI } from '../../lib/api'
import type { CleaningJob, WorkerStats } from '../../types'

export default function WorkerDashboard() {
  const { worker } = useAuth()
  const navigate = useNavigate()
  const [todaysJobs, setTodaysJobs] = useState<CleaningJob[]>([])
  const [stats, setStats] = useState<WorkerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (worker) {
      loadDashboardData()
    }
  }, [worker])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [jobsData, statsData] = await Promise.all([
        workersAPI.getTodaysJobs(worker!.id),
        workersAPI.getStats(worker!.id)
      ])
      setTodaysJobs(jobsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {worker?.first_name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{today}</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Jobs Today</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.jobs_today}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏱️</span>
              </div>
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Hours This Week</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {stats.hours_this_week}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Jobs Completed</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.jobs_completed}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Button onClick={() => navigate('/schedule')}>
          View Full Schedule
        </Button>
        <Button variant="outline" onClick={() => navigate('/availability')}>
          Manage Availability
        </Button>
      </div>

      {/* Today's Jobs */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Today's Jobs</h2>

        {todaysJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📅</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No jobs scheduled today
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Enjoy your day off!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {todaysJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={() => navigate(`/jobs/${job.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

### API Endpoints (Backend - Already Exist or Need Creation)
```typescript
// GET /api/workers/:id/jobs/today
// Response: CleaningJob[]

// GET /api/workers/:id/stats
// Response: {
//   jobs_today: number
//   jobs_this_week: number
//   hours_this_week: number
//   jobs_completed: number
// }
```

### Files to Create
- apps/web-worker/src/pages/dashboard/WorkerDashboard.tsx
- apps/web-worker/src/hooks/useWorker.ts
- apps/web-worker/src/lib/api.ts

### Testing
- Test dashboard loads with jobs
- Test dashboard loads without jobs
- Test stats display correctly
- Test navigation to schedule
- Test navigation to availability
- Test navigation to job details

---

## Testing Strategy

### Unit Tests
- AuthContext login/logout
- API client functions
- Date/time formatting
- Worker stats calculations

### Integration Tests
- Login → Dashboard flow
- Dashboard → Job Details navigation
- API error handling

### E2E Tests
- Complete login and view dashboard
- View today's jobs
- Navigate to job details
- Logout

### Mobile Testing
- Test on iPhone (iOS Safari)
- Test on Android (Chrome)
- Test touch interactions
- Test responsive layout

---

**Document Version**: 1.0
**Last Updated**: 2025-11-05
**Ready for Implementation**: YES
