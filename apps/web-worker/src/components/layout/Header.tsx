import { useAuth } from '../../contexts/AuthContext'
import { LogOut, User, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { worker, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">RightFit Worker</h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {worker?.first_name} {worker?.last_name}
              </p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {/* Profile Photo / Avatar */}
            <div className="relative">
              {worker?.profile_photo_url ? (
                <img
                  src={worker.profile_photo_url}
                  alt={`${worker.first_name} ${worker.last_name}`}
                  className="w-9 h-9 rounded-full object-cover border-2 border-blue-100"
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {worker?.first_name?.[0]}{worker?.last_name?.[0]}
                </div>
              )}
            </div>

            {/* Desktop Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
