import { useState, useEffect } from 'react'
import { Button, Input, Card, Modal, Spinner, EmptyState } from '@rightfit/ui-core';
import { useToast } from '../components/ui';
import { useLoading } from '../hooks/useLoading'
import { checklistTemplatesAPI, customersAPI, type ChecklistTemplate, type ChecklistSection, type CreateChecklistTemplateData } from '../lib/api'
import './Quotes.css'

const SERVICE_PROVIDER_ID = 'sp-cleaning-test'

interface FormSection {
  title: string
  items: string[]
  images: string[]
}

export default function ChecklistTemplates() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<ChecklistTemplate[]>([])
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    template_name: '',
    property_type: '',
    estimated_duration_minutes: '',
    is_active: true,
    customer_id: '',
  })

  const [sections, setSections] = useState<FormSection[]>([
    { title: '', items: [''], images: [] }
  ])
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => { loadTemplates() }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchQuery, propertyTypeFilter])

  const loadTemplates = () => {
    withLoading(async () => {
      try {
        const data = await checklistTemplatesAPI.list(SERVICE_PROVIDER_ID)
        setTemplates(data)
      } catch (err: any) {
        toast.error('Failed to load checklist templates')
        console.error('Load templates error:', err)
      }
    })
  }

  const filterTemplates = () => {
    let filtered = templates

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.property_type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (propertyTypeFilter !== 'all') {
      filtered = filtered.filter(t => t.property_type === propertyTypeFilter)
    }

    setFilteredTemplates(filtered)
  }

  const handleOpenDialog = (template?: ChecklistTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        template_name: template.template_name,
        property_type: template.property_type,
        estimated_duration_minutes: template.estimated_duration_minutes.toString(),
        is_active: template.is_active,
        customer_id: template.customer_id || '',
      })
      // Ensure sections is an array
      const templateSections = Array.isArray(template.sections) ? template.sections : []
      setSections(templateSections.length > 0 ? templateSections.map(s => ({
        title: s.title,
        items: s.items && s.items.length > 0 ? s.items : [''],
        images: s.images || []
      })) : [{ title: '', items: [''], images: [] }])
    } else {
      setEditingTemplate(null)
      setFormData({
        template_name: '',
        property_type: '',
        estimated_duration_minutes: '',
        is_active: true,
        customer_id: '',
      })
      setSections([{ title: '', items: [''], images: [] }])
    }
    setOpenDialog(true)
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.template_name.trim()) {
      toast.error('Template name is required')
      return
    }
    if (!formData.property_type.trim()) {
      toast.error('Property type is required')
      return
    }
    if (!formData.estimated_duration_minutes) {
      toast.error('Estimated duration is required')
      return
    }

    // Validate sections
    const validSections = sections.filter(s => s.title.trim() !== '')
    if (validSections.length === 0) {
      toast.error('At least one section with a title is required')
      return
    }

    try {
      const sectionsData: ChecklistSection[] = validSections.map(s => ({
        title: s.title,
        items: s.items.filter(item => item.trim() !== ''),
        images: s.images || []
      }))

      if (editingTemplate) {
        await checklistTemplatesAPI.update(editingTemplate.id, {
          template_name: formData.template_name,
          property_type: formData.property_type,
          estimated_duration_minutes: parseInt(formData.estimated_duration_minutes),
          is_active: formData.is_active,
          customer_id: formData.customer_id || undefined,
          sections: sectionsData,
          service_provider_id: SERVICE_PROVIDER_ID,
        })
        toast.success('Template updated')
      } else {
        const createData: CreateChecklistTemplateData = {
          service_provider_id: SERVICE_PROVIDER_ID,
          template_name: formData.template_name,
          property_type: formData.property_type,
          estimated_duration_minutes: parseInt(formData.estimated_duration_minutes),
          is_active: formData.is_active,
          customer_id: formData.customer_id || undefined,
          sections: sectionsData,
        }
        await checklistTemplatesAPI.create(createData)
        toast.success('Template created')
      }
      setOpenDialog(false)
      loadTemplates()
    } catch (err: any) {
      toast.error('Failed to save template')
      console.error('Save template error:', err)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"? This will set it as inactive.`)) return
    try {
      await checklistTemplatesAPI.delete(id, SERVICE_PROVIDER_ID)
      toast.success('Template deleted')
      loadTemplates()
    } catch (err: any) {
      toast.error('Failed to delete template')
      console.error('Delete template error:', err)
    }
  }

  const addSection = () => {
    setSections([...sections, { title: '', items: [''], images: [] }])
  }

  const removeSection = (index: number) => {
    if (sections.length === 1) {
      toast.error('At least one section is required')
      return
    }
    setSections(sections.filter((_, i) => i !== index))
  }

  const updateSectionTitle = (index: number, title: string) => {
    const newSections = [...sections]
    newSections[index].title = title
    setSections(newSections)
  }

  const addItem = (sectionIndex: number) => {
    const newSections = [...sections]
    newSections[sectionIndex].items.push('')
    setSections(newSections)
  }

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...sections]
    if (newSections[sectionIndex].items.length === 1) {
      toast.error('At least one item is required per section')
      return
    }
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex)
    setSections(newSections)
  }

  const updateItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const newSections = [...sections]
    newSections[sectionIndex].items[itemIndex] = value
    setSections(newSections)
  }

  const handleImageUpload = async (sectionIndex: number, file: File) => {
    if (!file) return

    setUploadingImage(true)
    try {
      const result = await checklistTemplatesAPI.uploadImage(file)
      const newSections = [...sections]
      if (!newSections[sectionIndex].images) {
        newSections[sectionIndex].images = []
      }
      newSections[sectionIndex].images.push(result.url)
      setSections(newSections)
      toast.success('Image uploaded successfully')
    } catch (err: any) {
      toast.error('Failed to upload image')
      console.error('Upload error:', err)
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (sectionIndex: number, imageIndex: number) => {
    const newSections = [...sections]
    newSections[sectionIndex].images.splice(imageIndex, 1)
    setSections(newSections)
  }

  // Get unique property types for filter
  const propertyTypes = Array.from(new Set(templates.map(t => t.property_type)))

  // Calculate stats
  const stats = {
    total: templates.length,
    active: templates.filter(t => t.is_active).length,
    inactive: templates.filter(t => !t.is_active).length,
    avgDuration: templates.length > 0
      ? Math.round(templates.reduce((sum, t) => sum + t.estimated_duration_minutes, 0) / templates.length)
      : 0,
  }

  if (isLoading) return (
    <div className="quotes-page">
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Loading templates...</span>
      </div>
    </div>
  )

  return (
    <div className="quotes-page">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Checklist Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage cleaning checklist templates</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenDialog()}>
          + Create Template
        </Button>
      </div>

      {/* Stats Dashboard */}
      <div className="quotes-stats">
        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Templates</div>
            <div className="text-sm text-gray-600 mt-2">{propertyTypes.length} property types</div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value text-green-600">{stats.active}</div>
            <div className="stat-label">Active</div>
            <div className="text-sm text-green-600 mt-2">Ready to use</div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value text-gray-600">{stats.inactive}</div>
            <div className="stat-label">Inactive</div>
            <div className="text-sm text-gray-600 mt-2">Not in use</div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value text-blue-600">{stats.avgDuration}</div>
            <div className="stat-label">Avg Duration</div>
            <div className="text-sm text-blue-600 mt-2">Minutes per job</div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-64">
          <select
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
            className="filter-select"
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              fontSize: '0.875rem',
            }}
          >
            <option value="all">All Property Types</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Templates Display */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || propertyTypeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first checklist template to get started'}
          </p>
          {!searchQuery && propertyTypeFilter === 'all' && (
            <Button variant="primary" onClick={() => handleOpenDialog()}>
              + Create Template
            </Button>
          )}
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'quotes-grid' : 'quotes-list'}>
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="quote-card"
              onClick={() => handleOpenDialog(template)}
            >
              <div className="quote-card-header">
                <div>
                  <h3 className="quote-number">{template.template_name}</h3>
                  <p className="quote-customer">{template.property_type}</p>
                </div>
                {template.is_active ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                    Inactive
                  </span>
                )}
              </div>

              <div className="quote-details">
                <div className="quote-detail-item">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{template.estimated_duration_minutes} minutes</span>
                </div>
                <div className="quote-detail-item">
                  <span className="text-gray-600">Sections:</span>
                  <span className="font-medium">{Array.isArray(template.sections) ? template.sections.length : 0}</span>
                </div>
                {Array.isArray(template.sections) && template.sections.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.sections.slice(0, 3).map((section, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700"
                      >
                        {section.title}
                      </span>
                    ))}
                    {template.sections.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">
                        +{template.sections.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="quote-footer">
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDialog(template)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(template.id, template.template_name)
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={openDialog}
        onClose={() => setOpenDialog(false)}
        title={editingTemplate ? 'Edit Template' : 'Create Template'}
        size="xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
          {/* Basic Info */}
          <div className="space-y-4">
            <Input
              label="Template Name"
              value={formData.template_name}
              onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
              placeholder="e.g., Standard House Cleaning"
              required
            />

            <Input
              label="Property Type"
              value={formData.property_type}
              onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
              placeholder="e.g., House, Apartment, Office"
              required
            />

            <Input
              label="Estimated Duration (minutes)"
              type="number"
              value={formData.estimated_duration_minutes}
              onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: e.target.value })}
              placeholder="e.g., 120"
              required
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active Template
              </label>
            </div>
          </div>

          {/* Sections */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Checklist Sections</h3>
              <Button variant="outline" size="sm" onClick={addSection}>
                + Add Section
              </Button>
            </div>

            <div className="space-y-4">
              {sections.map((section, sectionIdx) => (
                <div key={sectionIdx} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <Input
                      label={`Section ${sectionIdx + 1} Title`}
                      value={section.title}
                      onChange={(e) => updateSectionTitle(sectionIdx, e.target.value)}
                      placeholder="e.g., Kitchen"
                      className="flex-1"
                      required
                    />
                    {sections.length > 1 && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeSection(sectionIdx)}
                        className="ml-2 mt-6"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Items</label>
                    {section.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateItem(sectionIdx, itemIdx, e.target.value)}
                          placeholder="e.g., Clean countertops"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(sectionIdx, itemIdx)}
                          disabled={section.items.length === 1}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addItem(sectionIdx)}
                    >
                      + Add Item
                    </Button>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-700">Reference Images</label>
                    <p className="text-xs text-gray-500 mb-2">Add photos of room layouts or visual references (max 5MB per image)</p>

                    {/* Image Preview Gallery */}
                    {section.images && section.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {section.images.map((imageUrl, imgIdx) => (
                          <div key={imgIdx} className="relative group">
                            <img
                              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${imageUrl}`}
                              alt={`Reference ${imgIdx + 1}`}
                              className="w-full h-24 object-cover rounded border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(sectionIdx, imgIdx)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload(sectionIdx, file)
                            e.target.value = '' // Reset input
                          }
                        }}
                        className="hidden"
                        id={`image-upload-${sectionIdx}`}
                        disabled={uploadingImage}
                      />
                      <label htmlFor={`image-upload-${sectionIdx}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={uploadingImage}
                          onClick={(e) => {
                            e.preventDefault()
                            document.getElementById(`image-upload-${sectionIdx}`)?.click()
                          }}
                        >
                          {uploadingImage ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              📷 Add Image
                            </>
                          )}
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="ghost" onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingTemplate ? 'Update' : 'Create'} Template
          </Button>
        </div>
      </Modal>
    </div>
  )
}
