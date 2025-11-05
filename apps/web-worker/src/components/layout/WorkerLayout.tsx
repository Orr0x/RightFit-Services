import { ReactNode } from 'react'
import Header from './Header'
import BottomNav from './BottomNav'

interface WorkerLayoutProps {
  children: ReactNode
}

export default function WorkerLayout({ children }: WorkerLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  )
}
