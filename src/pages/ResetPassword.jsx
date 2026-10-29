import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout.jsx'
import { ErrorNote, SubmitButton } from '../components/ui.jsx'
import api, { errMessage } from '../api.js'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const token = params.get('token') || ''

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      toast.success('Password reset — log in with your new password')
      navigate('/login')
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="8+ characters with an uppercase letter and a number."
      sideTitle="Almost back in."
      sideQuote="Set the new password and your plan is exactly where you left it."
    >
      {error && <ErrorNote message={error} />}
      {!token && !error && (
        <div className="form-error">
          This link is missing its token. Open the full link from the reset email.
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="password">New password</label>
          <input
            id="password" type="password" className="input" required autoFocus
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
          />
        </div>
        <SubmitButton className="btn" style={{ width: '100%' }} loading={loading} disabled={!token}>
          Reset password
        </SubmitButton>
      </form>
      <p className="small muted center" style={{ marginTop: '1.2rem' }}>
        <Link to="/login" style={{ color: 'var(--rose-deep)' }}>Back to login</Link>
      </p>
    </AuthLayout>
  )
}
