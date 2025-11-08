import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Badge, Spinner, Select, type SelectOption } from '@rightfit/ui-core';
import { cleaningInvoicesAPI, type CleaningInvoice } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import './Invoices.css'

export default function Invoices() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<CleaningInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    if (user?.id) {
      loadInvoices()
    }
  }, [user])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await cleaningInvoicesAPI.list({
        service_provider_id: user?.id,
      })
      setInvoices(data)
    } catch (err) {
      console.error('Failed to load invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: invoices.filter((inv) => inv.status === 'PAID').length,
    paidAmount: invoices.filter((inv) => inv.status === 'PAID').reduce((sum, inv) => sum + inv.total, 0),
    outstanding: invoices.filter((inv) => inv.status === 'SENT' || inv.status === 'OVERDUE').length,
    outstandingAmount: invoices.filter((inv) => inv.status === 'SENT' || inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.total, 0),
    overdue: invoices.filter((inv) => inv.status === 'OVERDUE').length,
    overdueAmount: invoices.filter((inv) => inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.total, 0),
  }

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.contact_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SENT', label: 'Sent' },
    { value: 'PAID', label: 'Paid' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      PAID: 'success',
      SENT: 'info',
      DRAFT: 'warning',
      OVERDUE: 'danger',
      CANCELLED: 'danger',
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

  const handleInvoiceClick = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`)
  }

  if (loading) {
    return (
      <div className="invoices-page">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-600">Loading invoices...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="invoices-page">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage customer invoices and payments</p>
        </div>
        <Button onClick={() => navigate('/invoices/new')}>+ Create Invoice</Button>
      </div>

      {/* Stats Dashboard */}
      <div className="invoices-stats">
        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Invoices</div>
            <div className="text-sm text-gray-600 mt-2">{formatCurrency(stats.totalAmount)}</div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value text-green-600">{stats.paid}</div>
            <div className="stat-label">Paid Invoices</div>
            <div className="text-sm text-green-600 mt-2">{formatCurrency(stats.paidAmount)}</div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value text-blue-600">{stats.outstanding}</div>
            <div className="stat-label">Outstanding</div>
            <div className="text-sm text-blue-600 mt-2">{formatCurrency(stats.outstandingAmount)}</div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-card-content">
            <div className="stat-value text-red-600">{stats.overdue}</div>
            <div className="stat-label">Overdue</div>
            <div className="text-sm text-red-600 mt-2">{formatCurrency(stats.overdueAmount)}</div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by invoice number, customer..."
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

      {/* Invoices Display */}
      {filteredInvoices.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No invoices found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Create your first invoice to get started'}
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <Button onClick={() => navigate('/invoices/new')}>+ Create Invoice</Button>
          )}
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'invoices-grid' : 'invoices-list'}>
          {filteredInvoices.map((invoice) => (
            <Card
              key={invoice.id}
              className="invoice-card"
              onClick={() => handleInvoiceClick(invoice.id)}
            >
              <div className="invoice-card-header">
                <div>
                  <h3 className="invoice-number">{invoice.invoice_number}</h3>
                  <p className="invoice-customer">{invoice.customer?.business_name}</p>
                </div>
                {getStatusBadge(invoice.status)}
              </div>

              <div className="invoice-details">
                <div className="invoice-detail-item">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-medium">{formatDate(invoice.issue_date)}</span>
                </div>
                <div className="invoice-detail-item">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{formatDate(invoice.due_date)}</span>
                </div>
                <div className="invoice-detail-item">
                  <span className="text-gray-600">Billing Period:</span>
                  <span className="font-medium">
                    {formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}
                  </span>
                </div>
              </div>

              <div className="invoice-footer">
                <div className="invoice-total">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(invoice.total)}</span>
                </div>
                {invoice.status === 'PAID' && invoice.paid_date && (
                  <div className="text-sm text-green-600">
                    Paid on {formatDate(invoice.paid_date)}
                  </div>
                )}
                {invoice.status === 'OVERDUE' && (
                  <div className="text-sm text-red-600 font-semibold">
                    Payment overdue
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
