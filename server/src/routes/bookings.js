import { Router } from 'express'
import { requireAuth, requireRole, httpError } from '../auth.js'
import { Service, Booking, logActivity } from '../models.js'

const router = Router()

router.post('/', requireAuth, requireRole('user'), async (req, res, next) => {
  try {
    const { serviceId, eventDate, eventType, notes } = req.body || {}
    if (!serviceId || !eventDate) throw httpError(400, 'serviceId and eventDate are required')
    const service = await Service.findById(serviceId).populate('vendor')
    if (!service || service.vendor.role !== 'vendor' || !service.vendor.isApproved) {
      throw httpError(404, 'Service not found')
    }
    const booking = await Booking.create({
      user: req.user._id,
      vendor: service.vendor._id,
      service: service._id,
      eventDate: new Date(eventDate),
      eventType: eventType || 'wedding',
      notes,
    })
    await logActivity(req.user, 'booking-created', { vendor: service.vendor.businessName })
    res.status(201).json({ data: booking })
  } catch (e) {
    next(e)
  }
})

router.get('/my-bookings', requireAuth, requireRole('user'), async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('vendor', 'businessName city')
      .populate('service', 'title category price priceUnit')
      .sort('-createdAt')
    res.json({ data: bookings })
  } catch (e) {
    next(e)
  }
})

router.get('/vendor-bookings', requireAuth, requireRole('vendor'), async (req, res, next) => {
  try {
    const bookings = await Booking.find({ vendor: req.user._id })
      .populate('user', 'name email phone')
      .populate('service', 'title category price priceUnit')
      .sort('-createdAt')
    res.json({ data: bookings })
  } catch (e) {
    next(e)
  }
})

router.patch('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body || {}
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      throw httpError(400, 'Invalid status')
    }
    const booking = await Booking.findById(req.params.id)
    if (!booking) throw httpError(404, 'Booking not found')
    const isVendor = req.user.role === 'vendor' && booking.vendor.toString() === req.user._id.toString()
    const isOwnerCancelling =
      req.user.role === 'user' && booking.user.toString() === req.user._id.toString() && status === 'cancelled'
    if (!isVendor && !isOwnerCancelling) {
      throw httpError(403, 'Not your booking')
    }
    booking.status = status
    await booking.save()
    await logActivity(req.user, 'booking-status', { bookingId: booking._id, status })
    res.json({ data: booking })
  } catch (e) {
    next(e)
  }
})

export default router
