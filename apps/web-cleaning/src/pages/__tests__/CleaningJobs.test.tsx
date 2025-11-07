/**
 * CleaningJobs Page Integration Tests
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { CleaningJobs } from '../CleaningJobs'
import { AuthProvider } from '../../contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'

// Mock API responses
const mockJobs = [
  {
    id: '1',
    property_name: 'Property 1',
    customer_name: 'Customer 1',
    status: 'PENDING',
    scheduled_date: '2025-01-15',
    scheduled_start_time: '09:00:00',
  },
  {
    id: '2',
    property_name: 'Property 2',
    customer_name: 'Customer 2',
    status: 'COMPLETED',
    scheduled_date: '2025-01-16',
    scheduled_start_time: '10:00:00',
  },
]

// Setup MSW server
const server = setupServer(
  rest.get('/api/cleaning-jobs', (req, res, ctx) => {
    return res(
      ctx.json({
        data: mockJobs,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
)

describe('CleaningJobs Page', () => {
  it('renders page title', () => {
    render(
      <TestWrapper>
        <CleaningJobs />
      </TestWrapper>
    )
    expect(screen.getByText('Cleaning Jobs')).toBeInTheDocument()
  })

  it('fetches and displays cleaning jobs', async () => {
    render(
      <TestWrapper>
        <CleaningJobs />
      </TestWrapper>
    )

    // Shows loading initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Then shows jobs
    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument()
      expect(screen.getByText('Property 2')).toBeInTheDocument()
    })
  })

  it('displays job details correctly', async () => {
    render(
      <TestWrapper>
        <CleaningJobs />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument()
    })

    expect(screen.getByText('Customer 1')).toBeInTheDocument()
    expect(screen.getByText('PENDING')).toBeInTheDocument()
    expect(screen.getByText(/2025-01-15/)).toBeInTheDocument()
  })

  it('handles API error gracefully', async () => {
    server.use(
      rest.get('/api/cleaning-jobs', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: { message: 'Server error' } }))
      })
    )

    render(
      <TestWrapper>
        <CleaningJobs />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/error loading jobs/i)).toBeInTheDocument()
    })
  })

  it('filters jobs by status', async () => {
    server.use(
      rest.get('/api/cleaning-jobs', (req, res, ctx) => {
        const status = req.url.searchParams.get('status')
        const filtered = status
          ? mockJobs.filter((job) => job.status === status)
          : mockJobs

        return res(
          ctx.json({
            data: filtered,
            pagination: {
              page: 1,
              limit: 20,
              total: filtered.length,
              totalPages: 1,
            },
          })
        )
      })
    )

    render(
      <TestWrapper>
        <CleaningJobs />
      </TestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument()
    })

    // Select PENDING filter
    const statusFilter = screen.getByLabelText(/status/i)
    fireEvent.change(statusFilter, { target: { value: 'PENDING' } })

    // Should only show pending jobs
    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument()
      expect(screen.queryByText('Property 2')).not.toBeInTheDocument()
    })
  })

  it('displays pagination', async () => {
    render(
      <TestWrapper>
        <CleaningJobs />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument()
    })

    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument()
  })

  it('navigates to create job page', async () => {
    const navigate = vi.fn()
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => navigate,
    }))

    render(
      <TestWrapper>
        <CleaningJobs />
      </TestWrapper>
    )

    const createButton = screen.getByText(/create job/i)
    fireEvent.click(createButton)

    expect(navigate).toHaveBeenCalledWith('/cleaning-jobs/create')
  })

  it('shows empty state when no jobs', async () => {
    server.use(
      rest.get('/api/cleaning-jobs', (req, res, ctx) => {
        return res(
          ctx.json({
            data: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0,
            },
          })
        )
      })
    )

    render(
      <TestWrapper>
        <CleaningJobs />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/no cleaning jobs found/i)).toBeInTheDocument()
    })
  })
})
