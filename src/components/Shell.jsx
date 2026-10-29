import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Heart, LogOut } from 'lucide-react'
import { useAuth } from '../auth.jsx'

/**
 * Dashboard shell shared by user / vendor / admin areas.
 * `nav` items: { to, label, icon }
 */
export default function Shell({ nav, areaLabel }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="shell">
      <aside className="shell-sidebar">
        <NavLink to="/" className="brand" style={{ padding: '0.35rem 0.8rem 0.9rem' }}>
          <Heart size={20} fill="currentColor" />
          VidAI
        </NavLink>
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `shell-link ${isActive ? 'active' : ''}`}>
            <item.icon size={18} strokeWidth={1.8} />
            {item.label}
          </NavLink>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <button className="shell-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }} onClick={handleLogout}>
            <LogOut size={18} strokeWidth={1.8} />
            Log out
          </button>
        </div>
      </aside>
      <main className="shell-main">
        <div className="shell-topbar">
          <span className="muted small">{areaLabel}</span>
          <span className="row">
            <span style={{ fontWeight: 500 }}>{user?.businessName || user?.name}</span>
            <span className="badge badge-rose">{user?.role}</span>
          </span>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
