import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errMessage } from '../../api.js'
import { PageLoading, Stat, Badge } from '../../components/ui.jsx'
import { fmtDate } from '../../constants.js'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/activity-logs')])
      .then(([s, l]) => {
        setStats(s.data.data)
        setLogs(l.data.data.slice(0, 8))
      })
      .catch((e) => setError(errMessage(e)))
  }, [])

  if (error) return <div className="form-error">{error}</div>
  if (!stats) return <PageLoading />

  return (
    <div className="stack">
      <div className="page-title">
        <h1>Platform overview</h1>
        <Link to="/admin/vendors" className="btn btn-outline btn-sm">Review vendors</Link>
      </div>

      <div className="grid-3">
        <Stat num={stats.users} label="Couples" />
        <Stat num={stats.vendors} label="Vendors" />
        <Stat num={stats.pendingVendors} label="Vendors awaiting approval" />
        <Stat num={stats.services} label="Packages" />
        <Stat num={stats.bookings} label="Bookings" />
        <Stat num={stats.budgets} label="Active budgets" />
      </div>

      {stats.pendingVendors > 0 && (
        <div className="card" style={{ background: 'var(--warn-soft)', borderColor: '#f3d48f' }}>
          <div className="row-between">
            <span>
              <strong>{stats.pendingVendors} vendor{stats.pendingVendors === 1 ? '' : 's'} waiting for approval</strong>
              <span className="small muted" style={{ display: 'block' }}>
                Approved vendors become visible in search and the AI's recommendations.
              </span>
            </span>
            <Link to="/admin/vendors" className="btn btn-sm">Review now</Link>
          </div>
        </div>
      )}

      <div className="card">
        <div className="row-between" style={{ marginBottom: '0.7rem' }}>
          <h3 style={{ margin: 0 }}>Recent activity</h3>
          <Link to="/admin/logs" className="small" style={{ color: 'var(--rose-deep)' }}>All logs →</Link>
        </div>
        {logs.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>When</th><th>Who</th><th>Action</th></tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id}>
                    <td className="small muted" style={{ whiteSpace: 'nowrap' }}>{fmtDate(l.createdAt)}</td>
                    <td>{l.userName}</td>
                    <td><Badge>{l.action}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted small" style={{ margin: 0 }}>No activity recorded yet.</p>
        )}
      </div>
    </div>
  )
}
