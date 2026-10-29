import { Link } from 'react-router-dom'
import { ArrowRight, Package, CalendarCheck, ShieldCheck, Check } from 'lucide-react'

const STEPS = [
  ['Create your business profile', 'Name, city, phone and what you offer — five minutes, no fee.'],
  ['List your packages', 'Titles, prices in PKR, what each package covers. Edit any time.'],
  ['Get reviewed, go live', 'The VidAI team approves real businesses before couples can see them.'],
  ['Receive booking requests', 'Couples book you directly; you confirm, complete or decline from your portal.'],
]

export default function VendorLanding() {
  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1 className="rise rise-1">
              Couples are planning right now.
              <br />
              <em>Be there when they look.</em>
            </h1>
            <p className="lede rise rise-2">
              VidAI is where Pakistani couples plan their weddings — budget first, then
              vendors like you. List your packages, and booking requests arrive with the
              date, the event and the guest count already written.
            </p>
            <div className="hero-actions rise rise-3">
              <Link to="/register" className="btn btn-lg" state={{ role: 'vendor' }}>
                Join as Vendor <ArrowRight size={16} />
              </Link>
              <Link to="/" className="btn btn-lg btn-outline">I'm planning a wedding</Link>
            </div>
          </div>
          <div className="rise rise-2" style={{ padding: '10px 10px 0' }}>
            <div className="card jali-gold" style={{ background: 'var(--stone)' }}>
              <div className="row" style={{ marginBottom: '0.9rem' }}>
                <CalendarCheck size={18} color="var(--rose-deep)" />
                <strong>New booking request</strong>
                <span className="badge badge-warn" style={{ marginLeft: 'auto' }}>pending</span>
              </div>
              <p style={{ margin: '0 0 0.4rem' }}>
                <strong>Baraat day coverage</strong> · photographer
              </p>
              <p className="small muted" style={{ margin: '0 0 0.9rem' }}>
                From Ayesha K. · Lahore · 20 Feb 2027 · Baraat, 400 guests
              </p>
              <div className="row" style={{ gap: '0.5rem' }}>
                <span className="btn btn-sm" style={{ pointerEvents: 'none' }}>Confirm</span>
                <span className="btn btn-sm btn-outline" style={{ pointerEvents: 'none' }}>Decline</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="jali jali-divider" />

      <section className="section">
        <div className="section-head">
          <h2>How joining works</h2>
        </div>
        <div className="stack" style={{ maxWidth: '46rem', margin: '0 auto' }}>
          {STEPS.map(([title, body], i) => (
            <div key={title} className="feat-row" style={{ marginBottom: 0, gridTemplateColumns: 'auto 1fr', gap: '1.4rem', alignItems: 'start' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: 'var(--rose-deep)',
                  width: '2.6rem', textAlign: 'center', lineHeight: 1.2,
                }}
              >
                {i + 1}
              </span>
              <div>
                <h3 style={{ marginBottom: '0.2rem' }}>{title}</h3>
                <p className="muted" style={{ margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="grid-3">
          <div className="card" style={{ display: 'grid', gap: '0.5rem' }}>
            <Package size={20} color="var(--gold-deep)" />
            <h3 style={{ margin: 0 }}>Your packages, your prices</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Per-event or per-guest pricing in PKR. Update whenever your season changes.
            </p>
          </div>
          <div className="card" style={{ display: 'grid', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="var(--rose-deep)" />
            <h3 style={{ margin: 0 }}>Reviewed, not flooded</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Every vendor is checked before going live — couples trust the listings, so
              requests are serious.
            </p>
          </div>
          <div className="card" style={{ display: 'grid', gap: '0.5rem' }}>
            <Check size={20} color="var(--ok)" />
            <h3 style={{ margin: 0 }}>A portal that stays out of the way</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Confirm bookings, answer requests and keep your profile current from one screen.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-band-inner">
          <h2>List your business on VidAI</h2>
          <p>Free to join. Approved vendors appear in search and the assistant's recommendations.</p>
          <Link to="/register" className="btn btn-lg" state={{ role: 'vendor' }}>
            Create a vendor account <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
