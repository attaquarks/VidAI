import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, CalendarCheck, MessageCircleHeart, MailOpen } from 'lucide-react'
import api, { errMessage } from '../../api.js'
import { PageLoading, EmptyState, Badge, Stat } from '../../components/ui.jsx'
import { fmtPKR, fmtDate } from '../../constants.js'

export default function UserDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/budget/me'),
      api.get('/bookings/my-bookings'),
    ])
      .then(([b, k]) => setData({ budget: b.data.data, bookings: k.data.data }))
      .catch((e) => setError(errMessage(e)))
  }, [])

  if (error) return <div className="form-error">{error}</div>
  if (!data) return <PageLoading />

  const { budget, bookings } = data
  const spent = budget.items.reduce((s, i) => s + (i.amount || 0), 0)
  const upcoming = bookings.filter((b) => b.status !== 'cancelled' && new Date(b.eventDate) >= new Date())

  return (
    <div className="stack">
      <div className="page-title">
        <h1>Assalam-o-alaikum — here's your plan</h1>
        <Link to="/user/chat" className="btn">
          <MessageCircleHeart size={16} /> Ask the assistant
        </Link>
      </div>

      <div className="grid-3">
        <Stat num={fmtPKR(budget.totalBudget)} label="Total budget" />
        <Stat num={fmtPKR(spent)} label="Committed to line items" />
        <Stat num={bookings.length} label="Booking requests" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="row-between">
            <h3 style={{ margin: 0 }}>Budget</h3>
            <Wallet size={18} color="var(--rose-deep)" />
          </div>
          {budget.totalBudget > 0 || budget.items.length ? (
            <>
              <p className="muted small" style={{ margin: '0.4rem 0 0.8rem' }}>
                {budget.eventType.replace(/_/g, ' ')} · {budget.items.length} line item{budget.items.length === 1 ? '' : 's'}
              </p>
              <Link to="/user/budget" className="btn btn-outline btn-sm">Open budget planner</Link>
            </>
          ) : (
            <>
              <p className="muted small" style={{ margin: '0.4rem 0 0.8rem' }}>
                No budget yet. Set a total and let the planner split it across your events.
              </p>
              <Link to="/user/budget" className="btn btn-sm">Set up my budget</Link>
            </>
          )}
        </div>

        <div className="card">
          <div className="row-between">
            <h3 style={{ margin: 0 }}>Upcoming events</h3>
            <CalendarCheck size={18} color="var(--rose-deep)" />
          </div>
          {upcoming.length ? (
            <div className="stack" style={{ gap: '0.5rem', marginTop: '0.6rem' }}>
              {upcoming.slice(0, 3).map((b) => (
                <div key={b._id} className="row-between">
                  <span className="small">
                    <strong>{b.service?.title || 'Booking'}</strong>
                    <span className="muted" style={{ display: 'block' }}>
                      {b.vendor?.businessName} · {fmtDate(b.eventDate)}
                    </span>
                  </span>
                  <Badge tone={b.status === 'confirmed' ? 'ok' : 'warn'}>{b.status}</Badge>
                </div>
              ))}
              <Link to="/user/bookings" className="small" style={{ color: 'var(--rose-deep)' }}>
                All bookings →
              </Link>
            </div>
          ) : (
            <>
              <p className="muted small" style={{ margin: '0.4rem 0 0.8rem' }}>
                Nothing booked yet. Find vendors by city and category, and send your first request.
              </p>
              <Link to="/user/vendors" className="btn btn-sm">Find vendors</Link>
            </>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card card-hover">
          <div className="row-between">
            <h3 style={{ margin: 0 }}>Invitation wording, drafted</h3>
            <MailOpen size={18} color="var(--gold-deep)" />
          </div>
          <p className="muted small" style={{ margin: '0.4rem 0 0.9rem' }}>
            Names, date, venue, tone — get card text for the nikkah, the mehndi and the walima.
          </p>
          <Link to="/user/invitations" className="btn btn-gold btn-sm" style={{ justifySelf: 'start' }}>
            Draft an invitation
          </Link>
        </div>
        <div className="card jali-gold" style={{ background: 'var(--stone)' }}>
          <h3 style={{ margin: 0 }}>Vendors on VidAI</h3>
          <p className="muted small" style={{ margin: '0.4rem 0 0.9rem' }}>
            Photographers, caterers, venues, mehndi artists — approved businesses you can book directly.
          </p>
          <Link to="/user/vendors" className="btn btn-outline btn-sm" style={{ justifySelf: 'start' }}>Browse vendors</Link>
        </div>
      </div>
    </div>
  )
}
