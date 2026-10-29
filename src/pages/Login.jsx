import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout.jsx'
import { ErrorNote, SubmitButton } from '../components/ui.jsx'
import { useAuth } from '../auth.jsx'
import { homeFor } from '../nav.js'
import { errMessage } from '../api.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`)
      navigate(location.state?.from || homeFor(user.role), { replace: true })
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to pick up where the planning left off."
      sideTitle="Every event, one plan."
      sideQuote="Your budget, your vendors and your invitations — exactly where you left them."
    >
      {error && <ErrorNote message={error} />}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email" type="email" className="input" required autoFocus
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password" type="password" className="input" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Your password"
          />
        </div>
        <div className="row-between" style={{ marginBottom: '1rem' }}>
          <Link to="/forgot-password" className="small" style={{ color: 'var(--rose-deep)' }}>
            Forgot password?
          </Link>
        </div>
        <SubmitButton className="btn" style={{ width: '100%' }} loading={loading}>
          Log in
        </SubmitButton>
      </form>
      <p className="small muted center" style={{ marginTop: '1.2rem' }}>
        New to VidAI? <Link to="/register" style={{ color: 'var(--rose-deep)' }}>Create an account</Link>
      </p>
    </AuthLayout>
  )
}
