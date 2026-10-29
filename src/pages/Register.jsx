import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout.jsx'
import { ErrorNote, SubmitButton } from '../components/ui.jsx'
import { useAuth } from '../auth.jsx'
import { homeFor } from '../nav.js'
import { errMessage } from '../api.js'
import { CITIES } from '../constants.js'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('user')
  const [form, setForm] = useState({
    name: '', email: '', password: '', businessName: '', city: '', phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await register({ ...form, role })
      toast.success('Account created — welcome to VidAI')
      navigate(homeFor(user.role), { replace: true })
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Start planning"
      subtitle="Free for couples. Vendors join with their business details."
      sideTitle={role === 'vendor' ? 'Get booking requests from real couples.' : 'Your shaadi, organized.'}
      sideQuote={
        role === 'vendor'
          ? 'List your packages, set your prices, and receive booking requests from couples planning right now. Every vendor is reviewed before going live.'
          : 'One dashboard for the budget, the vendors, the invitations and every event between the dholki and the walima.'
      }
    >
      {error && <ErrorNote message={error} />}
      <form onSubmit={onSubmit}>
        <div className="row" style={{ marginBottom: '1rem', gap: '0.5rem' }}>
          {[
            ['user', "I'm planning a wedding"],
            ['vendor', "I'm a vendor"],
          ].map(([value, label]) => (
            <button
              key={value} type="button"
              className={`btn btn-sm ${role === value ? '' : 'btn-outline'}`}
              onClick={() => setRole(value)}
              style={role === value ? {} : { background: 'transparent' }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="field">
          <label htmlFor="name">{role === 'vendor' ? 'Your name' : 'Full name'}</label>
          <input id="name" className="input" required value={form.name} onChange={set('name')} placeholder="Ayesha Khan" />
        </div>
        {role === 'vendor' && (
          <div className="field">
            <label htmlFor="businessName">Business name</label>
            <input id="businessName" className="input" required value={form.businessName} onChange={set('businessName')} placeholder="Gul Photography" />
          </div>
        )}
        <div className="form-row">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="input" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="city">City</label>
            <select id="city" className="select" value={form.city} onChange={set('city')}>
              <option value="">Select…</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {role === 'vendor' && (
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" className="input" value={form.phone} onChange={set('phone')} placeholder="0300-1234567" />
          </div>
        )}
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password" type="password" className="input" required value={form.password} onChange={set('password')}
            placeholder="8+ chars, one uppercase, one number"
          />
          <span className="small muted">At least 8 characters with an uppercase letter and a number.</span>
        </div>
        <SubmitButton className="btn" style={{ width: '100%' }} loading={loading}>
          Create account
        </SubmitButton>
        {role === 'vendor' && (
          <p className="small muted" style={{ marginTop: '0.8rem', marginBottom: 0 }}>
            Vendor accounts are reviewed by the VidAI team before your listings go live.
          </p>
        )}
      </form>
      <p className="small muted center" style={{ marginTop: '1.2rem' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--rose-deep)' }}>Log in</Link>
      </p>
    </AuthLayout>
  )
}
