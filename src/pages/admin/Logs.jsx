import { useEffect, useState } from 'react'
import api, { errMessage } from '../../api.js'
import { PageLoading, EmptyState, Badge } from '../../components/ui.jsx'
import { fmtDate } from '../../constants.js'

export default function AdminLogs() {
  const [logs, setLogs] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/activity-logs')
      .then(({ data }) => setLogs(data.data))
      .catch((e) => setError(errMessage(e)))
  }, [])

  if (error) return <div className="form-error">{error}</div>
  if (!logs) return <PageLoading />

  return (
    <div className="stack">
      <div className="page-title">
        <h1>Activity logs</h1>
        <span className="small muted">Latest 200 events</span>
      </div>

      {logs.length ? (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Details</th></tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id}>
                    <td className="small muted" style={{ whiteSpace: 'nowrap' }}>
                      {fmtDate(l.createdAt)}
                      <span style={{ display: 'block' }}>
                        {new Date(l.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>{l.userName}</td>
                    <td><Badge>{l.action.replace(/-/g, ' ')}</Badge></td>
                    <td className="small muted">
                      {l.meta && Object.keys(l.meta).length
                        ? Object.entries(l.meta).map(([k, v]) => `${k}: ${v}`).join(' · ')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="Nothing logged yet" hint="Actions appear as people use the platform." />
      )}
    </div>
  )
}
