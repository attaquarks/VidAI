import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Search } from 'lucide-react'
import api from '../../api.js'
import { PageLoading, EmptyState } from '../../components/ui.jsx'
import { CITIES, VENDOR_CATEGORIES, categoryLabel } from '../../constants.js'

export default function UserVendors() {
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [vendors, setVendors] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (city) params.set('city', city)
      if (category) params.set('category', category)
      api.get(`/vendors/search?${params}`)
        .then(({ data }) => setVendors(data.data))
        .catch(() => setVendors([]))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [q, city, category])

  return (
    <div className="stack">
      <div className="page-title">
        <h1>Find vendors</h1>
      </div>

      <div className="card">
        <div className="form-row" style={{ gridTemplateColumns: '1fr 180px 200px', gap: '0.8rem', marginBottom: 0, alignItems: 'center' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="vq">Search</label>
            <input id="vq" className="input" placeholder="Business name or service…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="vcity">City</label>
            <select id="vcity" className="select" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="vcat">Category</label>
            <select id="vcat" className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading && !vendors ? (
        <PageLoading />
      ) : vendors?.length ? (
        <div className="grid-2">
          {vendors.map((v) => (
            <div key={v.id} className="card card-hover">
              <div className="row-between">
                <div>
                  <h3 style={{ margin: 0 }}>{v.businessName}</h3>
                  {v.city && (
                    <span className="row small muted" style={{ gap: '0.3rem' }}>
                      <MapPin size={12} /> {v.city}
                    </span>
                  )}
                </div>
                <Link to={`/vendors/${v.id}`} className="btn btn-sm">View &amp; book</Link>
              </div>
              {v.description && <p className="small muted" style={{ margin: '0.6rem 0' }}>{v.description}</p>}
              {v.services.length > 0 && (
                <div className="table-wrap" style={{ marginTop: '0.4rem' }}>
                  <table>
                    <tbody>
                      {v.services.slice(0, 3).map((s) => (
                        <tr key={s.id}>
                          <td>{s.title}<span className="small muted" style={{ display: 'block' }}>{categoryLabel(s.category)}</span></td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {s.price ? `₨${Number(s.price).toLocaleString('en-PK')}` : '—'}
                            <span className="small muted"> {s.priceUnit}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No vendors match"
          hint={loading ? 'Searching…' : 'Try a different city or clear the category filter.'}
        />
      )}
      <div className="row small muted" style={{ justifyContent: 'center', gap: '0.4rem' }}>
        <Search size={12} />
        Every vendor on VidAI is reviewed by the team before their packages go live.
      </div>
    </div>
  )
}
