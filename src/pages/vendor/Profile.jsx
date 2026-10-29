import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api, { errMessage } from '../../api.js'
import { PageLoading, Badge, SubmitButton } from '../../components/ui.jsx'
import { CITIES, VENDOR_CATEGORIES, categoryLabel } from '../../constants.js'
import { useAuth } from '../../auth.jsx'

export default function VendorProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get('/vendors/me/profile')
      .then(({ data }) => {
        const v = data.data
        setForm({
          businessName: v.businessName || '', city: v.city || '', phone: v.phone || '',
          description: v.description || '', servicesOffered: v.servicesOffered || [],
        })
      })
      .catch((e) => toast.error(errMessage(e)))
  }, [])

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.put('/vendors/me/profile', form)
      toast.success('Profile saved')
    } catch (e2) {
      toast.error(errMessage(e2))
    } finally {
      setBusy(false)
    }
  }

  if (!form) return <PageLoading />

  const toggleCategory = (c) =>
    setForm((f) => ({
      ...f,
      servicesOffered: f.servicesOffered.includes(c)
        ? f.servicesOffered.filter((x) => x !== c)
        : [...f.servicesOffered, c],
    }))

  return (
    <div className="stack">
      <div className="page-title">
        <h1>Business profile</h1>
        {user?.isApproved
          ? <Badge tone="ok">Approved — live on VidAI</Badge>
          : <Badge tone="warn">Pending review</Badge>}
      </div>

      {!user?.isApproved && (
        <div className="card" style={{ borderLeft: 'none' }}>
          <p className="small" style={{ margin: 0 }}>
            Your profile and packages go live once the VidAI team reviews your account.
            Complete everything below so the review is quick.
          </p>
        </div>
      )}

      <form className="card" onSubmit={save}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="bn">Business name</label>
            <input id="bn" className="input" required value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="bc">City</label>
            <select id="bc" className="select" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
              <option value="">Select…</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="bp">Phone</label>
          <input id="bp" className="input" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0300-1234567" />
        </div>
        <div className="field">
          <label htmlFor="bd">About your business</label>
          <textarea id="bd" className="textarea" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What you do, your style, your experience — couples read this before booking." />
        </div>
        <div className="field">
          <label>Categories you offer</label>
          <div className="cat-rail" style={{ justifyContent: 'start' }}>
            {VENDOR_CATEGORIES.map((c) => (
              <button
                key={c} type="button"
                className={`cat-chip ${form.servicesOffered.includes(c) ? 'cat-chip-on' : ''}`}
                style={form.servicesOffered.includes(c)
                  ? { borderColor: 'var(--rose)', color: 'var(--rose-ink)', background: 'var(--rose-soft)' }
                  : {}}
                onClick={() => toggleCategory(c)}
              >
                {categoryLabel(c)}
              </button>
            ))}
          </div>
        </div>
        <SubmitButton className="btn" loading={busy}>Save profile</SubmitButton>
      </form>
    </div>
  )
}
