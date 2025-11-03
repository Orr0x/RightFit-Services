/**
 * Guest Tablet API Client
 * Minimal API client for guest-facing features only
 * No authentication required - guests access via QR code with property context
 */

const API_BASE_URL = '/api'

export interface ReportIssueData {
  property_id: string
  issue_type: string
  issue_description: string
  guest_name?: string
  guest_phone?: string
  guest_email?: string
  photos?: string[]
}

export interface AskQuestionData {
  property_id: string
  question: string
}

export const guestApi = {
  /**
   * Report an issue at the property
   */
  reportIssue: async (data: ReportIssueData) => {
    const response = await fetch(`${API_BASE_URL}/guest-issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to report issue' }))
      throw new Error(error.message || 'Failed to report issue')
    }

    return response.json()
  },

  /**
   * Ask a question to the AI assistant
   */
  askQuestion: async (data: AskQuestionData) => {
    const response = await fetch(`${API_BASE_URL}/guest/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get answer' }))
      throw new Error(error.message || 'Failed to get answer')
    }

    return response.json()
  },

  /**
   * Get DIY guides for the property
   */
  getDiyGuides: async (propertyId: string) => {
    const response = await fetch(`${API_BASE_URL}/guest/diy-guides?property_id=${propertyId}`)

    if (!response.ok) {
      // Return empty array on error - placeholder data will be used
      return { data: [] }
    }

    return response.json()
  },

  /**
   * Get knowledge base / property information
   */
  getKnowledgeBase: async (propertyId: string) => {
    const response = await fetch(`${API_BASE_URL}/guest/knowledge-base?property_id=${propertyId}`)

    if (!response.ok) {
      // Return empty array on error - placeholder data will be used
      return { data: [] }
    }

    return response.json()
  },
}
