import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Badge, Spinner, Select, type SelectOption } from '../components/ui'
import { cleaningQuotesAPI, type CleaningQuote } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import './Quotes.css'

export default function Quotes() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quotes, setQuotes] = useState<CleaningQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    if (user?.id) {
      loadQuotes()
    }
  }, [user])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      const data = await cleaningQuotesAPI.list({
        service_provider_id: user?.id,
      })
      setQuotes(data)
    } catch (err) {
      console.error('Failed to load quotes:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const stats = {
    total: quotes.length,
    totalValue: quotes.reduce((sum, quote) => sum + quote.total, 0),
    approved: quotes.filter((q) => q.status === 'APPROVED').length,
    approvedValue: quotes.filter((q) => q.status === 'APPROVED').reduce((sum, q) => sum + q.total, 0),
    pending: quotes.filter((q) => q.status === 'DRAFT' || q.status === 'SENT').length,
    pendingValue: quotes.filter((q) => q.status === 'DRAFT' || q.status === 'SENT').reduce((sum, q) => sum + q.total, 0),
    declined: quotes.filter((q) => q.status === 'DECLINED').length,
    declinedValue: quotes.filter((q) => q.status === 'DECLINED').reduce((sum, q) => sum + q.total, 0),
  }

  // Filter quotes
  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer?.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.service_description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || quote.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SENT', label: 'Sent' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'DECLINED', label: 'Declined' },
    { value: 'EXPIRED', label: 'Expired' },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      APPROVED: 'success',
      SENT: 'info',
      DRAFT: 'warning',
      DECLINED: 'danger',
      EXPIRED: 'danger',
    }
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleQuoteClick = (quoteId: string) => {
    navigate(`/quotes/${quoteId}`)
  }

  if (loading) {
    return (
      <div className="quotes-page">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-600">Loading quotes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="quotes-page">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quotes</h1>
          <p className="text-gray-600 mt-1">Create and manage customer quotes</p>
        </div>
        <Button onClick={() => navigate('/quotes/new')}>+ Create Quote</Button>
      </div>

      {/* Stats Dashboard */}
      <div className="quotes-stats">
        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Quotes</div>
            <div className="text-sm text-gray-600 mt-2">{formatCurrency(stats.totalValue)}</div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value text-green-600">{stats.approved}</div>
            <div className="stat-label">Approved</div>
            <div className="text-sm text-green-600 mt-2">{formatCurrency(stats.approvedValue)}</div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value text-blue-600">{stats.pending}</div>
            <div className="stat-label">Pending</div>
            <div className="text-sm text-blue-600 mt-2">{formatCurrency(stats.pendingValue)}</div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value text-red-600">{stats.declined}</div>
            <div className="stat-label">Declined</div>
            <div className="text-sm text-red-600 mt-2">{formatCurrency(stats.declinedValue)}</div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by quote number, customer, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-64">
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={statusOptions}
          />
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

      {/* Quotes Display */}
      {filteredQuotes.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No quotes found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Create your first quote to get started'}
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <Button onClick={() => navigate('/quotes/new')}>+ Create Quote</Button>
          )}
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'quotes-grid' : 'quotes-list'}>
          {filteredQuotes.map((quote) => (
            <Card
              key={quote.id}
              className="quote-card"
              onClick={() => handleQuoteClick(quote.id)}
            >
              <div className="quote-card-header">
                <div>
                  <h3 className="quote-number">{quote.quote_number}</h3>
                  <p className="quote-customer">{quote.customer?.business_name}</p>
                </div>
                {getStatusBadge(quote.status)}
              </div>

              <div className="quote-details">
                <div className="quote-detail-item">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium truncate">{quote.service_description}</span>
                </div>
                {quote.property && (
                  <div className="quote-detail-item">
                    <span className="text-gray-600">Property:</span>
                    <span className="font-medium truncate">{quote.property.property_name}</span>
                  </div>
                )}
                <div className="quote-detail-item">
                  <span className="text-gray-600">Quote Date:</span>
                  <span className="font-medium">{formatDate(quote.quote_date)}</span>
                </div>
                <div className="quote-detail-item">
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="font-medium">{formatDate(quote.valid_until)}</span>
                </div>
                {quote.discount_percentage > 0 && (
                  <div className="quote-detail-item">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">{quote.discount_percentage}%</span>
                  </div>
                )}
              </div>

              <div className="quote-footer">
                <div className="quote-total">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(quote.total)}</span>
                </div>
                {quote.status === 'APPROVED' && quote.approved_date && (
                  <div className="text-sm text-green-600">
                    Approved on {formatDate(quote.approved_date)}
                  </div>
                )}
                {quote.status === 'DECLINED' && quote.declined_date && (
                  <div className="text-sm text-red-600">
                    Declined on {formatDate(quote.declined_date)}
                  </div>
                )}
                {quote.status === 'EXPIRED' && (
                  <div className="text-sm text-red-600 font-semibold">
                    Quote expired
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
