import { Router } from 'express'
import jwt from 'jsonwebtoken'
import {
  httpError, bcrypt, crypto, signAccessToken, setRefreshCookie,
  clearRefreshCookie, requireAuth, validatePassword, User,
} from '../auth.js'
import { PasswordReset, logActivity } from '../models.js'

const router = Router()

// Simple in-memory rate limit for auth endpoints — 30 requests / 15 min / IP
const attempts = new Map()
function rateLimit(req, res, next) {
  const key = req.ip
  const now = Date.now()
  const window = attempts.get(key)?.filter((t) => now - t < 15 * 60 * 1000) || []
  if (window.length >= 30) return next(httpError(429, 'Too many attempts. Try again later.'))
  window.push(now)
  attempts.set(key, window)
  next()
}
router.use(rateLimit)

const publicUser = (u) => ({
  id: u._id, name: u.name, email: u.email, role: u.role,
  isApproved: u.isApproved, businessName: u.businessName, city: u.city,
  phone: u.phone, description: u.description, avatarUrl: u.avatarUrl,
  servicesOffered: u.servicesOffered,
})

async function issueSession(res, user) {
  setRefreshCookie(res, user)
  return { user: publicUser(user), accessToken: signAccessToken(user) }
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, businessName, city, phone } = req.body || {}
    if (!name?.trim() || !email?.trim() || !password) {
      throw httpError(400, 'Name, email and password are required')
    }
    validatePassword(password)
    if (role && !['user', 'vendor'].includes(role)) throw httpError(400, 'Invalid role')
    if (role === 'vendor' && !businessName?.trim()) {
      throw httpError(400, 'Business name is required for vendor accounts')
    }
    if (await User.findOne({ email: email.toLowerCase().trim() })) {
      throw httpError(409, 'An account with this email already exists')
    }
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 10),
      role: role || 'user',
      businessName, city, phone,
      isApproved: false,
    })
    await logActivity(user, 'register', { role: user.role })
    res.status(201).json(await issueSession(res, user))
  } catch (e) {
    next(e)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) throw httpError(400, 'Email and password are required')
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw httpError(401, 'Invalid email or password')
    }
    if (user.banned) throw httpError(403, 'This account has been suspended')
    await logActivity(user, 'login')
    res.json(await issueSession(res, user))
  } catch (e) {
    next(e)
  }
})

router.post('/refresh-token', async (req, res, next) => {
  try {
    const token = req.cookies?.vidai_refresh
    if (!token) throw httpError(401, 'No refresh token')
    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret')
    } catch {
      clearRefreshCookie(res)
      throw httpError(401, 'Refresh token expired')
    }
    const user = await User.findById(payload.id)
    if (!user || user.banned) throw httpError(401, 'Account not available')
    res.json(await issueSession(res, user))
  } catch (e) {
    next(e)
  }
})

router.post('/logout', (req, res) => {
  clearRefreshCookie(res)
  res.json({ message: 'Logged out' })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

router.put('/update-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {}
    validatePassword(newPassword)
    const user = await User.findById(req.user._id).select('+password')
    if (!(await bcrypt.compare(currentPassword || '', user.password))) {
      throw httpError(401, 'Current password is incorrect')
    }
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    await logActivity(user, 'update-password')
    res.json({ message: 'Password updated' })
  } catch (e) {
    next(e)
  }
})

// No SMTP configured in dev: the reset link is written to the server log.
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body || {}
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() })
    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      await PasswordReset.create({
        user: user._id,
        tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      })
      console.log(`[reset] http://localhost:3000/reset-password?token=${token}`)
    }
    // Same response either way — don't reveal which emails exist
    res.json({ message: 'If that email is registered, a reset link has been created (see server log in dev).' })
  } catch (e) {
    next(e)
  }
})

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body || {}
    validatePassword(password)
    const tokenHash = crypto.createHash('sha256').update(token || '').digest('hex')
    const reset = await PasswordReset.findOne({ tokenHash, expiresAt: { $gt: new Date() } })
    if (!reset) throw httpError(400, 'Reset link is invalid or has expired')
    const user = await User.findById(reset.user).select('+password')
    user.password = await bcrypt.hash(password, 10)
    await user.save()
    await PasswordReset.deleteMany({ user: reset.user })
    await logActivity(user, 'reset-password')
    res.json({ message: 'Password reset. You can now log in.' })
  } catch (e) {
    next(e)
  }
})

export default router
