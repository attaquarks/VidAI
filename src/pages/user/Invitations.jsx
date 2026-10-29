import { useState } from 'react'
import toast from 'react-hot-toast'
import { Sparkles, Copy } from 'lucide-react'
import api, { errMessage } from '../../api.js'
import { PageLoading } from '../../components/ui.jsx'

const TONES = ['Formal & traditional', 'Warm & family', 'Poetic Urdu touch', 'Modern & minimal']

export default function UserInvitations() {
  const [form, setForm] = useState({
    names: '', date: '', time: '', venueName: '', venueCity: '',
    theme: '', colorPalette: '', orientation: 'Portrait', imagery: '',
    tone: TONES[0],
  })
  const [content, setContent] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function generate(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const { data } = await api.post('/ai/invitations/generate', {
        essentials: {
          names: form.names, date: form.date, time: form.time,
          venueName: form.venueName, venueCity: form.venueCity,
        },
        style: {
          theme: form.theme, colorPalette: form.colorPalette,
          orientation: form.orientation, imagery: form.imagery,
        },
        tone: form.tone,
      })
      setContent(data.data.generatedContent)
      toast.success('Draft ready')
    } catch (err) {
      toast.error(errMessage(err))
    } finally {
      setBusy(false)
    }
  }

  function copyAll() {
    navigator.clipboard.writeText(
      `${content.headline}\n\n${content.bodyText}\n\n${content.footerText}\n${content.rsvpInfo}`
    ).then(() => toast.success('Copied to clipboard'))
  }

  return (
    <div className="stack">
      <div className="page-title">
        <h1>Invitation drafts</h1>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <form className="card" onSubmit={generate}>
          <h3>The essentials</h3>
          <div className="field">
            <label htmlFor="names">Names</label>
            <input id="names" className="input" required value={form.names} onChange={set('names')} placeholder="Zoya & Hamza" />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="date">Date</label>
              <input id="date" className="input" required value={form.date} onChange={set('date')} placeholder="14 February 2027" />
            </div>
            <div className="field">
              <label htmlFor="time">Time</label>
              <input id="time" className="input" value={form.time} onChange={set('time')} placeholder="7:00 in the evening" />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="vname">Venue</label>
              <input id="vname" className="input" required value={form.venueName} onChange={set('venueName')} placeholder="The Family Lawns" />
            </div>
            <div className="field">
              <label htmlFor="vcity">City</label>
              <input id="vcity" className="input" value={form.venueCity} onChange={set('venueCity')} placeholder="Lahore" />
            </div>
          </div>

          <h3 style={{ marginTop: '1.2rem' }}>Style &amp; vibe</h3>
          <div className="form-row">
            <div className="field">
              <label htmlFor="theme">Theme</label>
              <input id="theme" className="input" value={form.theme} onChange={set('theme')} placeholder="Marigold mehndi night" />
            </div>
            <div className="field">
              <label htmlFor="colors">Color palette</label>
              <input id="colors" className="input" value={form.colorPalette} onChange={set('colorPalette')} placeholder="Marigold, deep green, gold" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="tone">Tone</label>
            <select id="tone" className="select" value={form.tone} onChange={set('tone')}>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn" disabled={busy} style={{ width: '100%' }}>
            <Sparkles size={15} />
            {busy ? 'Writing…' : 'Draft the invitation'}
          </button>
        </form>

        <div>
          {content ? (
            <div>
              <div className="invitation-preview">
                <div className="headline">{content.headline}</div>
                <div className="divider" />
                <p style={{ whiteSpace: 'pre-wrap' }}>{content.bodyText}</p>
                <p className="small" style={{ marginBottom: '0.4rem' }}>{content.footerText}</p>
                <p className="small muted" style={{ marginBottom: 0 }}>{content.rsvpInfo}</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={copyAll} style={{ marginTop: '0.9rem' }}>
                <Copy size={14} /> Copy all text
              </button>
            </div>
          ) : (
            <div className="card jali-gold" style={{ background: 'var(--stone)', textAlign: 'center' }}>
              <div className="card" style={{ boxShadow: 'none', padding: '2.4rem 1.6rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)' }}>Your card appears here</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  Fill in the essentials, choose a tone, and VidAI writes the wording —
                  headline, body, closing and RSVP.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
