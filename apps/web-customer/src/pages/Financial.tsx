import { useState, useEffect } from 'react'
import { Card, Spinner, EmptyState, useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import './Properties.css'

interface ServiceRecord {
  id: string
  date: string
  service_type: 'CLEANING' | 'MAINTENANCE'
  property_name: string
  description: string
  amount: number
  status: 'COMPLETED' | 'SCHEDULED' | 'PENDING'
}

export default function Financial() {
  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>([])
  const [stats, setStats] = useState({ thisMonth: 0, lastMonth: 0, ytd: 0, pending: 0 })
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()

  useEffect(() => { loadData() }, [])

  const loadData = () => {
    withLoading(async () => {
      try {
        // TODO: Replace with actual customer portal API endpoint
        // For now, showing placeholder data
        // const response = await api.get('/api/customer-portal/service-history')

        setStats({
          thisMonth: 0,
          lastMonth: 0,
          ytd: 0,
          pending: 0,
        })

        setServiceHistory([])
      } catch (err) {
        toast.error('Failed to load service history')
        console.error('Load service history error:', err)
      }
    })
  }

  if (isLoading) return <div className="page-loading"><Spinner size="lg" /></div>

  return (
    <div className="properties-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Service History & Spending</h1>
          <p className="page-subtitle">View your service history and spending overview</p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px'}}>
        <Card variant="elevated" style={{padding: '24px'}}>
          <div style={{fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px'}}>This Month</div>
          <div style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)'}}>£{stats.thisMonth.toLocaleString()}</div>
        </Card>
        <Card variant="elevated" style={{padding: '24px'}}>
          <div style={{fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px'}}>Last Month</div>
          <div style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-secondary)'}}>£{stats.lastMonth.toLocaleString()}</div>
        </Card>
        <Card variant="elevated" style={{padding: '24px'}}>
          <div style={{fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px'}}>Year to Date</div>
          <div style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--color-success)'}}>£{stats.ytd.toLocaleString()}</div>
        </Card>
        <Card variant="elevated" style={{padding: '24px'}}>
          <div style={{fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px'}}>Pending Payment</div>
          <div style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--color-warning)'}}>£{stats.pending.toLocaleString()}</div>
        </Card>
      </div>

      <Card variant="elevated" style={{padding: '24px'}}>
        <h2 style={{fontSize: '20px', fontWeight: 600, marginBottom: '24px'}}>Recent Service History</h2>
        {serviceHistory.length === 0 ? (
          <EmptyState
            title="No service history yet"
            description="Your completed services and invoices will appear here"
          />
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '1px solid var(--color-border)'}}>
                  <th style={{padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)'}}>Date</th>
                  <th style={{padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)'}}>Service Type</th>
                  <th style={{padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)'}}>Property</th>
                  <th style={{padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)'}}>Description</th>
                  <th style={{padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)'}}>Status</th>
                  <th style={{padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {serviceHistory.map((record) => (
                  <tr key={record.id} style={{borderBottom: '1px solid var(--color-border)'}}>
                    <td style={{padding: '12px', fontSize: '14px'}}>{new Date(record.date).toLocaleDateString()}</td>
                    <td style={{padding: '12px', fontSize: '14px'}}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: record.service_type === 'CLEANING' ? 'var(--color-info-bg)' : 'var(--color-warning-bg)',
                        color: record.service_type === 'CLEANING' ? 'var(--color-info)' : 'var(--color-warning)'
                      }}>
                        {record.service_type}
                      </span>
                    </td>
                    <td style={{padding: '12px', fontSize: '14px'}}>{record.property_name}</td>
                    <td style={{padding: '12px', fontSize: '14px'}}>{record.description}</td>
                    <td style={{padding: '12px', fontSize: '14px'}}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: record.status === 'COMPLETED' ? 'var(--color-success-bg)' : record.status === 'SCHEDULED' ? 'var(--color-info-bg)' : 'var(--color-warning-bg)',
                        color: record.status === 'COMPLETED' ? 'var(--color-success)' : record.status === 'SCHEDULED' ? 'var(--color-info)' : 'var(--color-warning)'
                      }}>
                        {record.status}
                      </span>
                    </td>
                    <td style={{padding: '12px', fontSize: '14px', textAlign: 'right', fontWeight: 600}}>£{Number(record.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div style={{marginTop: '24px', padding: '16px', backgroundColor: 'var(--color-info-bg)', borderRadius: '8px', border: '1px solid var(--color-info)'}}>
        <p style={{margin: 0, fontSize: '14px', color: 'var(--color-text-primary)'}}>
          <strong>Note:</strong> This page shows your service history and spending overview. For detailed invoices and payment options, please visit the <a href="/invoices" style={{color: 'var(--color-primary)', textDecoration: 'underline'}}>Invoices page</a>.
        </p>
      </div>
    </div>
  )
}
