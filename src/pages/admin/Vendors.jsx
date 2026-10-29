import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api, { errMessage } from '../../api.js'
import { PageLoading, EmptyState, Badge } from '../../components/ui.jsx'
import { fmtDate } from '../../constants.js'

export default function AdminVendors() {
  const [vendors, setVendors] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/vendors')
      .then(({ data }) => setVendors(data.data))
      .catch((e) => setError(errMessage(e)))
  }, [])

  async function act(v, action) {
    try {
      await api.patch(`/admin/vendors/${v.id}/${action}`)
      setVendors((list) =>
        list.map((x) => (x.id === v.id ? { ...x, isApproved: action === 'approve' } : x))
      )
      toast.success(action === 'approve' ? `${v.businessName} approved` : `${v.businessName} hidden`)
    } catch (e) {
      toast.error(errMessage(e))
    }
  }

  if (error) return <div className="form-error">{error}</div>
  if (!vendors) return <PageLoading />

  const pending = vendors.filter((v) => !v.isApproved && !v.banned)

  return (
    <div className="stack">
      <div className="page-title">
        <h1>Vendors</h1>
        {pending.length > 0 && <Badge tone="warn">{pending.length} pending</Badge>}
      </div>

      {vendors.length ? (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Business</th><th>City</th><th>Packages</th><th>Joined</th>
                  <th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.businessName || v.name}</strong>
                      <span className="small muted" style={{ display: 'block' }}>{v.email}</span>
                    </td>
                    <td>{v.city || '—'}</td>
                    <td>{v.serviceCount}</td>
                    <td className="small muted" style={{ whiteSpace: 'nowrap' }}>{fmtDate(v.createdAt)}</td>
                    <td>
                      {v.banned
                        ? <Badge tone="bad">banned</Badge>
                        : v.isApproved
                          ? <Badge tone="ok">approved</Badge>
                          : <Badge tone="warn">pending</Badge>}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {!v.banned && (
                        v.isApproved ? (
                          <button className="btn btn-sm btn-outline" onClick={() => act(v, 'reject')}>Unlist</button>
                        ) : (
                          <button className="btn btn-sm" onClick={() => act(v, 'approve')}>Approve</button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No vendor accounts" hint="Vendor sign-ups appear here for review." />
      )}
    </div>
  )
}
