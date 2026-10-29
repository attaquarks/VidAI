import { httpError } from './auth.js'

// Forward a JSON POST to the Python AI service, passing its response back.
export async function proxyAI(path, body, timeoutMs = 320_000) {
  const base = process.env.AI_SERVICE_URL || 'http://localhost:8000'
  let res
  try {
    res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch {
    throw httpError(502, 'AI service is unreachable. Is the ai-service running?')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = httpError(res.status === 503 ? 503 : 502, data.detail || 'AI service error')
    err.body = { message: err.message }
    throw err
  }
  return data
}

export async function fetchAIHealth() {
  const base = process.env.AI_SERVICE_URL || 'http://localhost:8000'
  try {
    const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(3000) })
    return await res.json()
  } catch {
    return { status: 'disconnected' }
  }
}
