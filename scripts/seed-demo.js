/**
 * Seed demo data through the API for emulator/web testing.
 * Usage: node scripts/seed-demo.js   (fresh DB assumed)
 */
const API = 'http://localhost:5000/api/v1'
const post = (p, body, token) =>
  fetch(`${API}${p}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, data: await r.json().catch(() => ({})) }))
const put = (p, body, token) =>
  fetch(`${API}${p}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }).then((r) => r.json())

async function main() {
  const admin = (await post('/auth/login', { email: 'admin@vidai.pk', password: 'Admin@123' })).data.accessToken

  const vendors = [
    { email: 'gul.photography@vidai.pk', name: 'Gul Rehman', businessName: 'Gul Photography', city: 'Lahore', category: 'photographer', title: 'Baraat day coverage', price: 185000, desc: 'Candid wedding photography since 2012 — two shooters, 10 hours, same-week edit.' },
    { email: 'shalimar.catering@vidai.pk', name: 'Farhan Iqbal', businessName: 'Shalimar Caterers', city: 'Lahore', category: 'caterer', title: 'Walima feast — 500 guests', price: 1250, unit: 'per guest', desc: 'Slow-cooked mutton korma, chicken tikka boti, 12 salans, live chaat counter.' },
    { email: 'grand.marquee@vidai.pk', name: 'Sana Mahmood', businessName: 'The Grand Marquee', city: 'Karachi', category: 'venue', title: 'DHA banquet hall — 800 guests', price: 650000, desc: 'Chandeliered banquet hall in DHA with bridal room and parking for 200 cars.' },
    { email: 'henna.sana@vidai.pk', name: 'Sana Yusuf', businessName: 'Henna by Sana', city: 'Islamabad', category: 'mehndi_artist', title: 'Bridal mehndi + 4 guests', price: 45000, desc: 'Intricate traditional designs, organic henna, 6-hour session.' },
  ]
  let firstServiceId = null
  for (const v of vendors) {
    let token = (await post('/auth/register', {
      name: v.name, email: v.email, password: 'Vendor@123', role: 'vendor',
      businessName: v.businessName, city: v.city, phone: '0300-0000000',
    })).data.accessToken
    if (!token) token = (await post('/auth/login', { email: v.email, password: 'Vendor@123' })).data.accessToken
    const list = await fetch(`${API}/admin/vendors`, { headers: { Authorization: `Bearer ${admin}` } }).then((r) => r.json())
    const me = list.data.find((x) => x.email === v.email)
    await put('/vendors/me/profile', { description: v.desc, servicesOffered: [v.category] }, token)
    const created = await post('/vendors/me/packages', {
      title: v.title, category: v.category, price: v.price, priceUnit: v.unit || 'per event', city: v.city, description: v.desc,
    }, token)
    await fetch(`${API}/admin/vendors/${me.id}/approve`, { method: 'PATCH', headers: { Authorization: `Bearer ${admin}` } })
    if (!firstServiceId) firstServiceId = created.data.data._id
  }

  const coupleReg = await post('/auth/register', {
    name: 'Ayesha Khan', email: 'ayesha@app.pk', password: 'Couple123', city: 'Lahore',
  })
  if (coupleReg.status !== 201) {
    console.log('Couple exists; logging in instead')
  }
  const couple = (await post('/auth/login', { email: 'ayesha@app.pk', password: 'Couple123' })).data.accessToken
  await put('/budget/me', { totalBudget: 2500000, eventType: 'full_wedding' }, couple)
  await post('/budget/items', { category: 'venue', name: 'Grand Marquee advance', amount: 300000 }, couple)
  await post('/budget/items', { category: 'bridal_wear', name: 'Baraat lehenga', amount: 240000 }, couple)
  const booking = await post('/bookings', {
    serviceId: firstServiceId, eventDate: '2027-02-20', eventType: 'baraat',
    notes: 'Evening ceremony, ~400 guests. We love candid shots.',
  }, couple)
  const gulToken = (await post('/auth/login', { email: vendors[0].email, password: 'Vendor@123' })).data.accessToken
  await fetch(`${API}/bookings/${booking.data.data._id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${gulToken}` },
    body: JSON.stringify({ status: 'confirmed' }),
  })
  console.log('Seeded: 4 approved vendors, couple ayesha@app.pk / Couple123 with budget items + confirmed booking')
}
main().catch((e) => { console.error(e); process.exit(1) })
