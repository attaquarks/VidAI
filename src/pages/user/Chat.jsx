import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'
import api, { errMessage } from '../../api.js'

const SUGGESTIONS = [
  'How much does a walima venue cost in Karachi?',
  'Plan a mehndi for 150 guests in Islamabad',
  'What should I book first for a December baraat?',
]

export default function UserChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  async function send(text) {
    const message = (text ?? input).trim()
    if (!message || busy) return
    setInput('')
    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    setMessages((m) => [...m, { role: 'user', content: message }])
    setBusy(true)
    try {
      const { data } = await api.post('/ai/chat', { message, conversationHistory: history })
      setMessages((m) => [
        ...m,
        { role: 'user', content: message },
        { role: 'assistant', content: data.data.response },
      ])
    } catch (e) {
      toast.error(errMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack" style={{ height: '100%' }}>
      <div className="page-title">
        <h1>AI Wedding Assistant</h1>
        <span className="small muted">Knows PKR rates, mehndi menus and December dates</span>
      </div>

      <div className="chat-window">
        <div className="chat-messages" ref={boxRef}>
          {messages.length === 0 && (
            <div className="center" style={{ margin: 'auto', maxWidth: '30rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)' }}>Assalam-o-alaikum</h3>
              <p className="muted small">
                Ask me anything about planning your wedding — budgets, vendors, traditions,
                timelines. I answer in PKR and I know what a baraat demands.
              </p>
              <div className="stack" style={{ gap: '0.5rem', marginTop: '1rem' }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="btn btn-outline btn-sm" style={{ justifyContent: 'start' }} onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
              {m.content}
            </div>
          ))}
          {busy && <div className="bubble bubble-ai muted small">VidAI is thinking…</div>}
        </div>
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <input
            className="input"
            placeholder="Ask about budgets, vendors, traditions…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Message"
          />
          <button className="btn" disabled={busy || !input.trim()} aria-label="Send">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
