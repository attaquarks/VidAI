import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MapPin, Phone } from 'lucide-react'
import api, { errMessage } from '../api.js'
import { useAuth } from '../auth.jsx'
import { PageLoading, EmptyState, Badge, Modal, SubmitButton } from '../components/ui.jsx'
import { fmtPKR, EVENT_TYPES, categoryLabel } from '../constants.js'

export default function VendorPublicProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(null) // service being booked
  const [form, setForm] = useState({ eventDate: '', eventType: 'wedding', notes: '' })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get(`/vendors/profile/${id}`)
      .then(({ data }) => setVendor(data.data))
      .catch((e) => setError(errMessage(e)))
  }, [id])

  async function submitBooking(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/bookings', { serviceId: booking.id, ...form })
      toast.success('Request sent — the vendor will confirm')
      setBooking(null)
      navigate('/user/bookings')
    } catch (err) {
      toast.error(errMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (error) return <div className="page"><div className="form-error">{error}</div></div>
  if (!vendor) return <PageLoading />

  return (
    <div className="page">
      <div className="stack">
        <div className="card" style={{ padding: '1.6rem' }}>
          <div className="row-between">
            <div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>{vendor.businessName}</h1>
              <div className="row small muted" style={{ gap: '0.9rem' }}>
                {vendor.city && <span className="row" style={{ gap: '0.3rem' }}><MapPin size={13} /> {vendor.city}</span>}
                {vendor.phone && <span className="row" style={{ gap: '0.3rem' }}><Phone size={13} /> {vendor.phone}</span>}
                {!vendor.isApproved && <Badge tone="warn">Pending approval</Badge>}
              </div>
            </div>
          </div>
          {vendor.description && <p className="muted" style={{ margin: '0.9rem 0 0', maxWidth: '46rem' }}>{vendor.description}</p>}
        </div>

        <div>
          <h2>Packages</h2>
          {vendor.services.length ? (
            <div className="grid-2" style={{ marginTop: '0.9rem' }}>
              {vendor.services.map((s) => (
                <div key={s.id} className="card card-hover" style={{ display: 'grid', gap: '0.5rem' }}>
                  <div className="row-between">
                    <h3 style={{ margin: 0 }}>{s.title}</h3>
                    <Badge tone="rose">{categoryLabel(s.category)}</Badge>
                  </div>
                  {s.description && <p className="small muted" style={{ margin: 0 }}>{s.description}</p>}
                  <div className="row-between" style={{ marginTop: 'auto', paddingTop: '0.4rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--rose-deep)', fontVariantNumeric: 'tabular-nums' }}>
                      {s.price ? fmtPKR(s.price) : 'On request'}
                      <span className="small muted" style={{ fontWeight: 400 }}> {s.priceUnit}</span>
                    </span>
                    {user?.role === 'user' ? (
                      <button className="btn btn-sm" onClick={() => setBooking(s)}>Request booking</button>
                    ) : (
                      <Link to="/login" state={{ from: `/vendors/${id}` }} className="btn btn-sm">Log in to book</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No packages listed yet" hint="This vendor hasn't published packages — check back soon." />
          )}
        </div>
      </div>

      {booking && (
        <Modal title={`Request: ${booking.title}`} onClose={() => setBooking(null)}>
          <form onSubmit={submitBooking}>
            <div className="form-row">
              <div className="field">
                <label htmlFor="bdate">Event date</label>
                <input
                  id="bdate" type="date" className="input" required
                  value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="btype">Event</label>
                <select id="btype" className="select" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="bnotes">Notes for the vendor</label>
              <textarea
                id="bnotes" className="textarea"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Guest count, timings, what matters most to you…"
              />
            </div>
            <p className="small muted">
              {fmtPKR(booking.price)} {booking.priceUnit} — final terms are agreed with the vendor directly.
            </p>
            <div className="row" style={{ justifyContent: 'end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setBooking(null)}>Cancel</button>
              <SubmitButton className="btn" loading={busy}>Send request</SubmitButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
