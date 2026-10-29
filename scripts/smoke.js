/**
 * Backend smoke test — exercises every route group against a running server.
 * Usage: node scripts/smoke.js [baseUrl]
 * Requires: fresh DB (admin gets seeded by the server on boot).
 */
const BASE = process.argv[2] || 'http://localhost:5000/api/v1'

let passed = 0
let failed = 0
const failures = []

async function call(method, path, { token, body, expect = 200, name } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  const ok = res.status === expect
  const label = name || `${method} ${path}`
  if (ok) {
    passed++
    console.log(`  ok  ${label} (${res.status})`)
  } else {
    failed++
    failures.push(label)
    console.log(`FAIL  ${label} — expected ${expect}, got ${res.status}: ${JSON.stringify(data).slice(0, 140)}`)
  }
  return { status: res.status, data }
}

const uniq = Date.now().toString(36)
const user = { email: `ayesha.${uniq}@test.pk`, password: 'Wedding@2026', name: 'Ayesha Khan' }
const vendor = {
  email: `gulphotography.${uniq}@test.pk`, password: 'Vendor@2026', name: 'Gul Rehman',
  role: 'vendor', businessName: 'Gul Photography', city: 'Lahore', phone: '0300-1234567',
}
let admin, userT, vendorT

console.log(`\nSmoke test against ${BASE}\n`)

// ── health & auth guards ──
await call('GET', '/health', { name: 'health' })
await call('GET', '/bookings/my-bookings', { expect: 401, name: 'unauthenticated blocked' })
await call('POST', '/auth/login', { body: { email: user.email, password: 'wrong' }, expect: 401, name: 'wrong password rejected' })
await call('POST', '/auth/register', { body: { ...user, password: 'weak' }, expect: 400, name: 'weak password rejected' })

// ── register user + vendor ──
const regUser = await call('POST', '/auth/register', { body: user, expect: 201, name: 'register user' })
userT = regUser.data?.accessToken
const regVendor = await call('POST', '/auth/register', { body: vendor, expect: 201, name: 'register vendor' })
vendorT = regVendor.data?.accessToken
await call('POST', '/auth/register', { body: user, expect: 409, name: 'duplicate email rejected' })

// ── admin login (seeded) ──
const adminLogin = await call('POST', '/auth/login', {
  body: { email: 'admin@vidai.pk', password: 'Admin@123' }, name: 'admin login (seeded)',
})
admin = adminLogin.data?.accessToken

// ── me / roles ──
await call('GET', '/auth/me', { token: userT, name: 'auth/me' })
await call('GET', '/admin/stats', { token: userT, expect: 403, name: 'user blocked from admin' })
await call('GET', '/admin/stats', { token: vendorT, expect: 403, name: 'vendor blocked from admin' })
await call('GET', '/admin/stats', { token: admin, name: 'admin stats' })

// ── vendor profile + packages ──
await call('PUT', '/vendors/me/profile', {
  token: vendorT,
  body: { description: 'Candid wedding photography since 2012', servicesOffered: ['photographer', 'videographer'] },
  name: 'vendor profile update',
})
await call('PUT', '/vendors/me/profile', {
  token: vendorT, body: { servicesOffered: ['not-a-category'] }, expect: 400, name: 'invalid category rejected',
})
const pkg = await call('POST', '/vendors/me/packages', {
  token: vendorT,
  body: { title: 'Baraat day coverage', category: 'photographer', price: 185000, priceUnit: 'per event', city: 'Lahore' },
  expect: 201, name: 'vendor creates package',
})
const serviceId = pkg.data?.data?._id
await call('PUT', `/vendors/me/packages/${serviceId}`, {
  token: vendorT, body: { price: 195000 }, name: 'vendor edits package',
})
await call('POST', '/vendors/me/packages', {
  token: userT, body: { title: 'x', category: 'venue' }, expect: 403, name: 'user blocked from vendor routes',
})

