import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Card, Spinner, Button, useToast } from '../components/ui'
import CreateMaintenanceRequestModal from '../components/maintenance/CreateMaintenanceRequestModal'
import GuestReportsTab from '../components/maintenance/GuestReportsTab'
import WorkerReportsTab from '../components/maintenance/WorkerReportsTab'
import MaintenanceJobsTab from '../components/maintenance/MaintenanceJobsTab'
import './Maintenance.css'

type TabType = 'guest' | 'worker' | 'jobs'

export default function Maintenance() {
  const [activeTab, setActiveTab] = useState<TabType>('guest')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const toast = useToast()

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    toast.success('Maintenance request created successfully')
    handleRefresh()
  }

  const tabs = [
    { id: 'guest' as TabType, label: 'Guest Reports', badge: null },
    { id: 'worker' as TabType, label: 'Worker Reports', badge: null },
    { id: 'jobs' as TabType, label: 'Maintenance Jobs', badge: null },
  ]

  return (
    <div className="maintenance-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage reports, requests, and maintenance jobs
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              {tab.badge !== null && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'guest' && (
          <GuestReportsTab refreshKey={refreshKey} onRefresh={handleRefresh} />
        )}
        {activeTab === 'worker' && (
          <WorkerReportsTab refreshKey={refreshKey} onRefresh={handleRefresh} />
        )}
        {activeTab === 'jobs' && (
          <MaintenanceJobsTab refreshKey={refreshKey} onRefresh={handleRefresh} />
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateMaintenanceRequestModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  )
}
