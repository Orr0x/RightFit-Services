import { useState, useEffect } from 'react'
import { Card, Spinner } from '@rightfit/ui-core'
import { useToast } from '../components/ui'
import { useLoading } from '../hooks/useLoading'
import { financialAPI } from '../lib/api'
import './Properties.css'

interface Transaction { id: string; property_id: string; amount: number; date: string; type: string; description: string; category?: string }

export default function Financial() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, lastMonth: 0, pending: 0 })
  const { isLoading, withLoading } = useLoading()
  const toast = useToast()

  useEffect(() => { loadData() }, [])

  const loadData = () => {
    withLoading(async () => {
      try {
        const data = await financialAPI.listTransactions()
        setTransactions(data.data || [])
        const now = new Date()
        const thisMonth = (data.data || []).filter((p: Transaction) => new Date(p.date).getMonth() === now.getMonth()).reduce((sum: number, p: Transaction) => sum + Number(p.amount), 0)
        const lastMonth = (data.data || []).filter((p: Transaction) => new Date(p.date).getMonth() === now.getMonth() - 1).reduce((sum: number, p: Transaction) => sum + Number(p.amount), 0)
        const total = (data.data || []).reduce((sum: number, p: Transaction) => sum + Number(p.amount), 0)
        setStats({ total, thisMonth, lastMonth, pending: 0 })
      } catch (err) {
        toast.error('Failed to load financial data')
      }
    })
  }

  if (isLoading) return <div className="page-loading"><Spinner size="lg" /></div>

  return (
    <div className="properties-page">
      <div className="page-header">
        <div><h1 className="page-title">Financial Overview</h1><p className="page-subtitle">Track payments and finances</p></div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px'}}>
        <Card variant="elevated" style={{padding: '24px'}}>
          <div style={{fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px'}}>Total Revenue</div>
          <div style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)'}}>£{stats.total.toLocaleString()}</div>
        </Card>
        <Card variant="elevated" style={{padding: '24px'}}>
          <div style={{fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px'}}>This Month</div>
          <div style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--color-success)'}}>£{stats.thisMonth.toLocaleString()}</div>
        </Card>
        <Card variant="elevated" style={{padding: '24px'}}>
          <div style={{fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px'}}>Last Month</div>
          <div style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-secondary)'}}>£{stats.lastMonth.toLocaleString()}</div>
        </Card>
        <Card variant="elevated" style={{padding: '24px'}}>
          <div style={{fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px'}}>Pending</div>
          <div style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--color-warning)'}}>£{stats.pending.toLocaleString()}</div>
        </Card>
      </div>

      <Card variant="elevated" style={{padding: '24px'}}>
        <h2 style={{fontSize: '20px', fontWeight: 600, marginBottom: '24px'}}>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <div style={{textAlign: 'center', padding: '48px', color: 'var(--color-text-secondary)'}}>No transactions recorded</div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '1px solid var(--color-border)'}}>
                  <th style={{padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)'}}>Date</th>
                  <th style={{padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)'}}>Description</th>
                  <th style={{padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)'}}>Type</th>
                  <th style={{padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)'}}>Category</th>
                  <th style={{padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((p) => (
                  <tr key={p.id} style={{borderBottom: '1px solid var(--color-border)'}}>
                    <td style={{padding: '12px', fontSize: '14px'}}>{new Date(p.date).toLocaleDateString()}</td>
                    <td style={{padding: '12px', fontSize: '14px'}}>{p.description || 'N/A'}</td>
                    <td style={{padding: '12px', fontSize: '14px'}}>{p.type}</td>
                    <td style={{padding: '12px', fontSize: '14px'}}>{p.category || '-'}</td>
                    <td style={{padding: '12px', fontSize: '14px', textAlign: 'right', fontWeight: 600}}>£{Number(p.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
