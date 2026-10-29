import { Router } from 'express'
import mongoose from 'mongoose'
import { requireAuth, requireRole, httpError } from '../auth.js'
import { User, Service, Booking, Budget, ActivityLog, logActivity } from '../models.js'
import { fetchAIHealth } from '../proxy.js'

const router = Router()
router.use(requireAuth, requireRole('admin'))

router.get('/stats', async (req, res, next) => {
  try {
    const [users, vendors, pendingVendors, services, bookings, budgets] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'vendor' }),
      User.countDocuments({ role: 'vendor', isApproved: false }),
      Service.countDocuments(),
      Booking.countDocuments(),
      Budget.countDocuments(),
    ])
    res.json({ data: { users, vendors, pendingVendors, services, bookings, budgets } })
  } catch (e) {
    next(e)
  }
})

router.get('/users', async (req, res, next) => {
  try {
    const { q = '', role = '' } = req.query
    const filter = {}
    if (role) filter.role = role
    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }]
    const users = await User.find(filter).sort('-createdAt').limit(200)
    res.json({ data: users })
  } catch (e) {
    next(e)
  }
})

router.patch('/users/:id/ban', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) throw httpError(404, 'User not found')
    if (user.role === 'admin') throw httpError(400, 'Cannot ban an admin')
    user.banned = true
    await user.save()
    await logActivity(req.user, 'user-banned', { email: user.email })
    res.json({ data: user })
  } catch (e) {
    next(e)
  }
})

router.patch('/users/:id/unban', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) throw httpError(404, 'User not found')
    user.banned = false
    await user.save()
    await logActivity(req.user, 'user-unbanned', { email: user.email })
    res.json({ data: user })
  } catch (e) {
    next(e)
  }
})

router.get('/vendors', async (req, res, next) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).sort('-createdAt').limit(200)
    const serviceCounts = await Service.aggregate([
      { $group: { _id: '$vendor', count: { $sum: 1 } } },
    ])
    const counts = new Map(serviceCounts.map((s) => [s._id.toString(), s.count]))
    res.json({
      data: vendors.map((v) => ({
        id: v._id, name: v.name, email: v.email, businessName: v.businessName,
        city: v.city, isApproved: v.isApproved, banned: v.banned,
        createdAt: v.createdAt, serviceCount: counts.get(v._id.toString()) || 0,
      })),
    })
  } catch (e) {
    next(e)
  }
})

router.patch('/vendors/:id/approve', async (req, res, next) => {
  try {
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' })
    if (!vendor) throw httpError(404, 'Vendor not found')
    vendor.isApproved = true
    await vendor.save()
    await logActivity(req.user, 'vendor-approved', { businessName: vendor.businessName })
    res.json({ data: vendor })
  } catch (e) {
    next(e)
  }
})

router.patch('/vendors/:id/reject', async (req, res, next) => {
  try {
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' })
    if (!vendor) throw httpError(404, 'Vendor not found')
    vendor.isApproved = false
    await vendor.save()
    await logActivity(req.user, 'vendor-rejected', { businessName: vendor.businessName })
    res.json({ data: vendor })
  } catch (e) {
    next(e)
  }
})

router.get('/activity-logs', async (req, res, next) => {
  try {
    const logs = await ActivityLog.find().sort('-createdAt').limit(200)
    res.json({ data: logs })
  } catch (e) {
    next(e)
  }
})

router.get('/system-health', async (req, res, next) => {
  try {
    res.json({
      data: {
        backend: {
          status: 'healthy',
          mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        },
        ai: await fetchAIHealth(),
      },
    })
  } catch (e) {
    next(e)
  }
})

export default router
