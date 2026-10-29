import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Sparkles, Trash2 } from 'lucide-react'
import api, { errMessage } from '../../api.js'
import { PageLoading, EmptyState, Badge } from '../../components/ui.jsx'
import { fmtPKR, EVENT_TYPES, VENDOR_CATEGORIES, categoryLabel } from '../../constants.js'

/* The hand-inked allocation chart: one bar per category, the ink does the arguing. */
function AllocationChart({ allocations, totalBudget }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60)
    return () => clearTimeout(t)
  }, [allocations])
  return (
    <div>
      {allocations.map((a, i) => (
        <div className="budget-bar-row" key={`${a.category}-${i}`}>
          <span className="budget-bar-label" title={a.explanation}>{categoryLabel(a.category)}</span>
          <div className="budget-bar-track">
            <div className="budget-bar-fill" style={{ width: ready ? `${Math.min(a.percentage, 100)}%` : 0, transitionDelay: `${i * 70}ms` }} />
          </div>
          <span className="budget-bar-amount">{fmtPKR(a.amount)}</span>
        </div>
      ))}
      {allocations.length > 0 && (
        <div className="row-between" style={{ borderTop: '1px solid var(--line)', paddingTop: '0.7rem' }}>
          <span className="small muted">Total across {allocations.length} categories</span>
          <span className="budget-total">{fmtPKR(totalBudget)}</span>
        </div>
      )}
    </div>
  )
}

export default function UserBudget() {
  const [budget, setBudget] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [planning, setPlanning] = useState(false)
  const [total, setTotal] = useState('')
  const [eventType, setEventType] = useState('full_wedding')
  const [item, setItem] = useState({ category: 'venue', name: '', amount: '' })

  useEffect(() => {
    api.get('/budget/me')
      .then(({ data }) => {
        setBudget(data.data)
        setTotal(data.data.totalBudget || '')
        setEventType(data.data.eventType || 'full_wedding')
      })
      .catch((e) => setError(errMessage(e)))
  }, [])

  async function saveBasic() {
    setSaving(true)
    try {
      const { data } = await api.put('/budget/me', { totalBudget: Number(total), eventType })
      setBudget(data.data)
      toast.success('Budget saved')
    } catch (e) {
      toast.error(errMessage(e))
    } finally {
      setSaving(false)
    }
  }

  async function generatePlan() {
    if (!(Number(total) > 0)) {
      toast.error('Set a total budget first')
      return
    }
    setPlanning(true)
    try {
      await saveBasic()
      const { data } = await api.post('/budget/ai-plan', { totalBudget: Number(total), eventType })
      setBudget(data.data)
      toast.success('Plan generated')
    } catch (e) {
      toast.error(errMessage(e))
    } finally {
      setPlanning(false)
    }
  }

  async function addItem(e) {
    e.preventDefault()
    try {
      const { data } = await api.post('/budget/items', { ...item, amount: Number(item.amount) })
      setBudget(data.data)
      setItem({ category: item.category, name: '', amount: '' })
      toast.success('Line item added')
    } catch (e2) {
      toast.error(errMessage(e2))
    }
  }

  async function removeItem(id) {
    try {
      const { data } = await api.delete(`/budget/items/${id}`)
      setBudget(data.data)
    } catch (e) {
      toast.error(errMessage(e))
    }
  }

  if (error) return <div className="form-error">{error}</div>
  if (!budget) return <PageLoading />

  const plan = budget.aiPlan
  const itemsTotal = budget.items.reduce((s, i) => s + (i.amount || 0), 0)

  return (
    <div className="stack">
      <div className="page-title">
        <h1>Budget planner</h1>
      </div>

      {/* Total + event type */}
      <div className="card">
        <div className="form-row" style={{ alignItems: 'end' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="total">Total budget (PKR)</label>
            <input
              id="total" type="number" min="0" className="input" placeholder="e.g. 2500000"
              value={total} onChange={(e) => setTotal(e.target.value)}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="etype">Which events?</label>
            <select id="etype" className="select" value={eventType} onChange={(e) => setEventType(e.target.value)}>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="row" style={{ gap: '0.5rem', paddingBottom: 2 }}>
            <button className="btn btn-outline" onClick={saveBasic} disabled={saving}>Save</button>
            <button className="btn" onClick={generatePlan} disabled={planning}>
              <Sparkles size={15} />
              {planning ? 'Planning…' : 'Generate AI plan'}
            </button>
          </div>
        </div>
      </div>

      {/* AI plan */}
      {plan ? (
        <div className="card">
          <div className="row-between" style={{ marginBottom: '0.9rem' }}>
            <h3 style={{ margin: 0 }}>Your allocation</h3>
            {plan.currency && <Badge tone="gold">{plan.currency}</Badge>}
          </div>
          {plan.summary && <p className="muted small" style={{ marginTop: 0 }}>{plan.summary}</p>}
          {plan.allocations?.length ? (
            <AllocationChart allocations={plan.allocations} totalBudget={plan.totalBudget} />
          ) : (
            <EmptyState title="No allocation returned" hint="Try generating the plan again." />
          )}
          {plan.tips?.length > 0 && (
            <div style={{ marginTop: '1.1rem' }}>
              <h3>Tips from the planner</h3>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--ink-soft)' }}>
                {plan.tips.map((t, i) => <li key={i} className="small">{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="card jali-gold" style={{ background: 'var(--stone)', textAlign: 'center', padding: '2.2rem 1.6rem' }}>
          <h3>No plan yet</h3>
          <p className="muted small" style={{ maxWidth: '34rem', margin: '0 auto' }}>
            Set your total above and press <strong>Generate AI plan</strong>. The planner
            splits your budget across categories using realistic Pakistani market rates —
            then every line stays editable below.
          </p>
        </div>
      )}

      {/* Manual items */}
      <div className="card">
        <div className="row-between" style={{ marginBottom: '0.9rem' }}>
          <h3 style={{ margin: 0 }}>Your line items</h3>
          <span className="small muted">Booked so far: <strong style={{ color: 'var(--rose-deep)' }}>{fmtPKR(itemsTotal)}</strong></span>
        </div>
        {budget.items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Category</th><th>Item</th><th style={{ textAlign: 'right' }}>Amount</th><th></th></tr>
              </thead>
              <tbody>
                {budget.items.map((i) => (
                  <tr key={i._id}>
                    <td><Badge>{categoryLabel(i.category)}</Badge></td>
                    <td>{i.name}</td>
                    <td style={{ textAlign: 'right' }}>{fmtPKR(i.amount)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeItem(i._id)} aria-label={`Remove ${i.name}`}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No line items yet" hint="Add deposits and bookings as you make them." />
        )}
        <form onSubmit={addItem} className="form-row" style={{ gridTemplateColumns: '150px 1fr 150px auto', marginTop: '0.9rem', alignItems: 'end', gap: '0.8rem' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="icat">Category</label>
            <select id="icat" className="select" value={item.category} onChange={(e) => setItem({ ...item, category: e.target.value })}>
              {VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="iname">Item</label>
            <input id="iname" className="input" required value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} placeholder="e.g. Farmhouse advance" />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="iamt">Amount (PKR)</label>
            <input id="iamt" type="number" min="0" className="input" required value={item.amount} onChange={(e) => setItem({ ...item, amount: e.target.value })} placeholder="300000" />
          </div>
          <button className="btn" style={{ marginBottom: 2 }}><Plus size={15} /> Add</button>
        </form>
      </div>
    </div>
  )
}
