import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from './models.js'

const ACCESS_TTL = '15m'
const REFRESH_TTL_DAYS = 7
const REFRESH_COOKIE = 'vidai_refresh'

function httpError(status, message) {
  const err = new Error(message)
  err.status = status
  return err
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET || 'dev-jwt-secret',
    { expiresIn: ACCESS_TTL }
  )
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id.toString(), type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret',
    { expiresIn: `${REFRESH_TTL_DAYS}d` }
  )
}

function setRefreshCookie(res, user) {
  res.cookie(REFRESH_COOKIE, signRefreshToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/v1/auth',
    maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  })
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' })
}

// Throws 401 unless a valid access token is present; attaches req.user
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) throw httpError(401, 'Not authenticated')
    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-jwt-secret')
    } catch {
      throw httpError(401, 'Session expired')
    }
    const user = await User.findById(payload.id)
    if (!user || user.banned) throw httpError(401, 'Account not available')
    req.user = user
    next()
  } catch (e) {
    next(e)
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(httpError(403, 'Not authorized'))
    }
    next()
  }
}

export function validatePassword(password) {
  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    throw httpError(
      400,
      'Password must be 8+ characters with an uppercase letter, a lowercase letter and a number'
    )
  }
}

export {
  httpError,
  bcrypt,
  crypto,
  signAccessToken,
  setRefreshCookie,
  User,
}

export async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@vidai.pk').toLowerCase()
  const exists = await User.findOne({ email })
  if (exists) return
  const password = process.env.ADMIN_PASSWORD || 'Admin@123'
  await User.create({
    name: 'VidAI Admin',
    email,
    password: await bcrypt.hash(password, 10),
    role: 'admin',
    isApproved: true,
  })
  console.log(`Seeded admin account: ${email} (password from ADMIN_PASSWORD env, default "Admin@123" — change it)`)
}