// ── admin approves vendor → visible in search ──
const vendorList = await call('GET', '/admin/vendors', { token: admin, name: 'admin vendor list' })
const vendorId = vendorList.data?.data?.find((v) => v.email === vendor.email)?.id
await call('PATCH', `/admin/vendors/${vendorId}/approve`, { token: admin, name: 'admin approves vendor' })
const search = await call('GET', `/vendors/search?city=Lahore&category=photographer`, { name: 'vendor search (public)' })
const found = search.data?.data?.find((v) => v.businessName === 'Gul Photography')
if (found && found.services.length === 1) {
  passed++
  console.log('  ok  approved vendor visible with services')
} else {
  failed++
  failures.push('approved vendor visible with services')
  console.log(`FAIL  approved vendor visible with services — got ${JSON.stringify(search.data).slice(0, 140)}`)
}

// ── bookings lifecycle ──
const booking = await call('POST', '/bookings', {
  token: userT,
  body: { serviceId, eventDate: '2027-02-20', eventType: 'baraat', notes: 'Evening ceremony, 400 guests' },
  expect: 201, name: 'user creates booking',
})
const bookingId = booking.data?.data?._id
await call('GET', '/bookings/my-bookings', { token: userT, name: 'user sees own bookings' })
await call('GET', '/bookings/vendor-bookings', { token: vendorT, name: 'vendor sees incoming bookings' })
await call('PATCH', `/bookings/${bookingId}/status`, { token: vendorT, body: { status: 'confirmed' }, name: 'vendor confirms booking' })
await call('PATCH', `/bookings/${bookingId}/status`, { token: vendorT, body: { status: 'nope' }, expect: 400, name: 'invalid status rejected' })

// ── budget CRUD (AI plan degrades gracefully with ai-service down) ──
await call('PUT', '/budget/me', { token: userT, body: { totalBudget: 1200000, eventType: 'full_wedding' }, name: 'budget set' })
await call('POST', '/budget/items', {
  token: userT, body: { category: 'venue', name: 'Farmhouse booking', amount: 300000 }, expect: 201, name: 'budget item added',
})
const bud = await call('GET', '/budget/me', { token: userT, name: 'budget read' })
if (bud.data?.data?.items?.length === 1 && bud.data.data.totalBudget === 1200000) {
  passed++; console.log('  ok  budget persisted')
} else { failed++; failures.push('budget persisted'); console.log(`FAIL  budget persisted — got ${JSON.stringify(bud.data).slice(0, 120)}`) }
await call('POST', '/budget/ai-plan', { token: userT, expect: 502, name: 'ai-plan graceful when AI down' })
await call('POST', '/ai/chat', { token: userT, body: { message: 'hi' }, expect: 502, name: 'chat graceful when AI down' })
await call('POST', '/ai/recommendations', { token: userT, body: { city: 'Karachi' }, expect: 502, name: 'recommendations graceful when AI down' })

// ── admin moderation & logs ──
await call('GET', '/admin/users', { token: admin, name: 'admin user list' })
await call('PATCH', `/admin/users/${vendorId}/ban`, { token: admin, name: 'admin bans user' })
await call('POST', '/auth/login', { body: { email: vendor.email, password: vendor.password }, expect: 403, name: 'banned vendor cannot log in' })
await call('PATCH', `/admin/users/${vendorId}/unban`, { token: admin, name: 'admin unbans user' })
await call('GET', '/admin/activity-logs', { token: admin, name: 'activity logs' })
await call('GET', '/admin/system-health', { token: admin, name: 'system health' })

// ── password flows ──
await call('PUT', '/auth/update-password', {
  token: userT, body: { currentPassword: user.password, newPassword: 'NewPass@123' }, name: 'password change',
})
await call('POST', '/auth/login', { body: { email: user.email, password: 'NewPass@123' }, name: 'login with new password' })
await call('POST', '/auth/logout', { token: userT, name: 'logout' })

// ── refresh token flow (cookie was set on login) ──
// (handled by browser in real use; here we just confirm the endpoint exists)
await call('POST', '/auth/refresh-token', { expect: 401, name: 'refresh without cookie rejected' })

console.log(`\n${passed} passed, ${failed} failed`)
if (failed) {
  console.log('Failures:', failures.join(' | '))
  process.exit(1)
}
