import { Loader2, Inbox } from 'lucide-react'

export function Spinner({ label }) {
  return (
    <div className="loading-page">
      <span className="spinner" style={{ width: 18, height: 18 }} />
      {label && <span className="small">{label}</span>}
    </div>
  )
}

export function PageLoading() {
  return <Spinner label="Loading…" />
}

export function EmptyState({ title, hint }) {
  return (
    <div className="empty">
      <Inbox size={36} strokeWidth={1.5} />
      <h3>{title}</h3>
      {hint && <p className="small">{hint}</p>}
    </div>
  )
}

export function ErrorNote({ message }) {
  if (!message) return null
  return <div className="form-error">{message}</div>
}

export function Badge({ tone = '', children }) {
  return <span className={`badge ${tone ? `badge-${tone}` : ''}`}>{children}</span>
}

export function Stat({ num, label }) {
  return (
    <div className="card stat">
      <span className="num">{num}</span>
      <span className="label">{label}</span>
    </div>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="row-between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function SubmitButton({ loading, children, ...props }) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading && <Loader2 size={16} className="spin-icon" />}
      {children}
    </button>
  )
}
