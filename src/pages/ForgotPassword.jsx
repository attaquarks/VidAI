import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { ErrorNote, SubmitButton } from '../components/ui.jsx'
import api, { errMessage } from '../api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll check the address and take it from there."
      sideTitle="Locked out the week of the mehndi?"
      sideQuote="It happens. Enter your email and we'll get you back into your plan."
    >
      {error && <ErrorNote message={error} />}
      {sent ? (
        <div className="stack">
          <p>
            If <strong>{email}</strong> is registered, a reset link has been created. In this
            development setup the link appears in the backend server's console log — copy it
            into the browser to continue.
          </p>
          <Link to="/login" className="btn btn-outline" style={{ justifySelf: 'start' }}>
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email" type="email" className="input" required autoFocus
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <SubmitButton className="btn" style={{ width: '100%' }} loading={loading}>
            Create reset link
          </SubmitButton>
        </form>
      )}
      <p className="small muted center" style={{ marginTop: '1.2rem' }}>
        Remembered it after all? <Link to="/login" style={{ color: 'var(--rose-deep)' }}>Log in</Link>
      </p>
    </AuthLayout>
  )
}
