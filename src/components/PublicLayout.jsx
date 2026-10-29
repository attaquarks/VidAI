import { Link, Outlet } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useAuth } from '../auth.jsx'

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className="brand">
      <span className="brand-crest">
        <Heart size={17} fill="currentColor" strokeWidth={0} />
      </span>
      VidAI
    </Link>
  )
}

export default function PublicLayout() {
  const { user } = useAuth()
  const dash = { user: '/user', vendor: '/vendor', admin: '/admin' }[user?.role]
  return (
    <div>
      <nav className="pub-nav">
        <div className="pub-nav-inner">
          <Logo />
          <div className="pub-nav-links">
            <Link to="/#features">Features</Link>
            <Link to="/vendor-landing">For Vendors</Link>
            {dash ? (
              <Link className="btn btn-sm" to={dash}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login">Log in</Link>
                <Link className="btn btn-sm" to="/register">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <Outlet />
      <footer className="pub-footer">
        <div className="pub-footer-inner">
          <Logo />
          <span>AI-powered wedding planning for Pakistan — Karachi · Lahore · Islamabad</span>
          <span className="row" style={{ gap: '1.2rem' }}>
            <Link to="/#features">Features</Link>
            <Link to="/vendor-landing">For Vendors</Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
