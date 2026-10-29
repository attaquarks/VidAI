import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { errMessage } from '../../api.js'
import { PageLoading, EmptyState, Badge } from '../../components/ui.jsx'
import { fmtPKR, fmtDate, categoryLabel } from '../../constants.js'

const STATUS_TONE = { pending: 'warn', confirmed: 'ok', completed: '', cancelled: 'bad' }
const ACTIONS = {
  pending: [['confirmed', 'Confirm'], ['cancelled', 'Decline']],
  confirmed: [['completed', 'Mark completed'], ['cancelled', 'Cancel']],
}

export default function VendorBookings() {
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    api.get('/bookings/vendor-bookings')
      .then(({ data }) => setBookings(data.data))
      .catch((e) => setError(errMessage(e)))
  }, [])

  async function setStatus(b, status) {
    setBusyId(b._id)
    try {
      const { data } = await api.patch(`/bookings/${b._id}/status`, { status })
      setBookings((list) => list.map((x) => (x._id === b._id ? data.data : x)))
      toast.success(`Booking ${status}`)
    } catch (e) {
      toast.error(errMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  if (error) return <div className="form-error">{error}</div>
  if (!bookings) return <PageLoading />

  const pendingCount = bookings.filter((b) => b.status === 'pending').length

  return (
    <div className="stack">
      <div className="page-title">
        <h1>Booking requests</h1>
        {pendingCount > 0 && <Badge tone="warn">{pendingCount} awaiting your reply</Badge>}
      </div>

      {bookings.length ? (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>From</th><th>Package</th><th>Event</th><th>Date</th>
                  <th style={{ textAlign: 'right' }}>Listed price</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>{b.user?.name || 'Client'}</strong>
                      <span className="small muted" style={{ display: 'block' }}>
                        {b.user?.email}{b.user?.phone ? ` · ${b.user.phone}` : ''}
                      </span>
                    </td>
                    <td>
                      {b.service?.title || '—'}
                      <span className="small muted" style={{ display: 'block' }}>
                        {categoryLabel(b.service?.category)}
                      </span>
                    </td>
                    <td><span className="badge">{(b.eventType || '').replace(/_/g, ' ')}</span></td>
                    <td>
                      {fmtDate(b.eventDate)}
                      {b.notes && <span className="small muted" style={{ display: 'block', maxWidth: '16rem' }}>{b.notes}</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>{b.service?.price ? fmtPKR(b.service.price) : '—'}</td>
                    <td><Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge></td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="row" style={{ justifyContent: 'end', gap: '0.4rem' }}>
                        {(ACTIONS[b.status] || []).map(([status, label]) => (
                          <button
                            key={status}
                            className={`btn btn-sm ${status === 'cancelled' ? 'btn-danger' : ''}`}
                            disabled={busyId === b._id}
                            onClick={() => setStatus(b, status)}
                          >
                            {label}
                          </button>
                        ))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No requests yet"
          hint="Publish packages on the My Packages page so couples can find and book you."
        />
      )}
      {bookings.length === 0 && (
        <Link to="/vendor/services" className="btn" style={{ justifySelf: 'center' }}>Add my first package</Link>
      )}
    </div>
  )
}
