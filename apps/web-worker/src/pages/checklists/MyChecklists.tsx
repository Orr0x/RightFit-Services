import { useState, useEffect } from 'react'
import { ClipboardList, ChevronDown, ChevronUp, Search, FileText, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ChecklistTemplate {
  id: string
  template_name: string
  property_type: string
  sections: any // JSON structure from API
  estimated_duration_minutes: number
  items?: ChecklistItem[] // Transformed for display
}

interface ChecklistItem {
  id: string
  label: string
  section?: string
  completed: boolean
}

export default function MyChecklists() {
  const navigate = useNavigate()
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadChecklists()
  }, [])

  const loadChecklists = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('worker_token')
      const serviceProviderId = localStorage.getItem('service_provider_id')
      const workerId = localStorage.getItem('worker_id')

      if (!token || !serviceProviderId || !workerId) return

      // First, fetch all jobs assigned to this worker
      const jobsResponse = await fetch(
        `/api/cleaning-jobs?service_provider_id=${serviceProviderId}&assigned_worker_id=${workerId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (!jobsResponse.ok) {
        console.error('Failed to fetch worker jobs')
        return
      }

      const jobsData = await jobsResponse.json()
      const jobs = jobsData.data || []

      // Extract unique checklist template IDs from the worker's jobs
      const templateIds = new Set<string>()
      jobs.forEach((job: any) => {
        if (job.checklist_template_id) {
          templateIds.add(job.checklist_template_id)
        }
      })

      // If no checklist templates are assigned to this worker's jobs, return empty
      if (templateIds.size === 0) {
        setChecklists([])
        return
      }

      // Fetch all templates
      const response = await fetch(
        `/api/checklist-templates?service_provider_id=${serviceProviderId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (response.ok) {
        const data = await response.json()
        const allTemplates = data.data || []

        // Filter to only templates that are assigned to this worker's jobs
        const relevantTemplates = allTemplates.filter((template: ChecklistTemplate) =>
          templateIds.has(template.id)
        )

        // Remove duplicates by ID (in case API returns duplicates)
        const uniqueTemplates = Array.from(
          new Map(relevantTemplates.map(t => [t.id, t])).values()
        )

        // Transform sections JSON to flat items array
        const transformedChecklists = uniqueTemplates.map((template: ChecklistTemplate) => {
          const items: ChecklistItem[] = []

          // Parse sections if it exists
          if (template.sections) {
            const sections = typeof template.sections === 'string'
              ? JSON.parse(template.sections)
              : template.sections

            // Flatten all items from all sections, preserving section info
            if (Array.isArray(sections)) {
              sections.forEach((section: any) => {
                if (section.items && Array.isArray(section.items)) {
                  section.items.forEach((item: any) => {
                    items.push({
                      id: item.id || crypto.randomUUID(),
                      label: item.label || item.text || '',
                      section: section.title || '',
                      completed: false
                    })
                  })
                }
              })
            }
          }

          return {
            ...template,
            items
          }
        })

        setChecklists(transformedChecklists)
      }
    } catch (error) {
      console.error('Failed to load checklists:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleChecklist = (checklistId: string) => {
    setExpandedChecklist(expandedChecklist === checklistId ? null : checklistId)
  }

  const filteredChecklists = checklists.filter((checklist) =>
    checklist.template_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    checklist.property_type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checklists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Checklists</h1>
            <p className="text-gray-600">Reference guides and task lists</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search checklists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Checklists */}
      {filteredChecklists.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No checklists found' : 'No checklists available'}
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Your company will add checklists for you to reference'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChecklists.map((checklist) => (
            <div
              key={checklist.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Checklist Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleChecklist(checklist.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{checklist.template_name}</h3>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {checklist.property_type}
                      </span>
                    </div>
                    {checklist.estimated_duration_minutes > 0 && (
                      <p className="text-sm text-gray-600">
                        Est. Duration: {checklist.estimated_duration_minutes} minutes
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {checklist.items?.length || 0} {checklist.items?.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="ml-4">
                    {expandedChecklist === checklist.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Checklist Items */}
              {expandedChecklist === checklist.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  {checklist.items && checklist.items.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {(() => {
                          // Group items by section
                          const sections: { [key: string]: ChecklistItem[] } = {}
                          let itemIndex = 0

                          checklist.items.forEach((item) => {
                            const sectionName = item.section || 'General'
                            if (!sections[sectionName]) {
                              sections[sectionName] = []
                            }
                            sections[sectionName].push({ ...item, globalIndex: itemIndex++ } as any)
                          })

                          return Object.entries(sections).map(([sectionName, items]) => (
                            <div key={sectionName}>
                              {/* Section Header */}
                              <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                                {sectionName}
                              </h4>

                              {/* Section Items */}
                              <div className="space-y-2">
                                {items.map((item: any) => (
                                  <div
                                    key={item.id}
                                    className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-200"
                                  >
                                    <div className="w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <span className="text-xs font-semibold text-gray-500">{item.globalIndex + 1}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 flex-1">{item.label}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        })()}
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800">
                          <strong>Note:</strong> This is a reference checklist. When you start a job, you'll have
                          a job-specific checklist that you can mark as complete.
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600 text-center py-4">
                      No checklist items available
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
