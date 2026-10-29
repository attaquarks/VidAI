import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import api, { errMessage } from '../../api.js'
import { PageLoading, Badge } from '../../components/ui.jsx'

function ServiceCard({ name, ok, detail }) {
  return (
    <div className="card" style={{ display: 'grid', gap: '0.4rem' }}>
      <div className="row-between">
        <h3 style={{ margin: 0 }}>{name}</h3>
        {ok
          ? <Badge tone="ok">healthy</Badge>
          : <Badge tone="bad">unreachable</Badge>}
      </div>
      <div className="small muted">{detail}</div>
    </div>
  )
}

export default function AdminSystem() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    setBusy(true)
    try {
      const { data } = await api.get('/admin/system-health')
      setHealth(data.data)
      setError('')
    } catch (e) {
      setError(errMessage(e))
    } finally { setBusy(false) }
  }
  useEffect(() => {
    api.get('/admin/system-health')
      .then(({ data }) => setHealth(data.data))
      .catch((e) => setError(errMessage(e)))
  }, [])

  if (error) return <div className="form-error">{error}</div>
  if (!health) return <PageLoading />

  const ai = health.ai || {}

  return (
    <div className="stack">
      <div className="page-title">
        <h1>System health</h1>
        <button className="btn btn-outline btn-sm" onClick={refresh} disabled={busy}>
          <RefreshCw size={14} className={busy ? 'spin-icon' : ''} /> Refresh
        </button>
      </div>

      <div className="grid-2">
        <ServiceCard
          name="Backend API"
          ok={health.backend?.mongo === 'connected'}
          detail={`Express + MongoDB — database ${health.backend?.mongo || 'unknown'}`}
        />
        <ServiceCard
          name="AI service (FastAPI)"
          ok={ai.status === 'healthy' || ai.status === 'degraded'}
          detail={
            ai.status === 'disconnected'
              ? 'Not reachable — start it with uvicorn from ai-service/'
              : `Ollama ${ai.ollama?.status || 'unknown'} · model ${ai.ollama?.model || '—'}`
          }
        />
        <ServiceCard
          name="Ollama inference"
          ok={ai.ollama?.status === 'connected'}
          detail={ai.ollama ? `${ai.ollama.model} at ${ai.ollama.url}` : 'No report from the AI service'}
        />
        <ServiceCard
          name="MongoDB"
          ok={health.backend?.mongo === 'connected'}
          detail={health.backend?.mongo === 'connected' ? 'Connection open' : 'Backend cannot reach the database'}
        />
      </div>

      {ai.status === 'disconnected' && (
        <div className="card" style={{ background: 'var(--warn-soft)', borderColor: '#f3d48f' }}>
          <p className="small" style={{ margin: 0 }}>
            The AI service is offline. Chat, recommendations and AI budget plans will fail
            gracefully for users, but start it to restore features:
            <code style={{ display: 'block', marginTop: '0.4rem', background: 'var(--panel)', padding: '0.4rem 0.7rem', borderRadius: 8 }}>
              cd ai-service && .venv/Scripts/python.exe -m uvicorn app.main:app --port 8000
            </code>
          </p>
        </div>
      )}
    </div>
  )
}
