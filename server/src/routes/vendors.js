import { Router } from 'express'
import { requireAuth, requireRole, httpError } from '../auth.js'
import { User, Service, VENDOR_CATEGORIES, logActivity } from '../models.js'

const router = Router()

const vendorCard = (v, services) => ({
  id: v._id, businessName: v.businessName || v.name, city: v.city,
  description: v.description, avatarUrl: v.avatarUrl,
  servicesOffered: v.servicesOffered, phone: v.phone,
  services: services || [],
})

async function servicesFor(vendorIds) {
  if (!vendorIds.length) return new Map()
  const docs = await Service.find({ vendor: { $in: vendorIds } })
  return docs.reduce((map, s) => {
    const list = map.get(s.vendor.toString()) || []
    list.push(s)
    map.set(s.vendor.toString(), list)
    return map
  }, new Map())
}

// ── Public: browse approved vendors ──────────────────────────────────

router.get('/search', async (req, res, next) => {
  try {
    const { q = '', city = '', category = '' } = req.query
    const filter = { role: 'vendor', isApproved: true, banned: { $ne: true } }
    if (city) filter.city = new RegExp(`^${city}$`, 'i')
    if (q) {
      filter.$or = [
        { businessName: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { servicesOffered: new RegExp(q, 'i') },
      ]
    }
    const vendors = await User.find(filter).limit(100)
    const byVendor = await servicesFor(vendors.map((v) => v._id))
    let results = vendors.map((v) => vendorCard(v, byVendor.get(v._id.toString()) || []))
    if (category) {
      results = results.filter(
        (v) => v.services.some((s) => s.category === category) || v.servicesOffered.includes(category)
      )
    }
    res.json({ data: results })
  } catch (e) {
    next(e)
  }
})

router.get('/profile/:id', async (req, res, next) => {
  try {
    const vendor = await User.findOne({
      _id: req.params.id, role: 'vendor', banned: { $ne: true },
    })
    if (!vendor) throw httpError(404, 'Vendor not found')
    const byVendor = await servicesFor([vendor._id])
    res.json({ data: { ...vendorCard(vendor, byVendor.get(vendor._id.toString()) || []), isApproved: vendor.isApproved } })
  } catch (e) {
    next(e)
  }
})

// ── Vendor portal ────────────────────────────────────────────────────

router.get('/me/profile', requireAuth, requireRole('vendor'), (req, res) => {
  res.json({ data: vendorCard(req.user, null) })
})

router.put('/me/profile', requireAuth, requireRole('vendor'), async (req, res, next) => {
  try {
    const { businessName, city, phone, description, avatarUrl, servicesOffered } = req.body || {}
    if (servicesOffered) {
      const invalid = servicesOffered.filter((c) => !VENDOR_CATEGORIES.includes(c))
      if (invalid.length) throw httpError(400, `Unknown categories: ${invalid.join(', ')}`)
    }
    Object.assign(req.user, {
      ...(businessName !== undefined && { businessName }),
      ...(city !== undefined && { city }),
      ...(phone !== undefined && { phone }),
      ...(description !== undefined && { description }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(servicesOffered !== undefined && { servicesOffered }),
    })
    await req.user.save()
    res.json({ data: vendorCard(req.user, null) })
  } catch (e) {
    next(e)
  }
})

// "Packages" in the UI are Service documents
router.get('/me/packages', requireAuth, requireRole('vendor'), async (req, res, next) => {
  try {
    res.json({ data: await Service.find({ vendor: req.user._id }).sort('-createdAt') })
  } catch (e) {
    next(e)
  }
})

router.post('/me/packages', requireAuth, requireRole('vendor'), async (req, res, next) => {
  try {
    const { title, description, category, price, priceUnit, city, images } = req.body || {}
    if (!title?.trim() || !category) throw httpError(400, 'Title and category are required')
    if (!VENDOR_CATEGORIES.includes(category)) throw httpError(400, 'Unknown category')
    const service = await Service.create({
      vendor: req.user._id, title: title.trim(), description, category,
      price: Number(price) || 0, priceUnit: priceUnit || 'per event',
      city: city || req.user.city, images: images || [],
    })
    res.status(201).json({ data: service })
  } catch (e) {
    next(e)
  }
})

async function ownPackage(req) {
  const service = await Service.findById(req.params.id)
  if (!service) throw httpError(404, 'Package not found')
  if (service.vendor.toString() !== req.user._id.toString()) throw httpError(403, 'Not your package')
  return service
}

router.put('/me/packages/:id', requireAuth, requireRole('vendor'), async (req, res, next) => {
  try {
    const service = await ownPackage(req)
    const { title, description, category, price, priceUnit, city, images } = req.body || {}
    if (category && !VENDOR_CATEGORIES.includes(category)) throw httpError(400, 'Unknown category')
    Object.assign(service, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(price !== undefined && { price: Number(price) || 0 }),
      ...(priceUnit !== undefined && { priceUnit }),
      ...(city !== undefined && { city }),
      ...(images !== undefined && { images }),
    })
    await service.save()
    res.json({ data: service })
  } catch (e) {
    next(e)
  }
})

router.delete('/me/packages/:id', requireAuth, requireRole('vendor'), async (req, res, next) => {
  try {
    const service = await ownPackage(req)
    await service.deleteOne()
    await logActivity(req.user, 'package-deleted', { title: service.title })
    res.json({ message: 'Package deleted' })
  } catch (e) {
    next(e)
  }
})

export default router
