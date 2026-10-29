import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { errMessage } from '../../api.js'
import { PageLoading, EmptyState, Badge } from '../../components/ui.jsx'
import { fmtPKR, fmtDate, categoryLabel } from '../../constants.js'

const STATUS_TONE = { pending: 'warn', confirmed: 'ok', completed: '', cancelled: 'bad' }

export default function UserBookings() {
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/bookings/my-bookings')
      .then(({ data }) => setBookings(data.data))
      .catch((e) => setError(errMessage(e)))
  }, [])

  async function cancel(b) {
    if (!confirm(`Cancel your request to ${b.vendor?.businessName}?`)) return
    try {
      const { data } = await api.patch(`/bookings/${b._id}/status`, { status: 'cancelled' })
      setBookings((list) => list.map((x) => (x._id === b._id ? data.data : x)))
      toast.success('Booking cancelled')
    } catch (e) {
      toast.error(errMessage(e))
    }
  }

  if (error) return <div className="form-error">{error}</div>
  if (!bookings) return <PageLoading />

  return (
    <div className="stack">
      <div className="page-title">
        <h1>My bookings</h1>
        <Link to="/user/vendors" className="btn btn-outline btn-sm">Find more vendors</Link>
      </div>

      {bookings.length ? (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vendor</th><th>Package</th><th>Event</th><th>Date</th>
                  <th style={{ textAlign: 'right' }}>Price</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td><strong>{b.vendor?.businessName || 'Vendor'}</strong></td>
                    <td>
                      {b.service?.title || '—'}
                      <span className="small muted" style={{ display: 'block' }}>
                        {categoryLabel(b.service?.category)}
                      </span>
                    </td>
                    <td><span className="badge">{(b.eventType || '').replace(/_/g, ' ')}</span></td>
                    <td>{fmtDate(b.eventDate)}</td>
                    <td style={{ textAlign: 'right' }}>{b.service?.price ? fmtPKR(b.service.price) : '—'}</td>
                    <td><Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge></td>
                    <td style={{ textAlign: 'right' }}>
                      {b.status === 'pending' && (
                        <button className="btn btn-danger btn-sm" onClick={() => cancel(b)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No bookings yet"
          hint="Browse vendors by city and category, open a profile, and send your first request."
        />
      )}
    </div>
  )
}
