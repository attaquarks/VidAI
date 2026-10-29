import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api, { errMessage } from '../../api.js'
import { PageLoading, EmptyState, Badge } from '../../components/ui.jsx'
import { fmtDate } from '../../constants.js'

export default function AdminUsers() {
  const [users, setUsers] = useState(null)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (role) params.set('role', role)
      api.get(`/admin/users?${params}`)
        .then(({ data }) => setUsers(data.data))
        .catch((e) => setError(errMessage(e)))
    }, 200)
    return () => clearTimeout(t)
  }, [q, role])

  async function setBanned(u, banned) {
    if (banned && !confirm(`Ban ${u.email}? They will be logged out and blocked.`)) return
    try {
      const { data } = await api.patch(`/admin/users/${u._id}/${banned ? 'ban' : 'unban'}`)
      setUsers((list) => list.map((x) => (x._id === u._id ? data.data : x)))
      toast.success(banned ? 'Account banned' : 'Account restored')
    } catch (e) {
      toast.error(errMessage(e))
    }
  }

  if (error) return <div className="form-error">{error}</div>

  return (
    <div className="stack">
      <div className="page-title">
        <h1>Users</h1>
      </div>

      <div className="card">
        <div className="form-row" style={{ gridTemplateColumns: '1fr 160px', gap: '0.8rem', marginBottom: 0 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="uq">Search name or email</label>
            <input id="uq" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ayesha@…" />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="urole">Role</label>
            <select id="urole" className="select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              <option value="user">Couples</option>
              <option value="vendor">Vendors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {users === null ? (
        <PageLoading />
      ) : users.length ? (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong>{u.businessName && <span className="small muted" style={{ display: 'block' }}>{u.businessName}</span>}</td>
                    <td className="small">{u.email}</td>
                    <td><Badge tone={u.role === 'admin' ? 'gold' : u.role === 'vendor' ? 'rose' : ''}>{u.role}</Badge></td>
                    <td className="small muted" style={{ whiteSpace: 'nowrap' }}>{fmtDate(u.createdAt)}</td>
                    <td>{u.banned ? <Badge tone="bad">banned</Badge> : <Badge tone="ok">active</Badge>}</td>
                    <td style={{ textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        u.banned ? (
                          <button className="btn btn-sm btn-outline" onClick={() => setBanned(u, false)}>Unban</button>
                        ) : (
                          <button className="btn btn-sm btn-danger" onClick={() => setBanned(u, true)}>Ban</button>
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
        <EmptyState title="No users match" hint="Try a different search or clear the role filter." />
      )}
    </div>
  )
}
