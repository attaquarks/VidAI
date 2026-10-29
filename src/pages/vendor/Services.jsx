import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import api, { errMessage } from '../../api.js'
import { PageLoading, EmptyState, Badge, Modal, SubmitButton } from '../../components/ui.jsx'
import { fmtPKR, VENDOR_CATEGORIES, categoryLabel } from '../../constants.js'

const BLANK = { title: '', category: 'venue', price: '', priceUnit: 'per event', description: '', city: '' }

export default function VendorServices() {
  const [packages, setPackages] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // BLANK for new, package for edit
  const [busy, setBusy] = useState(false)

  async function load() {
    try {
      const { data } = await api.get('/vendors/me/packages')
      setPackages(data.data)
    } catch (e) {
      setError(errMessage(e))
    }
  }
  useEffect(() => { load() }, [])

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = { ...editing, price: Number(editing.price) || 0 }
      if (editing._id) {
        await api.put(`/vendors/me/packages/${editing._id}`, payload)
      } else {
        await api.post('/vendors/me/packages', payload)
      }
      toast.success(editing._id ? 'Package updated' : 'Package published')
      setEditing(null)
      await load()
    } catch (e2) {
      toast.error(errMessage(e2))
    } finally {
      setBusy(false)
    }
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.title}"? Couples can no longer book it.`)) return
    try {
      await api.delete(`/vendors/me/packages/${p._id}`)
      setPackages((list) => list.filter((x) => x._id !== p._id))
      toast.success('Package deleted')
    } catch (e) {
      toast.error(errMessage(e))
    }
  }

  if (error) return <div className="form-error">{error}</div>
  if (!packages) return <PageLoading />

  return (
    <div className="stack">
      <div className="page-title">
        <h1>My packages</h1>
        <button className="btn" onClick={() => setEditing({ ...BLANK })}>
          <Plus size={15} /> Add package
        </button>
      </div>

      {packages.length ? (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Package</th><th>Category</th><th style={{ textAlign: 'right' }}>Price</th><th style={{ textAlign: 'right' }}></th></tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.title}</strong>
                      {p.description && <span className="small muted" style={{ display: 'block', maxWidth: '22rem' }}>{p.description}</span>}
                    </td>
                    <td><Badge>{categoryLabel(p.category)}</Badge></td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {fmtPKR(p.price)} <span className="small muted">{p.priceUnit}</span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...p })} aria-label={`Edit ${p.title}`}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => remove(p)} aria-label={`Delete ${p.title}`}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No packages yet"
          hint="List what you offer — a baraat photography day, a 500-guest catering menu, your venue halls."
        />
      )}

      {editing && (
        <Modal title={editing._id ? 'Edit package' : 'New package'} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <div className="field">
              <label htmlFor="ptitle">Title</label>
              <input id="ptitle" className="input" required value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Baraat day coverage" />
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="pcat">Category</label>
                <select id="pcat" className="select" value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  {VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="pcity">City</label>
                <input id="pcity" className="input" value={editing.city}
                  onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                  placeholder="Lahore" />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="pprice">Price (PKR)</label>
                <input id="pprice" type="number" min="0" className="input" value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                  placeholder="185000" />
              </div>
              <div className="field">
                <label htmlFor="punit">Unit</label>
                <select id="punit" className="select" value={editing.priceUnit}
                  onChange={(e) => setEditing({ ...editing, priceUnit: e.target.value })}>
                  {['per event', 'per day', 'per guest', 'per hour', 'fixed'].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="pdesc">What's included</label>
              <textarea id="pdesc" className="textarea" value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Two shooters, 8 hours, same-week edit…" />
            </div>
            <div className="row" style={{ justifyContent: 'end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <SubmitButton className="btn" loading={busy}>
                {editing._id ? 'Save changes' : 'Publish package'}
              </SubmitButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
