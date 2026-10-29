import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Diamond } from 'lucide-react'

/* Split auth layout: rose jali panel with the product promise, form on marble. */
export default function AuthLayout({ title, subtitle, children, sideQuote, sideTitle }) {
  return (
    <div className="auth-wrap">
      <aside className="auth-side">
        <Link to="/" className="brand" style={{ color: '#fff' }}>
          <span className="brand-crest" style={{ background: '#fff', color: 'var(--rose-ink)' }}>
            <Heart size={17} fill="currentColor" strokeWidth={0} />
          </span>
          VidAI
        </Link>
        <div>
          <h2>{sideTitle}</h2>
          <blockquote>{sideQuote}</blockquote>
        </div>
        <span className="small" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Karachi · Lahore · Islamabad
        </span>
      </aside>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <h1>{title}</h1>
          {subtitle && (
            <p className="muted" style={{ marginBottom: '1.4rem' }}>
              {subtitle}
            </p>
          )}
          {children}
          <div className="gold-rule">
            <Diamond size={9} />
          </div>
          <p className="small muted center" style={{ margin: 0 }}>
            Planning a wedding or running a vendor business?{' '}
            <Link to="/vendor-landing" style={{ color: 'var(--rose-deep)' }}>
              See how VidAI works for you
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
