import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, ClipboardList, User, Clock, Wrench, FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface NavItem {
  path: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

export default function BottomNav() {
  const location = useLocation()
  const { worker } = useAuth()

  const isCleaningWorker = worker?.worker_type === 'CLEANER' || worker?.worker_type === 'GENERAL'
  const isMaintenanceWorker = worker?.worker_type === 'MAINTENANCE' || worker?.worker_type === 'GENERAL'

  // Build navigation items based on worker type
  const navItems: NavItem[] = [
    { path: '/dashboard', icon: Home, label: 'Home' },
  ]

  // Add job navigation based on worker type
  if (worker?.worker_type === 'GENERAL') {
    // GENERAL workers see both cleaning and maintenance jobs
    navItems.push({ path: '/jobs', icon: ClipboardList, label: 'Cleaning' })
    navItems.push({ path: '/maintenance-jobs', icon: Wrench, label: 'Maintenance' })
  } else if (worker?.worker_type === 'MAINTENANCE') {
    // MAINTENANCE workers only see maintenance jobs
    navItems.push({ path: '/maintenance-jobs', icon: Wrench, label: 'Jobs' })
  } else {
    // CLEANER workers (default) only see cleaning jobs
    navItems.push({ path: '/jobs', icon: ClipboardList, label: 'Jobs' })
  }

  // Add My Issues for cleaners and general workers
  if (worker?.worker_type === 'CLEANER' || worker?.worker_type === 'GENERAL') {
    navItems.push({ path: '/my-issues', icon: FileText, label: 'Reports' })
  }

  // Add common navigation items
  navItems.push(
    { path: '/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/profile', icon: User, label: 'Profile' }
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className={`grid ${navItems.length === 6 ? 'grid-cols-6' : navItems.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path ||
                          (item.path !== '/dashboard' && location.pathname.startsWith(item.path))

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : ''}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
