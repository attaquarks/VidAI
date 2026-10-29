/**
 * End-to-end validation against a running stack:
 * backend health, auth roundtrip, and AI-service reachability.
 * Usage: npm run validate  (backend on :5000, AI service on :8000)
 */
const API = process.env.API_URL || 'http://localhost:5000/api/v1'
const AI = process.env.AI_URL || 'http://localhost:8000'

let failures = 0
function check(name, ok, detail = '') {
  console.log(`${ok ? '  ok' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

async function main() {
  // 1. Backend health
  try {
    const res = await fetch(`${API}/health`)
    const data = await res.json()
    check('backend health', res.ok && data.mongo === 'connected', JSON.stringify(data))
  } catch (e) {
    check('backend health', false, e.message)
  }

  // 2. Auth roundtrip: register → me → logout
  const email = `validate.${Date.now().toString(36)}@test.pk`
  try {
    const reg = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Validate Bot', email, password: 'Validate@123' }),
    })
    check('register', reg.status === 201)
    const { accessToken } = await reg.json()

    const me = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    check('auth/me with token', me.ok && (await me.json()).user.email === email)

    const bad = await fetch(`${API}/auth/me`)
    check('auth/me without token rejected', bad.status === 401)
  } catch (e) {
    check('auth roundtrip', false, e.message)
  }

  // 3. AI service health (optional — warn only)
  try {
    const res = await fetch(`${AI}/health`)
    const data = await res.json()
    check('ai-service health', res.ok, `status: ${data.status}, ollama: ${data.ollama?.status}`)
  } catch {
    console.log(' warn  ai-service not reachable — AI features will degrade (start Ollama + ai-service)')
  }

  console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed')
  process.exit(failures ? 1 : 0)
}

main()
