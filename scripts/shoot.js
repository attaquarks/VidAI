/**
 * Visual verification: seeds demo data through the API, then captures
 * desktop + mobile screenshots of the key pages into .impeccable/review/.
 * Usage: node scripts/shoot.js  (needs backend :5000 and vite dev :3000 running)
 */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const API = 'http://localhost:5000/api/v1'
const APP = 'http://localhost:3000'
const CHROME = `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
const OUT = '.impeccable/review'
fs.mkdirSync(OUT, { recursive: true })

const post = (path, body, token) =>
  fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, data: await r.json().catch(() => ({})) }))
const put = (path, body, token) =>
  fetch(`${API}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).then((r) => r.json())
const get = (path, token) =>
  fetch(`${API}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then((r) => r.json())

// ── Seed: admin login, vendors with packages (approved), a couple with budget/bookings ──
async function seed() {
  const admin = (await post('/auth/login', { email: 'admin@vidai.pk', password: 'Admin@123' })).data.accessToken

  const vendors = [
    { email: 'gul.photography@vidai.pk', name: 'Gul Rehman', businessName: 'Gul Photography', city: 'Lahore', category: 'photographer', title: 'Baraat day coverage', price: 185000, desc: 'Candid wedding photography since 2012 — two shooters, 10 hours, same-week edit.' },
    { email: 'shalimar.catering@vidai.pk', name: 'Farhan Iqbal', businessName: 'Shalimar Caterers', city: 'Lahore', category: 'caterer', title: 'Walima feast — 500 guests', price: 1250, unit: 'per guest', desc: 'Slow-cooked mutton korma, chicken tikka boti, 12 salans, live chaat counter.' },
    { email: 'grand.marquee@vidai.pk', name: 'Sana Mahmood', businessName: 'The Grand Marquee', city: 'Karachi', category: 'venue', title: 'DHA banquet hall — 800 guests', price: 650000, desc: 'Chandeliered banquet hall in DHA with bridal room and parking for 200 cars.' },
    { email: 'henna.sana@vidai.pk', name: 'Sana Yusuf', businessName: 'Henna by Sana', city: 'Islamabad', category: 'mehndi_artist', title: 'Bridal mehndi + 4 guests', price: 45000, desc: 'Intricate traditional designs, organic henna, 6-hour session.' },
  ]
  for (const v of vendors) {
    let token
    const reg = await post('/auth/register', {
      name: v.name, email: v.email, password: 'Vendor@123', role: 'vendor',
      businessName: v.businessName, city: v.city, phone: '0300-0000000',
    })
    token = reg.data.accessToken
    if (!token) token = (await post('/auth/login', { email: v.email, password: 'Vendor@123' })).data.accessToken
    const list = await get('/admin/vendors', admin)
    const me = list.data.find((x) => x.email === v.email)
    await put('/vendors/me/profile', { description: v.desc, servicesOffered: [v.category] }, token)
    const created = await post('/vendors/me/packages', {
      title: v.title, category: v.category, price: v.price, priceUnit: v.unit || 'per event', city: v.city, description: v.desc,
    }, token)
    await fetch(`${API}/admin/vendors/${me.id}/approve`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${admin}` },
    })
    v.serviceId = created.data.data._id
  }

  const coupleReg = await post('/auth/register', {
    name: 'Ayesha Khan', email: 'ayesha@vidai.pk', password: 'Couple@123', city: 'Lahore',
  })
  const couple = coupleReg.data.accessToken
  await put('/budget/me', { totalBudget: 2500000, eventType: 'full_wedding' }, couple)
  await post('/budget/items', { category: 'venue', name: 'Grand Marquee advance', amount: 300000 }, couple)
  await post('/budget/items', { category: 'bridal_wear', name: 'Baraat lehenga — Nida Azwer', amount: 240000 }, couple)
  const booking = await post('/bookings', {
    serviceId: vendors[0].serviceId, eventDate: '2027-02-20', eventType: 'baraat',
    notes: 'Evening ceremony, ~400 guests. We love candid shots.',
  }, couple)
  await fetch(`${API}/bookings/${booking.data.data._id}/status`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${(await post('/auth/login', { email: vendors[0].email, password: 'Vendor@123' })).data.accessToken}` },
    body: JSON.stringify({ status: 'confirmed' }),
  })
  return { couple: 'ayesha@vidai.pk', admin: 'admin@vidai.pk' }
}

const authed = {}
async function tokenFor(email, password) {
  authed[email] = (await post('/auth/login', { email, password })).data.accessToken
}

// ── Shoot ──
async function shoot(browser) {
  const shots = [
    { url: '/', file: 'desktop-home', wait: 14000 },
    { url: '/vendor-landing', file: 'desktop-vendor-landing' },
    { url: '/login', file: 'desktop-login' },
    { url: '/register', file: 'desktop-register' },
  ]
  for (const s of shots) {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })
    await page.goto(`${APP}${s.url}`, { waitUntil: 'networkidle2' })
    if (s.wait) await new Promise((r) => setTimeout(r, s.wait))
    await page.screenshot({ path: `${OUT}/${s.file}.png` })
    await page.close()
    console.log(`shot ${s.file}`)
  }

  // Authenticated desktop pages: seed the token before the SPA boots
  const authedShots = [
    { url: '/user', file: 'desktop-user-dashboard', email: 'ayesha@vidai.pk' },
    { url: '/user/budget', file: 'desktop-user-budget', email: 'ayesha@vidai.pk' },
    { url: '/user/vendors', file: 'desktop-user-vendors', email: 'ayesha@vidai.pk' },
    { url: '/user/chat', file: 'desktop-user-chat', email: 'ayesha@vidai.pk', wait: 1500 },
    { url: '/admin', file: 'desktop-admin', email: 'admin@vidai.pk' },
    { url: '/admin/vendors', file: 'desktop-admin-vendors', email: 'admin@vidai.pk' },
    { url: '/vendor', file: 'desktop-vendor-bookings', email: 'gul.photography@vidai.pk' },
    { url: '/vendor/services', file: 'desktop-vendor-services', email: 'gul.photography@vidai.pk' },
  ]
  for (const s of authedShots) {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })
    await page.evaluateOnNewDocument((token) => {
      localStorage.setItem('vidai_token', token)
    }, authed[s.email])
    await page.goto(`${APP}${s.url}`, { waitUntil: 'networkidle2' })
    if (s.wait) await new Promise((r) => setTimeout(r, s.wait))
    await page.screenshot({ path: `${OUT}/${s.file}.png` })
    await page.close()
    console.log(`shot ${s.file}`)
  }

  // Mobile: home + budget + vendors
  const mobileShots = [
    { url: '/', file: 'mobile-home', wait: 14000 },
    { url: '/user/budget', file: 'mobile-user-budget', email: 'ayesha@vidai.pk' },
    { url: '/user/vendors', file: 'mobile-user-vendors', email: 'ayesha@vidai.pk' },
  ]
  for (const s of mobileShots) {
    const page = await browser.newPage()
    await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 })
    await page.evaluateOnNewDocument((token) => {
      if (token) localStorage.setItem('vidai_token', token)
      else localStorage.removeItem('vidai_token')
    }, s.email ? authed[s.email] : null)
    await page.goto(`${APP}${s.url}`, { waitUntil: 'networkidle2' })
    if (s.wait) await new Promise((r) => setTimeout(r, s.wait))
    await page.screenshot({ path: `${OUT}/${s.file}.png` })
    await page.close()
    console.log(`shot ${s.file}`)
  }
}

const seeded = await seed()
await tokenFor(seeded.couple, 'Couple@123')
await tokenFor('gul.photography@vidai.pk', 'Vendor@123')
await tokenFor(seeded.admin, 'Admin@123')

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
try {
  await shoot(browser)
} finally {
  await browser.close()
}
console.log('done')
